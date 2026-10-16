import { createHash, randomBytes } from "node:crypto";
import { all, get, run } from "./db";
import { hashPassword, passwordProblem } from "./password";

/**
 * Password resets, built so they work before there is any way to send email.
 *
 * Until today a forgotten password meant a permanently lost account — no recovery path existed at
 * all. Sending a link needs a mail provider, which this project deliberately doesn't have yet, so
 * the flow is split: requesting a reset always creates a link, and *delivering* it is a separate
 * concern. With no provider configured the link surfaces on the admin funnel page for the founder
 * to pass on by hand, which is fine for the first handful of users and stops the hole being open.
 * Adding a provider later changes delivery and nothing else.
 *
 * Two rules the implementation keeps:
 *
 *  - **Only a hash of the token is stored.** The plain token exists in the link and nowhere else,
 *    so a leaked database cannot be turned into account takeovers.
 *  - **Requesting a reset never reveals whether an account exists.** The caller gets the same
 *    answer either way, because "no account with that email" is a disclosure about a person.
 */

const TOKEN_BYTES = 32;
const TTL_MINUTES = 60;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export interface ResetRequest {
  /** The plain token. Exists only in memory and in the link — never stored. */
  token: string;
  expiresAt: string;
}

/**
 * Create a reset for an email address, if an account exists.
 *
 * Returns undefined when it doesn't — callers must still report success to the user.
 */
export function createPasswordReset(email: string): ResetRequest | undefined {
  const account = get<{ id: string }>(
    "SELECT id FROM account WHERE email = ?",
    email.trim().toLowerCase()
  );
  if (!account) return undefined;

  const token = randomBytes(TOKEN_BYTES).toString("base64url");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + TTL_MINUTES * 60 * 1000).toISOString();

  // One live reset per account: requesting a new link should invalidate the old one, or an
  // abandoned email in someone's inbox stays usable for an hour.
  run("DELETE FROM password_reset WHERE account_id = ?", account.id);
  run(
    "INSERT INTO password_reset (token_hash, account_id, created_at, expires_at) VALUES (?,?,?,?)",
    hashToken(token),
    account.id,
    now.toISOString(),
    expiresAt
  );

  return { token, expiresAt };
}

export type ResetOutcome =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Spend a reset token and set the new password.
 *
 * Expiry and single use are both checked in the query, so a token can't be replayed by a caller
 * that forgets to look.
 */
export function completePasswordReset(token: string, newPassword: string): ResetOutcome {
  const problem = passwordProblem(newPassword);
  if (problem) return { ok: false, error: problem };

  const now = new Date().toISOString();
  const row = get<{ account_id: string }>(
    `SELECT account_id FROM password_reset
      WHERE token_hash = ? AND used_at IS NULL AND expires_at > ?`,
    hashToken(token),
    now
  );

  if (!row) {
    return { ok: false, error: "That link has expired or already been used. Ask for a new one." };
  }

  run("UPDATE account SET password_hash = ? WHERE id = ?", hashPassword(newPassword), row.account_id);
  run("UPDATE password_reset SET used_at = ? WHERE token_hash = ?", now, hashToken(token));
  // Signing in everywhere else should stop: a reset usually means the old password is compromised
  // or forgotten, and leaving old sessions alive defeats the point.
  run("DELETE FROM session WHERE account_id = ?", row.account_id);

  return { ok: true };
}

/** Whether a token is still usable — for rendering the form without spending it. */
export function isResetTokenValid(token: string): boolean {
  return Boolean(
    get(
      `SELECT 1 FROM password_reset
        WHERE token_hash = ? AND used_at IS NULL AND expires_at > ?`,
      hashToken(token),
      new Date().toISOString()
    )
  );
}

export interface PendingReset {
  email: string;
  createdAt: string;
  expiresAt: string;
}

/**
 * Live resets, for the admin funnel page.
 *
 * Deliberately does NOT return the token: the link can only be read from the row that created it,
 * so even an admin page cannot mint a way into somebody's account after the fact.
 */
export function pendingResets(): PendingReset[] {
  return all<{ email: string; created_at: string; expires_at: string }>(
    `SELECT a.email, r.created_at, r.expires_at
       FROM password_reset r JOIN account a ON a.id = r.account_id
      WHERE r.used_at IS NULL AND r.expires_at > ?
      ORDER BY r.created_at DESC`,
    new Date().toISOString()
  ).map((r) => ({ email: r.email, createdAt: r.created_at, expiresAt: r.expires_at }));
}
