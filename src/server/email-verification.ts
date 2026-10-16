import { createHash, randomBytes } from "node:crypto";
import { get, run } from "./db";

/**
 * Email verification, same shape as password resets and for the same reasons: only a hash of the
 * token is ever stored (a leaked database can't mint confirmation links), tokens are single-use,
 * and they expire.
 *
 * What verification gates is deliberately almost nothing. An unverified account can still build a
 * profile — someone who just spent ten minutes describing their work should never hit a wall
 * because an email landed in spam. The point of verifying is honesty of the address book: we know
 * which addresses are real before we ever send anything to them, and an address typo'd at sign-up
 * can't silently orphan an account's recovery path.
 */

const TOKEN_BYTES = 32;
const TTL_HOURS = 48;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Create a verification token for an account. The plain token exists only in the return value. */
export function createEmailVerification(accountId: string): string {
  const token = randomBytes(TOKEN_BYTES).toString("base64url");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + TTL_HOURS * 60 * 60 * 1000).toISOString();

  // One live token per account — a re-sent email should invalidate the earlier link.
  run("DELETE FROM email_verification WHERE account_id = ?", accountId);
  run(
    "INSERT INTO email_verification (token_hash, account_id, created_at, expires_at) VALUES (?,?,?,?)",
    hashToken(token),
    accountId,
    now.toISOString(),
    expiresAt
  );
  return token;
}

/**
 * Spend a token and mark the account verified. Expiry and single-use are conditions of the
 * lookup itself, so they cannot be forgotten by a caller.
 */
export function completeEmailVerification(token: string): boolean {
  const now = new Date().toISOString();
  const row = get<{ account_id: string }>(
    "SELECT account_id FROM email_verification WHERE token_hash = ? AND expires_at > ?",
    hashToken(token),
    now
  );
  if (!row) return false;

  run("UPDATE account SET email_verified_at = ? WHERE id = ?", now, row.account_id);
  run("DELETE FROM email_verification WHERE token_hash = ?", hashToken(token));
  return true;
}

export function isEmailVerified(accountId: string): boolean {
  return Boolean(
    get("SELECT 1 FROM account WHERE id = ? AND email_verified_at IS NOT NULL", accountId)
  );
}
