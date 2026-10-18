"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAccount } from "../auth";
import { run } from "../db";
import {
  changeAccountEmail,
  changeAccountPassword,
  endOtherSessions,
} from "../account-management";
import { createEmailVerification } from "../email-verification";
import { sendEmail, verifyEmailEmail } from "../email";
import { rateLimit } from "../rate-limit";
import { callerKey } from "../request-identity";

/** Thin request-world wrappers; the rules live pure in account-management.ts. */

export async function updateDisplayNameAction(formData: FormData) {
  const account = await requireAccount();
  const name = String(formData.get("name") ?? "").trim().slice(0, 80);
  if (name) {
    run("UPDATE account SET display_name = ? WHERE id = ?", name, account.id);
    if (account.candidateId) {
      run("UPDATE candidate SET name = ? WHERE id = ?", name, account.candidateId);
    }
    revalidatePath("/talent/account");
    revalidatePath("/profile/[slug]", "page");
  }
  redirect("/talent/account?saved=name");
}

export async function changeEmailAction(formData: FormData) {
  const account = await requireAccount();

  const limited = rateLimit("signInByIp", await callerKey());
  if (!limited.allowed) redirect("/talent/account?error=Too+many+attempts.+Give+it+a+while.");

  const result = changeAccountEmail(
    account.id,
    String(formData.get("newEmail") ?? ""),
    String(formData.get("currentPassword") ?? "")
  );
  if (!result.ok) redirect(`/talent/account?error=${encodeURIComponent(result.error)}`);

  // The new inbox gets its own confirmation; nothing is locked while it waits.
  const newEmail = String(formData.get("newEmail") ?? "").trim().toLowerCase();
  const token = createEmailVerification(account.id);
  await sendEmail(verifyEmailEmail(newEmail, token));

  revalidatePath("/talent/account");
  redirect("/talent/account?saved=email");
}

export async function changePasswordAction(formData: FormData) {
  const account = await requireAccount();

  const limited = rateLimit("signInByIp", await callerKey());
  if (!limited.allowed) redirect("/talent/account?error=Too+many+attempts.+Give+it+a+while.");

  const result = changeAccountPassword(
    account.id,
    String(formData.get("currentPassword") ?? ""),
    String(formData.get("newPassword") ?? "")
  );
  if (!result.ok) redirect(`/talent/account?error=${encodeURIComponent(result.error)}`);

  // A changed password ends every other session; this one keeps living.
  const jar = await cookies();
  endOtherSessions(account.id, jar.get("disruptajob_session")?.value);

  redirect("/talent/account?saved=password");
}
