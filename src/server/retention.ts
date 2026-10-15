import { run } from "./db";

/**
 * How long things are kept.
 *
 * These constants are the privacy policy, in the only form that can't drift from the truth. If you
 * change one, change the policy page in the same commit — a retention promise the code doesn't
 * keep is worse than no promise at all.
 */

export const RETENTION = {
  /** Matches the session cookie's lifetime, so a token can't outlive the cookie that carried it. */
  sessionDays: 30,
  /** Funnel events. Long enough to compare one month to the last, short enough not to hoard. */
  eventDays: 365,
  /** Rate-limiting rows are useful for minutes; this is only a backstop for abandoned buckets. */
  rateAttemptDays: 1,
} as const;

function cutoff(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

/** Delete everything past its retention period. Safe to call repeatedly. */
export function pruneExpiredData(): void {
  run("DELETE FROM session WHERE created_at < ?", cutoff(RETENTION.sessionDays));
  run("DELETE FROM event WHERE created_at < ?", cutoff(RETENTION.eventDays));
  run("DELETE FROM rate_attempt WHERE created_at < ?", cutoff(RETENTION.rateAttemptDays));
}

const PRUNE_INTERVAL_MS = 60 * 60 * 1000;
let lastPrune = 0;

/**
 * Prune at most once an hour.
 *
 * Called from the event tracker, which runs on most page views, so a long-lived process keeps
 * tidying itself without a scheduler. Boot-time pruning alone would mean a server up for three
 * months never deletes anything.
 */
export function maybePrune(): void {
  const now = Date.now();
  if (now - lastPrune < PRUNE_INTERVAL_MS) return;
  lastPrune = now;
  try {
    pruneExpiredData();
  } catch {
    // Housekeeping must never take a page down.
  }
}

/** For tests: forget when we last pruned. */
export function resetPruneClock(): void {
  lastPrune = 0;
}
