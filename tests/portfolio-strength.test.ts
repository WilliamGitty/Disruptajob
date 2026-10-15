import test from "node:test";
import assert from "node:assert/strict";
import { assessPortfolio } from "@/lib/portfolio-strength";
import type { Project } from "@/types";

/**
 * Portfolio feedback.
 *
 * The rule being defended: this reads evidence and never produces any. A candidate who follows
 * every suggestion ends up stronger because they added real work, not because they ticked boxes —
 * so the tests check that the advice is specific, ordered by what an employer actually does, and
 * that "strong" cannot be reached by writing more words.
 */

function project(overrides: Partial<Project> = {}): Project {
  return {
    id: "p1",
    slug: "p1",
    ownerId: "c1",
    title: "A project",
    description: "",
    thumbnailSeed: "p1",
    capabilities: ["automation"],
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
  };
}

const LINK = [{ id: "e1", type: "demo-link" as const, label: "Repo", url: "https://example.com" }];
const DEEP = "A long description of the problem that existed before any of this was built, with real detail.";

test("an empty portfolio is described as normal, not as a failure", () => {
  const result = assessPortfolio([]);

  assert.equal(result.band, "empty");
  assert.match(result.summary, /start/i);
  // Tone matters most exactly here. Nothing should imply the person has done something wrong.
  assert.doesNotMatch(result.headline + result.summary, /incomplete|missing|fail|poor|weak/i);
  assert.equal(result.suggestions[0].id, "first-project");
});

test("drafts are the first thing raised, because they're invisible and nearly finished", () => {
  const result = assessPortfolio([
    project({ id: "live", capabilities: ["automation"] }),
    project({ id: "draft", status: "draft", capabilities: [] }),
  ]);

  assert.equal(result.suggestions[0].id, "publish-drafts");
  assert.equal(result.suggestions[0].projectId, "draft");
});

test("drafts never count toward any signal", () => {
  const result = assessPortfolio([
    project({ id: "d1", status: "draft", capabilities: ["automation", "operations"], outcome: "cut 40%" }),
  ]);

  assert.equal(result.signals.publishedProjects, 0);
  assert.equal(result.signals.capabilitiesEvidenced, 0);
  assert.equal(result.band, "empty");
});

test("a measurable outcome is distinguished from a described one", () => {
  const vague = assessPortfolio([project({ outcome: "Saved the team a lot of time" })]);
  const measured = assessPortfolio([project({ outcome: "Cut a two-hour daily job to 10 minutes" })]);

  assert.equal(vague.signals.projectsWithOutcome, 0);
  assert.equal(measured.signals.projectsWithOutcome, 1);
  assert.ok(vague.suggestions.some((s) => s.id === "quantify-outcome"));
  assert.equal(measured.suggestions.some((s) => s.id === "quantify-outcome"), false);
});

test("the quantify suggestion names the project it means", () => {
  const result = assessPortfolio([project({ id: "p9", title: "Invoice triage bot" })]);
  const s = result.suggestions.find((x) => x.id === "quantify-outcome");

  assert.ok(s);
  assert.equal(s.projectId, "p9");
  assert.match(s.title, /Invoice triage bot/);
});

test("more words alone cannot reach 'strong' — proof and results are required", () => {
  // Three deep projects across three capabilities, but nothing anyone can open and no numbers.
  const wordy = assessPortfolio([
    project({ id: "a", capabilities: ["automation"], problem: DEEP }),
    project({ id: "b", capabilities: ["operations"], problem: DEEP }),
    project({ id: "c", capabilities: ["growth"], problem: DEEP }),
  ]);
  assert.notEqual(wordy.band, "strong");

  const proven = assessPortfolio([
    project({ id: "a", capabilities: ["automation"], problem: DEEP, outcome: "cut 2 hours to 10 minutes", evidence: LINK }),
    project({ id: "b", capabilities: ["operations"], problem: DEEP, outcome: "handled 1,200 a month", evidence: LINK }),
    project({ id: "c", capabilities: ["growth"], problem: DEEP, outcome: "grew 30%", evidence: LINK }),
  ]);
  assert.equal(proven.band, "strong");
});

test("bands move in one direction as real work is added", () => {
  const one = assessPortfolio([project({ id: "a", capabilities: ["automation"] })]);
  const two = assessPortfolio([
    project({ id: "a", capabilities: ["automation"] }),
    project({ id: "b", capabilities: ["operations"] }),
  ]);

  assert.equal(one.band, "started");
  assert.equal(two.band, "credible");
});

test("a capability resting on one project is flagged once there's enough to compare", () => {
  const result = assessPortfolio([
    project({ id: "a", capabilities: ["automation"] }),
    project({ id: "b", capabilities: ["operations"] }),
  ]);

  assert.deepEqual(result.signals.singleEvidenceCapabilities.sort(), ["automation", "operations"]);
  assert.ok(result.suggestions.some((s) => s.id === "thicken"));
});

test("visibility is raised only once the portfolio is worth finding, and never as a demand", () => {
  const thin = assessPortfolio([project({ id: "a" })], { discoverability: "hidden" });
  assert.equal(thin.suggestions.some((s) => s.id === "consider-visibility"), false);

  const ready = assessPortfolio(
    [project({ id: "a", capabilities: ["automation"] }), project({ id: "b", capabilities: ["operations"] })],
    { discoverability: "hidden" }
  );
  const visibility = ready.suggestions.find((s) => s.id === "consider-visibility");

  assert.ok(visibility);
  // It comes last, and it offers rather than instructs.
  assert.equal(ready.suggestions[ready.suggestions.length - 1].id, "consider-visibility");
  assert.match(visibility.title, /when you're ready/i);
});

test("every suggestion explains why an employer cares, not why the form is incomplete", () => {
  const result = assessPortfolio([project({ id: "a" })], { discoverability: "hidden" });

  for (const s of result.suggestions) {
    assert.ok(s.why.length > 30, `suggestion "${s.id}" has no real reason attached`);
    assert.doesNotMatch(s.why, /complete your profile|fill in|100%/i);
  }
});

test("suggestions come back in priority order", () => {
  const result = assessPortfolio(
    [project({ id: "a", status: "draft" }), project({ id: "b" })],
    { discoverability: "hidden" }
  );
  const priorities = result.suggestions.map((s) => s.priority);

  assert.deepEqual(priorities, [...priorities].sort((a, b) => a - b));
});
