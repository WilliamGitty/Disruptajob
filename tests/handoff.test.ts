import test, { before, beforeEach } from "node:test";
import assert from "node:assert/strict";

/**
 * Releasing contact details.
 *
 * The rule: reaching out does not earn you someone's email address — them accepting does. This is
 * the only path in the application that returns a candidate's address to anyone else, so these
 * tests check the release condition from every angle a bug could come from: wrong status, wrong
 * company, and a status changed after the fact.
 */

process.env.DISRUPTAJOB_DB = ":memory:";

let handoffForInvite: typeof import("@/server/repositories/handoff").handoffForInvite;
let run: typeof import("@/server/db").run;

before(async () => {
  handoffForInvite = (await import("@/server/repositories/handoff")).handoffForInvite;
  run = (await import("@/server/db")).run;
});

const NOW = new Date().toISOString();

function seed(status: string, followup = "email") {
  for (const t of ["invite", "account", "candidate", "company"]) run(`DELETE FROM ${t}`);

  run(`INSERT INTO candidate (id, slug, name, avatar_initials, accent_index, created_at)
       VALUES ('cand','priya','Priya Raman','PR',0,?)`, NOW);
  run(`INSERT INTO company (id, slug, name, avatar_initials, accent_index, published, created_at)
       VALUES ('co','acme','Acme','AC',0,1,?)`, NOW);
  run(`INSERT INTO company (id, slug, name, avatar_initials, accent_index, published, created_at)
       VALUES ('other','other','Other Ltd','OT',0,1,?)`, NOW);
  run(`INSERT INTO account (id, email, display_name, role, candidate_id, created_at)
       VALUES ('acc','priya@example.com','Priya','talent','cand',?)`, NOW);
  run(`INSERT INTO invite (id, candidate_id, company_id, role_title, message,
                           followup_channel, status, created_at)
       VALUES ('inv','cand','co','Ops Lead','Hello',?,?,?)`, followup, status, NOW);
}

beforeEach(() => seed("sent"));

test("a sent invite does not release the email address", () => {
  const handoff = handoffForInvite("inv", "co");

  assert.ok(handoff);
  assert.equal(handoff.email, undefined);
  assert.equal(handoff.candidateName, "Priya Raman");
});

test("a viewed invite still does not release it", () => {
  seed("viewed");
  assert.equal(handoffForInvite("inv", "co")?.email, undefined);
});

test("a declined invite never releases it", () => {
  seed("declined");
  assert.equal(handoffForInvite("inv", "co")?.email, undefined);
});

test("acceptance is what releases the address", () => {
  seed("accepted");
  assert.equal(handoffForInvite("inv", "co")?.email, "priya@example.com");
});

test("another company cannot read the handoff, accepted or not", () => {
  seed("accepted");
  assert.equal(handoffForInvite("inv", "other"), undefined);
});

test("an unknown invite returns nothing rather than a partial record", () => {
  assert.equal(handoffForInvite("does-not-exist", "co"), undefined);
});

test("a missing or unrecognised followup choice falls back to staying on the platform", () => {
  // The safe default is the one that discloses least.
  seed("accepted", "nonsense");
  assert.equal(handoffForInvite("inv", "co")?.channel, "here");
});

test("withdrawing acceptance withdraws the address", () => {
  seed("accepted");
  assert.equal(handoffForInvite("inv", "co")?.email, "priya@example.com");

  run("UPDATE invite SET status = 'declined' WHERE id = 'inv'");
  assert.equal(handoffForInvite("inv", "co")?.email, undefined);
});
