import test from "node:test";
import assert from "node:assert/strict";
import { assessMutualFit } from "@/lib/role-matching";
import { toEmployerSafeTerms } from "@/lib/terms";
import type { CandidateProfile, EmployerTerms, NonNegotiables } from "@/types";

/**
 * Mutual fit, and the asymmetry that makes it safe to show.
 *
 * A company's range is public because they chose to post it. A candidate's floor is private and
 * may only ever produce a verdict — "clears" or "doesn't" — never a number. These tests exist
 * because the failure is silent: a leak here reads like a helpful explanation right up until a
 * candidate realises an employer learned what they'd accept.
 */

function candidate(nonNegotiables?: NonNegotiables): CandidateProfile {
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
    nonNegotiables,
  };
}

const TERMS = (overrides: Partial<EmployerTerms> = {}): EmployerTerms => ({
  compRange: "£70,000 – £90,000",
  workArrangements: ["hybrid"],
  constraints: [],
  ...overrides,
});

test("a range clearing the candidate's floor reads as a fit", () => {
  const fit = assessMutualFit(
    TERMS(),
    candidate({ roleTypes: [], workArrangements: [], dealbreakers: [], compFloor: "£75,000" })
  );
  assert.equal(fit.compensation, "fits");
});

test("a range below the candidate's floor reads as a conflict", () => {
  const fit = assessMutualFit(
    TERMS({ compRange: "£50,000 – £60,000" }),
    candidate({ roleTypes: [], workArrangements: [], dealbreakers: [], compFloor: "£75,000" })
  );
  assert.equal(fit.compensation, "conflicts");
});

test("the candidate's private floor never appears in employer-facing notes", () => {
  // The whole asymmetry in one assertion. A verdict is allowed out; a figure is not.
  for (const range of ["£50,000 – £60,000", "£70,000 – £90,000", "£120,000"]) {
    const fit = assessMutualFit(
      TERMS({ compRange: range }),
      candidate({ roleTypes: [], workArrangements: [], dealbreakers: [], compFloor: "£82,500" })
    );

    const prose = fit.notes.join(" ");
    for (const leak of ["82,500", "82500", "82.5"]) {
      assert.equal(
        prose.includes(leak),
        false,
        `note leaked the candidate's floor (${leak}) for range "${range}": ${prose}`
      );
    }
  }
});

test("mismatched currencies yield no verdict rather than a wrong one", () => {
  // Inventing a conversion rate could rule someone out of a job on a guess.
  const fit = assessMutualFit(
    TERMS({ compRange: "$90,000" }),
    candidate({ roleTypes: [], workArrangements: [], dealbreakers: [], compFloor: "£75,000" })
  );
  assert.equal(fit.compensation, "unknown");
});

test("a candidate who stated no floor produces no compensation verdict", () => {
  const fit = assessMutualFit(TERMS(), candidate({ roleTypes: [], workArrangements: [], dealbreakers: [] }));
  assert.equal(fit.compensation, "unknown");
});

test("a candidate with no stated terms at all is handled, not crashed on", () => {
  const fit = assessMutualFit(TERMS(), candidate(undefined));
  assert.equal(fit.compensation, "unknown");
  assert.equal(fit.workArrangement, "unknown");
});

test("'90k' and '90,000' are read as the same figure", () => {
  const shorthand = assessMutualFit(
    TERMS({ compRange: "£90k" }),
    candidate({ roleTypes: [], workArrangements: [], dealbreakers: [], compFloor: "£80,000" })
  );
  const longhand = assessMutualFit(
    TERMS({ compRange: "£90,000" }),
    candidate({ roleTypes: [], workArrangements: [], dealbreakers: [], compFloor: "£80,000" })
  );
  assert.equal(shorthand.compensation, longhand.compensation);
  assert.equal(shorthand.compensation, "fits");
});

test("overlapping work arrangements fit, disjoint ones conflict", () => {
  const base = { roleTypes: [], dealbreakers: [] };

  assert.equal(
    assessMutualFit(
      TERMS({ workArrangements: ["hybrid", "onsite"] }),
      candidate({ ...base, workArrangements: ["remote", "hybrid"] })
    ).workArrangement,
    "fits"
  );

  assert.equal(
    assessMutualFit(
      TERMS({ workArrangements: ["onsite"] }),
      candidate({ ...base, workArrangements: ["remote"] })
    ).workArrangement,
    "conflicts"
  );
});

test("toEmployerSafeTerms removes the private floor rather than blanking it", () => {
  // Blanking would still show the field exists; removal means there is nothing to render.
  const safe = toEmployerSafeTerms({
    roleTypes: ["Ops Lead"],
    workArrangements: ["remote"],
    dealbreakers: ["no on-call"],
    compFloor: "£82,500",
    locationConstraint: "Manchester",
  });

  assert.equal("compFloor" in safe, false);
  assert.equal(JSON.stringify(safe).includes("82,500"), false);
  // Everything the employer is entitled to see survives.
  assert.deepEqual(safe.roleTypes, ["Ops Lead"]);
  assert.deepEqual(safe.dealbreakers, ["no on-call"]);
});
