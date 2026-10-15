import test from "node:test";
import assert from "node:assert/strict";
import {
  isBlockedBy,
  isDiscoverable,
  isVisibleTo,
  partitionByVisibility,
} from "@/lib/visibility";
import type { CandidateProfile, Discoverability } from "@/types";

/**
 * The search privacy gate.
 *
 * This is the highest-stakes logic in the product: someone can lose the job they already have if
 * it is wrong. The tests are therefore written around the two failure directions, which are not
 * equally bad — showing a hidden candidate is a disaster, while hiding a visible one is merely a
 * poor result — and they pin the "absent data means hidden" rule that makes the safe direction
 * the default.
 */

function candidate(overrides: Partial<CandidateProfile> = {}): CandidateProfile {
  return {
    id: "cand-1",
    slug: "test-person",
    userId: "user-1",
    name: "Test Person",
    headline: "",
    shortDescription: "",
    location: "",
    availability: "open",
    avatarInitials: "TP",
    accentIndex: 0,
    capabilities: [],
    projectIds: [],
    experience: [],
    education: [],
    ...overrides,
  };
}

test("a profile with no discoverability set is hidden, never open", () => {
  // The single most important line in the file: absent data must never be read as consent.
  assert.equal(isDiscoverable(candidate()), false);
  assert.equal(isVisibleTo(candidate(), "Meridian Robotics"), false);
});

test("discoverability states gate search as documented", () => {
  const cases: [Discoverability, boolean][] = [
    ["hidden", false],
    ["open", true],
    ["selectively-open", true],
  ];
  for (const [state, expected] of cases) {
    assert.equal(
      isDiscoverable(candidate({ discoverability: state })),
      expected,
      `discoverability "${state}" should be ${expected ? "" : "not "}discoverable`
    );
  }
});

test("an unrecognised discoverability value does not open a profile", () => {
  // Defends against a bad write or a future enum member: anything that isn't explicitly a
  // non-hidden state should still be treated conservatively by callers.
  const c = candidate({ discoverability: "hidden" as Discoverability });
  assert.equal(isVisibleTo(c, "Anyone"), false);
});

test("blocking works across the forms a person would actually type", () => {
  const c = candidate({
    discoverability: "open",
    blockedCompanies: ["Meridian Robotics"],
  });

  for (const typed of [
    "Meridian Robotics",
    "meridian robotics",
    "MERIDIAN ROBOTICS",
    "Meridian Robotics Ltd",
    "Meridian Robotics Limited",
    "meridian-robotics.com",
    "Meridian  Robotics.",
    "Meridian", // employer's short name still matches the fuller blocked name
  ]) {
    assert.equal(isBlockedBy(c, typed), true, `"${typed}" should match the blocklist`);
    assert.equal(isVisibleTo(c, typed), false, `"${typed}" should not see this profile`);
  }
});

test("blocking a short name also covers the longer legal entity", () => {
  const c = candidate({ discoverability: "open", blockedCompanies: ["Meridian"] });
  assert.equal(isBlockedBy(c, "Meridian Robotics Ltd"), true);
});

test("an unrelated company is not blocked", () => {
  const c = candidate({ discoverability: "open", blockedCompanies: ["Meridian Robotics"] });
  assert.equal(isBlockedBy(c, "Halcyon Systems"), false);
  assert.equal(isVisibleTo(c, "Halcyon Systems"), true);
});

test("an empty blocklist blocks nobody", () => {
  const c = candidate({ discoverability: "open", blockedCompanies: [] });
  assert.equal(isBlockedBy(c, "Meridian Robotics"), false);
});

test("an empty or whitespace company name is never treated as a match", () => {
  // A blank viewer must not accidentally collide with every blocklist entry via substring logic.
  const c = candidate({ discoverability: "open", blockedCompanies: ["Meridian Robotics"] });
  assert.equal(isBlockedBy(c, ""), false);
  assert.equal(isBlockedBy(c, "   "), false);
});

test("a blocklist entry that normalises to nothing is ignored rather than matching everyone", () => {
  const c = candidate({ discoverability: "open", blockedCompanies: ["", "   ", "..."] });
  assert.equal(isBlockedBy(c, "Meridian Robotics"), false);
});

test("hiding beats an empty blocklist — both gates are independent", () => {
  const c = candidate({ discoverability: "hidden", blockedCompanies: [] });
  assert.equal(isVisibleTo(c, "Meridian Robotics"), false);
});

test("partitionByVisibility reports a count and never identities", () => {
  const population = [
    candidate({ id: "visible-1", discoverability: "open" }),
    candidate({ id: "visible-2", discoverability: "selectively-open" }),
    candidate({ id: "hidden-1" }), // no discoverability at all
    candidate({ id: "hidden-2", discoverability: "hidden" }),
    candidate({ id: "blocked-1", discoverability: "open", blockedCompanies: ["Meridian"] }),
  ];

  const { visible, withheldCount } = partitionByVisibility(population, "Meridian Robotics");

  assert.deepEqual(
    visible.map((c) => c.id),
    ["visible-1", "visible-2"]
  );
  assert.equal(withheldCount, 3);

  // The shape itself is the privacy guarantee: a bare number, with no way to recover who or why.
  assert.deepEqual(Object.keys({ visible, withheldCount }).sort(), ["visible", "withheldCount"]);
});

test("the same person is visible to one company and invisible to another", () => {
  // The actual product promise: searching for work must not cost you the job you have.
  const c = candidate({ discoverability: "open", blockedCompanies: ["Meridian Robotics"] });

  assert.equal(isVisibleTo(c, "Meridian Robotics"), false);
  assert.equal(isVisibleTo(c, "Halcyon Systems"), true);
});
