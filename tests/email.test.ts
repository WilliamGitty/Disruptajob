import test from "node:test";
import assert from "node:assert/strict";

/**
 * Email: the no-provider fallback and the message builders.
 *
 * The transport rule under test is the one the architecture depends on: with no RESEND_API_KEY,
 * sending degrades to a logged no-op rather than an error, because every calling flow (sign-up,
 * reset, invites) is required to survive a machine with no configuration at all.
 */

delete process.env.RESEND_API_KEY;
process.env.APP_URL = "https://example.test";

test("without a key, sendEmail reports no-provider instead of throwing", async () => {
  const { sendEmail } = await import("@/server/email");
  const outcome = await sendEmail({ to: "someone@example.com", subject: "x", text: "y" });
  assert.deepEqual(outcome, { sent: false, reason: "no-provider" });
});

test("reset email carries the token exactly once, in the link", async () => {
  const { passwordResetEmail } = await import("@/server/email");
  const msg = passwordResetEmail("a@example.com", "tok-abc123");
  assert.ok(msg.text.includes("https://example.test/reset-password/tok-abc123"));
  assert.equal(msg.text.split("tok-abc123").length, 2, "token must appear exactly once");
  assert.ok(!msg.subject.includes("tok-abc123"), "subjects leak into push notifications — no tokens there");
});

test("verification email links to the verify route", async () => {
  const { verifyEmailEmail } = await import("@/server/email");
  const msg = verifyEmailEmail("a@example.com", "vtok");
  assert.ok(msg.text.includes("https://example.test/verify-email/vtok"));
});

test("invite notifications carry no candidate identity", async () => {
  // The contact-release promise (handoff.ts) extends to email: an employer learns a candidate
  // answered, never who they are, from the notification itself.
  const { inviteAnsweredEmail, inviteReceivedEmail } = await import("@/server/email");
  const answered = inviteAnsweredEmail("employer@example.com", "Ops lead", "declined");
  assert.ok(!answered.text.toLowerCase().includes("candidate@"), "no addresses beyond the recipient");
  assert.ok(answered.text.includes("Ops lead"));

  const received = inviteReceivedEmail("cand@example.com", "Meridian", "Ops lead");
  assert.ok(received.text.includes("Meridian"));
  assert.ok(received.text.includes("Nothing is"), "must state the no-sharing-before-accept promise");
});
