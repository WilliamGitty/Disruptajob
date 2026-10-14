import type { CandidateProfile } from "@/types";

/**
 * Who can see whom. Two independent gates, both candidate-controlled:
 *
 *  1. `discoverability` — defaults to "hidden". A complete profile is never searchable until the
 *     candidate explicitly opts in. Absent data is treated as hidden, never as open.
 *  2. `blockedCompanies` — named companies that must never see the profile, even when it is open.
 *     This is the mechanism behind "your current employer will never see this".
 *
 * Both gates apply to *search only*. A hidden candidate can still receive a direct invite if they
 * shared their profile link themselves — that is the candidate initiating, which is always allowed.
 */

const LEGAL_SUFFIXES = new Set(["ltd", "limited", "inc", "llc", "plc", "gmbh", "co", "corp", "sa", "bv"]);
const DOMAIN_TLDS = new Set(["com", "co", "uk", "io", "ai", "net", "org", "dev", "app"]);

/**
 * Reduce a company name or domain to comparable tokens, so "Meridian Robotics",
 * "meridian-robotics.com" and "Meridian Robotics Ltd." all collapse to "meridian robotics".
 */
function normaliseCompany(value: string): string {
  const tokens = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);

  // Drop trailing domain/legal noise ("...com", "...ltd") from the end only, so a real word like
  // "Co-op Group" at the start is preserved.
  while (tokens.length > 1) {
    const last = tokens[tokens.length - 1];
    if (DOMAIN_TLDS.has(last) || LEGAL_SUFFIXES.has(last)) tokens.pop();
    else break;
  }

  return tokens.join(" ");
}

/** True when the candidate has named this company in their blocklist. */
export function isBlockedBy(candidate: CandidateProfile, companyName: string): boolean {
  const target = normaliseCompany(companyName);
  if (!target) return false;
  return (candidate.blockedCompanies ?? []).some((blocked) => {
    const b = normaliseCompany(blocked);
    if (!b) return false;
    // Equality, plus containment so "Meridian" blocks "Meridian Robotics" and vice versa.
    return b === target || b.includes(target) || target.includes(b);
  });
}

/** Opted in to being found at all. Missing data means hidden — never assume consent. */
export function isDiscoverable(candidate: CandidateProfile): boolean {
  return (candidate.discoverability ?? "hidden") !== "hidden";
}

/** The full search gate: discoverable AND not blocking this particular company. */
export function isVisibleTo(candidate: CandidateProfile, companyName: string): boolean {
  return isDiscoverable(candidate) && !isBlockedBy(candidate, companyName);
}

/**
 * Split a population into what an employer may see and how many were withheld.
 *
 * The withheld count is deliberately a single aggregate number with no identities and no breakdown
 * by reason: an employer learning *who* hid from them is exactly the outcome the blocklist exists
 * to prevent.
 */
export function partitionByVisibility(
  candidates: CandidateProfile[],
  companyName: string
): { visible: CandidateProfile[]; withheldCount: number } {
  const visible = candidates.filter((c) => isVisibleTo(c, companyName));
  return { visible, withheldCount: candidates.length - visible.length };
}
