import type { CandidateProfile, Project } from "@/types";
import { capabilityLabel } from "./capabilities";

/**
 * How good is this portfolio, and what would make it better?
 *
 * The question someone asks thirty seconds after writing their first project, and until now the
 * product had no answer. A CV at least tells you when it looks thin; a page of your own prose
 * tells you nothing.
 *
 * Three rules this had to obey:
 *
 *  1. **No vanity percentage.** "Your profile is 64% complete" trains people to fill boxes. Every
 *     signal here is tied to something an employer actually does — searching a capability, opening
 *     a project, believing an outcome — and every suggestion says which.
 *  2. **Nothing here can move a capability score.** This reads evidence; it never produces any.
 *     A candidate acting on every suggestion improves their portfolio because they added real
 *     work, not because they satisfied a checklist.
 *  3. **Never scold.** These are free users, many of them worn down by months of rejection. The
 *     wording is what you'd say out loud to someone having a hard year.
 */

/** Bands rather than a score out of a hundred — the difference that actually changes behaviour. */
export type StrengthBand = "empty" | "started" | "credible" | "strong";

export interface Suggestion {
  id: string;
  /** Short imperative, e.g. "Add a number to one outcome". */
  title: string;
  /** Why an employer cares. Never "to complete your profile". */
  why: string;
  /** Rough ordering: 1 is the single most valuable thing to do next. */
  priority: number;
  /** The project this is about, when it's about one. */
  projectId?: string;
}

export interface PortfolioStrength {
  band: StrengthBand;
  headline: string;
  /** Plain sentence describing where they are. */
  summary: string;
  suggestions: Suggestion[];
  signals: {
    publishedProjects: number;
    capabilitiesEvidenced: number;
    projectsWithOutcome: number;
    projectsWithLinkedEvidence: number;
    projectsWithDepth: number;
    /** Capabilities backed by only one project — believable, but thin. */
    singleEvidenceCapabilities: string[];
  };
}

const DIGITS = /\d/;

function isLive(p: Project): boolean {
  return p.status !== "draft";
}

/** A described result is good; a measured one is what makes a stranger believe it. */
function hasQuantifiedOutcome(p: Project): boolean {
  return p.outcome.trim().length > 0 && DIGITS.test(p.outcome);
}

/** Enough written that an employer opening it learns something beyond the title. */
function hasDepth(p: Project): boolean {
  return p.problem.trim().length > 60 || p.whatIBuilt.trim().length > 60;
}

function hasLinkedEvidence(p: Project): boolean {
  return p.evidence.some((e) => Boolean(e.url)) || Boolean(p.demoUrl);
}

export function assessPortfolio(
  projects: Project[],
  profile?: Pick<CandidateProfile, "discoverability">
): PortfolioStrength {
  const live = projects.filter(isLive);
  const drafts = projects.filter((p) => p.status === "draft");

  const tagCounts = new Map<string, number>();
  for (const p of live) {
    for (const tag of new Set(p.capabilities)) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }

  const signals = {
    publishedProjects: live.length,
    capabilitiesEvidenced: tagCounts.size,
    projectsWithOutcome: live.filter(hasQuantifiedOutcome).length,
    projectsWithLinkedEvidence: live.filter(hasLinkedEvidence).length,
    projectsWithDepth: live.filter(hasDepth).length,
    singleEvidenceCapabilities: [...tagCounts.entries()]
      .filter(([, n]) => n === 1)
      .map(([tag]) => tag),
  };

  const suggestions: Suggestion[] = [];

  // --- Ordered by what most changes whether a stranger believes this person -----------------

  if (drafts.length > 0) {
    suggestions.push({
      id: "publish-drafts",
      title: drafts.length === 1 ? "Finish the project you started" : `Finish ${drafts.length} started projects`,
      why: "Drafts aren't visible to anyone and don't count toward a capability. Tagging one is usually two minutes.",
      priority: 1,
      projectId: drafts[0].id,
    });
  }

  if (live.length === 0) {
    suggestions.push({
      id: "first-project",
      title: "Describe one thing you built",
      why: "One real project is the whole difference between a profile and a blank page. It doesn't have to be impressive, it has to be yours.",
      priority: 1,
    });
  } else if (live.length === 1) {
    suggestions.push({
      id: "second-project",
      title: "Add a second piece of work",
      why: "One project reads as a one-off. Two start to look like a pattern, which is what an employer is actually trying to see.",
      priority: 2,
    });
  }

  if (signals.capabilitiesEvidenced > 0 && signals.capabilitiesEvidenced < 3) {
    suggestions.push({
      id: "broaden",
      title: "Tag work against a capability you haven't covered",
      why: "Employers search one capability at a time. Each one you've genuinely evidenced is another search you appear in.",
      priority: 3,
    });
  }

  const withoutOutcome = live.filter((p) => !hasQuantifiedOutcome(p));
  if (withoutOutcome.length > 0 && live.length > 0) {
    const target = withoutOutcome[0];
    suggestions.push({
      id: "quantify-outcome",
      title: `Put a number on what “${target.title}” changed`,
      why: "“Saved the team time” and “cut a two-hour daily job to ten minutes” describe the same work. Only one of them is believable to someone who's never met you.",
      priority: 2,
      projectId: target.id,
    });
  }

  const thin = live.filter((p) => !hasDepth(p));
  if (thin.length > 0 && live.length > 0) {
    const target = thin[0];
    suggestions.push({
      id: "add-depth",
      title: `Say what the problem was in “${target.title}”`,
      why: "What you built matters less than what was broken before you built it. That's the part that shows judgement rather than output.",
      priority: 4,
      projectId: target.id,
    });
  }

  const unlinked = live.filter((p) => !hasLinkedEvidence(p));
  if (unlinked.length > 0 && live.length >= 2) {
    suggestions.push({
      id: "attach-proof",
      title: "Attach something somebody can open",
      why: "A repo, a doc, a screenshot, a short write-up. Anything a stranger can look at moves you from “says so” to “shows it”.",
      priority: 5,
      projectId: unlinked[0].id,
    });
  }

  if (signals.singleEvidenceCapabilities.length > 0 && live.length >= 2) {
    const tag = signals.singleEvidenceCapabilities[0];
    suggestions.push({
      id: "thicken",
      title: `Back up ${capabilityLabel(tag)} with a second example`,
      why: "One project supporting a capability is a claim. Two is a track record, and it's the difference an employer scanning results actually notices.",
      priority: 6,
    });
  }

  // Visibility comes last deliberately: it's a decision, not a chore, and pushing someone to be
  // discoverable before their profile is any good serves us rather than them.
  if (profile?.discoverability === "hidden" && live.length >= 2) {
    suggestions.push({
      id: "consider-visibility",
      title: "You're still hidden, only when you're ready",
      why: "Your profile is strong enough to be found now. You can open up and still block your current employer by name.",
      priority: 7,
    });
  }

  suggestions.sort((a, b) => a.priority - b.priority);

  const band = bandFor(signals);

  return {
    band,
    headline: HEADLINES[band],
    summary: summaryFor(band, signals),
    suggestions,
    signals,
  };
}

function bandFor(s: PortfolioStrength["signals"]): StrengthBand {
  if (s.publishedProjects === 0) return "empty";
  if (s.publishedProjects === 1 || s.capabilitiesEvidenced < 2) return "started";

  // "Strong" deliberately requires proof a stranger can open and a result they can believe —
  // not merely more words.
  const believable = s.projectsWithOutcome >= 2 && s.projectsWithLinkedEvidence >= 2;
  if (s.publishedProjects >= 3 && s.capabilitiesEvidenced >= 3 && believable) return "strong";
  return "credible";
}

const HEADLINES: Record<StrengthBand, string> = {
  empty: "Nothing here yet, that's the normal starting point.",
  started: "You've made a start.",
  credible: "This holds up.",
  strong: "This is a strong body of work.",
};

function summaryFor(band: StrengthBand, s: PortfolioStrength["signals"]): string {
  const caps = `${s.capabilitiesEvidenced} ${s.capabilitiesEvidenced === 1 ? "capability" : "capabilities"}`;
  const projects = `${s.publishedProjects} ${s.publishedProjects === 1 ? "project" : "projects"}`;

  switch (band) {
    case "empty":
      return "Everyone's profile starts empty. One piece of real work is enough to be findable.";
    case "started":
      return `${projects}, evidencing ${caps}. Enough to exist, not yet enough for someone to judge you fairly.`;
    case "credible":
      return `${projects} across ${caps}. An employer searching those would find you and have something real to read.`;
    case "strong":
      return `${projects} across ${caps}, most with a measurable result and something to open. This is the version of you a CV could never show.`;
  }
}
