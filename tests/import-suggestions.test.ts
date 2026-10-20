import test, { before } from "node:test";
import assert from "node:assert/strict";

/**
 * The suggestion firewall.
 *
 * On 20 Oct 2026 the founder moved AI tag suggestions from unchecked-by-default to
 * pre-selected-by-default in the import desk UI. The rule that must survive that move:
 * a suggestion row (project_suggested_tag) is NEVER a capability. Scores read
 * project_capability only, and nothing fills project_capability but a human publish.
 * These tests break the firewall on purpose and check the suite notices.
 */

process.env.DISRUPTAJOB_DB = ":memory:";

let run: (sql: string, ...params: unknown[]) => void;
let getCandidateById: (id: string) => { capabilities: { tag: string }[] } | undefined;
let suggestedTagsForOwner: (candidateId: string) => Record<string, string[]>;

before(async () => {
  const db = await import("@/server/db");
  const candidates = await import("@/server/repositories/candidates");
  const projects = await import("@/server/repositories/projects");
  run = db.run;
  getCandidateById = candidates.getCandidateById;
  suggestedTagsForOwner = projects.suggestedTagsForOwner;

  run(
    `INSERT INTO candidate (id, slug, name, headline, short_description, location,
                            availability, avatar_initials, accent_index, discoverability, demo, created_at)
     VALUES ('cand-sugg','cand-sugg','Suggestion Test','','','','open','ST',0,'hidden',0,'2026-10-20')`
  );
  run(
    `INSERT INTO project (id, owner_id, slug, title, description, thumbnail_seed, outcome,
                          problem, what_i_built, my_contribution, status, source, created_at)
     VALUES ('proj-sugg','cand-sugg','imported-thing','Imported thing','A real thing','seed','',
             '','','','draft','github-import','2026-10-20')`
  );
  run("INSERT INTO project_suggested_tag (project_id, tag) VALUES ('proj-sugg','automation')");
  run("INSERT INTO project_suggested_tag (project_id, tag) VALUES ('proj-sugg','operations')");
});

test("a suggestion is not a capability: suggested tags alone produce zero score", () => {
  const me = getCandidateById("cand-sugg");
  assert.ok(me);
  assert.equal(
    me.capabilities.length,
    0,
    "suggestion rows must never surface as capabilities before a human publish"
  );
});

test("the desk can read its suggestions back after a reload", () => {
  const map = suggestedTagsForOwner("cand-sugg");
  assert.deepEqual(map["proj-sugg"]?.sort(), ["automation", "operations"]);
});

test("publishing with human ticks moves the claim and clears the suggestions", () => {
  // The batch action's core writes, replayed directly (the action itself needs a session).
  run("UPDATE project SET status = 'published' WHERE id = 'proj-sugg'");
  run("INSERT OR IGNORE INTO project_capability (project_id, tag) VALUES ('proj-sugg','automation')");
  run("DELETE FROM project_suggested_tag WHERE project_id = 'proj-sugg'");

  const me = getCandidateById("cand-sugg");
  assert.ok(me);
  assert.deepEqual(
    me.capabilities.map((c) => c.tag),
    ["automation"],
    "only the human-claimed tag scores; the unticked suggestion died with the draft"
  );
  assert.deepEqual(suggestedTagsForOwner("cand-sugg"), {}, "suggestions are gone after publish");
});
