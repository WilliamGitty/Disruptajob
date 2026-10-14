// Capability scoring — the one place capability scores are derived.
//
// Scores are ONLY ever computed from tagged project evidence. Nothing a candidate types,
// uploads, or imports (CV/LinkedIn) is allowed to reach this function — only Projects, and
// only their `capabilities` tags + `evidence`. This keeps the platform's core promise intact:
// demonstrated capability, not self-declared skills.

import type { Capability, Project } from "@/types";
import { capabilityLabel } from "@/lib/capabilities";

/** Mirror of the seeded-data formula in mock-data.ts so added evidence scores consistently. */
export function scoreFromEvidenceCount(evidenceCount: number): number {
  return Math.min(97, 36 + evidenceCount * 8);
}

/** Only published projects count toward scores — drafts (e.g. unconfirmed imports) never do. */
function isLive(project: Project): boolean {
  return project.status !== "draft";
}

/**
 * Evidence weight for a project: its concrete evidence items, with a floor of 1 so a tagged
 * project with no attached artefacts still registers as a single piece of evidence.
 */
function evidenceWeight(project: Project): number {
  return Math.max(1, project.evidence.length);
}

/**
 * Compute capabilities purely from a set of projects. Used for the onboarding score reveal,
 * where we want to show the bars that a candidate's own tagged evidence produces from scratch.
 */
export function computeCapabilities(projects: Project[]): Capability[] {
  const byTag = new Map<string, { evidenceCount: number; projectIds: string[] }>();

  for (const project of projects.filter(isLive)) {
    const weight = evidenceWeight(project);
    for (const tag of project.capabilities) {
      const entry = byTag.get(tag) ?? { evidenceCount: 0, projectIds: [] };
      entry.evidenceCount += weight;
      if (!entry.projectIds.includes(project.id)) entry.projectIds.push(project.id);
      byTag.set(tag, entry);
    }
  }

  return [...byTag.entries()]
    .map(([tag, { evidenceCount, projectIds }]) => ({
      tag,
      label: capabilityLabel(tag),
      score: scoreFromEvidenceCount(evidenceCount),
      evidenceCount,
      projectIds,
    }))
    .sort((a, b) => b.score - a.score);
}

/**
 * Merge freshly-added projects onto a base set of (curated) capabilities. Existing capabilities
 * have their evidence count bumped and score recomputed; brand-new tags are appended. This is
 * what makes tagging a new project visibly move the bars on an existing profile, rather than
 * discarding the seeded scores.
 */
export function mergeCapabilities(base: Capability[], projects: Project[]): Capability[] {
  const merged = new Map<string, Capability>(base.map((c) => [c.tag, { ...c }]));
  const added = computeCapabilities(projects);

  for (const inc of added) {
    const existing = merged.get(inc.tag);
    if (existing) {
      const evidenceCount = existing.evidenceCount + inc.evidenceCount;
      merged.set(inc.tag, {
        ...existing,
        evidenceCount,
        score: scoreFromEvidenceCount(evidenceCount),
        projectIds: [...new Set([...existing.projectIds, ...inc.projectIds])],
      });
    } else {
      merged.set(inc.tag, inc);
    }
  }

  return [...merged.values()].sort((a, b) => b.score - a.score);
}
