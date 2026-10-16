import type { CandidateMatch, CandidateProfile, MatchStrength, MatchedRequirement } from "@/types";
import { assessTerms } from "./terms";

interface RequirementTemplate {
  id: string;
  label: string;
  tags: string[];
  keywords: string[];
}

// A deterministic, inspectable map from natural-language phrasing to capability tags.
// This stands in for an NLP/embedding layer — the important product property it
// preserves is that every match can be traced back to a human-readable reason.
const REQUIREMENT_TEMPLATES: RequirementTemplate[] = [
  {
    id: "ai-tools",
    label: "Has built internal AI tools",
    tags: ["ai-enablement"],
    keywords: ["ai tool", "internal ai", "built ai", "ai product", "ai implementation", "ai system", "ai assistant", "copilot"],
  },
  {
    id: "automation",
    label: "Automated business processes",
    tags: ["automation"],
    keywords: ["automat", "workflow", "repetitive", "manual work"],
  },
  {
    id: "senior-stakeholders",
    label: "Worked with senior leadership",
    tags: ["executive-communication"],
    keywords: ["senior leader", "senior stakeholder", "leadership", "executive", "board", "c-suite", "founder"],
  },
  {
    id: "prototyping",
    label: "Can prototype quickly",
    tags: ["rapid-prototyping", "product-thinking"],
    keywords: ["prototyp", "rapid", "mvp", "quickly", "fast iteration", "experiment"],
  },
  {
    id: "communication",
    label: "Strong communication",
    tags: ["executive-communication"],
    keywords: ["communicat"],
  },
  {
    id: "operations",
    label: "Operations experience",
    tags: ["operations"],
    keywords: ["operations experience", "operational", "business operations", "run operations"],
  },
  {
    id: "systems-thinking",
    label: "Systems-level thinking",
    tags: ["systems-thinking"],
    keywords: ["systems thinking", "cross-functional", "cross functional"],
  },
  {
    id: "growth",
    label: "Growth or demand generation experience",
    tags: ["growth"],
    keywords: ["growth", "demand gen", "acquisition", "retention", "funnel"],
  },
  {
    id: "data",
    label: "Data and analytics fluency",
    tags: ["data-analysis"],
    keywords: ["data", "analytics", "sql", "dashboard", "metrics"],
  },
  {
    id: "startup",
    label: "Startup environment experience",
    tags: ["startup-experience"],
    keywords: ["startup", "early-stage", "early stage", "0 to 1", "0-1", "zero to one"],
  },
  {
    id: "problem-solving",
    label: "Solves ambiguous problems",
    tags: ["problem-solving"],
    keywords: ["problem solv", "ambiguous", "unstructured"],
  },
  {
    id: "workflow-design",
    label: "Designs workflows end to end",
    tags: ["workflow-design"],
    keywords: ["workflow design", "redesign", "process redesign"],
  },
];

const LOCATIONS = ["london", "berlin", "new york", "lisbon", "manchester", "san francisco", "remote", "uk", "usa", "germany", "portugal"];

function strengthFromEvidenceCount(count: number): MatchStrength {
  if (count >= 7) return "high";
  if (count >= 5) return "strong";
  if (count >= 3) return "solid";
  return "exploratory";
}

export function extractRequirements(query: string): RequirementTemplate[] {
  const q = query.toLowerCase();
  const matched = REQUIREMENT_TEMPLATES.filter((t) => t.keywords.some((k) => q.includes(k)));
  // De-duplicate by tag overlap so "communication" + "senior leadership" don't double count identical tags.
  const seen = new Set<string>();
  const deduped: RequirementTemplate[] = [];
  for (const t of matched) {
    const key = t.tags.join(",");
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(t);
  }
  return deduped;
}

export function extractLocation(query: string): string | null {
  const q = query.toLowerCase();
  return LOCATIONS.find((loc) => q.includes(loc)) ?? null;
}

function buildMatchedRequirement(
  candidate: CandidateProfile,
  template: RequirementTemplate
): MatchedRequirement {
  const relevantCapabilities = candidate.capabilities.filter((c) => template.tags.includes(c.tag));
  const evidenceProjectIds = Array.from(
    // The ids are already on the hydrated capability — the old helper resolved them through the
    // demo dataset and back, which also meant a real candidate's ids resolved to nothing.
    new Set(relevantCapabilities.flatMap((c) => c.projectIds))
  ).slice(0, 3);
  const totalEvidence = relevantCapabilities.reduce((sum, c) => sum + c.evidenceCount, 0);

  return {
    id: template.id,
    requirementLabel: template.label,
    matchedCapabilityTags: relevantCapabilities.map((c) => c.tag),
    evidenceProjectIds,
    strength: strengthFromEvidenceCount(totalEvidence),
    met: relevantCapabilities.length > 0,
  };
}

export function matchCandidate(candidate: CandidateProfile, query: string): CandidateMatch {
  const requirementTemplates = extractRequirements(query);
  const location = extractLocation(query);

  const matchedRequirements = requirementTemplates.map((t) => buildMatchedRequirement(candidate, t));

  const metRequirements = matchedRequirements.filter((r) => r.met);
  const baseScore =
    matchedRequirements.length === 0
      ? 55
      : matchedRequirements.reduce((sum, r) => {
          if (!r.met) return sum;
          const caps = candidate.capabilities.filter((c) => r.matchedCapabilityTags.includes(c.tag));
          const avgScore = caps.length ? caps.reduce((s, c) => s + c.score, 0) / caps.length : 0;
          return sum + avgScore;
        }, 0) / Math.max(matchedRequirements.length, 1);

  let fitScore = Math.round(baseScore);

  if (location) {
    const candidateLocation = candidate.location.toLowerCase();
    if (candidateLocation.includes(location)) {
      fitScore = Math.min(98, fitScore + 3);
    } else if (location !== "remote") {
      fitScore = Math.round(fitScore * 0.88);
    }
  }

  fitScore = Math.max(28, Math.min(98, fitScore));

  const supportingProjectCount = new Set(matchedRequirements.flatMap((r) => r.evidenceProjectIds)).size;

  return {
    candidateId: candidate.id,
    query,
    fitScore,
    matchedRequirements,
    supportingProjectCount: supportingProjectCount || metRequirements.length,
    // Intent data, computed alongside but never mixed into fitScore.
    termsFit: assessTerms(candidate, query),
  };
}
