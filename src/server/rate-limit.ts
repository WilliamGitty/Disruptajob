import { randomUUID } from "node:crypto";
import { all, get, run } from "./db";

/**
 * Rate limiting for the handful of endpoints a stranger can hammer.
 *
 * Open sign-up with no limit is an invitation: unlimited password guesses against a known address,
 * and unlimited account creation from one machine. This is deliberately modest — a fixed window
 * counted in SQLite, not a token bucket in Redis — because the app runs as a single process
 * against a single file, and anything cleverer would be infrastructure this project doesn't have.
 *
 * What it is NOT: a defence against a distributed attack. It raises the cost of the attacks that
 * actually happen to a prototype, and nothing more. Said plainly so nobody mistakes it for armour.
 *
 * Deliberately knows nothing about HTTP. Turning a request into a subject lives in
 * server/request-identity.ts, which keeps this file testable without a server around it.
 */

export interface Limit {
  /** Attempts allowed inside the window. */
  max: number;
  windowMs: number;
}

export const LIMITS = {
  /** Password guesses against one address. Generous enough for a person who genuinely forgot. */
  signInByEmail: { max: 8, windowMs: 15 * 60 * 1000 },
  /** Total sign-in attempts from one machine, across any number of addresses. */
  signInByIp: { max: 25, windowMs: 15 * 60 * 1000 },
  /** Account creation from one machine. */
  signUpByIp: { max: 5, windowMs: 60 * 60 * 1000 },
  /** The interest form, which is unauthenticated and therefore the easiest thing to spam. */
  interestByIp: { max: 10, windowMs: 60 * 60 * 1000 },
  /** Reset requests cause email to be sent, so one machine can't use us as a spam cannon. */
  resetByIp: { max: 10, windowMs: 60 * 60 * 1000 },
  /** And one address can't be flooded with reset mail it never asked for. */
  resetByEmail: { max: 3, windowMs: 60 * 60 * 1000 },
  /** Registering interest is consequential (it grants a company visibility), so no spraying. */
  roleInterestByIp: { max: 30, windowMs: 60 * 60 * 1000 },
  /** The help assistant costs money per message; generous for a stuck human, dull for a script. */
  assistantByIp: { max: 20, windowMs: 15 * 60 * 1000 },
} as const satisfies Record<string, Limit>;

export type LimitName = keyof typeof LIMITS;

export interface RateResult {
  allowed: boolean;
  /** Whole seconds until the oldest attempt in the window expires. */
  retryAfterSeconds: number;
}

/**
 * Count an attempt and say whether it may proceed.
 *
 * Counts first, then decides, so a caller who keeps hammering keeps extending nothing — the window
 * is fixed to the oldest attempt, not to the newest.
 */
export function rateLimit(name: LimitName, subject: string): RateResult {
  const limit = LIMITS[name];
  const now = Date.now();
  const cutoff = new Date(now - limit.windowMs).toISOString();

  // Prune this bucket as we go, so the table stays small without a scheduled job.
  run("DELETE FROM rate_attempt WHERE bucket = ? AND created_at < ?", name, cutoff);

  const key = subject.trim().toLowerCase() || "unknown";
  const rows = all<{ created_at: string }>(
    "SELECT created_at FROM rate_attempt WHERE bucket = ? AND subject = ? ORDER BY created_at",
    name,
    key
  );

  if (rows.length >= limit.max) {
    const oldest = new Date(rows[0].created_at).getTime();
    const retryAfterSeconds = Math.max(1, Math.ceil((oldest + limit.windowMs - now) / 1000));
    return { allowed: false, retryAfterSeconds };
  }

  run(
    "INSERT INTO rate_attempt (id, bucket, subject, created_at) VALUES (?,?,?,?)",
    `ra-${randomUUID()}`,
    name,
    key,
    new Date(now).toISOString()
  );

  return { allowed: true, retryAfterSeconds: 0 };
}

/** Forget a subject's attempts — called after a success, so one good login clears the slate. */
export function clearRateLimit(name: LimitName, subject: string): void {
  run(
    "DELETE FROM rate_attempt WHERE bucket = ? AND subject = ?",
    name,
    subject.trim().toLowerCase() || "unknown"
  );
}

/** Human phrasing for a lockout, kept warm rather than punitive. */
export function retryMessage(seconds: number): string {
  if (seconds <= 90) return "Try again in a minute.";
  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) return `Try again in about ${minutes} minutes.`;
  return "Try again in about an hour.";
}

/** Whether a subject currently has attempts left, without recording one. */
export function peekRateLimit(name: LimitName, subject: string): boolean {
  const limit = LIMITS[name];
  const cutoff = new Date(Date.now() - limit.windowMs).toISOString();
  const row = get<{ n: number }>(
    "SELECT COUNT(*) AS n FROM rate_attempt WHERE bucket = ? AND subject = ? AND created_at >= ?",
    name,
    subject.trim().toLowerCase() || "unknown",
    cutoff
  );
  return (row?.n ?? 0) < limit.max;
}
