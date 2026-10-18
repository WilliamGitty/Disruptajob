"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isSafeHttpUrl } from "@/lib/project-input";
import { run, transaction } from "../db";
import { requireCandidate } from "../auth";
import type { Discoverability, WorkArrangement } from "@/types";

/**
 * Editing your own profile.
 *
 * The visibility controls matter most here: before this existed, `discoverability` and the
 * company blocklist could only be set during onboarding and never changed again — so the one
 * promise that persuades a nervous candidate to upload their work was a single irreversible
 * decision. Changing your mind is the whole point of consent.
 */

const DISCOVERABILITY: Discoverability[] = ["hidden", "selectively-open", "open"];
const ARRANGEMENTS: WorkArrangement[] = ["remote", "hybrid", "onsite"];

function clean(value: FormDataEntryValue | null, max: number): string {
  return String(value ?? "").trim().slice(0, max);
}

/** Split a textarea of one-per-line entries into a clean list. */
function lines(value: FormDataEntryValue | null, max: number): string[] {
  return String(value ?? "")
    .split("\n")
    .map((l) => l.trim().slice(0, 120))
    .filter(Boolean)
    .slice(0, max);
}

export async function updateVisibility(formData: FormData) {
  const { candidateId } = await requireCandidate();

  const requested = String(formData.get("discoverability") ?? "");
  // Anything unrecognised falls back to hidden rather than to open — a malformed request must
  // never be the thing that exposes someone.
  const discoverability: Discoverability = DISCOVERABILITY.includes(requested as Discoverability)
    ? (requested as Discoverability)
    : "hidden";

  const blocked = lines(formData.get("blockedCompanies"), 50);

  transaction(() => {
    run("UPDATE candidate SET discoverability = ? WHERE id = ?", discoverability, candidateId);
    run("DELETE FROM blocked_company WHERE candidate_id = ?", candidateId);
    for (const name of new Set(blocked)) {
      run(
        "INSERT OR IGNORE INTO blocked_company (candidate_id, company_name) VALUES (?,?)",
        candidateId,
        name
      );
    }
  });

  revalidatePath("/talent/settings");
  revalidatePath("/profile/[slug]", "page");
  redirect("/talent/settings?saved=visibility");
}

export async function updateTerms(formData: FormData) {
  const { candidateId } = await requireCandidate();

  const compFloor = clean(formData.get("compFloor"), 60);
  const locationConstraint = clean(formData.get("locationConstraint"), 120);
  const roleTypes = lines(formData.get("roleTypes"), 20);
  const dealbreakers = lines(formData.get("dealbreakers"), 20);
  const arrangements = ARRANGEMENTS.filter((a) => formData.get(`arrangement-${a}`) === "on");

  transaction(() => {
    run(
      "UPDATE candidate SET comp_floor = ?, location_constraint = ? WHERE id = ?",
      compFloor || null,
      locationConstraint || null,
      candidateId
    );

    run("DELETE FROM candidate_role_type WHERE candidate_id = ?", candidateId);
    for (const r of new Set(roleTypes)) {
      run("INSERT OR IGNORE INTO candidate_role_type (candidate_id, role_type) VALUES (?,?)", candidateId, r);
    }

    run("DELETE FROM candidate_arrangement WHERE candidate_id = ?", candidateId);
    for (const a of arrangements) {
      run("INSERT OR IGNORE INTO candidate_arrangement (candidate_id, arrangement) VALUES (?,?)", candidateId, a);
    }

    run("DELETE FROM candidate_dealbreaker WHERE candidate_id = ?", candidateId);
    for (const d of new Set(dealbreakers)) {
      run("INSERT OR IGNORE INTO candidate_dealbreaker (candidate_id, dealbreaker) VALUES (?,?)", candidateId, d);
    }
  });

  revalidatePath("/talent/settings");
  redirect("/talent/settings?saved=terms");
}

export async function updateBasics(formData: FormData) {
  const { candidateId } = await requireCandidate();

  const name = clean(formData.get("name"), 80);
  const headline = clean(formData.get("headline"), 160);
  const shortDescription = clean(formData.get("shortDescription"), 400);
  const location = clean(formData.get("location"), 120);
  const availability = String(formData.get("availability") ?? "open");
  const linkedinRaw = clean(formData.get("linkedinUrl"), 200);
  const linkedinUrl = linkedinRaw && isSafeHttpUrl(linkedinRaw) ? linkedinRaw : null;

  run(
    `UPDATE candidate
        SET name = COALESCE(NULLIF(?, ''), name),
            headline = ?, short_description = ?, location = ?, availability = ?,
            linkedin_url = ?
      WHERE id = ?`,
    name,
    headline,
    shortDescription,
    location,
    ["open", "selectively-open", "not-looking"].includes(availability) ? availability : "open",
    linkedinUrl,
    candidateId
  );

  revalidatePath("/talent/settings");
  revalidatePath("/profile/[slug]", "page");
  redirect("/talent/settings?saved=basics");
}
