import test, { before } from "node:test";
import assert from "node:assert/strict";

/**
 * The demo-population flag. Two properties carry the honesty promise:
 * every seeded (invented) person and company is flagged, and nothing a real
 * sign-up does can ever set the flag — it exists only on the seed path.
 */

process.env.DISRUPTAJOB_DB = ":memory:";

let get: typeof import("@/server/db").get;
let run: typeof import("@/server/db").run;

before(async () => {
  ({ get, run } = await import("@/server/db"));
});

test("every seeded candidate and company is flagged as demo", () => {
  const unflaggedCandidates = get<{ n: number }>(
    "SELECT COUNT(*) AS n FROM candidate WHERE demo = 0"
  );
  const unflaggedCompanies = get<{ n: number }>("SELECT COUNT(*) AS n FROM company WHERE demo = 0");
  const total = get<{ n: number }>("SELECT COUNT(*) AS n FROM candidate");
  assert.ok((total?.n ?? 0) > 0, "seed should have populated the database");
  assert.equal(unflaggedCandidates?.n, 0, "an unlabelled invented person is a lie to real users");
  assert.equal(unflaggedCompanies?.n, 0);
});

test("a candidate created the way sign-up creates one is not demo", () => {
  // Mirrors the INSERT in auth.ts signUp: the demo column is simply never mentioned.
  run(
    `INSERT INTO candidate (id, slug, name, headline, short_description, location,
                            availability, avatar_initials, accent_index, discoverability, created_at)
     VALUES ('cand-real-1','real-person','Real Person','','','','open','RP',0,'hidden',?)`,
    new Date().toISOString()
  );
  const row = get<{ demo: number }>("SELECT demo FROM candidate WHERE id = 'cand-real-1'");
  assert.equal(row?.demo, 0);
});

test("the repository surfaces the flag", async () => {
  const { getCandidateBySlug } = await import("@/server/repositories/candidates");
  const seeded = getCandidateBySlug("jordan-blake");
  const real = getCandidateBySlug("real-person");
  assert.equal(seeded?.isDemo, true);
  assert.equal(real?.isDemo, false);
});
