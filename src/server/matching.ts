import { listDiscoverableCandidates } from "./repositories/discovery";
import { capabilitiesForRole } from "./repositories/companies";
import type { CandidateProfile, Role } from "@/types";

/**
 * Matching a role to candidates, against the database.
 *
 * The server-side counterpart of `lib/role-matching.ts`. Scoring is identical — what changes is
 * where the population comes from: `listDiscoverableCandidates` applies the privacy gate in the
 * query, so a hidden or blocking candidate can't reach the ranking at all rather than being
 * filtered out afterwards by a caller who might forget.
 */

export interface RoleMatch {
  candidateId: string;
  fitScore: number;
  matchedCapabilities: string[];
  missingCapabilities: string[];
  supportingProjectIds: string[];
}

function scoreCandidate(candidate: CandidateProfile, required: string[]): RoleMatch | null {
  const matched = candidate.capabilities.filter((c) => required.includes(c.tag));
  if (matched.length === 0) return null;

  const coverage = matched.length / required.length;
  const avgStrength = matched.reduce((sum, c) => sum + c.score, 0) / matched.length;

  // Coverage dominates: broad-but-decent beats narrow-but-brilliant when work demands several
  // capabilities. Strength then separates candidates with equal coverage.
  const fitScore = Math.round(Math.min(98, coverage * 70 + (avgStrength / 100) * 30));

  return {
    candidateId: candidate.id,
    fitScore,
    matchedCapabilities: matched.map((c) => c.tag),
    missingCapabilities: required.filter((t) => !matched.some((c) => c.tag === t)),
    supportingProjectIds: [...new Set(matched.flatMap((c) => c.projectIds))],
  };
}

export function matchCandidatesForCapabilities(
  required: string[],
  viewingCompany: string
): RoleMatch[] {
  if (required.length === 0) return [];
  return listDiscoverableCandidates(viewingCompany)
    .map((c) => scoreCandidate(c, required))
    .filter((m): m is RoleMatch => m !== null)
    .sort((a, b) => b.fitScore - a.fitScore);
}

export function matchCandidatesForRole(role: Role, viewingCompany: string): RoleMatch[] {
  return matchCandidatesForCapabilities(capabilitiesForRole(role), viewingCompany);
}
