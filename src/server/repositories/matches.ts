import { all } from "../db";
import { capabilitiesForRole, listRoles } from "./companies";
import { assessMutualFit, hasMutualConflict, type MutualFit } from "@/lib/role-matching";
import { isBlockedBy } from "@/lib/visibility";
import type { CandidateProfile, EmployerTerms } from "@/types";

/**
 * The candidate-side mirror of employer search: every open role whose asks overlap this
 * person's evidence, scored the same deterministic, explainable way the employer side scores
 * them. No model, no mystery: the percentage is coverage of what the role asks for, weighted
 * by the depth of the evidence behind the overlap, and every row says why.
 *
 * The line this page must never cross, from strategy §5a: there is nothing to apply to.
 * This is a mirror of demand, built so the two honest levers are visible: evidence raises
 * the percentages, terms narrow the list. Blocked companies are excluded entirely, keeping
 * the rule that a blocklist entry is never surfaced back to its owner.
 */

export interface RoleMatch {
  roleTitle: string;
  companyName: string;
  companySlug: string;
  demo: boolean;
  /** 0-98, same ceiling as the employer side: certainty is never claimed. */
  pct: number;
  /** The explanation: which of the role's asks this person's evidence covers. */
  covered: string[];
  missing: string[];
  terms: { compRange?: string; location?: string; arrangements: string[] };
  fit: MutualFit;
  conflict: boolean;
}

interface CompanyRow {
  id: string;
  name: string;
  slug: string;
  demo: number;
}

export function rolesMatchingCandidate(candidate: CandidateProfile): RoleMatch[] {
  const evidenced = new Map(
    candidate.capabilities.filter((c) => c.evidenceCount > 0).map((c) => [c.tag, c])
  );
  if (evidenced.size === 0) return [];

  const companies = new Map(
    all<CompanyRow>("SELECT id, name, slug, demo FROM company WHERE published = 1").map((c) => [c.id, c])
  );

  const matches: RoleMatch[] = [];

  for (const role of listRoles()) {
    if (role.status !== "open") continue;
    const company = companies.get(role.companyId);
    if (!company) continue;
    if (isBlockedBy(candidate, company.name)) continue;

    const required = capabilitiesForRole(role);
    if (required.length === 0) continue;

    const covered = required.filter((tag) => evidenced.has(tag));
    if (covered.length === 0) continue;

    // The employer side's shape (matching.ts): coverage carries 70, evidence depth 30.
    const coverage = covered.length / required.length;
    const avgScore =
      covered.reduce((sum, tag) => sum + (evidenced.get(tag)?.score ?? 0), 0) / covered.length;
    const pct = Math.round(Math.min(98, coverage * 70 + (avgScore / 100) * 30));

    const terms: EmployerTerms = role.terms;
    const fit = assessMutualFit(terms, candidate);

    matches.push({
      roleTitle: role.title,
      companyName: company.name,
      companySlug: company.slug,
      demo: company.demo === 1,
      pct,
      covered,
      missing: required.filter((tag) => !evidenced.has(tag)),
      terms: {
        compRange: terms.compRange,
        location: terms.location,
        arrangements: terms.workArrangements,
      },
      fit,
      conflict: hasMutualConflict(fit),
    });
  }

  return matches.sort((a, b) => b.pct - a.pct || a.companyName.localeCompare(b.companyName));
}
