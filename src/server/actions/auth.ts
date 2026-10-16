"use server";

import { redirect } from "next/navigation";
import { findAccountByEmail, signIn, signOut, signUp } from "../auth";
import { SIGNUP_ENABLED } from "../config";
import { createEmailVerification } from "../email-verification";
import { sendEmail, verifyEmailEmail } from "../email";
import { clearRateLimit, rateLimit, retryMessage } from "../rate-limit";
import { callerKey } from "../request-identity";

/**
 * Sign-in and sign-up, rate limited.
 *
 * Limits are applied per email *and* per machine. Per-email alone lets someone try one password
 * against ten thousand addresses; per-machine alone lets a shared office IP lock out a colleague.
 * Together they cover the two attacks a prototype actually sees.
 */

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const ip = await callerKey();

  const byIp = rateLimit("signInByIp", ip);
  if (!byIp.allowed) {
    redirect(`/signin?error=${encodeURIComponent(`Too many attempts. ${retryMessage(byIp.retryAfterSeconds)}`)}`);
  }

  const byEmail = rateLimit("signInByEmail", email);
  if (!byEmail.allowed) {
    // Deliberately the same wording whether or not the address exists — a different message here
    // would turn the rate limiter into an account-enumeration oracle.
    redirect(`/signin?error=${encodeURIComponent(`Too many attempts. ${retryMessage(byEmail.retryAfterSeconds)}`)}`);
  }

  const ok = await signIn(email, password || undefined);
  if (!ok) redirect("/signin?error=1");

  // A successful sign-in clears the slate, so someone who fumbled their password twice and then
  // got it right isn't carrying a near-lockout around for the next quarter of an hour.
  clearRateLimit("signInByEmail", email);
  redirect("/");
}

export async function signUpAction(formData: FormData) {
  // Enforced here as well as in the page: hiding a form is not the same as closing a door, and
  // this action is reachable by anyone who can craft a POST.
  if (!SIGNUP_ENABLED) {
    redirect("/signup?error=Sign-up%20is%20closed%20on%20this%20demonstration%20site.");
  }

  const role = formData.get("role") === "employer" ? "employer" : "talent";

  const limited = rateLimit("signUpByIp", await callerKey());
  if (!limited.allowed) {
    redirect(
      `/signup?error=${encodeURIComponent(
        `That's a lot of accounts from one place. ${retryMessage(limited.retryAfterSeconds)}`
      )}&role=${role}`
    );
  }

  const result = await signUp({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    name: String(formData.get("name") ?? ""),
    role,
  });

  if (!result.ok) {
    redirect(`/signup?error=${encodeURIComponent(result.error)}&role=${role}`);
  }

  // Confirm the address works while it's fresh. Best-effort: a failed or undeliverable send
  // must never block the account — verification gates nothing, it future-proofs recovery.
  const created = findAccountByEmail(String(formData.get("email") ?? ""));
  if (created) {
    const token = createEmailVerification(created.id);
    await sendEmail(verifyEmailEmail(created.email, token));
  }

  // Straight into the thing they came to do, rather than a dead-end "account created" screen.
  redirect(role === "talent" ? "/talent/onboarding" : "/employer/setup");
}

export async function resendVerificationAction() {
  const { requireAccount } = await import("../auth");
  const { isEmailVerified, createEmailVerification } = await import("../email-verification");
  const account = await requireAccount();

  if (!isEmailVerified(account.id)) {
    // Same shape as the sign-up send; a failure is logged inside sendEmail and the user can
    // simply press the button again.
    const token = createEmailVerification(account.id);
    await sendEmail(verifyEmailEmail(account.email, token));
  }

  const back = account.role === "talent" ? "/talent/settings" : "/employer/settings";
  redirect(`${back}?verification=sent`);
}

export async function signOutAction() {
  await signOut();
  redirect("/signin");
}
