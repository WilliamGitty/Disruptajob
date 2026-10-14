import type { CandidateProfile, EmployerTerms, Role, TermsVerdict } from "@/types";
import { CANDIDATES, capabilitiesForRole } from "./mock-data";
import { partitionByVisibility } from "./visibility";
import { CURRENT_EMPLOYER_COMPANY } from "./current-user";

/**
 * Matching a role to candidates by capability overlap.
 *
 * This is the point of posting real work instead of a job description: both sides of the match
 * are expressed in the same vocabulary. A role's requirements come from the work examples a
 * company wrote; a candidate's capabilities come from evidence they attached. So matching is a
 * set overlap weighted by proof — no keyword guessing, and every number is explainable.
 */

export interface RoleMatch {
  candidateId: string;
  /** 0-100. Coverage of what the work demands, weighted by how well-evidenced each one is. */
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

  // Coverage dominates — someone strong in one of five required capabilities is a worse fit than
  // someone decent across four — but strength still separates candidates with equal coverage.
  const fitScore = Math.round(Math.min(98, coverage * 70 + (avgStrength / 100) * 30));

  return {
    candidateId: candidate.id,
    fitScore,
    matchedCapabilities: matched.map((c) => c.tag),
    missingCapabilities: required.filter((t) => !matched.some((c) => c.tag === t)),
    supportingProjectIds: [...new Set(matched.flatMap((c) => c.projectIds))],
  };
}

/** Rank the candidates this employer may see against a set of required capabilities. */
export function matchCandidatesForCapabilities(
  required: string[],
  viewingCompany: string = CURRENT_EMPLOYER_COMPANY
): RoleMatch[] {
  if (required.length === 0) return [];
  const { visible } = partitionByVisibility(CANDIDATES, viewingCompany);
  return visible
    .map((c) => scoreCandidate(c, required))
    .filter((m): m is RoleMatch => m !== null)
    .sort((a, b) => b.fitScore - a.fitScore);
}

export function matchCandidatesForRole(
  role: Role,
  viewingCompany: string = CURRENT_EMPLOYER_COMPANY
): RoleMatch[] {
  return matchCandidatesForCapabilities(capabilitiesForRole(role), viewingCompany);
}

// --- Mutual fit ------------------------------------------------------------

const MONEY = /([£$€])\s?(\d[\d,.]*)\s*(k\b)?/gi;

/** Highest figure in a posted range — what the employer could actually pay. */
function topOfRange(value: string): { currency: string; amount: number } | null {
  const matches = [...value.matchAll(MONEY)];
  if (matches.length === 0) return null;
  let best: { currency: string; amount: number } | null = null;
  for (const m of matches) {
    const digits = m[2].replace(/[,.]/g, "");
    let amount = Number(digits);
    if (!Number.isFinite(amount) || amount <= 0) continue;
    if (m[3]) amount *= 1000;
    if (!best || amount > best.amount) best = { currency: m[1], amount };
  }
  return best;
}

export interface MutualFit {
  compensation: TermsVerdict;
  workArrangement: TermsVerdict;
  /** Employer-safe copy. Never contains the candidate's private floor. */
  notes: string[];
}

/**
 * Compare a company's posted terms against a candidate's stated non-negotiables.
 *
 * Asymmetric on purpose: the employer's range is public because they chose to post it, while the
 * candidate's floor stays private and only ever yields a verdict. Different currencies resolve to
 * "unknown" rather than inventing a conversion that could wrongly rule someone out.
 */
export function assessMutualFit(terms: EmployerTerms, candidate: CandidateProfile): MutualFit {
  const nn = candidate.nonNegotiables;
  const notes: string[] = [];

  let compensation: TermsVerdict = "unknown";
  const offered = terms.compRange ? topOfRange(terms.compRange) : null;
  const floor = nn?.compFloor ? topOfRange(nn.compFloor) : null;
  if (offered && floor) {
    if (offered.currency !== floor.currency) {
      notes.push("Your range is in a different currency to their minimum — worth confirming.");
    } else if (offered.amount >= floor.amount) {
      compensation = "fits";
      notes.push("Your range clears their minimum.");
    } else {
      compensation = "conflicts";
      notes.push("Your range sits below their minimum.");
    }
  }

  let workArrangement: TermsVerdict = "unknown";
  const theirs = nn?.workArrangements ?? [];
  if (terms.workArrangements.length > 0 && theirs.length > 0) {
    const overlap = terms.workArrangements.filter((a) => theirs.includes(a));
    if (overlap.length > 0) {
      workArrangement = "fits";
      notes.push(`Both open to ${overlap.join(" or ")} work.`);
    } else {
      workArrangement = "conflicts";
      notes.push(
        `You're offering ${terms.workArrangements.join("/")}; they need ${theirs.join(" or ")}.`
      );
    }
  }

  return { compensation, workArrangement, notes };
}

export function hasMutualConflict(fit: MutualFit): boolean {
  return fit.compensation === "conflicts" || fit.workArrangement === "conflicts";
}
