import test, { before, beforeEach } from "node:test";
import assert from "node:assert/strict";

/**
 * Retention, and session expiry.
 *
 * These exist because the privacy policy makes promises in numbers — thirty days, twelve months —
 * and a promise the code doesn't keep is worse than no promise. The constants in
 * server/retention.ts are the policy; these tests are what stop the two drifting apart.
 */

process.env.DISRUPTAJOB_DB = ":memory:";

let pruneExpiredData: typeof import("@/server/retention").pruneExpiredData;
let RETENTION: typeof import("@/server/retention").RETENTION;
let run: typeof import("@/server/db").run;
let all: typeof import("@/server/db").all;

before(async () => {
  const r = await import("@/server/retention");
  const db = await import("@/server/db");
  pruneExpiredData = r.pruneExpiredData;
  RETENTION = r.RETENTION;
  run = db.run;
  all = db.all;
});

beforeEach(() => {
  run("DELETE FROM event");
  run("DELETE FROM rate_attempt");
  run("DELETE FROM session");
  run("DELETE FROM account");
});

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

test("events older than the stated retention are deleted, newer ones kept", () => {
  run("INSERT INTO event (id, name, visitor, created_at) VALUES ('old','landing_view','v',?)",
    daysAgo(RETENTION.eventDays + 1));
  run("INSERT INTO event (id, name, visitor, created_at) VALUES ('new','landing_view','v',?)",
    daysAgo(1));

  pruneExpiredData();

  const remaining = all<{ id: string }>("SELECT id FROM event");
  assert.deepEqual(remaining.map((r) => r.id), ["new"]);
});

test("sessions older than the stated retention are deleted", () => {
  const now = new Date().toISOString();
  run("INSERT INTO account (id, email, display_name, role, created_at) VALUES ('a','a@b.c','A','talent',?)", now);
  run("INSERT INTO session (token, account_id, created_at) VALUES ('old','a',?)", daysAgo(RETENTION.sessionDays + 1));
  run("INSERT INTO session (token, account_id, created_at) VALUES ('fresh','a',?)", daysAgo(1));

  pruneExpiredData();

  const remaining = all<{ token: string }>("SELECT token FROM session");
  assert.deepEqual(remaining.map((r) => r.token), ["fresh"]);
});

test("rate-limit rows are cleaned up even for buckets nobody is hitting any more", () => {
  run("INSERT INTO rate_attempt (id, bucket, subject, created_at) VALUES ('old','signInByEmail','x',?)",
    daysAgo(RETENTION.rateAttemptDays + 1));

  pruneExpiredData();

  assert.equal(all("SELECT 1 FROM rate_attempt").length, 0);
});

test("pruning is safe to run repeatedly and on an empty database", () => {
  pruneExpiredData();
  pruneExpiredData();
  assert.equal(all("SELECT 1 FROM event").length, 0);
});

test("session retention matches the session cookie's lifetime", () => {
  // If these diverge, either a token outlives its cookie or a signed-in person is logged out
  // early. Pinned so the two have to be changed together.
  assert.equal(RETENTION.sessionDays, 30);
});
