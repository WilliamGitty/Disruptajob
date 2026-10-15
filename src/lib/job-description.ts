import { CAPABILITY_DEFINITIONS, proposeCapabilities } from "./capabilities";
import type { WorkArrangement } from "@/types";

/**
 * Reading a job description so a company doesn't have to start from a blank page.
 *
 * The company-side friction is real: "describe the actual work rather than writing a job spec" is
 * the right ask and a daunting one. Most companies already have a JD sitting in a document. So we
 * take it, pull out what's genuinely useful, and hand it back as a *starting point*.
 *
 * THE TRUST BOUNDARY, which matters as much here as it does for candidate imports: this returns
 * `JobDescriptionDraft`, whose work examples are explicitly marked unconfirmed and whose
 * capabilities are suggestions. Nothing here can publish a role. If a parser could, every company
 * would ship their existing JD unchanged and the matching signal would be exactly as worthless as
 * the job descriptions this product exists to replace — we'd have automated the problem.
 *
 * Deliberately deterministic. No model, no API key, no network. It reads structure that is
 * genuinely there — headings, bullets, salary figures — and refuses to guess beyond it.
 */

const MAX_INPUT = 40_000;

export interface SuggestedWorkExample {
  title: string;
  description: string;
  /** Suggested tags. The human confirms every one before anything is published. */
  suggestedCapabilities: string[];
}

export interface JobDescriptionDraft {
  roleTitle: string;
  /** Lines that read as the purpose of the role rather than a list of requirements. */
  whyThisRole: string;
  compRange?: string;
  location?: string;
  workArrangements: WorkArrangement[];
  suggestedCapabilities: string[];
  /** Candidate work items pulled from responsibility bullets. Always unconfirmed. */
  workExamples: SuggestedWorkExample[];
  /** What we could not find, so the UI can ask for it rather than silently omitting it. */
  missing: string[];
}

/** Headings that introduce the things a person would actually do. */
const DUTY_HEADINGS = /^(what you('|’)?ll do|responsibilities|the role|day to day|day-to-day|your mission|what you will be doing|key duties|about the role)\b/i;
/** Headings that introduce wish-lists — the part of a JD worth ignoring. */
const WISHLIST_HEADINGS = /^(requirements|about you|what we('|’)?re looking for|qualifications|skills|must have|nice to have|benefits|perks|what we offer|our stack|about us)\b/i;

const BULLET = /^\s*([-–—*•·]|\d+[.)])\s+/;

const ARRANGEMENT_PATTERNS: [WorkArrangement, RegExp][] = [
  ["remote", /\b(fully remote|remote[- ]first|work from home|wfh|remote)\b/i],
  ["hybrid", /\b(hybrid|\d\s*days?\s*(a|per)\s*week in|in[- ]office\s*\d)\b/i],
  ["onsite", /\b(on[- ]?site|in[- ]person|office[- ]based|5 days a week in)\b/i],
];

// Matches "£65,000 – £80,000", "$120k", "£65k-£80k", "EUR 70,000".
const MONEY = /(?:[£$€]|\bGBP\b|\bUSD\b|\bEUR\b)\s?\d[\d,.]*\s*k?/gi;

function clean(line: string): string {
  return line.replace(BULLET, "").trim().replace(/\s+/g, " ");
}

/** A sentence fragment short enough to be a title, trimmed at a natural break. */
function toTitle(text: string): string {
  const firstClause = text.split(/[—–:;.]|\s-\s/)[0].trim();
  const base = firstClause.length >= 12 ? firstClause : text;
  if (base.length <= 70) return base;
  const cut = base.slice(0, 70);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

function detectArrangements(text: string): WorkArrangement[] {
  return ARRANGEMENT_PATTERNS.filter(([, re]) => re.test(text)).map(([a]) => a);
}

function detectComp(text: string): string | undefined {
  const matches = text.match(MONEY);
  if (!matches || matches.length === 0) return undefined;
  const unique = [...new Set(matches.map((m) => m.trim()))];
  // A range needs two figures; one figure on its own is still worth carrying over.
  return unique.slice(0, 2).join(" – ");
}

const LOCATION_LINE = /^(location|based in|office)\s*[:\-–]\s*(.+)$/i;

function detectLocation(lines: string[]): string | undefined {
  for (const line of lines) {
    const m = line.match(LOCATION_LINE);
    if (m) return m[2].trim().slice(0, 120);
  }
  return undefined;
}

const TITLE_LINE = /^(job title|role|position)\s*[:\-–]\s*(.+)$/i;

/** The role's name: an explicit label if present, else the first line that looks like a heading. */
function detectTitle(lines: string[]): string {
  for (const line of lines.slice(0, 15)) {
    const m = line.match(TITLE_LINE);
    if (m) return m[2].trim().slice(0, 120);
  }

  for (const line of lines.slice(0, 8)) {
    const text = clean(line);
    if (!text || text.length > 80) continue;
    if (WISHLIST_HEADINGS.test(text) || DUTY_HEADINGS.test(text)) continue;
    if (/^(about|we are|we're|company|who we are)\b/i.test(text)) continue;
    if (text.split(" ").length <= 10) return text;
  }

  return "";
}

/**
 * Pull the bullets that describe work, ignoring the wish-list.
 *
 * Sections are tracked rather than every bullet taken, because "5+ years of experience" and
 * "own the dispatch system" are different kinds of sentence and only one of them is work.
 */
function extractDutyLines(lines: string[]): string[] {
  const duties: string[] = [];
  let inDuties = false;
  let sawAnyHeading = false;

  for (const raw of lines) {
    const text = clean(raw);
    if (!text) continue;

    if (DUTY_HEADINGS.test(text)) {
      inDuties = true;
      sawAnyHeading = true;
      continue;
    }
    if (WISHLIST_HEADINGS.test(text)) {
      inDuties = false;
      sawAnyHeading = true;
      continue;
    }
    if (inDuties && BULLET.test(raw)) duties.push(text);
  }

  // No headings at all — common in short JDs. Fall back to every bullet, minus obvious wish-list
  // sentences, and let the human throw away what doesn't belong.
  if (!sawAnyHeading || duties.length === 0) {
    return lines
      .filter((l) => BULLET.test(l))
      .map(clean)
      .filter((t) => t.length > 0 && !/^\d+\+?\s*years?\b/i.test(t) && !/\bdegree\b/i.test(t));
  }

  return duties;
}

export function parseJobDescription(input: string): JobDescriptionDraft {
  const text = input.slice(0, MAX_INPUT);
  const lines = text.split(/\r?\n/);

  const roleTitle = detectTitle(lines);
  const duties = extractDutyLines(lines);

  // Work examples come only from duty lines with enough substance to be a piece of work.
  const workExamples: SuggestedWorkExample[] = duties
    .filter((d) => d.length >= 25)
    .slice(0, 8)
    .map((d) => ({
      title: toTitle(d),
      description: d,
      suggestedCapabilities: capabilitiesIn(d),
    }));

  // Role-level suggestions come from the duties, not the whole document: "about us" paragraphs
  // are marketing, and letting them vote would tag every role with whatever the homepage says.
  const dutyText = duties.join("\n");
  const suggestedCapabilities = dutyText.trim()
    ? dedupe(workExamples.flatMap((w) => w.suggestedCapabilities)).slice(0, 6)
    : [];

  const whyThisRole = lines
    .map(clean)
    .filter((l) => l.length > 60 && !BULLET.test(l) && !WISHLIST_HEADINGS.test(l))
    .slice(0, 2)
    .join(" ")
    .slice(0, 600);

  const compRange = detectComp(text);
  const location = detectLocation(lines.map(clean));
  const workArrangements = detectArrangements(text);

  const missing: string[] = [];
  if (!roleTitle) missing.push("role title");
  if (workExamples.length === 0) missing.push("what the person would actually do");
  if (!compRange) missing.push("salary range");
  if (workArrangements.length === 0) missing.push("remote, hybrid or onsite");

  return {
    roleTitle,
    whyThisRole,
    compRange,
    location,
    workArrangements,
    suggestedCapabilities,
    workExamples,
    missing,
  };
}

/** Capability tags genuinely present in a line — no padding, unlike the onboarding helper. */
function capabilitiesIn(text: string): string[] {
  const proposed = proposeCapabilities(text);
  const lower = text.toLowerCase();
  const valid = new Set(CAPABILITY_DEFINITIONS.map((c) => c.tag));

  // proposeCapabilities pads sparse input toward a usable starter set, which is right for a
  // candidate staring at an empty form and wrong here: a padded tag on a role would match people
  // against work the company never described.
  return proposed
    .filter((tag) => valid.has(tag))
    .filter((tag) => {
      const def = CAPABILITY_DEFINITIONS.find((c) => c.tag === tag);
      if (!def) return false;
      const words = def.label.toLowerCase().split(/\s+/);
      return words.some((w) => w.length > 3 && lower.includes(w)) || directHit(tag, lower);
    })
    .slice(0, 3);
}

/** Words that imply a capability without naming it. */
const IMPLIED: Record<string, RegExp> = {
  automation: /\bautomat|\bscript|\bpipeline|\bworkflow|\bmanual\b/i,
  "ai-enablement": /\bai\b|\bllm\b|\bmachine learning\b|\bgpt\b|\bcopilot\b/i,
  operations: /\boperations?\b|\bprocess\b|\bdispatch\b|\blogistics\b|\bsupply\b/i,
  "data-analysis": /\bdata\b|\banalytics\b|\bsql\b|\bdashboard\b|\breporting\b|\bmetrics\b/i,
  "product-thinking": /\bproduct\b|\broadmap\b|\bcustomer\b|\buser\b/i,
  "executive-communication": /\bstakeholder|\bsenior\b|\bexec|\bleadership\b|\bboard\b/i,
  "rapid-prototyping": /\bprototyp|\bmvp\b|\bexperiment|\bpilot\b/i,
  growth: /\bgrowth\b|\brevenue\b|\bacquisition\b|\bchurn\b|\bpipeline of customers\b/i,
  "workflow-design": /\bworkflow|\bprocess design\b|\bsop\b|\bhandoff\b/i,
  "systems-thinking": /\bsystems?\b|\barchitect|\bend[- ]to[- ]end\b|\bintegrat/i,
  "problem-solving": /\btroubleshoot|\bdebug|\bunblock|\bsolve\b/i,
  "startup-experience": /\bstartup\b|\bearly[- ]stage\b|\bseed\b|\bscale[- ]up\b/i,
};

function directHit(tag: string, lower: string): boolean {
  return IMPLIED[tag]?.test(lower) ?? false;
}

function dedupe(tags: string[]): string[] {
  const counts = new Map<string, number>();
  for (const t of tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);
}
