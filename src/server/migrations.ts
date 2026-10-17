import type { DatabaseSync } from "node:sqlite";
import { CANDIDATES, COMPANIES } from "@/lib/mock-data";
import { seedDemoDemand } from "./demo-demand";
import { seedGeneratedDemand } from "./demo-demand-generated";

/**
 * Schema migrations.
 *
 * `schema.sql` uses CREATE TABLE IF NOT EXISTS, which silently does nothing once a table exists —
 * so adding a column that way would appear to work and then not be there. Without this, every
 * schema change meant deleting the database, which is fine on day one and catastrophic the first
 * time there's real data in it.
 *
 * Each migration runs once, in order, inside a transaction, and is recorded. Append new ones to
 * the end; never edit or reorder an existing entry.
 */

interface Migration {
  id: string;
  up: (db: DatabaseSync) => void;
}

/**
 * Add a column only if it isn't already there.
 *
 * SQLite has no ADD COLUMN IF NOT EXISTS, and a migration that assumes absence is one schema.sql
 * edit away from breaking every fresh install — which is exactly how this helper came to exist.
 */
function addColumn(db: DatabaseSync, table: string, column: string, type: string): void {
  const existing = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  if (existing.some((c) => c.name === column)) return;
  db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
}

const MIGRATIONS: Migration[] = [
  {
    // Email-only sign-in was a stand-in while there was no way to create an account at all.
    // Nullable so the seeded demo accounts keep working without one.
    id: "001-account-password",
    up: (db) => {
      addColumn(db, "account", "password_hash", "TEXT");
    },
  },
  {
    // Reaching out now asks how the company wants to continue if the person says yes. Nullable,
    // so invites sent before this existed keep working and simply have no stated preference.
    id: "002-invite-followup",
    up: (db) => {
      addColumn(db, "invite", "followup_channel", "TEXT");
      addColumn(db, "invite", "followup_detail", "TEXT");
    },
  },
  {
    // A longer, optional piece in the candidate's own words. Context for a human who is already
    // interested — it never reaches a capability score, like everything else self-written.
    id: "003-candidate-about",
    up: (db) => {
      addColumn(db, "candidate", "about", "TEXT");
    },
  },
  {
    // Real people are about to share a database with the invented demo population, and a real
    // user must never mistake seeded fiction for a colleague. The flag is set here for databases
    // seeded before it existed (the ids are the seed's own, so the match is exact), and by
    // seed.ts for fresh installs. Nothing a user does can ever set it.
    id: "005-demo-population-flag",
    up: (db) => {
      addColumn(db, "candidate", "demo", "INTEGER NOT NULL DEFAULT 0");
      addColumn(db, "company", "demo", "INTEGER NOT NULL DEFAULT 0");
      const mark = (table: string, ids: string[]) => {
        const marks = ids.map(() => "?").join(",");
        db.prepare(`UPDATE ${table} SET demo = 1 WHERE id IN (${marks})`).run(...ids);
      };
      mark("candidate", CANDIDATES.map((c) => c.id));
      mark("company", COMPANIES.map((c) => c.id));
    },
  },
  {
    // When (if ever) the account's email address was confirmed by clicking a link we sent to it.
    // Nullable: accounts from before email existed, and the seeded demo accounts, have no value
    // and nothing is gated on it — see email-verification.ts for what verification does and
    // deliberately doesn't do.
    id: "004-account-email-verified",
    up: (db) => {
      addColumn(db, "account", "email_verified_at", "TEXT");
    },
  },
  {
    // The seeded demo candidate wore the founder's real name, which was quaint while the whole
    // site was fiction and became "two William Sandfords on the homepage" the day the real one
    // signed up. The invented person gets an invented name. Guarded on demo = 1 so it can never
    // touch a real account that happens to share the id's slug.
    id: "006-demo-founder-rename",
    up: (db) => {
      db.prepare(
        `UPDATE candidate SET name = 'Jordan Blake', slug = 'jordan-blake', avatar_initials = 'JB'
          WHERE id = 'william-sandford' AND demo = 1`
      ).run();
      db.prepare(
        `UPDATE account SET display_name = 'Jordan Blake'
          WHERE candidate_id = 'william-sandford' AND email = 'will@example.com'`
      ).run();
    },
  },
  {
    // Three more Example companies with open roles, so the demand side of the demo is thick
    // enough to walk through. Invented rather than scraped on purpose — see demo-demand.ts.
    id: "007-demo-demand",
    up: seedDemoDemand,
  },
  {
    // The founder wanted the demand side expansive for weekend testers; the agreed compromise
    // (quality over theatre — 200 fake roles would make the Example badge wallpaper) was a
    // dozen companies with demand across the whole capability taxonomy. seedDemoDemand is
    // id-guarded, so re-running it only inserts the additions.
    id: "008-demo-demand-expanded",
    up: seedDemoDemand,
  },
  {
    // ~200 generated roles across ~120 invented companies — founder decision for weekend demo
    // volume, honesty preserved structurally: demo = 1 everywhere, Example badges, noindex, and
    // none of it in the sitemap. See demo-demand-generated.ts.
    id: "009-demo-demand-generated",
    up: seedGeneratedDemand,
  },
];

function appliedIds(db: DatabaseSync): Set<string> {
  db.exec(`CREATE TABLE IF NOT EXISTS schema_migration (
             id         TEXT PRIMARY KEY,
             applied_at TEXT NOT NULL
           )`);
  const rows = db.prepare("SELECT id FROM schema_migration").all() as { id: string }[];
  return new Set(rows.map((r) => r.id));
}

/** Apply any migrations this database hasn't seen. Returns the ids that ran. */
export function runMigrations(db: DatabaseSync): string[] {
  const done = appliedIds(db);
  const ran: string[] = [];

  for (const migration of MIGRATIONS) {
    if (done.has(migration.id)) continue;

    db.exec("BEGIN");
    try {
      migration.up(db);
      db.prepare("INSERT INTO schema_migration (id, applied_at) VALUES (?,?)").run(
        migration.id,
        new Date().toISOString()
      );
      db.exec("COMMIT");
      ran.push(migration.id);
    } catch (error) {
      db.exec("ROLLBACK");
      throw new Error(
        `Migration ${migration.id} failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  return ran;
}
