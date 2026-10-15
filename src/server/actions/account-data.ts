"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAccount, signOut } from "../auth";
import { collectAccountData, purgeAccount, type AccountExport } from "../account-data";

/**
 * Taking your data out, and taking it away.
 *
 * Both are UK GDPR obligations (Articles 15 and 17) before real people use this, and both are
 * also the product's argument made operational: a platform that says your evidence belongs to you
 * has to let you leave with it. The data work lives in server/account-data.ts; this file is the
 * session, the confirmation and the redirect.
 */

export async function exportMyData(): Promise<AccountExport> {
  return collectAccountData(await requireAccount());
}

export type DeleteResult = { ok: false; error: string };

/**
 * Delete the account and everything behind it.
 *
 * Requires the account's own email typed back, because this is irreversible and a misclick costs
 * someone their entire body of evidence. Signs out on success so the next render has no session
 * rather than a session pointing at rows that no longer exist.
 */
export async function deleteMyAccount(formData: FormData): Promise<DeleteResult> {
  const account = await requireAccount();
  const typed = String(formData.get("confirmEmail") ?? "").trim().toLowerCase();

  if (typed !== account.email.toLowerCase()) {
    return { ok: false, error: "That doesn't match the email on this account, so nothing was deleted." };
  }

  purgeAccount(account);
  await signOut();
  revalidatePath("/", "layout");
  redirect("/?deleted=1");
}
