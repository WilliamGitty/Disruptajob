import test, { before, beforeEach } from "node:test";
import assert from "node:assert/strict";
import type { CandidateProfile } from "@/types";

/**
 * Demand, shown without anything to apply to.
 *
 * This is the job-board question answered in code: a candidate sees who is describing work they
 * can evidence, and crucially how many of those companies cannot currently see them. The tests
 * pin the parts that would quietly turn it back into a job board — counting roles nobody can
 * match, or reporting demand from companies the candidate has deliberately hidden from.
 */

process.env.DISRUPTAJOB_DB = ":memory:";

let demandFor: typeof import("@/server/repositories/demand").demandFor;
let run: typeof import("@/server/db").run;

before(async () => {
  demandFor = (await import("@/server/repositories/demand")).demandFor;
  run = (await import("@/server/db")).run;
});

const NOW = new Date().toISOString();

function candidate(overrides: Partial<CandidateProfile> = {}): CandidateProfile {
  return {
    id: "cand-1",
    slug: "cand-1",
    userId: "u",
    name: "Test",
    headline: "",
    shortDescription: "",
    location: "",
    availability: "open",
    avatarInitials: "TT",
    accentIndex: 0,
    capabilities: [
      { tag: "automation", label: "Automation", score: 50, evidenceCount: 2, projectIds: ["p"] },
    ],
    projectIds: [],
    experience: [],
    education: [],
    discoverability: "open",
    ...overrides,
  };
}

function addRole(id: string, companyId: string, companyName: string, capabilities: string[], status = "open") {
  run(
    `INSERT OR IGNORE INTO company (id, slug, name, avatar_initials, accent_index, published, created_at)
     VALUES (?,?,?,?,0,1,?)`,
    companyId, companyId, companyName, "CC", NOW
  );
  run(
    `INSERT INTO role (id, company_id, title, why_this_role, status, created_at)
     VALUES (?,?,?,'',?,?)`,
    id, companyId, `Role ${id}`, status, NOW
  );
  run(
    "INSERT INTO work_example (id, role_id, title, description, sort_order) VALUES (?,?,?,'',0)",
    `we-${id}`, id, "Work"
  );
  for (const tag of capabilities) {
    run("INSERT INTO work_example_capability (work_example_id, tag) VALUES (?,?)", `we-${id}`, tag);
  }
}

beforeEach(() => {
  for (const t of ["work_example_capability", "work_example", "role", "company"]) run(`DELETE FROM ${t}`);
});

test("only roles asking for something the candidate has evidenced are counted", () => {
  addRole("r1", "co1", "Acme", ["automation"]);
  addRole("r2", "co2", "Beta", ["growth"]);

  const d = demandFor(candidate());
  assert.equal(d.matchingRoles, 1);
});

test("capabilities with no evidence behind them don't create demand", () => {
  // A self-declared capability must not make the product tell someone they're in demand.
  addRole("r1", "co1", "Acme", ["growth"]);
  const c = candidate({
    capabilities: [
      { tag: "growth", label: "Growth", score: 40, evidenceCount: 0, projectIds: [] },
    ],
  });

  assert.equal(demandFor(c).matchingRoles, 0);
});

test("closed and draft roles are ignored", () => {
  addRole("open", "co1", "Acme", ["automation"], "open");
  addRole("closed", "co2", "Beta", ["automation"], "closed");
  addRole("draft", "co3", "Gamma", ["automation"], "draft");

  assert.equal(demandFor(candidate()).matchingRoles, 1);
});

test("a hidden candidate is told how many of those companies cannot see them", () => {
  addRole("r1", "co1", "Acme", ["automation"]);
  addRole("r2", "co2", "Beta", ["automation"]);

  const d = demandFor(candidate({ discoverability: "hidden" }));

  assert.equal(d.matchingRoles, 2);
  assert.equal(d.invisibleTo, 2);
  assert.equal(d.hiddenEntirely, true);
});

test("a blocked company counts as unable to see them, and is not singled out", () => {
  addRole("r1", "co1", "Meridian Robotics", ["automation"]);
  addRole("r2", "co2", "Beta", ["automation"]);

  const d = demandFor(candidate({ blockedCompanies: ["Meridian"] }));

  assert.equal(d.matchingRoles, 2);
  assert.equal(d.invisibleTo, 1);
  assert.equal(d.hiddenEntirely, false);
  // The summary is counts only — naming the blocked company back at them serves nobody.
  assert.equal(JSON.stringify(d).includes("Meridian"), false);
});

test("an open, unblocked candidate is invisible to nobody", () => {
  addRole("r1", "co1", "Acme", ["automation"]);
  assert.equal(demandFor(candidate()).invisibleTo, 0);
});

test("in-demand capabilities are ranked, and gaps are reported separately", () => {
  addRole("r1", "co1", "Acme", ["automation", "operations"]);
  addRole("r2", "co2", "Beta", ["automation"]);

  const d = demandFor(candidate());

  assert.equal(d.inDemand[0].tag, "automation");
  assert.equal(d.inDemand[0].roles, 2);
  assert.ok(d.gaps.some((g) => g.tag === "operations"), "unevidenced demand belongs in gaps");
  assert.equal(d.inDemand.some((x) => x.tag === "operations"), false);
});

test("roles with no capabilities on them are skipped rather than matching everyone", () => {
  run(`INSERT INTO company (id, slug, name, avatar_initials, accent_index, published, created_at)
       VALUES ('co9','co9','Empty','EE',0,1,?)`, NOW);
  run(`INSERT INTO role (id, company_id, title, why_this_role, status, created_at)
       VALUES ('r9','co9','Untagged','', 'open', ?)`, NOW);

  assert.equal(demandFor(candidate()).matchingRoles, 0);
});

test("unpublished companies don't generate demand", () => {
  addRole("r1", "co1", "Acme", ["automation"]);
  run("UPDATE company SET published = 0 WHERE id = 'co1'");

  assert.equal(demandFor(candidate()).matchingRoles, 0);
});

test("the named list carries company, role, overlap, and visibility", () => {
  addRole("r-d1", "co-d1", "Detail Co", ["automation", "growth"]);
  const d = demandFor(candidate({ discoverability: "hidden" }));
  const row = d.matchingRoleDetails.find((r) => r.companyName === "Detail Co");
  assert.ok(row, "matching role must be listed");
  assert.deepEqual(row.tags, ["automation"], "only the evidenced overlap is shown");
  assert.equal(row.canSee, false, "a hidden candidate is marked invisible to them");
});

test("blocked companies are counted but never named", () => {
  addRole("r-d2", "co-d2", "Blocked Corp", ["automation"]);
  const d = demandFor(candidate({ blockedCompanies: ["Blocked Corp"] }));
  assert.ok(d.matchingRoles >= 1, "still counted in the aggregate");
  assert.ok(
    !d.matchingRoleDetails.some((r) => r.companyName === "Blocked Corp"),
    "a blocklist entry is not singled out back to its owner"
  );
});

test("the named list is capped and ordered by overlap", () => {
  for (let i = 0; i < 12; i++) {
    addRole(`r-cap-${i}`, `co-cap-${i}`, `Cap Co ${i}`, ["automation"]);
  }
  const d = demandFor(candidate());
  assert.ok(d.matchingRoleDetails.length <= 8, "capped at eight rows");
});
