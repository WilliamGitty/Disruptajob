import type { CapabilityDefinition } from "@/types";

/**
 * The shared capability vocabulary. This list is the product's answer to "who is this for":
 * a tester whose work had no tag here (a mental health support officer who delivers workshops,
 * runs a blog, fronts an organisation) read the old, all-startup list and correctly concluded
 * the site wasn't for her. The beachhead is people the CV format punishes, most of whom do not
 * work in tech, so the vocabulary has to hold their work too.
 *
 * Grouped so the picker reads as "kinds of work" rather than a wall of chips. Tags are stable
 * identifiers: never rename or remove one that published projects may already carry.
 */
export const CAPABILITY_DEFINITIONS: CapabilityDefinition[] = [
  // Building and improving
  {
    tag: "ai-enablement",
    label: "AI Enablement",
    group: "Building and improving",
    description: "Implementing AI tools and systems inside a real business, not just experimenting with them.",
  },
  {
    tag: "automation",
    label: "Automation",
    group: "Building and improving",
    description: "Removing manual, repetitive work by designing and shipping automated workflows.",
  },
  {
    tag: "rapid-prototyping",
    label: "Rapid Prototyping",
    group: "Building and improving",
    description: "Going from idea to working artefact fast enough to test it against reality.",
  },
  {
    tag: "product-thinking",
    label: "Product Thinking",
    group: "Building and improving",
    description: "Framing ambiguous problems as products: scoping, prioritising, and shipping toward an outcome.",
  },
  {
    tag: "design",
    label: "Design",
    group: "Building and improving",
    description: "Shaping how things look, read and feel, from visual identity to the layout of a page or a space.",
  },

  // Running things
  {
    tag: "operations",
    label: "Operations",
    group: "Running things",
    description: "Keeping a business running, process, infrastructure, and the unglamorous work that compounds.",
  },
  {
    tag: "workflow-design",
    label: "Workflow Design",
    group: "Running things",
    description: "Mapping how work actually moves and redesigning it to remove friction.",
  },
  {
    tag: "systems-thinking",
    label: "Systems Thinking",
    group: "Running things",
    description: "Seeing how parts of a business interact, and designing for the whole rather than a single step.",
  },
  {
    tag: "problem-solving",
    label: "Problem Solving",
    group: "Running things",
    description: "Finding workable paths through unclear, under-specified problems.",
  },
  {
    tag: "startup-experience",
    label: "Startup Experience",
    group: "Running things",
    description: "Operating effectively in early-stage, resource-constrained environments.",
  },

  // Working with people
  {
    tag: "executive-communication",
    label: "Executive Communication",
    group: "Working with people",
    description: "Distilling complexity for senior stakeholders and driving decisions in the room.",
  },
  {
    tag: "public-speaking",
    label: "Public Speaking",
    group: "Working with people",
    description: "Presenting to real audiences: talks, workshops, panels, representing an organisation in public.",
  },
  {
    tag: "training-facilitation",
    label: "Training and Facilitation",
    group: "Working with people",
    description: "Designing and running sessions that leave people able to do something they couldn't before.",
  },
  {
    tag: "community-building",
    label: "Community Building",
    group: "Working with people",
    description: "Growing and holding together a group of people: members, volunteers, users, a network.",
  },
  {
    tag: "care-support",
    label: "Care and Support",
    group: "Working with people",
    description: "Supporting people through difficulty: wellbeing, safeguarding, frontline and pastoral work.",
  },
  {
    tag: "client-relationships",
    label: "Client Relationships",
    group: "Working with people",
    description: "Winning and keeping the trust of clients, customers or partners over time.",
  },

  // Insight and reach
  {
    tag: "data-analysis",
    label: "Data Analysis",
    group: "Insight and reach",
    description: "Turning raw data into decisions, dashboards, models, and clear-eyed analysis.",
  },
  {
    tag: "research",
    label: "Research",
    group: "Insight and reach",
    description: "Gathering and synthesising information rigorously: interviews, studies, literature, findings people act on.",
  },
  {
    tag: "writing-content",
    label: "Writing and Content",
    group: "Insight and reach",
    description: "Writing things real people read: articles, posts, guides, documentation, a voice for an organisation.",
  },
  {
    tag: "growth",
    label: "Growth",
    group: "Insight and reach",
    description: "Driving acquisition, activation, or retention through experimentation and systems.",
  },
  {
    tag: "event-delivery",
    label: "Event Delivery",
    group: "Insight and reach",
    description: "Planning and running real events, from logistics to the moment the room fills.",
  },
  {
    tag: "fundraising",
    label: "Fundraising",
    group: "Insight and reach",
    description: "Bringing money in for a cause or a company: grants, donors, sponsors, bids.",
  },
];

export const CAPABILITY_GROUPS = [...new Set(CAPABILITY_DEFINITIONS.map((c) => c.group))];

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
  "executive-communication": ["stakeholder", "leadership", "exec", "board", "brief"],
  "rapid-prototyping": ["prototyp", "mvp", "build", "ship", "hack", "vibe", "proof of concept", "poc"],
  growth: ["growth", "acquisition", "retention", "marketing", "funnel", "convert"],
  "data-analysis": ["data", "analy", "dashboard", "metric", "sql", "spreadsheet"],
  "systems-thinking": ["system", "architecture", "end-to-end", "whole", "connect"],
  "workflow-design": ["workflow", "process", "friction", "handoff", "sop"],
  "problem-solving": ["problem", "solve", "figure out", "unblock", "fix", "ambigu"],
  "startup-experience": ["startup", "founder", "early-stage", "scrappy", "0 to 1", "zero to one"],
  "public-speaking": ["speak", "talk", "present", "audience", "panel", "summit", "conference"],
  "training-facilitation": ["train", "facilitat", "workshop", "teach", "coach", "mentor", "session"],
  "writing-content": ["write", "writing", "blog", "content", "post", "article", "newsletter", "copy"],
  "community-building": ["community", "group", "member", "forum", "network", "volunteer"],
  "care-support": ["care", "support", "wellbeing", "mental health", "safeguard", "welfare", "counsel", "pastoral"],
  "event-delivery": ["event", "conference", "meetup", "organis", "organiz", "host", "venue"],
  "client-relationships": ["client", "customer", "account", "relationship", "partner", "retain"],
  research: ["research", "interview", "survey", "literature", "study", "synthesis", "findings"],
  design: ["design", "figma", "brand", "visual", "layout", "illustrat", "ux"],
  fundraising: ["fundrais", "grant", "donor", "sponsor", "charity", "bid"],
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
