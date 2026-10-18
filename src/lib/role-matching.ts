import type { CandidateProfile, EmployerTerms, TermsVerdict } from "@/types";

/**
 * Mutual fit between a company's posted terms and a candidate's private non-negotiables.
 *
 * This file used to also hold a candidate-matching engine fed by the demo dataset, with a default
 * "viewing company" argument pointing at a seeded employer. Production matching lives in
 * server/matching.ts against the database; the demo engine's last consumer was the fabricated
 * setup payoff, and both were removed by the audit fixes (D2). What remains is the one part that
 * was always pure: comparing terms, with the candidate's floor never leaving as a number.
 */

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
      notes.push("Your range is in a different currency to their minimum, worth confirming.");
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
