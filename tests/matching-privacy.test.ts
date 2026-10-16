import test, { before, beforeEach } from "node:test";
import assert from "node:assert/strict";

/**
 * Where matching meets privacy — tested against the engine production actually runs.
 *
 * The first version of this file imported the demo-data matcher and asserted its behaviour, which
 * the audit called confidence theatre (D2/R8): the suite that claimed to guard the core promise
 * exercised an engine no page used. This version seeds a real in-memory database and calls
 * server/matching.ts, the function behind /employer and /employer/roles/[id].
 */

process.env.DISRUPTAJOB_DB = ":memory:";

let matchCandidatesForCapabilities: typeof import("@/server/matching").matchCandidatesForCapabilities;
let run: typeof import("@/server/db").run;

before(async () => {
  matchCandidatesForCapabilities = (await import("@/server/matching")).matchCandidatesForCapabilities;
  run = (await import("@/server/db")).run;
});

const NOW = new Date().toISOString();

/** A candidate with one published, tagged project per capability given. */
function addCandidate(
  id: string,
  discoverability: string,
  capabilities: string[],
  blocked: string[] = []
) {
  run(
    `INSERT INTO candidate (id, slug, name, avatar_initials, accent_index, discoverability, created_at)
     VALUES (?,?,?,?,0,?,?)`,
    id, id, id, "XX", discoverability, NOW
  );
  capabilities.forEach((tag, i) => {
    const pid = `${id}-p${i}`;
    run(
      `INSERT INTO project (id, owner_id, slug, title, description, thumbnail_seed, outcome,
                            problem, what_i_built, my_contribution, status, source, created_at)
       VALUES (?,?,?,?,'','','','','','','published','manual',?)`,
      pid, id, pid, `Work ${i}`, NOW
    );
    run("INSERT INTO project_capability (project_id, tag) VALUES (?,?)", pid, tag);
  });
  for (const name of blocked) {
    run("INSERT INTO blocked_company (candidate_id, company_name) VALUES (?,?)", id, name);
  }
}

beforeEach(() => {
  run("DELETE FROM candidate");
  run("DELETE FROM project");
});

test("a hidden candidate never reaches the ranking, whatever they could score", () => {
  addCandidate("hidden-ace", "hidden", ["automation", "operations", "growth"]);
  addCandidate("open-mid", "open", ["automation"]);

  const ids = matchCandidatesForCapabilities(["automation", "operations"], "Acme").map((m) => m.candidateId);
  assert.deepEqual(ids, ["open-mid"]);
});

test("a candidate is absent from the blocking company's matches and present for everyone else", () => {
  addCandidate("blocker", "open", ["automation"], ["Meridian Robotics"]);

  assert.equal(
    matchCandidatesForCapabilities(["automation"], "Meridian Robotics").some((m) => m.candidateId === "blocker"),
    false,
    "shown to the company they blocked"
  );
  assert.equal(
    matchCandidatesForCapabilities(["automation"], "Halcyon Systems").some((m) => m.candidateId === "blocker"),
    true,
    "hidden from a company they did not block"
  );
});

test("blocking matches the forms a company name actually takes, in the production path", () => {
  addCandidate("blocker", "open", ["automation"], ["Meridian Robotics"]);
  for (const typed of ["meridian robotics", "Meridian Robotics Ltd", "meridian-robotics.com", "Meridian"]) {
    assert.deepEqual(
      matchCandidatesForCapabilities(["automation"], typed),
      [],
      `"${typed}" should see nothing`
    );
  }
});

test("draft projects produce no capabilities, so an unreviewed import can't rank anyone", () => {
  addCandidate("open-empty", "open", []);
  run(
    `INSERT INTO project (id, owner_id, slug, title, description, thumbnail_seed, outcome,
                          problem, what_i_built, my_contribution, status, source, created_at)
     VALUES ('draft-p','open-empty','draft-p','Draft','','','','','','','draft','github-import',?)`,
    NOW
  );
  run("INSERT INTO project_capability (project_id, tag) VALUES ('draft-p','automation')");

  assert.deepEqual(matchCandidatesForCapabilities(["automation"], "Acme"), []);
});

test("asking for no capabilities returns nothing rather than everyone", () => {
  addCandidate("open-mid", "open", ["automation"]);
  assert.deepEqual(matchCandidatesForCapabilities([], "Acme"), []);
});

test("coverage beats single-capability strength, and results come strongest first", () => {
  // Three automation projects = deep but narrow; one each of the two required = broad.
  addCandidate("narrow-deep", "open", ["automation", "automation", "automation"]);
  addCandidate("broad", "open", ["automation", "operations"]);

  const ranked = matchCandidatesForCapabilities(["automation", "operations"], "Acme");
  assert.equal(ranked[0].candidateId, "broad", "full coverage should outrank depth in one");
  const scores = ranked.map((m) => m.fitScore);
  assert.deepEqual(scores, [...scores].sort((a, b) => b - a));
});

test("every match explains itself and never contradicts itself", () => {
  addCandidate("open-mid", "open", ["automation"]);
  const [m] = matchCandidatesForCapabilities(["automation", "operations"], "Acme");

  assert.ok(m.matchedCapabilities.includes("automation"));
  assert.ok(m.missingCapabilities.includes("operations"));
  assert.equal(m.matchedCapabilities.some((t) => m.missingCapabilities.includes(t)), false);
  assert.ok(m.supportingProjectIds.length > 0, "a match must point at the work behind it");
  assert.ok(m.fitScore > 0 && m.fitScore <= 98);
});
