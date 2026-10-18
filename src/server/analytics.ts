import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { all, get, run } from "./db";
import { EVENTS, type EventName } from "@/lib/events";
import { maybePrune } from "./retention";
import { logError } from "./log";

export { EVENTS };
export type { EventName };

/**
 * First-party funnel measurement.
 *
 * Hopkins keyed every coupon so he could trace a sale back to the advertisement that made it.
 * This is that, for a product that cannot ethically use anyone else's tracker: the site's whole
 * promise to a candidate is "hidden until you say otherwise", and loading a third-party analytics
 * script would mean the page making that promise was simultaneously telling an ad network who
 * was reading it.
 *
 * So: events are written to this database and leave it only when someone reads the funnel page.
 * The visitor id is random, stored in a first-party cookie, and is the only identifier recorded —
 * no IP, no user agent, no fingerprint. It can tell you "one person did these four things in
 * order", which is what a funnel needs, and it cannot tell you who they were.
 */

const VISITOR_COOKIE = "dj_v";
const VISITOR_MAX_AGE = 60 * 60 * 24 * 180; // 180 days

/**
 * The visitor id for this request, minting one if there isn't one.
 *
 * Returns null when called from a context that can't set cookies (a Server Component render).
 * Callers treat that as "don't record" rather than inventing an id per request, because a funnel
 * built from ids that change every page view would show a hundred visitors who each did one step.
 */
async function visitorId(): Promise<string | null> {
  const jar = await cookies();
  const existing = jar.get(VISITOR_COOKIE)?.value;
  if (existing) return existing;

  const minted = randomUUID();
  try {
    jar.set(VISITOR_COOKIE, minted, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: VISITOR_MAX_AGE,
      path: "/",
    });
  } catch {
    // Server Components can read cookies but not set them. Nothing to record against.
    return null;
  }
  return minted;
}

/**
 * Record one event. Never throws: measurement failing must not take a page down with it.
 */
export async function track(
  name: EventName,
  options: { path?: string; props?: Record<string, unknown> } = {}
): Promise<void> {
  try {
    const visitor = await visitorId();
    if (!visitor) return;

    // Housekeeping rides along with the thing that happens most often, so retention is enforced
    // by the running application rather than by remembering to run a job.
    maybePrune();

    run(
      "INSERT INTO event (id, name, visitor, path, props, created_at) VALUES (?,?,?,?,?,?)",
      `ev-${randomUUID()}`,
      name,
      visitor,
      options.path ?? null,
      options.props ? JSON.stringify(options.props) : null,
      new Date().toISOString()
    );
  } catch (error) {
    // Still deliberately non-fatal — measurement must never take a page down — but no longer
    // silent, which is how a broken funnel would have gone unnoticed for weeks (audit S3).
    logError("analytics.track", error, { event: name });
  }
}

export interface FunnelStep {
  label: string;
  event: EventName;
  /** Distinct visitors who reached this step. */
  visitors: number;
  /** Percentage of the step above, so the biggest drop-off is obvious at a glance. */
  retainedPct: number | null;
}

/** Distinct visitors per event, counted once each however many times they fired it. */
function distinctVisitors(since: string): Map<string, number> {
  const rows = all<{ name: string; n: number }>(
    "SELECT name, COUNT(DISTINCT visitor) AS n FROM event WHERE created_at >= ? GROUP BY name",
    since
  );
  return new Map(rows.map((r) => [r.name, r.n]));
}

const CANDIDATE_FUNNEL: { label: string; event: EventName }[] = [
  { label: "Landed on the homepage", event: EVENTS.landingView },
  { label: "Opened onboarding", event: EVENTS.onboardingStart },
  { label: "Added a piece of work", event: EVENTS.onboardingProject },
  { label: "Finished, profile created", event: EVENTS.onboardingComplete },
];

const EMPLOYER_FUNNEL: { label: string; event: EventName }[] = [
  { label: "Landed on the homepage", event: EVENTS.landingView },
  { label: "Opened company setup", event: EVENTS.employerSetupStart },
  { label: "Published a role", event: EVENTS.employerSetupComplete },
];

function buildFunnel(
  steps: { label: string; event: EventName }[],
  counts: Map<string, number>
): FunnelStep[] {
  return steps.map((step, i) => {
    const visitors = counts.get(step.event) ?? 0;
    const previous = i === 0 ? null : counts.get(steps[i - 1].event) ?? 0;
    return {
      ...step,
      visitors,
      retainedPct: previous === null ? null : previous === 0 ? 0 : Math.round((visitors / previous) * 100),
    };
  });
}

export interface FunnelReport {
  since: string;
  days: number;
  candidate: FunnelStep[];
  employer: FunnelStep[];
  /** Where candidates actually quit, by onboarding step index. */
  stepDropOff: { step: number; label: string; visitors: number }[];
  interest: { total: number; recent: { email: string; side: string; createdAt: string }[] };
  totalEvents: number;
}

export function funnelReport(days = 30): FunnelReport {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const counts = distinctVisitors(since);

  const stepRows = all<{ step: number; label: string; n: number }>(
    `SELECT CAST(json_extract(props, '$.step') AS INTEGER) AS step,
            json_extract(props, '$.label') AS label,
            COUNT(DISTINCT visitor) AS n
       FROM event
      WHERE name = ? AND created_at >= ? AND json_extract(props, '$.step') IS NOT NULL
      GROUP BY step, label
      ORDER BY step`,
    EVENTS.onboardingStep,
    since
  );

  const interestTotal =
    get<{ n: number }>("SELECT COUNT(*) AS n FROM interest WHERE created_at >= ?", since)?.n ?? 0;

  const recentInterest = all<{ email: string; side: string; created_at: string }>(
    "SELECT email, side, created_at FROM interest ORDER BY created_at DESC LIMIT 25"
  );

  const totalEvents =
    get<{ n: number }>("SELECT COUNT(*) AS n FROM event WHERE created_at >= ?", since)?.n ?? 0;

  return {
    since,
    days,
    candidate: buildFunnel(CANDIDATE_FUNNEL, counts),
    employer: buildFunnel(EMPLOYER_FUNNEL, counts),
    stepDropOff: stepRows
      // Events from retired flows (the eight-step onboarding) would otherwise haunt this list
      // forever; the report speaks only the current flow's language.
      .filter((r) => ["gap", "work", "proof", "you", "claim"].includes(r.label ?? ""))
      .map((r) => ({ step: r.step, label: r.label ?? `Step ${r.step}`, visitors: r.n })),
    interest: {
      total: interestTotal,
      recent: recentInterest.map((r) => ({ email: r.email, side: r.side, createdAt: r.created_at })),
    },
    totalEvents,
  };
}
