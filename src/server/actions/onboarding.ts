"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { get, run, transaction } from "../db";
import { getCurrentAccount, signUp } from "../auth";
import { isSafeHttpUrl } from "@/lib/project-input";
import type { Discoverability, NonNegotiables, WorkArrangement } from "@/types";

/**
 * Turning a finished onboarding draft into a real profile.
 *
 * Onboarding deliberately runs without an account: asking someone to sign up before they've seen
 * what the product does is the friction this whole company exists to remove. The cost is that
 * everything they enter lives in the browser until this action runs, so this is the single moment
 * the draft becomes real — and it has to be all-or-nothing. A half-written profile here would mean
 * a candidate with an account but no evidence, which is exactly the empty shell a CV already is.
 *
 * Hence one transaction covering profile, terms, visibility, blocklist and every project. If any
 * insert throws, the account exists but nothing else does, and the draft is still in the browser
 * for a retry.
 */

const DISCOVERABILITY: Discoverability[] = ["hidden", "selectively-open", "open"];
const ARRANGEMENTS: WorkArrangement[] = ["remote", "hybrid", "onsite"];
const AVAILABILITY = ["open", "selectively-open", "not-looking"];

const MAX_PROJECTS = 50;
const MAX_TITLE = 120;
const MAX_SHORT = 400;
const MAX_LONG = 4000;

function clean(value: string | undefined, max: number): string {
  return (value ?? "").trim().slice(0, max);
}

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "project"
  );
}

export interface OnboardingProjectInput {
  title: string;
  description: string;
  problem?: string;
  whatIBuilt?: string;
  outcome?: string;
  repoUrl?: string;
  demoUrl?: string;
  tools?: string[];
  capabilities: string[];
}

export interface CompleteOnboardingInput {
  name: string;
  email: string;
  /** Only read when there's no session — an existing user keeps the password they already have. */
  password?: string;
  location: string;
  currentTitle: string;
  availability: string;
  /** The candidate's own words about what their title hides. Becomes the profile summary. */
  titleGap: string;
  nonNegotiables: NonNegotiables;
  discoverability: Discoverability;
  blockedCompanies: string[];
  projects: OnboardingProjectInput[];
}

export type CompleteOnboardingResult =
  | { ok: true; slug: string }
  | { ok: false; error: string };

export async function completeCandidateOnboarding(
  input: CompleteOnboardingInput
): Promise<CompleteOnboardingResult> {
  const name = clean(input.name, 80);
  const email = clean(input.email, 160).toLowerCase();

  if (!name) return { ok: false, error: "We need a name to put on your profile." };
  if (!email.includes("@")) return { ok: false, error: "That doesn't look like an email address." };

  // Tagged work is the only thing that produces a capability score, so finishing without any
  // would create a profile that cannot be found — the precise failure this product exists to fix.
  const projects = input.projects.filter((p) => p.title.trim() && p.capabilities.length > 0);
  if (projects.length === 0) {
    return { ok: false, error: "Add at least one piece of work, tagged with what it proves." };
  }
  if (projects.length > MAX_PROJECTS) {
    return { ok: false, error: `That's more than ${MAX_PROJECTS} projects — add the rest from your profile.` };
  }

  for (const p of projects) {
    const repo = p.repoUrl?.trim();
    const demo = p.demoUrl?.trim();
    if (repo && !isSafeHttpUrl(repo)) return { ok: false, error: `“${p.title}” has a repo link that isn't a valid http(s) URL.` };
    if (demo && !isSafeHttpUrl(demo)) return { ok: false, error: `“${p.title}” has a demo link that isn't a valid http(s) URL.` };
  }

  // Either adopt the signed-in candidate or create the account now. Signing up also signs in.
  const existing = await getCurrentAccount();
  let candidateId: string;

  if (existing?.role === "talent" && existing.candidateId) {
    candidateId = existing.candidateId;
  } else if (existing) {
    // An employer finishing candidate onboarding would write a candidate profile they can't reach.
    return { ok: false, error: "You're signed in as a company. Sign out first to build a work profile." };
  } else {
    const created = await signUp({ email, password: input.password ?? "", name, role: "talent" });
    if (!created.ok) return { ok: false, error: created.error };

    const account = await getCurrentAccount();
    if (!account?.candidateId) return { ok: false, error: "Account created but the profile didn't attach. Try signing in." };
    candidateId = account.candidateId;
  }

  const row = get<{ slug: string }>("SELECT slug FROM candidate WHERE id = ?", candidateId);
  if (!row) return { ok: false, error: "That profile no longer exists." };

  const discoverability: Discoverability = DISCOVERABILITY.includes(input.discoverability)
    ? input.discoverability
    : "hidden";
  const availability = AVAILABILITY.includes(input.availability) ? input.availability : "open";
  const nn = input.nonNegotiables;
  const now = new Date().toISOString();

  // Slugs are unique per owner, so a resumed draft re-submitting the same titles can't collide.
  const taken = new Set(
    (
      get<{ slugs: string }>(
        "SELECT COALESCE(GROUP_CONCAT(slug, '\n'), '') AS slugs FROM project WHERE owner_id = ?",
        candidateId
      )?.slugs ?? ""
    )
      .split("\n")
      .filter(Boolean)
  );

  function uniqueSlug(title: string): string {
    const root = slugify(title);
    let slug = root;
    let n = 2;
    while (taken.has(slug)) slug = `${root}-${n++}`;
    taken.add(slug);
    return slug;
  }

  transaction(() => {
    run(
      `UPDATE candidate
          SET name = ?, headline = ?, short_description = ?, location = ?,
              availability = ?, discoverability = ?, comp_floor = ?, location_constraint = ?
        WHERE id = ?`,
      name,
      clean(input.currentTitle, 160),
      clean(input.titleGap, MAX_SHORT),
      clean(input.location, 120),
      availability,
      discoverability,
      clean(nn.compFloor, 60) || null,
      clean(nn.locationConstraint, 120) || null,
      candidateId
    );

    run("DELETE FROM blocked_company WHERE candidate_id = ?", candidateId);
    for (const company of new Set(input.blockedCompanies.map((c) => clean(c, 120)).filter(Boolean))) {
      run(
        "INSERT OR IGNORE INTO blocked_company (candidate_id, company_name) VALUES (?,?)",
        candidateId,
        company
      );
    }

    run("DELETE FROM candidate_arrangement WHERE candidate_id = ?", candidateId);
    for (const a of ARRANGEMENTS.filter((a) => nn.workArrangements.includes(a))) {
      run("INSERT OR IGNORE INTO candidate_arrangement (candidate_id, arrangement) VALUES (?,?)", candidateId, a);
    }

    run("DELETE FROM candidate_role_type WHERE candidate_id = ?", candidateId);
    for (const r of new Set((nn.roleTypes ?? []).map((r) => clean(r, 120)).filter(Boolean))) {
      run("INSERT OR IGNORE INTO candidate_role_type (candidate_id, role_type) VALUES (?,?)", candidateId, r);
    }

    run("DELETE FROM candidate_dealbreaker WHERE candidate_id = ?", candidateId);
    for (const d of new Set((nn.dealbreakers ?? []).map((d) => clean(d, 120)).filter(Boolean))) {
      run("INSERT OR IGNORE INTO candidate_dealbreaker (candidate_id, dealbreaker) VALUES (?,?)", candidateId, d);
    }

    for (const p of projects) {
      const id = `proj-${randomUUID()}`;
      const slug = uniqueSlug(p.title);
      const demoUrl = p.demoUrl?.trim();
      const repoUrl = p.repoUrl?.trim();

      run(
        `INSERT INTO project (id, owner_id, slug, title, description, thumbnail_seed, outcome,
                              problem, what_i_built, my_contribution, demo_url, status, source, created_at)
         VALUES (?,?,?,?,?,?,?,?,?,'',?,'published','manual',?)`,
        id,
        candidateId,
        slug,
        clean(p.title, MAX_TITLE),
        clean(p.description, MAX_SHORT),
        slug,
        clean(p.outcome, MAX_SHORT),
        clean(p.problem, MAX_LONG),
        clean(p.whatIBuilt, MAX_LONG),
        demoUrl || null,
        now
      );

      for (const tag of new Set(p.capabilities)) {
        run("INSERT OR IGNORE INTO project_capability (project_id, tag) VALUES (?,?)", id, tag);
      }
      for (const tool of new Set(p.tools ?? [])) {
        const t = clean(tool, 40);
        if (t) run("INSERT OR IGNORE INTO project_tool (project_id, tool) VALUES (?,?)", id, t);
      }
      if (repoUrl) {
        run(
          "INSERT INTO evidence (id, project_id, type, label, url, sort_order) VALUES (?,?,?,?,?,0)",
          `ev-${randomUUID()}`,
          id,
          "demo-link",
          "Repository",
          repoUrl
        );
      }
      if (demoUrl) {
        run(
          "INSERT INTO evidence (id, project_id, type, label, url, sort_order) VALUES (?,?,?,?,?,1)",
          `ev-${randomUUID()}`,
          id,
          "demo-link",
          "Live demo",
          demoUrl
        );
      }
    }
  });

  revalidatePath("/profile/[slug]", "page");
  revalidatePath("/talent");
  return { ok: true, slug: row.slug };
}
