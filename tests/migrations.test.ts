import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import path from "node:path";
import { runMigrations } from "@/server/migrations";

/**
 * Migrations against the real schema.
 *
 * Written after a migration that added two columns which schema.sql had also just gained: every
 * fresh database then failed to boot with "duplicate column name", and because dev was running on
 * an *existing* database, nothing looked wrong locally. Only a new install would have broken —
 * which is to say, the deployment.
 */

const SCHEMA = readFileSync(path.join(process.cwd(), "src/server/schema.sql"), "utf8");

function freshDb(): DatabaseSync {
  const db = new DatabaseSync(":memory:");
  db.exec(SCHEMA);
  return db;
}

test("every migration applies cleanly to a database built from schema.sql", () => {
  // The case that broke: a brand-new install, where schema.sql has just run.
  const db = freshDb();
  const ran = runMigrations(db);

  assert.ok(ran.length > 0, "expected at least one migration to run on a fresh database");
});

test("running migrations twice is a no-op, not an error", () => {
  const db = freshDb();
  runMigrations(db);

  assert.deepEqual(runMigrations(db), [], "a second run must apply nothing");
});

test("migrations are applied in order and recorded exactly once", () => {
  const db = freshDb();
  const ran = runMigrations(db);
  runMigrations(db);

  const recorded = db.prepare("SELECT id FROM schema_migration ORDER BY id").all() as { id: string }[];
  assert.deepEqual(recorded.map((r) => r.id), [...ran].sort());
  assert.equal(new Set(recorded.map((r) => r.id)).size, recorded.length, "a migration was recorded twice");
});

test("the columns migrations add actually exist afterwards", () => {
  const db = freshDb();
  runMigrations(db);

  const columns = (table: string) =>
    (db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[]).map((c) => c.name);

  assert.ok(columns("account").includes("password_hash"));
  assert.ok(columns("invite").includes("followup_channel"));
  assert.ok(columns("invite").includes("followup_detail"));
});

test("a migration already satisfied by schema.sql does not throw", () => {
  // Guards the specific mistake: someone adds a column to schema.sql that a migration also adds.
  const db = freshDb();
  db.exec("ALTER TABLE invite ADD COLUMN followup_channel TEXT");

  assert.doesNotThrow(() => runMigrations(db));
});

test("011: Maya backfills into a seeded database, but never pre-empts a fresh seed", () => {
  // The trap: migrations run BEFORE seedIfEmpty. If 011 inserted into an empty candidate
  // table, the seed would see a populated database and skip the entire demo world.
  const fresh = freshDb();
  runMigrations(fresh);
  const onFresh = fresh.prepare("SELECT COUNT(*) AS n FROM candidate").get() as { n: number };
  assert.equal(onFresh.n, 0, "011 must leave an unseeded database untouched");

  // An existing database (seeded before Maya existed, migrations already recorded up to 010)
  // gets her from the migration.
  const existing = freshDb();
  existing
    .prepare("INSERT INTO candidate (id, slug, name, headline, short_description, location, availability, avatar_initials, accent_index, created_at) VALUES ('someone','someone','Some One','','','','open','SO',0,'2026-01-01')")
    .run();
  runMigrations(existing);
  const maya = existing
    .prepare("SELECT demo FROM candidate WHERE slug = 'maya-okonkwo'")
    .get() as { demo: number } | undefined;
  assert.ok(maya, "an already-seeded database gains Maya");
  assert.equal(maya.demo, 1, "and she is flagged as demo like the rest of the invented world");
  const projects = existing
    .prepare("SELECT COUNT(*) AS n FROM project WHERE owner_id = 'maya-okonkwo'")
    .get() as { n: number };
  assert.equal(projects.n, 3, "with her three projects");
});
