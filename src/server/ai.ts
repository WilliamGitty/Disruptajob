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
    const cleaned = raw.trim().replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    const parsed = JSON.parse(cleaned) as Record<string, unknown>;
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
