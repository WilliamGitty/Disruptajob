import test from "node:test";
import assert from "node:assert/strict";
import { cvDraftsPrompt, draftPrompt, parseCvDrafts, parseDraftSuggestion, parseTidy, tidyPrompt } from "@/server/ai";
import { CAPABILITY_DEFINITIONS } from "@/lib/capabilities";

/**
 * The AI drafting layer's pure parts. The rule under test is the product's own: the model may
 * only SUGGEST, only from the fixed taxonomy, and anything else it says is discarded — because
 * a tag that doesn't survive this parser can never even be shown, let alone scored.
 */

test("the prompt carries the full taxonomy and demands JSON", () => {
  const prompt = draftPrompt("my-repo", "TypeScript", "# A thing\nIt automates reports.");
  for (const c of CAPABILITY_DEFINITIONS) {
    assert.ok(prompt.includes(c.tag), `taxonomy tag ${c.tag} must be offered to the model`);
  }
  assert.ok(prompt.includes("ONLY a JSON object"));
  assert.ok(prompt.includes("never inflate"));
});

test("valid reply parses, including markdown-fenced", () => {
  const body = JSON.stringify({
    description: "A report automation.",
    problem: "Reports took days.",
    whatIBuilt: "A script and a schedule.",
    outcome: "Hours instead of days.",
    suggestedTags: ["automation", "workflow-design"],
  });
  for (const raw of [body, "```json\n" + body + "\n```"]) {
    const parsed = parseDraftSuggestion(raw);
    assert.ok(parsed);
    assert.equal(parsed.description, "A report automation.");
    assert.deepEqual(parsed.suggestedTags, ["automation", "workflow-design"]);
  }
});

test("invented tags are discarded, not passed through", () => {
  const parsed = parseDraftSuggestion(
    JSON.stringify({
      description: "x",
      problem: "",
      whatIBuilt: "",
      outcome: "",
      suggestedTags: ["automation", "blockchain-wizardry", "leadership", 42],
    })
  );
  assert.ok(parsed);
  assert.deepEqual(parsed.suggestedTags, ["automation"], "only taxonomy tags survive");
});

test("at most three suggestions, however many the model offers", () => {
  const all = CAPABILITY_DEFINITIONS.map((c) => c.tag);
  const parsed = parseDraftSuggestion(
    JSON.stringify({ description: "x", problem: "", whatIBuilt: "", outcome: "", suggestedTags: all })
  );
  assert.ok(parsed);
  assert.equal(parsed.suggestedTags.length, 3);
});

test("JSON buried in model prose still parses — the exact production failure", () => {
  const body = JSON.stringify({ description: "A thing.", problem: "", whatIBuilt: "", outcome: "", suggestedTags: ["automation"] });
  for (const raw of [
    `Here is the JSON you asked for:\n\n${body}\n\nLet me know if you'd like changes!`,
    `Sure! ${body}`,
  ]) {
    const parsed = parseDraftSuggestion(raw);
    assert.ok(parsed, "prose-wrapped JSON must parse");
    assert.equal(parsed.description, "A thing.");
  }
});

test("garbage returns null rather than a half-parsed draft", () => {
  assert.equal(parseDraftSuggestion("Sure! Here's what I'd write:"), null);
  assert.equal(parseDraftSuggestion(""), null);
});

test("oversized fields are clamped", () => {
  const parsed = parseDraftSuggestion(
    JSON.stringify({
      description: "d".repeat(1000),
      problem: "",
      whatIBuilt: "",
      outcome: "",
      suggestedTags: [],
    })
  );
  assert.ok(parsed);
  assert.equal(parsed.description.length, 400);
});

test("CV drafts: array parsed, titles required, taxonomy enforced, capped at six", () => {
  const item = (title: string, tags: string[]) =>
    ({ title, description: "d", problem: "", whatIBuilt: "", outcome: "", suggestedTags: tags });
  const raw = "Here you go:\n" + JSON.stringify([
    item("Invoice automation", ["automation", "made-up-tag"]),
    item("", ["growth"]),
    ...Array.from({ length: 8 }, (_, i) => item(`Work ${i}`, [])),
  ]);
  const drafts = parseCvDrafts(raw);
  assert.ok(drafts);
  assert.equal(drafts.length, 6, "capped at six even when the model offers more");
  assert.deepEqual(drafts[0].suggestedTags, ["automation"], "invented tags discarded");
  assert.ok(!drafts.some((d) => d.title === ""), "untitled items dropped");
});

test("CV drafts: prose without an array returns null", () => {
  assert.equal(parseCvDrafts("I couldn't find any projects in this document."), null);
});

test("the CV prompt asks for work, not titles, and carries the taxonomy", () => {
  const prompt = cvDraftsPrompt();
  assert.ok(prompt.includes("not job titles"));
  for (const c of CAPABILITY_DEFINITIONS) assert.ok(prompt.includes(c.tag));
});

test("tidy: JSON buried in model prose still parses, and fields clamp at 400", () => {
  const parsed = parseTidy(
    "Of course! Here is the tidied version:\n" +
      JSON.stringify({
        titleGap: "x".repeat(900),
        description: "I run mental health workshops and deliver talks to large audiences.",
        outcome: "",
      }) +
      "\nLet me know if you'd like changes."
  );
  assert.ok(parsed);
  assert.equal(parsed.titleGap.length, 400);
  assert.equal(parsed.outcome, "", "an empty field stays empty");
});

test("tidy: prose without JSON returns null rather than guessing", () => {
  assert.equal(parseTidy("I tidied it up for you, hope that helps."), null);
});

test("the tidy prompt forbids invention and inflation in so many words", () => {
  const prompt = tidyPrompt({ titleGap: "a", description: "b", outcome: "c" });
  assert.ok(prompt.includes("Never add a fact"));
  assert.ok(prompt.includes("Never inflate"));
  assert.ok(prompt.includes("No em dashes"));
});
