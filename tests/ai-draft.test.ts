import test from "node:test";
import assert from "node:assert/strict";
import { draftPrompt, parseDraftSuggestion } from "@/server/ai";
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
