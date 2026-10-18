import { get, run } from "./db";
import { hashPassword, passwordProblem, verifyPassword } from "./password";

/**
 * Changing the credentials that ARE the account: email and password.
 *
 * Pure of next/headers on purpose (the fourth application of the extraction pattern), so
 * every rule here is testable. The rules themselves:
 *
 *  - Both changes require the current password where one exists. An email change without a
 *    password check is an account-takeover button for anyone at an unlocked laptop.
 *  - A changed email is an UNVERIFIED email: verification state resets and a fresh
 *    confirmation goes to the new address, because the old proof proved the old inbox.
 *  - A changed password ends every other session, same reasoning as password reset.
 */

export type AccountChange = { ok: true } | { ok: false; error: string };

function passwordGate(accountId: string, currentPassword: string): AccountChange {
  const row = get<{ password_hash: string | null }>(
    "SELECT password_hash FROM account WHERE id = ?",
    accountId
  );
  if (!row) return { ok: false, error: "That account no longer exists." };
  if (row.password_hash) {
    if (!currentPassword || !verifyPassword(currentPassword, row.password_hash)) {
      return { ok: false, error: "Your current password didn't match." };
    }
  }
  return { ok: true };
}

export function changeAccountEmail(
  accountId: string,
  newEmailRaw: string,
  currentPassword: string
): AccountChange {
  const newEmail = newEmailRaw.trim().toLowerCase();
  if (!newEmail.includes("@") || newEmail.length < 5) {
    return { ok: false, error: "That doesn't look like an email address." };
  }

  const gate = passwordGate(accountId, currentPassword);
  if (!gate.ok) return gate;

  const taken = get<{ id: string }>(
    "SELECT id FROM account WHERE LOWER(email) = ? AND id <> ?",
    newEmail,
    accountId
  );
  if (taken) return { ok: false, error: "There's already an account with that email." };

  run(
    "UPDATE account SET email = ?, email_verified_at = NULL WHERE id = ?",
    newEmail,
    accountId
  );
  // Any confirmation link in flight proved the OLD inbox; it must not verify the new one.
  run("DELETE FROM email_verification WHERE account_id = ?", accountId);
  return { ok: true };
}

export function changeAccountPassword(
  accountId: string,
  currentPassword: string,
  newPassword: string
): AccountChange {
  const problem = passwordProblem(newPassword);
  if (problem) return { ok: false, error: problem };

  const gate = passwordGate(accountId, currentPassword);
  if (!gate.ok) return gate;

  run("UPDATE account SET password_hash = ? WHERE id = ?", hashPassword(newPassword), accountId);
  return { ok: true };
}

/** End every session for this account except the given token. Used after a password change. */
export function endOtherSessions(accountId: string, keepToken: string | undefined): void {
  if (keepToken) {
    run("DELETE FROM session WHERE account_id = ? AND token <> ?", accountId, keepToken);
  } else {
    run("DELETE FROM session WHERE account_id = ?", accountId);
  }
}
