"use server";

import { redirect } from "next/navigation";
import { createPasswordReset, completePasswordReset } from "../password-reset";
import { passwordResetEmail, sendEmail } from "../email";
import { rateLimit, retryMessage } from "../rate-limit";
import { callerKey } from "../request-identity";

/**
 * The delivery half of password resets. The core (`server/password-reset.ts`) was written before
 * any email could be sent and is unchanged — these actions only connect it to a form and a mailbox.
 *
 * The invariant both actions keep: **nothing in any response reveals whether an account exists.**
 * Same redirect, same message, same timing-irrelevant work either way.
 */

export async function requestPasswordResetAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();

  const byIp = rateLimit("resetByIp", await callerKey());
  if (!byIp.allowed) {
    redirect(
      `/forgot-password?error=${encodeURIComponent(`Too many requests. ${retryMessage(byIp.retryAfterSeconds)}`)}`
    );
  }
  const byEmail = rateLimit("resetByEmail", email.toLowerCase());
  if (!byEmail.allowed) {
    // Identical wording to the IP limit: a distinct message would say something about the address.
    redirect(
      `/forgot-password?error=${encodeURIComponent(`Too many requests. ${retryMessage(byEmail.retryAfterSeconds)}`)}`
    );
  }

  const reset = createPasswordReset(email);
  if (reset) {
    // Best-effort: a failed send is logged inside sendEmail and must not change the response,
    // or delivery failures become an account-existence oracle.
    await sendEmail(passwordResetEmail(email.toLowerCase(), reset.token));
  }

  redirect("/forgot-password?sent=1");
}

export async function completePasswordResetAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");

  const outcome = completePasswordReset(token, password);
  if (!outcome.ok) {
    redirect(`/reset-password/${encodeURIComponent(token)}?error=${encodeURIComponent(outcome.error)}`);
  }

  redirect("/signin?reset=1");
}
