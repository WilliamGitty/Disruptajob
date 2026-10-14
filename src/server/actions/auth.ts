"use server";

import { redirect } from "next/navigation";
import { signIn, signOut, signUp } from "../auth";
import { SIGNUP_ENABLED } from "../config";

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const ok = await signIn(email, password || undefined);
  if (!ok) redirect("/signin?error=1");
  redirect("/");
}

export async function signUpAction(formData: FormData) {
  // Enforced here as well as in the page: hiding a form is not the same as closing a door, and
  // this action is reachable by anyone who can craft a POST.
  if (!SIGNUP_ENABLED) {
    redirect("/signup?error=Sign-up%20is%20closed%20on%20this%20demonstration%20site.");
  }

  const role = formData.get("role") === "employer" ? "employer" : "talent";
  const result = await signUp({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    name: String(formData.get("name") ?? ""),
    role,
  });

  if (!result.ok) {
    redirect(`/signup?error=${encodeURIComponent(result.error)}&role=${role}`);
  }

  // Straight into the thing they came to do, rather than a dead-end "account created" screen.
  redirect(role === "talent" ? "/talent/onboarding" : "/employer/setup");
}

export async function signOutAction() {
  await signOut();
  redirect("/signin");
}
