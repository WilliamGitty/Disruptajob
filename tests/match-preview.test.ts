import test, { before, beforeEach } from "node:test";
import assert from "node:assert/strict";

/**
 * The truthful setup payoff (audit D1 replacement).
 *
 * Aggregate counts only, shown to a company that doesn't exist yet — so the two things to pin are
 * that it respects the privacy gates like every other read, and that it discloses numbers, never
 * people. The second is enforced by the return type; the first is tested here.
 */

process.env.DISRUPTAJOB_DB = ":memory:";

let previewMatchCount: typeof import("@/server/actions/match-preview").previewMatchCount;
let run: typeof import("@/server/db").run;

before(async () => {
  previewMatchCount = (await import("@/server/actions/match-preview")).previewMatchCount;
  run = (await import("@/server/db")).run;
});

const NOW = new Date().toISOString();

function addCandidate(id: string, discoverability: string, tags: string[], blocked: string[] = []) {
  run(
    `INSERT INTO candidate (id, slug, name, avatar_initials, accent_index, discoverability, created_at)
     VALUES (?,?,?,?,0,?,?)`,
    id, id, id, "XX", discoverability, NOW
  );
  tags.forEach((tag, i) => {
    const pid = `${id}-p${i}`;
    run(
      `INSERT INTO project (id, owner_id, slug, title, description, thumbnail_seed, outcome,
                            problem, what_i_built, my_contribution, status, source, created_at)
       VALUES (?,?,?,?,'','','','','','','published','manual',?)`,
      pid, id, pid, "W", NOW
    );
    run("INSERT INTO project_capability (project_id, tag) VALUES (?,?)", pid, tag);
  });
  for (const b of blocked) run("INSERT INTO blocked_company (candidate_id, company_name) VALUES (?,?)", id, b);
}

beforeEach(() => {
  run("DELETE FROM candidate");
  run("DELETE FROM project");
});

test("counts only discoverable people with evidence for a required capability", async () => {
  addCandidate("match", "open", ["automation"]);
  addCandidate("other-skill", "open", ["growth"]);
  addCandidate("hidden-match", "hidden", ["automation"]);

  const p = await previewMatchCount(["automation"], "Acme");
  assert.equal(p.matching, 1);
  assert.equal(p.discoverable, 2);
  assert.equal(p.total, 3, "the hidden are counted in total — honest context, no identity");
});

test("a candidate who blocked the signing-up company is not counted for them", async () => {
  addCandidate("blocks-acme", "open", ["automation"], ["Acme Ltd"]);

  assert.equal((await previewMatchCount(["automation"], "Acme")).matching, 0);
  assert.equal((await previewMatchCount(["automation"], "Beta")).matching, 1);
});

test("no required capabilities means zero matches, not everybody", async () => {
  addCandidate("match", "open", ["automation"]);
  assert.equal((await previewMatchCount([], "Acme")).matching, 0);
});

test("the honest-zero case reports the real pool so the copy can say how early it is", async () => {
  addCandidate("someone", "open", ["growth"]);
  const p = await previewMatchCount(["automation"], "Acme");
  assert.deepEqual([p.matching, p.discoverable, p.total], [0, 1, 1]);
});
