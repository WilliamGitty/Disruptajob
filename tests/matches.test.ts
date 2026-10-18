import test, { before, beforeEach } from "node:test";
import assert from "node:assert/strict";
import type { CandidateProfile } from "@/types";

/**
 * The candidate-side mirror. What the tests pin: the percentage is deterministic and
 * explainable (coverage plus depth, never a model), blocked companies never appear, and the
 * explanation lists exactly the overlap it scored.
 */

process.env.DISRUPTAJOB_DB = ":memory:";

let rolesMatchingCandidate: typeof import("@/server/repositories/matches").rolesMatchingCandidate;
let run: typeof import("@/server/db").run;

before(async () => {
  ({ rolesMatchingCandidate } = await import("@/server/repositories/matches"));
  ({ run } = await import("@/server/db"));
});

const NOW = new Date().toISOString();

function candidate(overrides: Partial<CandidateProfile> = {}): CandidateProfile {
  return {
    id: "cand-m", slug: "cand-m", userId: "u", name: "Test", headline: "",
    shortDescription: "", location: "", availability: "open", avatarInitials: "T",
    accentIndex: 0,
    capabilities: [
      { tag: "automation", label: "Automation", score: 80, evidenceCount: 2, projectIds: [] },
      { tag: "growth", label: "Growth", score: 40, evidenceCount: 1, projectIds: [] },
    ],
    projectIds: [], experience: [], education: [], discoverability: "open",
    ...overrides,
  };
}

function addRole(id: string, companyName: string, caps: string[], compRange?: string) {
  const companyId = `co-${id}`;
  run(
    `INSERT OR IGNORE INTO company (id, slug, name, avatar_initials, accent_index, published, created_at)
     VALUES (?,?,?,?,0,1,?)`,
    companyId, companyId, companyName, "C", NOW
  );
  run(
    `INSERT INTO role (id, company_id, title, why_this_role, status, comp_range, created_at)
     VALUES (?,?,?,'','open',?,?)`,
    id, companyId, `Role ${id}`, compRange ?? null, NOW
  );
  run("INSERT INTO work_example (id, role_id, title, description, sort_order) VALUES (?,?,'W','',0)", `we-${id}`, id);
  for (const tag of caps) {
    run("INSERT INTO work_example_capability (work_example_id, tag) VALUES (?,?)", `we-${id}`, tag);
  }
}

beforeEach(() => {
  for (const t of ["work_example_capability", "work_example", "role", "company"]) run(`DELETE FROM ${t}`);
});

test("the percentage is coverage plus depth, and the explanation matches it", () => {
  addRole("m1", "Coverage Co", ["automation", "growth"]);
  const [m] = rolesMatchingCandidate(candidate());
  assert.ok(m);
  // Full coverage (2/2) is 70, depth is avg score 60 of 100 giving 18: 88.
  assert.equal(m.pct, 88);
  assert.deepEqual(m.covered.sort(), ["automation", "growth"]);
  assert.deepEqual(m.missing, []);
});

test("partial coverage scores lower and names what's missing", () => {
  addRole("m2", "Partial Co", ["automation", "growth", "data-analysis"]);
  const [m] = rolesMatchingCandidate(candidate());
  // Coverage 2/3 is ~46.7, depth 60/100 gives 18: 65.
  assert.equal(m.pct, 65);
  assert.deepEqual(m.missing, ["data-analysis"]);
});

test("blocked companies never appear in the mirror", () => {
  addRole("m3", "Blocked Corp", ["automation"]);
  const matches = rolesMatchingCandidate(candidate({ blockedCompanies: ["Blocked Corp"] }));
  assert.ok(!matches.some((m) => m.companyName === "Blocked Corp"));
});

test("a comp range below the candidate's floor is flagged as a conflict", () => {
  addRole("m4", "Low Co", ["automation"], "£20,000-£25,000");
  const matches = rolesMatchingCandidate(
    candidate({
      nonNegotiables: { roleTypes: [], workArrangements: [], dealbreakers: [], compFloor: "£40,000" },
    })
  );
  assert.equal(matches[0]?.conflict, true);
});

test("no evidence means an empty mirror, not a flattering one", () => {
  addRole("m5", "Any Co", ["automation"]);
  const matches = rolesMatchingCandidate(
    candidate({ capabilities: [{ tag: "automation", label: "A", score: 0, evidenceCount: 0, projectIds: [] }] })
  );
  assert.equal(matches.length, 0);
});
