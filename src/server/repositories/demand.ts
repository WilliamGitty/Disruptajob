import { all } from "../db";
import { capabilitiesForRole, listRoles } from "./companies";
import { isBlockedBy, isDiscoverable } from "@/lib/visibility";
import type { CandidateProfile } from "@/types";

/**
 * Who is looking for what this person can already do.
 *
 * The deliberate answer to "should we have a job board". A board would invert the model: the
 * candidate browses, applies, and goes back to chasing — which is the exact dynamic that put them
 * eleven months into a search feeling invisible. So this shows demand and gives them nothing to
 * apply to.
 *
 * What it does instead is make the one decision that matters visible: **how many of the companies
 * describing work you can evidence are currently unable to see you.** That number is honest,
 * motivating, and points at the two actions that genuinely help — add evidence, or open up — with
 * no application in sight.
 *
 * It is also why this doesn't need gamification. Streaks and badges are what you reach for when
 * the product has no real feedback to give. "Four companies described work you have evidence for;
 * three of them can't see you" is a better reason to come back than any badge.
 */

export interface CapabilityDemand {
  tag: string;
  /** Open roles asking for this capability. */
  roles: number;
}

export interface DemandSummary {
  /** Open roles demanding at least one capability this candidate has evidenced. */
  matchingRoles: number;
  /** Of those, how many belong to companies that cannot currently see this person. */
  invisibleTo: number;
  /** Which of their capabilities are being asked for, most in demand first. */
  inDemand: CapabilityDemand[];
  /** Capabilities being asked for across all open roles that this person has no evidence for. */
  gaps: CapabilityDemand[];
  /** Whether the reason for being unseen is hiding rather than a blocklist. */
  hiddenEntirely: boolean;
}

interface CompanyRow {
  id: string;
  name: string;
}

export function demandFor(candidate: CandidateProfile): DemandSummary {
  const evidenced = new Set(
    candidate.capabilities.filter((c) => c.evidenceCount > 0).map((c) => c.tag)
  );

  const companies = new Map(
    all<CompanyRow>("SELECT id, name FROM company WHERE published = 1").map((c) => [c.id, c.name])
  );

  const openRoles = listRoles().filter((r) => r.status === "open" && companies.has(r.companyId));

  const mine = new Map<string, number>();
  const theirs = new Map<string, number>();
  let matchingRoles = 0;
  let invisibleTo = 0;

  for (const role of openRoles) {
    const required = capabilitiesForRole(role);
    if (required.length === 0) continue;

    const overlap = required.filter((tag) => evidenced.has(tag));

    for (const tag of required) {
      if (evidenced.has(tag)) mine.set(tag, (mine.get(tag) ?? 0) + 1);
      else theirs.set(tag, (theirs.get(tag) ?? 0) + 1);
    }

    if (overlap.length === 0) continue;
    matchingRoles += 1;

    // The same two gates search applies, asked in reverse: could this company find them?
    const companyName = companies.get(role.companyId) ?? "";
    const visible = isDiscoverable(candidate) && !isBlockedBy(candidate, companyName);
    if (!visible) invisibleTo += 1;
  }

  const rank = (m: Map<string, number>): CapabilityDemand[] =>
    [...m.entries()]
      .map(([tag, roles]) => ({ tag, roles }))
      .sort((a, b) => b.roles - a.roles || a.tag.localeCompare(b.tag));

  return {
    matchingRoles,
    invisibleTo,
    inDemand: rank(mine),
    gaps: rank(theirs).slice(0, 4),
    hiddenEntirely: !isDiscoverable(candidate),
  };
}
