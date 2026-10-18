import type { CapabilityDefinition } from "@/types";

export const CAPABILITY_DEFINITIONS: CapabilityDefinition[] = [
  {
    tag: "ai-enablement",
    label: "AI Enablement",
    description: "Implementing AI tools and systems inside a real business, not just experimenting with them.",
  },
  {
    tag: "automation",
    label: "Automation",
    description: "Removing manual, repetitive work by designing and shipping automated workflows.",
  },
  {
    tag: "operations",
    label: "Operations",
    description: "Keeping a business running, process, infrastructure, and the unglamorous work that compounds.",
  },
  {
    tag: "product-thinking",
    label: "Product Thinking",
    description: "Framing ambiguous problems as products: scoping, prioritising, and shipping toward an outcome.",
  },
  {
    tag: "executive-communication",
    label: "Executive Communication",
    description: "Distilling complexity for senior stakeholders and driving decisions in the room.",
  },
  {
    tag: "rapid-prototyping",
    label: "Rapid Prototyping",
    description: "Going from idea to working artefact fast enough to test it against reality.",
  },
  {
    tag: "growth",
    label: "Growth",
    description: "Driving acquisition, activation, or retention through experimentation and systems.",
  },
  {
    tag: "data-analysis",
    label: "Data Analysis",
    description: "Turning raw data into decisions, dashboards, models, and clear-eyed analysis.",
  },
  {
    tag: "systems-thinking",
    label: "Systems Thinking",
    description: "Seeing how parts of a business interact, and designing for the whole rather than a single step.",
  },
  {
    tag: "workflow-design",
    label: "Workflow Design",
    description: "Mapping how work actually moves and redesigning it to remove friction.",
  },
  {
    tag: "problem-solving",
    label: "Problem Solving",
    description: "Finding workable paths through unclear, under-specified problems.",
  },
  {
    tag: "startup-experience",
    label: "Startup Experience",
    description: "Operating effectively in early-stage, resource-constrained environments.",
  },
];

export function capabilityLabel(tag: string): string {
  return CAPABILITY_DEFINITIONS.find((c) => c.tag === tag)?.label ?? tag;
}

export function capabilityDescription(tag: string): string {
  return CAPABILITY_DEFINITIONS.find((c) => c.tag === tag)?.description ?? "";
}

// Keyword hints per capability — used to propose a starting hypothesis from the candidate's
// own words in the hook step. A deliberately simple stand-in for what an LLM would do later;
// kept here so swapping in a smarter suggester is a one-function change.
const CAPABILITY_KEYWORDS: Record<string, string[]> = {
  "ai-enablement": ["ai", "llm", "gpt", "claude", "model", "prompt", "copilot", "ml"],
  automation: ["automat", "script", "workflow", "zapier", "pipeline", "bot", "integrat"],
  operations: ["ops", "operation", "process", "logistics", "admin", "coordinat"],
  "product-thinking": ["product", "roadmap", "feature", "user", "scope", "prioriti"],
  "executive-communication": ["stakeholder", "leadership", "exec", "present", "report", "brief"],
  "rapid-prototyping": ["prototyp", "mvp", "build", "ship", "hack", "vibe", "proof of concept", "poc"],
  growth: ["growth", "acquisition", "retention", "marketing", "funnel", "convert"],
  "data-analysis": ["data", "analy", "dashboard", "metric", "sql", "spreadsheet", "report"],
  "systems-thinking": ["system", "architecture", "end-to-end", "whole", "connect"],
  "workflow-design": ["workflow", "process", "friction", "handoff", "sop"],
  "problem-solving": ["problem", "solve", "figure out", "unblock", "fix", "ambigu"],
  "startup-experience": ["startup", "founder", "early-stage", "scrappy", "0 to 1", "zero to one"],
};

/**
 * Propose 3-5 capability tags from the candidate's free-text answer to the hook question.
 * Scores each capability by keyword hits, then pads with sensible defaults so the candidate
 * always has a starting scoreboard to confirm/edit.
 */
export function proposeCapabilities(text: string): string[] {
  const lower = text.toLowerCase();
  const scored = CAPABILITY_DEFINITIONS.map((c) => {
    const hits = (CAPABILITY_KEYWORDS[c.tag] ?? []).filter((kw) => lower.includes(kw)).length;
    return { tag: c.tag, hits };
  });

  const matched = scored
    .filter((s) => s.hits > 0)
    .sort((a, b) => b.hits - a.hits)
    .map((s) => s.tag);

  // Pad toward a useful 4-tag starting set if the text was sparse.
  const defaults = ["problem-solving", "rapid-prototyping", "operations", "systems-thinking"];
  const result = [...matched];
  for (const tag of defaults) {
    if (result.length >= 4) break;
    if (!result.includes(tag)) result.push(tag);
  }
  return result.slice(0, 5);
}
