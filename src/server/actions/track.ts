"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { get, run } from "../db";
import { track } from "../analytics";
import { EVENTS, type EventName } from "@/lib/events";

/**
 * The client half of measurement.
 *
 * Client components can't call `track` directly — it reads and sets cookies, which only a server
 * action or route handler can do. Only the names in EVENTS are accepted: an action that took an
 * arbitrary string would let anything on the page write rows into the events table.
 */

const ALLOWED = new Set<string>(Object.values(EVENTS));

export async function trackEvent(
  name: string,
  props?: Record<string, unknown>
): Promise<void> {
  if (!ALLOWED.has(name)) return;
  await track(name as EventName, { props });
}

const MAX_EMAIL = 160;
const MAX_NOTE = 400;

export type InterestResult = { ok: true } | { ok: false; error: string };

/**
 * "Tell me when companies are searching."
 *
 * The only thing on the site for someone who understood the pitch but hasn't got ten minutes
 * today. Re-submitting the same address succeeds rather than reporting "already registered":
 * telling a stranger which emails are on a list is a disclosure, and being scolded for signing up
 * twice is a poor welcome.
 */
export async function registerInterest(formData: FormData): Promise<InterestResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase().slice(0, MAX_EMAIL);
  const sideRaw = String(formData.get("side") ?? "talent");
  const side = sideRaw === "employer" ? "employer" : "talent";
  const note = String(formData.get("note") ?? "").trim().slice(0, MAX_NOTE);

  if (!email.includes("@") || email.length < 5) {
    return { ok: false, error: "That doesn't look like an email address." };
  }

  const existing = get<{ id: string }>("SELECT id FROM interest WHERE email = ?", email);
  if (!existing) {
    run(
      "INSERT INTO interest (id, email, side, note, created_at) VALUES (?,?,?,?,?)",
      `int-${randomUUID()}`,
      email,
      side,
      note || null,
      new Date().toISOString()
    );
    await track(EVENTS.interestCaptured, { props: { side } });
  }

  revalidatePath("/");
  return { ok: true };
}
