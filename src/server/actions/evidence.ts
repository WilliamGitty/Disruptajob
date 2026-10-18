"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { get, run, transaction } from "../db";
import { requireCandidate } from "../auth";
import { isSafeHttpUrl } from "@/lib/project-input";

/**
 * Writing evidence.
 *
 * This is the action the whole product rests on: tagging a project with capabilities is the only
 * thing that can move a capability score, because scores are computed from these rows. Nothing a
 * candidate types about themselves reaches a score — there is no column for it.
 *
 * Previously this wrote to localStorage, which meant a candidate's own work could never affect
 * what an employer saw.
 */

const MAX_TITLE = 120;
const MAX_SHORT = 400;
const MAX_LONG = 4000;

function clean(value: string, max: number): string {
  return value.trim().slice(0, max);
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

function uniqueProjectSlug(ownerId: string, base: string): string {
  const root = slugify(base);
  let slug = root;
  let n = 2;
  while (get<{ id: string }>("SELECT id FROM project WHERE owner_id = ? AND slug = ?", ownerId, slug)) {
    slug = `${root}-${n++}`;
  }
  return slug;
}

export interface AddProjectInput {
  title: string;
  description: string;
  whatIBuilt?: string;
  problem?: string;
  outcome?: string;
  repoUrl?: string;
  demoUrl?: string;
  tools?: string[];
  capabilities: string[];
}

export async function addProject(input: AddProjectInput): Promise<{ ok: boolean; error?: string }> {
  const { candidateId } = await requireCandidate();

  const title = clean(input.title, MAX_TITLE);
  const description = clean(input.description, MAX_SHORT);
  if (!title) return { ok: false, error: "Give the work a title." };
  if (!description) return { ok: false, error: "Say what it was, briefly." };
  // Untagged work would be invisible to matching, so it's a requirement rather than a nicety.
  if (input.capabilities.length === 0) {
    return { ok: false, error: "Tag at least one capability this work demonstrates." };
  }

  // Links are stored but never fetched; validate so nothing but http(s) is ever rendered.
  const repoUrl = input.repoUrl?.trim();
  const demoUrl = input.demoUrl?.trim();
  if (repoUrl && !isSafeHttpUrl(repoUrl)) return { ok: false, error: "Repo link must be a valid http(s) URL." };
  if (demoUrl && !isSafeHttpUrl(demoUrl)) return { ok: false, error: "Demo link must be a valid http(s) URL." };

  const id = `proj-${randomUUID()}`;
  const slug = uniqueProjectSlug(candidateId, title);
  const now = new Date().toISOString();

  transaction(() => {
    run(
      `INSERT INTO project (id, owner_id, slug, title, description, thumbnail_seed, outcome,
                            problem, what_i_built, my_contribution, demo_url, status, source, created_at)
       VALUES (?,?,?,?,?,?,?,?,?,'',?,'published','manual',?)`,
      id,
      candidateId,
      slug,
      title,
      description,
      slug,
      clean(input.outcome ?? "", MAX_SHORT),
      clean(input.problem ?? "", MAX_LONG),
      clean(input.whatIBuilt ?? "", MAX_LONG),
      demoUrl || null,
      now
    );

    for (const tag of new Set(input.capabilities)) {
      run("INSERT INTO project_capability (project_id, tag) VALUES (?,?)", id, tag);
    }
    for (const tool of new Set(input.tools ?? [])) {
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
  });

  revalidatePath("/profile/[slug]", "page");
  return { ok: true };
}

/** Remove your own work. Ownership is checked in the WHERE clause, not before it. */
export async function removeProject(projectId: string): Promise<void> {
  const { candidateId } = await requireCandidate();
  run("DELETE FROM project WHERE id = ? AND owner_id = ?", projectId, candidateId);
  revalidatePath("/profile/[slug]", "page");
}

export interface PublishDraftInput {
  projectId: string;
  description: string;
  whatIBuilt?: string;
  problem?: string;
  outcome?: string;
  /** The human's explicit ticks. AI suggestions that were never ticked never reach this array. */
  capabilities: string[];
}

/**
 * Turn a reviewed draft (typically a GitHub import) into published, scoring evidence.
 *
 * The gate every draft must pass: a human owner, editing the words, choosing at least one
 * capability by hand. This is the moment "AI drafts, humans claim" becomes enforceable — and
 * the owner check re-derives identity from the session, never from the payload.
 */
export async function publishDraftProject(
  input: PublishDraftInput
): Promise<{ ok: boolean; error?: string }> {
  const account = await requireCandidate();

  const row = get<{ id: string; status: string }>(
    "SELECT id, status FROM project WHERE id = ? AND owner_id = ?",
    input.projectId,
    account.candidateId
  );
  if (!row) return { ok: false, error: "That draft isn't yours or no longer exists." };
  if (row.status !== "draft") return { ok: false, error: "That project is already published." };

  const capabilities = [...new Set(input.capabilities)].filter(Boolean);
  if (capabilities.length === 0) {
    return { ok: false, error: "Tag at least one capability this work actually proves, that's what makes it evidence." };
  }
  const description = clean(input.description, MAX_SHORT);
  if (!description) {
    return { ok: false, error: "Say what this is in a sentence, imports shouldn't publish unexplained." };
  }

  transaction(() => {
    run(
      `UPDATE project SET description = ?, what_i_built = ?, problem = ?, outcome = ?, status = 'published'
        WHERE id = ?`,
      description,
      clean(input.whatIBuilt ?? "", MAX_LONG),
      clean(input.problem ?? "", MAX_LONG),
      clean(input.outcome ?? "", MAX_SHORT),
      row.id
    );
    for (const tag of capabilities) {
      run("INSERT OR IGNORE INTO project_capability (project_id, tag) VALUES (?,?)", row.id, tag);
    }
  });

  revalidatePath("/profile/[slug]", "page");
  return { ok: true };
}
