import { logError, logWarn } from "./log";

/**
 * Email, via Resend's REST API.
 *
 * This is the one external service this project talks to, and the decision to add it was made
 * deliberately (strategy doc, decision D1): opening sign-up to real people responsibly requires
 * email verification and password recovery, and both require delivery. Everything else about the
 * zero-dependency rule stands — no SDK (the API is one fetch), no other keys, and the entire
 * application still runs with `npm ci && npm run dev` on a machine with no configuration at all:
 * with no RESEND_API_KEY set, sends are logged to stderr instead of delivered, and every calling
 * flow is built to survive that.
 *
 * Two rules for callers:
 *
 *  - **Sending is best-effort.** Never let a failed send fail the action around it — an invite
 *    that saved but didn't notify is an inconvenience; an invite that vanished because Resend had
 *    a bad minute is a bug.
 *  - **Plain text only.** These are short, personal-scale messages, and text survives every
 *    client, reads as a person, and can't carry a tracking pixel — which matters for a product
 *    whose pitch is that nobody is watching you.
 */

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
}

export type SendOutcome =
  | { sent: true }
  | { sent: false; reason: "no-provider" | "send-failed" };

const RESEND_API_KEY = process.env.RESEND_API_KEY;

/**
 * The sender. Resend's shared `onboarding@resend.dev` address works without any DNS setup but
 * only delivers to the Resend account owner's own inbox — fine for testing the loop end to end,
 * useless for real users. Verifying a domain in Resend and setting EMAIL_FROM is what makes
 * delivery general. See DEPLOY.md.
 */
const FROM = process.env.EMAIL_FROM ?? "Disruptajob <onboarding@resend.dev>";

/** Where links in emails point. Set in fly.toml for production; localhost otherwise. */
export const APP_URL = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/+$/, "");

export async function sendEmail(message: EmailMessage): Promise<SendOutcome> {
  if (!RESEND_API_KEY) {
    // The dev-mode path: the full message goes to stderr, so the flow can be exercised —
    // including clicking the link — without any account or key existing anywhere.
    logWarn("email.not-sent", "no RESEND_API_KEY configured, full message follows", {
      to: message.to,
      subject: message.subject,
      text: message.text,
    });
    return { sent: false, reason: "no-provider" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to: message.to, subject: message.subject, text: message.text }),
    });
    if (!res.ok) {
      logError("email.send-failed", new Error(`Resend responded ${res.status}`), {
        to: message.to,
        subject: message.subject,
        body: (await res.text()).slice(0, 500),
      });
      return { sent: false, reason: "send-failed" };
    }
    return { sent: true };
  } catch (error) {
    logError("email.send-failed", error, { to: message.to, subject: message.subject });
    return { sent: false, reason: "send-failed" };
  }
}

// --- Messages ---------------------------------------------------------------
//
// Pure builders, separate from transport so their content is testable. The writing rules from
// docs/design-principles.md apply to email more than anywhere: this lands in the inbox of someone
// who may be eleven months into a search. No urgency, no guilt, no marketing voice.

export function passwordResetEmail(to: string, token: string): EmailMessage {
  return {
    to,
    subject: "Reset your Disruptajob password",
    text: [
      "Someone, hopefully you, asked to reset the password for this account.",
      "",
      `Set a new one here (the link works once, for the next hour):`,
      `${APP_URL}/reset-password/${token}`,
      "",
      "If this wasn't you, ignore this email. Nothing has changed and nothing will.",
    ].join("\n"),
  };
}

export function verifyEmailEmail(to: string, token: string): EmailMessage {
  return {
    to,
    subject: "Confirm your email · Disruptajob",
    text: [
      "One click to confirm this address is yours:",
      "",
      `${APP_URL}/verify-email/${token}`,
      "",
      "That's the whole job. If you didn't create a Disruptajob account, ignore this",
      "and the account will never be able to do anything with your address.",
    ].join("\n"),
  };
}

export function inviteReceivedEmail(to: string, companyName: string, roleTitle: string): EmailMessage {
  return {
    to,
    subject: `${companyName} wants to talk`,
    text: [
      `${companyName} saw your work and reached out about: ${roleTitle}.`,
      "",
      "They wrote you a message, read it and decide in your own time. Nothing is",
      "shared with them unless you accept.",
      "",
      `${APP_URL}/talent/opportunities`,
    ].join("\n"),
  };
}

export function inviteAnsweredEmail(
  to: string,
  roleTitle: string,
  answer: "accepted" | "declined"
): EmailMessage {
  return {
    to,
    subject:
      answer === "accepted"
        ? `Your invite was accepted, ${roleTitle}`
        : `An answer on your invite, ${roleTitle}`,
    text:
      answer === "accepted"
        ? [
            `Good news: your invite for "${roleTitle}" was accepted, and the conversation is open.`,
            "",
            `${APP_URL}/employer/responses`,
          ].join("\n")
        : [
            `The person you invited for "${roleTitle}" has declined, and they've come off your`,
            "board. No reply is expected from you.",
            "",
            `${APP_URL}/employer/responses`,
          ].join("\n"),
  };
}
