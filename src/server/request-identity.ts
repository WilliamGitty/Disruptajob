import { createHash, randomUUID } from "node:crypto";
import { headers } from "next/headers";

/**
 * Turning an incoming request into something a rate limiter can count.
 *
 * Separate from server/rate-limit.ts so the limiting logic stays a pure function of the database
 * and can be tested without a server around it — and so the one place that touches a client IP is
 * a single short file somebody can audit.
 *
 * The address is hashed with a server-side salt and never stored raw, matching the position taken
 * in server/analytics.ts: this application does not keep a record of where people are.
 */

/**
 * Salt for IP hashing. Generated per process when unset, which means limits reset on deploy —
 * acceptable, and far better than shipping a constant that would make the hashes reversible by
 * anyone who reads this repository.
 */
const IP_SALT = process.env.RATE_LIMIT_SALT ?? randomUUID();

/** A stable, non-reversible stand-in for the caller's IP. */
export async function callerKey(): Promise<string> {
  const h = await headers();
  // Fly sets fly-client-ip; most proxies set x-forwarded-for. Take the first hop only — the rest
  // of that chain is attacker-controlled.
  const raw =
    h.get("fly-client-ip") ??
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "unknown";

  return createHash("sha256").update(`${IP_SALT}:${raw}`).digest("hex").slice(0, 32);
}
