import { CAPABILITY_DEFINITIONS } from "@/lib/capabilities";
import { logError, logWarn } from "./log";

/**
 * The second — and so far last — external service: Claude, for drafting.
 *
 * The terms match the email decision (strategy §5b): called with one fetch, no SDK, and with no
 * ANTHROPIC_API_KEY everything degrades to exactly the behaviour the app had before — imports
 * arrive as bare drafts the person fills in by hand.
 *
 * The harder rule is the product's own: **AI drafts, humans claim, evidence scores.** Nothing
 * returned by this file can touch `project_capability`. Suggested tags are rendered UNCHECKED to
 * the person who did the work, because a pre-ticked box that gets clicked past is a declared
 * capability wearing a disguise — this codebase already deleted one feature (the hypothesis
 * step) for exactly that sin. The model proposes; only the human's explicit tick ever scores.
 */

const API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = "claude-sonnet-5";

export const AI_ENABLED = Boolean(API_KEY);

export interface ProjectDraftSuggestion {
  description: string;
  problem: string;
  whatIBuilt: string;
  outcome: string;
  /** Tags from the fixed taxonomy only — anything the model invents is discarded. */
  suggestedTags: string[];
}

const VALID_TAGS = new Set(CAPABILITY_DEFINITIONS.map((c) => c.tag));

/** The prompt is pure and exported so tests can pin what we ask for without any network. */
export function draftPrompt(repoName: string, language: string | undefined, readme: string): string {
  const taxonomy = CAPABILITY_DEFINITIONS.map((c) => `- ${c.tag}: ${c.description}`).join("\n");
  return [
    `You are helping someone turn a GitHub repository into a portfolio write-up they will edit and own. Be concrete and modest; never inflate. Write in first person ("I built..."). If the README doesn't support a claim, leave that field as an empty string rather than inventing.`,
    ``,
    `Repository: ${repoName}${language ? ` (mainly ${language})` : ""}`,
    `README (may be truncated):`,
    `"""`,
    readme.slice(0, 8000),
    `"""`,
    ``,
    `Capability taxonomy (suggest ONLY tags from this list, only where the README gives real evidence):`,
    taxonomy,
    ``,
    `Reply with ONLY a JSON object, no markdown fence: {"description": one plain sentence saying what this is, "problem": what problem it addresses (1-2 sentences, empty string if unclear), "whatIBuilt": what was actually built and how (2-3 sentences), "outcome": what changed or worked as a result (1 sentence, empty string if the README doesn't say), "suggestedTags": array of 0-3 taxonomy tags}`,
  ].join("\n");
}

/** Clamp whatever the model said to the shape the product allows. Exported for tests. */
export function parseDraftSuggestion(raw: string): ProjectDraftSuggestion | null {
  try {
    // Models preface JSON with prose no matter how firmly the prompt forbids it — production
    // showed every reply failing the strict parse. Take the outermost brace-to-brace span.
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start === -1 || end <= start) return null;
    const parsed = JSON.parse(raw.slice(start, end + 1)) as Record<string, unknown>;
    const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
    const tags = Array.isArray(parsed.suggestedTags)
      ? parsed.suggestedTags.filter((t): t is string => typeof t === "string" && VALID_TAGS.has(t)).slice(0, 3)
      : [];
    return {
      description: str(parsed.description, 400),
      problem: str(parsed.problem, 1000),
      whatIBuilt: str(parsed.whatIBuilt, 1500),
      outcome: str(parsed.outcome, 400),
      suggestedTags: tags,
    };
  } catch {
    return null;
  }
}

export type CvDraft = ProjectDraftSuggestion & { title: string };

/** What a CV import asks the model for. Pure and exported for tests. */
export function cvDraftsPrompt(): string {
  const taxonomy = CAPABILITY_DEFINITIONS.map((c) => `- ${c.tag}: ${c.description}`).join("\n");
  return [
    `The attached document is someone's CV or LinkedIn profile export. Extract the distinct pieces of REAL WORK in it (projects, systems built, processes changed, things run), not job titles or responsibilities. Write in first person, concrete and modest; never inflate. Skip anything too vague to describe as work that happened.`,
    ``,
    `Capability taxonomy (suggest ONLY tags from this list, only where the document gives real evidence):`,
    taxonomy,
    ``,
    `Reply with ONLY a JSON array of 1 to 6 objects, no markdown fence, each: {"title": short name for the piece of work, "description": one plain sentence saying what it is, "problem": what it addressed (1-2 sentences, empty string if unclear), "whatIBuilt": what was actually done and how (2-3 sentences), "outcome": what changed (1 sentence, empty string if the document doesn't say), "suggestedTags": array of 0-3 taxonomy tags}`,
  ].join("\n");
}

/** Clamp a CV reply to the allowed shape: at most six drafts, taxonomy tags only. */
export function parseCvDrafts(raw: string): CvDraft[] | null {
  try {
    const start = raw.indexOf("[");
    const end = raw.lastIndexOf("]");
    if (start === -1 || end <= start) return null;
    const arr = JSON.parse(raw.slice(start, end + 1));
    if (!Array.isArray(arr)) return null;
    const drafts: CvDraft[] = [];
    for (const item of arr) {
      if (drafts.length >= 6) break;
      const one = parseDraftSuggestion(JSON.stringify(item));
      const title = typeof item?.title === "string" ? item.title.trim().slice(0, 120) : "";
      if (one && title) drafts.push({ ...one, title });
    }
    return drafts.length > 0 ? drafts : null;
  } catch {
    return null;
  }
}

/**
 * Draft projects from an uploaded CV (PDF, read natively by the API) or pasted text.
 * Best-effort like everything else here: null means the import proceeds with nothing drafted.
 */
export async function draftProjectsFromCv(input: {
  pdfBase64?: string;
  text?: string;
}): Promise<CvDraft[] | null> {
  if (!API_KEY) return null;

  const content: unknown[] = [];
  if (input.pdfBase64) {
    content.push({
      type: "document",
      source: { type: "base64", media_type: "application/pdf", data: input.pdfBase64 },
    });
  }
  content.push({
    type: "text",
    text: (input.text ? `Document text:\n"""\n${input.text.slice(0, 30000)}\n"""\n\n` : "") + cvDraftsPrompt(),
  });

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 2500,
        messages: [{ role: "user", content }],
      }),
    });
    if (!res.ok) {
      logError("ai.cv-draft-failed", new Error(`Anthropic responded ${res.status}`), {
        body: (await res.text()).slice(0, 300),
      });
      return null;
    }
    const data = (await res.json()) as { content?: { type: string; text?: string }[] };
    const text = data.content?.find((b) => b.type === "text")?.text ?? "";
    const drafts = parseCvDrafts(text);
    if (!drafts) logWarn("ai.cv-draft-unparseable", "model reply was not the requested JSON array", {});
    return drafts;
  } catch (error) {
    logError("ai.cv-draft-failed", error, {});
    return null;
  }
}

/**
 * Draft a write-up from a repo README. Best-effort: any failure returns null and the import
 * continues exactly as it would with no key configured.
 */
export async function draftProjectFromReadme(
  repoName: string,
  language: string | undefined,
  readme: string
): Promise<ProjectDraftSuggestion | null> {
  if (!API_KEY) return null;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 700,
        messages: [{ role: "user", content: draftPrompt(repoName, language, readme) }],
      }),
    });
    if (!res.ok) {
      logError("ai.draft-failed", new Error(`Anthropic responded ${res.status}`), {
        repo: repoName,
        body: (await res.text()).slice(0, 300),
      });
      return null;
    }
    const data = (await res.json()) as { content?: { type: string; text?: string }[] };
    const text = data.content?.find((b) => b.type === "text")?.text ?? "";
    const suggestion = parseDraftSuggestion(text);
    if (!suggestion) logWarn("ai.draft-unparseable", "model reply was not the requested JSON", { repo: repoName });
    return suggestion;
  } catch (error) {
    logError("ai.draft-failed", error, { repo: repoName });
    return null;
  }
}
