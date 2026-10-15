import test from "node:test";
import assert from "node:assert/strict";
import {
  computeCapabilities,
  mergeCapabilities,
  scoreFromEvidenceCount,
} from "@/lib/capability-scoring";
import type { Capability, Project } from "@/types";

/**
 * Capability scoring — the mechanism the whole product rests on.
 *
 * The claim being defended is narrow and absolute: a score can only come from tagged project
 * evidence. Not from a headline, not from an imported CV, not from anything a candidate asserts
 * about themselves. These tests exist so that if someone ever adds a self-declared path to a
 * score, something goes red.
 */

function project(overrides: Partial<Project> = {}): Project {
  return {
    id: "proj-1",
    slug: "a-project",
    ownerId: "cand-1",
    title: "A project",
    description: "",
    thumbnailSeed: "a-project",
    capabilities: [],
    tools: [],
    evidence: [],
    outcome: "",
    problem: "",
    whatIBuilt: "",
    myContribution: "",
    process: [],
    mediaGallery: [],
    status: "published",
    source: "manual",
    ...overrides,
  } as Project;
}

test("an untagged project produces no capability at all", () => {
  // Work nobody tagged can't be matched against, which is why addProject refuses to save it.
  assert.deepEqual(computeCapabilities([project({ capabilities: [] })]), []);
});

test("a tagged project with no attached artefacts still counts as one piece of evidence", () => {
  const caps = computeCapabilities([project({ capabilities: ["automation"], evidence: [] })]);

  assert.equal(caps.length, 1);
  assert.equal(caps[0].tag, "automation");
  assert.equal(caps[0].evidenceCount, 1);
});

test("attached evidence increases the count beyond the floor", () => {
  const caps = computeCapabilities([
    project({
      capabilities: ["automation"],
      evidence: [
        { id: "e1", type: "demo-link", label: "Repo", url: "https://example.com" },
        { id: "e2", type: "demo-link", label: "Demo", url: "https://example.com" },
        { id: "e3", type: "demo-link", label: "Doc", url: "https://example.com" },
      ],
    }),
  ]);

  assert.equal(caps[0].evidenceCount, 3);
});

test("draft projects never contribute to a score", () => {
  // An unreviewed import must not silently inflate a profile.
  const caps = computeCapabilities([
    project({ id: "p1", capabilities: ["automation"], status: "draft" }),
    project({ id: "p2", capabilities: ["automation"], status: "published" }),
  ]);

  assert.equal(caps.length, 1);
  assert.equal(caps[0].evidenceCount, 1, "only the published project should count");
  assert.deepEqual(caps[0].projectIds, ["p2"]);
});

test("a project tagged with several capabilities supports each of them", () => {
  const caps = computeCapabilities([
    project({ capabilities: ["automation", "operations", "workflow-design"] }),
  ]);

  assert.deepEqual(caps.map((c) => c.tag).sort(), ["automation", "operations", "workflow-design"]);
  for (const c of caps) assert.deepEqual(c.projectIds, ["proj-1"]);
});

test("the same project is never counted twice for one capability", () => {
  const caps = computeCapabilities([project({ id: "p1", capabilities: ["automation"] })]);
  assert.deepEqual(caps[0].projectIds, ["p1"]);
});

test("more evidence scores higher, and the score is capped", () => {
  assert.ok(scoreFromEvidenceCount(1) < scoreFromEvidenceCount(3));
  assert.ok(scoreFromEvidenceCount(3) < scoreFromEvidenceCount(6));
  assert.equal(scoreFromEvidenceCount(1000), 97, "a score must never reach a claim of perfection");
});

test("capabilities come back strongest first", () => {
  const caps = computeCapabilities([
    project({ id: "p1", capabilities: ["weak"] }),
    project({ id: "p2", capabilities: ["strong"] }),
    project({ id: "p3", capabilities: ["strong"] }),
  ]);

  assert.equal(caps[0].tag, "strong");
  assert.ok(caps[0].score > caps[1].score);
});

test("merging new work onto an existing profile moves the bar it belongs to", () => {
  const base: Capability[] = [
    { tag: "automation", label: "Automation", score: 44, evidenceCount: 1, projectIds: ["old"] },
  ];

  const merged = mergeCapabilities(base, [project({ id: "new", capabilities: ["automation"] })]);
  const automation = merged.find((c) => c.tag === "automation")!;

  assert.equal(automation.evidenceCount, 2);
  assert.ok(automation.score > 44, "adding evidence must visibly move the score");
  assert.deepEqual(automation.projectIds.sort(), ["new", "old"]);
});

test("merging work with a brand-new tag appends a capability rather than losing it", () => {
  const base: Capability[] = [
    { tag: "automation", label: "Automation", score: 44, evidenceCount: 1, projectIds: ["old"] },
  ];

  const merged = mergeCapabilities(base, [project({ id: "new", capabilities: ["growth"] })]);

  assert.equal(merged.length, 2);
  assert.ok(merged.some((c) => c.tag === "growth"));
});

test("merging nothing changes nothing", () => {
  const base: Capability[] = [
    { tag: "automation", label: "Automation", score: 44, evidenceCount: 1, projectIds: ["old"] },
  ];

  assert.deepEqual(mergeCapabilities(base, []), base);
});
