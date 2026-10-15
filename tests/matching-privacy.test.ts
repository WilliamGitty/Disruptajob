import test from "node:test";
import assert from "node:assert/strict";
import { matchCandidatesForCapabilities } from "@/lib/role-matching";
import { CANDIDATES } from "@/lib/mock-data";
import { isVisibleTo } from "@/lib/visibility";

/**
 * Where matching meets privacy.
 *
 * Both halves can be individually correct and the product still fail: a search that ranks people
 * beautifully and forgets to apply the gate is the worst outcome this codebase can produce. These
 * tests assert the join — that nothing reaches a result set which the viewer was not allowed to
 * see — rather than trusting that each side behaves.
 */

const VIEWERS = ["Meridian Robotics", "Halcyon Systems", "Nordstar Analytics"];
const ALL_TAGS = [...new Set(CANDIDATES.flatMap((c) => c.capabilities.map((cap) => cap.tag)))];

test("the fixture population actually contains people who are not discoverable", () => {
  // Without this, every assertion below could pass vacuously.
  const hidden = CANDIDATES.filter((c) => (c.discoverability ?? "hidden") === "hidden");
  assert.ok(hidden.length > 0, "fixtures must include at least one hidden candidate");
});

test("no match is ever returned for a candidate the viewer cannot see", () => {
  for (const viewer of VIEWERS) {
    const matches = matchCandidatesForCapabilities(ALL_TAGS, viewer);

    for (const match of matches) {
      const person = CANDIDATES.find((c) => c.id === match.candidateId);
      assert.ok(person, `match referenced an unknown candidate: ${match.candidateId}`);
      assert.equal(
        isVisibleTo(person, viewer),
        true,
        `"${viewer}" was shown ${person.name}, who is not visible to them`
      );
    }
  }
});

test("a candidate blocking a company is absent from that company's matches and present elsewhere", () => {
  const blocker = CANDIDATES.find(
    (c) => (c.blockedCompanies ?? []).length > 0 && (c.discoverability ?? "hidden") !== "hidden"
  );

  if (!blocker) {
    // Stated rather than silently skipped: if fixtures lose this case, the gap should be visible.
    assert.fail("fixtures must include a discoverable candidate with a blocklist");
  }

  const blockedCompany = blocker.blockedCompanies![0];
  const tags = blocker.capabilities.map((c) => c.tag);

  const blockedView = matchCandidatesForCapabilities(tags, blockedCompany);
  assert.equal(
    blockedView.some((m) => m.candidateId === blocker.id),
    false,
    `${blocker.name} appeared in results for ${blockedCompany}, whom they blocked`
  );

  const otherView = matchCandidatesForCapabilities(tags, "An Unrelated Company Ltd");
  assert.equal(
    otherView.some((m) => m.candidateId === blocker.id),
    true,
    `${blocker.name} should still be matchable by companies they did not block`
  );
});

test("asking for no capabilities returns nothing rather than everyone", () => {
  // A dropped filter must fail closed. Returning the whole population here would quietly turn
  // an empty search into a people directory.
  assert.deepEqual(matchCandidatesForCapabilities([], "Meridian Robotics"), []);
});

test("results are ordered by fit, strongest first", () => {
  const matches = matchCandidatesForCapabilities(ALL_TAGS, "An Unrelated Company Ltd");
  const scores = matches.map((m) => m.fitScore);

  assert.deepEqual(scores, [...scores].sort((a, b) => b - a));
});

test("every match explains itself — matched tags, gaps, and the work behind them", () => {
  // "Explainable by construction" is a product claim, not a nicety: an employer is told why.
  const matches = matchCandidatesForCapabilities(ALL_TAGS, "An Unrelated Company Ltd");
  assert.ok(matches.length > 0, "expected at least one match from the fixture population");

  for (const match of matches) {
    assert.ok(match.matchedCapabilities.length > 0, "a match with no matched capability is not a match");
    assert.ok(match.supportingProjectIds.length > 0, "a match must point at the work behind it");
    assert.equal(
      match.matchedCapabilities.some((t) => match.missingCapabilities.includes(t)),
      false,
      "a capability cannot be both matched and missing"
    );
    assert.ok(match.fitScore > 0 && match.fitScore <= 98);
  }
});
