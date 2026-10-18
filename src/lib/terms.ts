import type {
  CandidateProfile,
  NonNegotiables,
  TermsFit,
  TermsVerdict,
  WorkArrangement,
} from "@/types";

/**
 * A candidate's terms with the private comp floor structurally removed.
 *
 * The spec requires the floor boundary be enforced in code rather than by convention, so employer
 * UI takes this type instead of `NonNegotiables` — passing the raw object is a compile error, and
 * no component is in a position to render the figure by accident.
 */
export type EmployerSafeTerms = Omit<NonNegotiables, "compFloor">;

export function toEmployerSafeTerms(nn: NonNegotiables): EmployerSafeTerms {
  // Destructured out rather than deleted so the omission is visible and type-checked.
  const { compFloor: _private, ...safe } = nn;
  void _private;
  return safe;
}

/**
 * Matching on *intent* data (what someone needs to take a role) as opposed to *proof* data
 * (what they can demonstrate). Deliberately kept out of `fitScore`: that number means
 * "backed by evidence", and mixing scheduling preferences into it would make it mean nothing.
 *
 * Privacy rule enforced here rather than at the view layer: `compFloor` is never returned,
 * formatted, or embedded in a note. Callers can only ever learn a verdict.
 */

const MONEY = /([£$€])\s?(\d[\d,.]*)\s*(k\b)?/i;

/** Parse "£70,000", "$140k", "€85.000" into a currency symbol + absolute number. */
function parseMoney(value: string): { currency: string; amount: number } | null {
  const m = value.match(MONEY);
  if (!m) return null;
  const currency = m[1];
  const digits = m[2].replace(/[,.]/g, "");
  let amount = Number(digits);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  if (m[3]) amount *= 1000; // "90k"
  return { currency, amount };
}

/** The compensation an employer has stated in their search query, if any. */
export function parseOfferedCompensation(query: string): { currency: string; amount: number } | null {
  return parseMoney(query);
}

/** The working arrangement an employer has asked for, if any. */
export function parseOfferedArrangement(query: string): WorkArrangement | null {
  const q = query.toLowerCase();
  if (/\b(fully remote|remote[- ]first|remote)\b/.test(q)) return "remote";
  if (/\bhybrid\b/.test(q)) return "hybrid";
  if (/\b(onsite|on-site|in office|in-office|in person|in-person|5 days? in)\b/.test(q)) return "onsite";
  return null;
}

/**
 * Compare an employer's stated terms against a candidate's non-negotiables.
 *
 * Returns verdicts only. "unknown" is used generously — when the employer hasn't stated a budget,
 * when the candidate hasn't set a floor, or when the two are in different currencies (converting
 * would invent precision we don't have and could wrongly filter someone out).
 */
export function assessTerms(candidate: CandidateProfile, query: string): TermsFit {
  const nn = candidate.nonNegotiables;
  const notes: string[] = [];

  let compensation: TermsVerdict = "unknown";
  const offered = parseOfferedCompensation(query);
  const floor = nn?.compFloor ? parseMoney(nn.compFloor) : null;
  if (offered && floor) {
    if (offered.currency !== floor.currency) {
      compensation = "unknown";
      notes.push("Budget stated in a different currency to their minimum, worth confirming.");
    } else if (offered.amount >= floor.amount) {
      compensation = "fits";
      notes.push("Your stated budget clears their minimum.");
    } else {
      compensation = "conflicts";
      // Deliberately no number: the employer learns the answer, not the figure.
      notes.push("Your stated budget is below their minimum.");
    }
  }

  let workArrangement: TermsVerdict = "unknown";
  const wanted = parseOfferedArrangement(query);
  const accepted = nn?.workArrangements ?? [];
  if (wanted && accepted.length > 0) {
    if (accepted.includes(wanted)) {
      workArrangement = "fits";
      notes.push(`Open to ${wanted} work.`);
    } else {
      workArrangement = "conflicts";
      notes.push(`Looking for ${wanted}; they are open to ${accepted.join(" or ")}.`);
    }
  }

  return { compensation, workArrangement, notes };
}

/** True when any stated term is in direct conflict — used to badge a result, never to hide one. */
export function hasTermsConflict(fit: TermsFit): boolean {
  return fit.compensation === "conflicts" || fit.workArrangement === "conflicts";
}
