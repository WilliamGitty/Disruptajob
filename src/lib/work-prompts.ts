import { CAPABILITY_DEFINITIONS } from "./capabilities";

/**
 * Questions that help someone remember work they'd never think to write down.
 *
 * The person this product is for consistently undersells themselves, not out of modesty but
 * because the work that doesn't match their job title doesn't feel like it counts. Asking "what
 * are your skills?" gets you the job title back. Asking "what would break if you went away for a
 * month?" gets you the actual answer.
 *
 * THE RULE THIS OBEYS, and it is the important part: a prompt is a memory aid, never a claim.
 * Choosing one doesn't tag you with anything or move any score — it opens the project form with
 * that question attached, so the output is still a described piece of work that you tag yourself.
 * The moment a question could award a capability, the whole platform becomes a CV with extra
 * steps, which is precisely what docs/strategy.md forbids.
 *
 * `surfaces` exists only to spread the deck across different kinds of work, never to assign tags.
 */

export interface WorkPrompt {
  id: string;
  /** Asked in the second person, the way a friend would ask it. */
  question: string;
  /** One line of permission — the reason it's fine to answer small. */
  nudge: string;
  /** The sorts of work this question tends to uncover. Never applied to a profile. */
  surfaces: string[];
}

export const WORK_PROMPTS: WorkPrompt[] = [
  {
    id: "come-to-you-for",
    question: "What do people come to you for that isn't in your job description?",
    nudge: "The thing colleagues ask you about because you're the one who worked it out.",
    surfaces: ["operations", "problem-solving", "systems-thinking"],
  },
  {
    id: "holiday-test",
    question: "What would break if you went away for a month?",
    nudge: "Whatever you'd have to write a handover document about — that's ownership, whatever your title says.",
    surfaces: ["operations", "workflow-design", "systems-thinking"],
  },
  {
    id: "nobody-asked",
    question: "What did you build or fix that nobody asked you to?",
    nudge: "Unasked work is the clearest signal there is. It's also the first thing a CV loses.",
    surfaces: ["automation", "rapid-prototyping", "product-thinking"],
  },
  {
    id: "spreadsheet",
    question: "What tool, spreadsheet or process do other people now rely on?",
    nudge: "It counts even if it's held together with formulas and hope. Especially then.",
    surfaces: ["automation", "workflow-design", "operations"],
  },
  {
    id: "mess",
    question: "What did you inherit as a mess, and what is it now?",
    nudge: "Before and after. The before is the part people forget to describe.",
    surfaces: ["operations", "problem-solving", "workflow-design"],
  },
  {
    id: "manual-work",
    question: "What manual job did you make smaller or make disappear?",
    nudge: "Hours saved per week is a perfectly good answer.",
    surfaces: ["automation", "ai-enablement", "workflow-design"],
  },
  {
    id: "explained-up",
    question: "What's the hardest thing you've had to explain to someone senior?",
    nudge: "Getting a decision made by people who don't share your context is a real skill.",
    surfaces: ["executive-communication", "product-thinking"],
  },
  {
    id: "changed-mind",
    question: "When did you change someone's mind with evidence?",
    nudge: "What you showed them matters more than what you said.",
    surfaces: ["data-analysis", "executive-communication"],
  },
  {
    id: "taught",
    question: "What have you taught someone else to do?",
    nudge: "If you could teach it, you understood it well enough to have built it.",
    surfaces: ["operations", "systems-thinking"],
  },
  {
    id: "learned-alone",
    question: "What did you learn to do because nobody else was going to?",
    nudge: "Picked up SQL, learnt to prompt properly, worked out the API. All of it counts.",
    surfaces: ["ai-enablement", "rapid-prototyping", "problem-solving"],
  },
  {
    id: "first-version",
    question: "What have you got working quickly that proved an idea?",
    nudge: "Rough and working beats polished and theoretical. Say how long it took.",
    surfaces: ["rapid-prototyping", "product-thinking"],
  },
  {
    id: "numbers",
    question: "What number did your work move?",
    nudge: "Revenue, time, error rate, churn, headcount you didn't have to hire.",
    surfaces: ["growth", "data-analysis"],
  },
  {
    id: "course-applied",
    question: "What have you learnt recently and actually used?",
    nudge: "A course on its own doesn't show much. A course plus the thing you built with it does.",
    surfaces: ["ai-enablement", "rapid-prototyping"],
  },
  {
    id: "no-title",
    question: "What part of your job would surprise someone reading your job title?",
    nudge: "That gap is the entire reason this exists.",
    surfaces: ["product-thinking", "operations"],
  },
];

const BY_ID = new Map(WORK_PROMPTS.map((p) => [p.id, p]));

export function getWorkPrompt(id: string): WorkPrompt | undefined {
  return BY_ID.get(id);
}

/**
 * A spread of prompts, biased toward kinds of work this person hasn't evidenced yet.
 *
 * Someone with three automation projects doesn't need a fourth automation question — they need
 * the one that reminds them they also run the reporting nobody else understands. Deterministic so
 * the page doesn't reshuffle under them on every render.
 */
export function suggestPrompts(evidencedTags: string[], count = 3): WorkPrompt[] {
  const covered = new Set(evidencedTags);

  const scored = WORK_PROMPTS.map((prompt, index) => {
    const fresh = prompt.surfaces.filter((t) => !covered.has(t)).length;
    return { prompt, fresh, index };
  });

  return scored
    .sort((a, b) => b.fresh - a.fresh || a.index - b.index)
    .slice(0, count)
    .map((s) => s.prompt);
}

/** Every tag a prompt mentions must be a real capability, or the spread logic silently misfires. */
export function unknownSurfaces(): string[] {
  const valid = new Set(CAPABILITY_DEFINITIONS.map((c) => c.tag));
  return [...new Set(WORK_PROMPTS.flatMap((p) => p.surfaces))].filter((t) => !valid.has(t));
}
