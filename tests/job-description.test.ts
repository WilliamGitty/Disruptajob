import test from "node:test";
import assert from "node:assert/strict";
import { parseJobDescription } from "@/lib/job-description";

/**
 * Parsing a pasted job description.
 *
 * The parser's job is to save a company from a blank page, not to publish a role. The tests that
 * matter most are therefore the ones about restraint: it must separate work from wish-list, refuse
 * to invent capabilities the document doesn't support, and report what it couldn't find instead of
 * quietly returning a confident half-answer.
 */

const FULL_JD = `
Job Title: Dispatch Automation Lead

About us
Harbour Freight Systems builds the routing software behind regional freight networks across the UK.

What you'll do
- Replace the manual dispatch spreadsheet that one coordinator rebuilds by hand every morning
- Design the workflow that routes exceptions to the right person automatically
- Build reporting so the operations team can see where time is going
- Work with senior stakeholders to agree what "on time" actually means

What we're looking for
- 5+ years of experience in a similar role
- A degree in a numerate subject
- Excellent communication skills

Location: Leeds, UK
Hybrid - 3 days a week in the office
Salary: £65,000 – £80,000
`;

test("the role title is read from an explicit label", () => {
  assert.equal(parseJobDescription(FULL_JD).roleTitle, "Dispatch Automation Lead");
});

test("duties become work examples and the wish-list is ignored", () => {
  const draft = parseJobDescription(FULL_JD);
  const text = draft.workExamples.map((w) => w.description).join(" ");

  assert.equal(draft.workExamples.length, 4);
  assert.match(text, /dispatch spreadsheet/);
  // The part of a JD this product exists to throw away.
  assert.doesNotMatch(text, /5\+ years|degree|Excellent communication/);
});

test("work examples get a short title and keep the full line as description", () => {
  const draft = parseJobDescription(FULL_JD);
  const first = draft.workExamples[0];

  assert.ok(first.title.length <= 72);
  assert.ok(first.description.length >= first.title.length);
  assert.match(first.description, /^Replace the manual dispatch spreadsheet/);
});

test("salary, location and arrangement are pulled out when stated", () => {
  const draft = parseJobDescription(FULL_JD);

  assert.match(draft.compRange ?? "", /65,000/);
  assert.match(draft.compRange ?? "", /80,000/);
  assert.equal(draft.location, "Leeds, UK");
  assert.ok(draft.workArrangements.includes("hybrid"));
});

test("capabilities are suggested from the duties, and are plausible", () => {
  const draft = parseJobDescription(FULL_JD);

  assert.ok(draft.suggestedCapabilities.length > 0);
  assert.ok(
    draft.suggestedCapabilities.includes("automation") ||
      draft.suggestedCapabilities.includes("workflow-design"),
    `expected automation-ish tags, got ${draft.suggestedCapabilities.join(", ")}`
  );
});

test("marketing copy does not get a vote on capabilities", () => {
  // "About us" paragraphs are the single easiest way to tag a role with work it doesn't contain.
  const draft = parseJobDescription(`
About us
We are a growth-stage AI startup using machine learning and data analytics to transform product.

What you'll do
- Keep the office plants alive and order the milk
`);

  assert.equal(draft.suggestedCapabilities.includes("ai-enablement"), false);
  assert.equal(draft.suggestedCapabilities.includes("growth"), false);
});

test("what could not be found is reported rather than guessed", () => {
  const draft = parseJobDescription("We're hiring! Get in touch.");

  assert.ok(draft.missing.includes("role title") || draft.roleTitle === "");
  assert.ok(draft.missing.includes("what the person would actually do"));
  assert.ok(draft.missing.includes("salary range"));
  assert.equal(draft.workExamples.length, 0);
});

test("a bullet list with no headings still yields work, minus the obvious wish-list lines", () => {
  const draft = parseJobDescription(`
Operations Manager

- Own the weekly reporting pack that goes to the leadership team
- Automate the reconciliation process that currently takes two days
- 7+ years of experience required
- Must hold a degree
`);

  const text = draft.workExamples.map((w) => w.description).join(" ");
  assert.equal(draft.workExamples.length, 2);
  assert.match(text, /reporting pack/);
  assert.doesNotMatch(text, /7\+ years|degree/);
});

test("nothing it returns is presented as confirmed", () => {
  // The type is the guarantee: a draft carries *suggested* capabilities, and has no field that
  // could mark a work example as approved. A role still has to be published by a person.
  const draft = parseJobDescription(FULL_JD);

  for (const w of draft.workExamples) {
    assert.ok("suggestedCapabilities" in w);
    assert.equal("capabilities" in w, false, "a parsed example must not carry confirmed tags");
  }
});

test("empty and junk input are handled without throwing", () => {
  for (const input of ["", "   ", "\n\n\n", "%%%%", "a".repeat(50_000)]) {
    const draft = parseJobDescription(input);
    assert.ok(Array.isArray(draft.workExamples));
    assert.ok(Array.isArray(draft.missing));
  }
});

test("a US-formatted description is handled too", () => {
  const draft = parseJobDescription(`
Role: Operations Analyst

Responsibilities
- Build dashboards so the leadership team can see pipeline health
- Automate the manual data entry between our CRM and billing system

Location: New York, NY
Fully remote
$120k - $150k
`);

  assert.equal(draft.roleTitle, "Operations Analyst");
  assert.equal(draft.location, "New York, NY");
  assert.ok(draft.workArrangements.includes("remote"));
  assert.match(draft.compRange ?? "", /120k/);
  assert.equal(draft.workExamples.length, 2);
});
