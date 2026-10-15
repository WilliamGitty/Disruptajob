import test, { before, beforeEach } from "node:test";
import assert from "node:assert/strict";

/**
 * The privacy gate as it actually runs: in SQL, against a real database.
 *
 * tests/visibility.test.ts covers the pure functions. This covers the thing production calls,
 * because the two are separate implementations — `normaliseCompany` in lib/visibility.ts and
 * `normalise` in repositories/discovery.ts are duplicated, SQLite having no regex. A bug fixed in
 * one and missed in the other would leave the pure tests green while the real query leaked, so
 * these assertions deliberately re-state the same rules against the database.
 */

// Must be set before db.ts is imported — it reads the path once, at module scope.
process.env.DISRUPTAJOB_DB = ":memory:";

let run: (sql: string, ...params: unknown[]) => void;
let discoverableCandidateIds: (viewingCompany: string) => string[];
let isCandidateVisibleTo: (candidateId: string, viewingCompany: string) => boolean;
let withheldCount: (viewingCompany: string) => number;

before(async () => {
  const db = await import("@/server/db");
  const discovery = await import("@/server/repositories/discovery");
  run = db.run;
  discoverableCandidateIds = discovery.discoverableCandidateIds;
  isCandidateVisibleTo = discovery.isCandidateVisibleTo;
  withheldCount = discovery.withheldCount;
});

/** Replace the seeded demo population with a known one, so counts are exact. */
beforeEach(() => {
  run("DELETE FROM candidate"); // blocked_company cascades
});

function addCandidate(
  id: string,
  discoverability: string | null,
  blocked: string[] = []
): void {
  if (discoverability === null) {
    // Exercise the schema default rather than passing a value, since "no opinion recorded"
    // is the state a half-finished signup leaves behind.
    run(
      `INSERT INTO candidate (id, slug, name, avatar_initials, accent_index, created_at)
       VALUES (?,?,?,?,0,?)`,
      id,
      id,
      id,
      "XX",
      new Date().toISOString()
    );
  } else {
    run(
      `INSERT INTO candidate (id, slug, name, avatar_initials, accent_index, discoverability, created_at)
       VALUES (?,?,?,?,0,?,?)`,
      id,
      id,
      id,
      "XX",
      discoverability,
      new Date().toISOString()
    );
  }

  for (const company of blocked) {
    run("INSERT INTO blocked_company (candidate_id, company_name) VALUES (?,?)", id, company);
  }
}

test("the schema default is hidden, so an unfinished signup is never searchable", () => {
  addCandidate("no-choice-made", null);
  assert.deepEqual(discoverableCandidateIds("Meridian Robotics"), []);
});

test("only candidates who opted in are returned", () => {
  addCandidate("hidden", "hidden");
  addCandidate("open", "open");
  addCandidate("selective", "selectively-open");

  assert.deepEqual(discoverableCandidateIds("Meridian Robotics").sort(), ["open", "selective"]);
});

test("a blocked company gets the same query without that candidate", () => {
  addCandidate("blocks-meridian", "open", ["Meridian Robotics"]);
  addCandidate("blocks-nobody", "open");

  assert.deepEqual(discoverableCandidateIds("Meridian Robotics"), ["blocks-nobody"]);
  assert.deepEqual(
    discoverableCandidateIds("Halcyon Systems").sort(),
    ["blocks-meridian", "blocks-nobody"]
  );
});

test("blocking matches the forms a person would type, in SQL as in the pure gate", () => {
  addCandidate("blocker", "open", ["Meridian Robotics"]);

  for (const typed of [
    "Meridian Robotics",
    "meridian robotics",
    "MERIDIAN ROBOTICS",
    "Meridian Robotics Ltd",
    "meridian-robotics.com",
    "Meridian",
  ]) {
    assert.deepEqual(
      discoverableCandidateIds(typed),
      [],
      `"${typed}" should not see a candidate blocking Meridian Robotics`
    );
  }
});

test("a candidate with several blocked companies is hidden from each of them", () => {
  addCandidate("careful", "open", ["Meridian Robotics", "Halcyon Systems"]);

  assert.deepEqual(discoverableCandidateIds("Meridian Robotics"), []);
  assert.deepEqual(discoverableCandidateIds("Halcyon Systems"), []);
  assert.deepEqual(discoverableCandidateIds("Nordstar Analytics"), ["careful"]);
});

test("isCandidateVisibleTo agrees with the list — one gate, not two", () => {
  // A profile page gating by id and a search gating by list must never disagree, or a blocked
  // employer finds by URL what they could not find by search.
  addCandidate("blocker", "open", ["Meridian"]);
  addCandidate("hidden-one", "hidden");

  assert.equal(isCandidateVisibleTo("blocker", "Meridian Robotics"), false);
  assert.equal(isCandidateVisibleTo("blocker", "Halcyon Systems"), true);
  assert.equal(isCandidateVisibleTo("hidden-one", "Halcyon Systems"), false);
});

test("withheldCount is an aggregate that reveals no identities", () => {
  addCandidate("open-1", "open");
  addCandidate("hidden-1", "hidden");
  addCandidate("blocked-1", "open", ["Meridian"]);

  assert.equal(withheldCount("Meridian Robotics"), 2);
  assert.equal(withheldCount("Halcyon Systems"), 1);
  assert.equal(typeof withheldCount("Meridian Robotics"), "number");
});

test("an empty viewing company skips the blocklist — the public-page contract", () => {
  // The landing page passes "" because no company is doing the looking. Hidden candidates are
  // still excluded; only the per-company blocklist is bypassed. Any caller that can pass an
  // employer's name must never pass "" instead.
  addCandidate("blocks-everyone", "open", ["Meridian Robotics"]);
  addCandidate("hidden-one", "hidden");

  assert.deepEqual(discoverableCandidateIds(""), ["blocks-everyone"]);
  assert.equal(discoverableCandidateIds("").includes("hidden-one"), false);
});
