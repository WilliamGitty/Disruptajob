import type { DatabaseSync } from "node:sqlite";

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
