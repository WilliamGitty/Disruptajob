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

export interface RoleDemand {
  roleTitle: string;
  companyName: string;
  companySlug: string;
  /** Part of the invented demo population; rendered with its badge. */
  demo: boolean;
  /** The overlap: capabilities the role asks for that this person has evidenced. */
  tags: string[];
  /** Whether this company could find them today. */
  canSee: boolean;
}

export interface DemandSummary {
  /**
   * Open roles where this candidate's evidence covers at least half of what the role asks for.
   * The threshold exists because "shares one tag" matched nearly every role in the database,
   * and a number that includes almost everything is flattery, not demand.
   */
  matchingRoles: number;
  /** Distinct companies behind those roles, so copy that says "companies" counts companies. */
  matchingCompanies: number;
  /** Of those, how many belong to companies that cannot currently see this person. */
  invisibleTo: number;
  /** Which of their capabilities are being asked for, most in demand first. */
  inDemand: CapabilityDemand[];
  /** Capabilities being asked for across all open roles that this person has no evidence for. */
  gaps: CapabilityDemand[];
  /** Whether the reason for being unseen is hiding rather than a blocklist. */
  hiddenEntirely: boolean;
  /**
   * The names behind the number: open roles whose asks overlap this person's evidence, best
   * overlap first. Blocked companies are counted in the aggregates but never listed, keeping
   * the existing rule that a blocklist entry is not singled out back to its owner.
   */
  matchingRoleDetails: RoleDemand[];
}

interface CompanyRow {
  id: string;
  name: string;
  slug: string;
  demo: number;
}

export function demandFor(candidate: CandidateProfile): DemandSummary {
  const evidenced = new Set(
    candidate.capabilities.filter((c) => c.evidenceCount > 0).map((c) => c.tag)
  );

  const companies = new Map(
    all<CompanyRow>("SELECT id, name, slug, demo FROM company WHERE published = 1").map((c) => [c.id, c])
  );

  const openRoles = listRoles().filter((r) => r.status === "open" && companies.has(r.companyId));

  const mine = new Map<string, number>();
  const theirs = new Map<string, number>();
  const details: RoleDemand[] = [];
  const matchedCompanyIds = new Set<string>();
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

    // Majority coverage, not a single shared tag: the role is asking for this person, not for
    // anyone who has ever automated anything.
    if (overlap.length < Math.ceil(required.length / 2)) continue;
    matchingRoles += 1;
    matchedCompanyIds.add(role.companyId);

    // The same two gates search applies, asked in reverse: could this company find them?
    const company = companies.get(role.companyId);
    const companyName = company?.name ?? "";
    const blocked = isBlockedBy(candidate, companyName);
    const visible = isDiscoverable(candidate) && !blocked;
    if (!visible) invisibleTo += 1;

    if (company && !blocked) {
      details.push({
        roleTitle: role.title,
        companyName: company.name,
        companySlug: company.slug,
        demo: company.demo === 1,
        tags: overlap,
        canSee: visible,
      });
    }
  }

  const rank = (m: Map<string, number>): CapabilityDemand[] =>
    [...m.entries()]
      .map(([tag, roles]) => ({ tag, roles }))
      .sort((a, b) => b.roles - a.roles || a.tag.localeCompare(b.tag));

  details.sort((a, b) => b.tags.length - a.tags.length || a.companyName.localeCompare(b.companyName));

  return {
    matchingRoles,
    matchingCompanies: matchedCompanyIds.size,
    invisibleTo,
    inDemand: rank(mine),
    gaps: rank(theirs).slice(0, 4),
    hiddenEntirely: !isDiscoverable(candidate),
    matchingRoleDetails: details.slice(0, 8),
  };
}
