import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { seedIfEmpty } from "./seed";
import { runMigrations } from "./migrations";

/**
 * The database.
 *
 * SQLite via `node:sqlite` — built into Node 22, so there is no dependency to install, no native
 * module to compile, no service to sign up for and no API key to paste. The whole app runs from
 * `npm ci && npm run dev` on any machine, which is the constraint this project has to meet.
 *
 * The file lives under `.data/` (gitignored). Swapping to Postgres later means reimplementing the
 * repository layer above this file; nothing in the app imports `DatabaseSync` directly.
 */

// Guard rather than the `server-only` package, to keep the dependency count at zero. If this
// module ever gets pulled into a client bundle the failure is loud and immediate.
if (typeof window !== "undefined") {
  throw new Error("src/server/db.ts is server-only and must never reach the browser bundle.");
}

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_PATH = process.env.DISRUPTAJOB_DB ?? path.join(DATA_DIR, "disruptajob.db");

let instance: DatabaseSync | null = null;

function openDatabase(): DatabaseSync {
  if (DB_PATH !== ":memory:") mkdirSync(DATA_DIR, { recursive: true });

  const db = new DatabaseSync(DB_PATH);
  // WAL keeps reads from blocking the dev server while a write is in flight.
  if (DB_PATH !== ":memory:") db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");

  const schema = readFileSync(path.join(process.cwd(), "src/server/schema.sql"), "utf8");
  db.exec(schema);

  // Base schema first, then any changes made since — order matters, since a migration may alter
  // a table the base schema just created.
  runMigrations(db);

  // Populate the demo population on a fresh database, so `npm ci && npm run dev` on any machine
  // produces a working app with no extra command. Never overwrites existing data.
  seedIfEmpty(db);

  return db;
}

/**
 * Cached across hot reloads. Next re-evaluates modules on edit in dev, and reopening the handle
 * each time leaks file descriptors and loses WAL state, so the instance is parked on globalThis.
 */
const globalForDb = globalThis as unknown as { __disruptajobDb?: DatabaseSync };

export function getDb(): DatabaseSync {
  if (instance) return instance;
  if (globalForDb.__disruptajobDb) {
    instance = globalForDb.__disruptajobDb;
    return instance;
  }
  instance = openDatabase();
  globalForDb.__disruptajobDb = instance;
  return instance;
}

/** Run a set of writes atomically — either all of it lands or none of it does. */
export function transaction<T>(fn: () => T): T {
  const db = getDb();
  db.exec("BEGIN");
  try {
    const result = fn();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

/** Convenience wrappers so repositories don't repeat prepare/run boilerplate. */
export function all<T = Record<string, unknown>>(sql: string, ...params: unknown[]): T[] {
  return getDb().prepare(sql).all(...(params as never[])) as T[];
}

export function get<T = Record<string, unknown>>(sql: string, ...params: unknown[]): T | undefined {
  return getDb().prepare(sql).get(...(params as never[])) as T | undefined;
}

export function run(sql: string, ...params: unknown[]): void {
  getDb().prepare(sql).run(...(params as never[]));
}
