import { verifyPassword } from "./password";

/**
 * The sign-in credential decision, as a pure function (audit S4).
 *
 * Pulled out of auth.ts for the same reason the rate limiter's caller-identity was: auth imports
 * next/headers to set the session cookie, which makes it untestable under plain Node — and an
 * untestable rule about who may sign in is how the passwordless-in-production trap survived
 * unnoticed in the first place.
 */
export function credentialsAccepted(
  storedHash: string | null | undefined,
  password: string | undefined,
  isProduction: boolean
): { ok: true } | { ok: false; reason: "bad-password" | "passwordless-in-production" } {
  if (storedHash) {
    return password && verifyPassword(password, storedHash)
      ? { ok: true }
      : { ok: false, reason: "bad-password" };
  }

  // No password on the account: the local-demo convenience. In production it is an open door with
  // the key under the mat — whether it was locked used to depend on an env var being set before
  // the database's first-ever seed ran. The rule lives here now, where deploy order can't touch it.
  return isProduction ? { ok: false, reason: "passwordless-in-production" } : { ok: true };
}
