"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { all, get, run, transaction } from "../db";
import { getCurrentAccount, requireCandidate, requireEmployer } from "../auth";
import { isCandidateVisibleTo } from "../repositories/discovery";
import { getCompanyById } from "../repositories/companies";
import type { PipelineStage } from "@/types";

/**
 * Every write in the hiring loop.
 *
 * Each one re-derives who is acting from the session rather than trusting an id from the client,
 * and checks ownership before touching a row. Previously all of this ran in the browser against
 * localStorage, which meant any visitor could have moved any employer's pipeline or answered
 * someone else's invite.
 */

// --- Pipeline --------------------------------------------------------------

export async function addToPipeline(candidateId: string, roleId?: string) {
  const { companyId } = await requireEmployer();
  const company = getCompanyById(companyId);
  if (!company) throw new Error("Unknown company.");

  // You cannot put someone on your board who has hidden from you.
  if (!isCandidateVisibleTo(candidateId, company.name)) {
    throw new Error("That profile is not available to you.");
  }

  const existing = get<{ candidate_id: string }>(
    "SELECT candidate_id FROM pipeline_entry WHERE company_id = ? AND candidate_id = ?",
    companyId,
    candidateId
  );
  if (existing) return;

  const next =
    (get<{ n: number }>(
      "SELECT COALESCE(MAX(position), -1) + 1 AS n FROM pipeline_entry WHERE company_id = ? AND stage = 'reviewing'",
      companyId
    )?.n ?? 0);

  run(
    `INSERT INTO pipeline_entry (company_id, candidate_id, role_id, stage, position, updated_at)
     VALUES (?,?,?,'reviewing',?,?)`,
    companyId,
    candidateId,
    roleId ?? null,
    next,
    new Date().toISOString()
  );
  revalidatePath("/employer/pipeline");
}

/** Move within/between stages, renumbering both columns so positions never go sparse. */
export async function movePipelineEntry(
  candidateId: string,
  stage: PipelineStage,
  index: number
) {
  const { companyId } = await requireEmployer();
  const now = new Date().toISOString();

  transaction(() => {
    const current = get<{ stage: string; role_id: string | null }>(
      "SELECT stage, role_id FROM pipeline_entry WHERE company_id = ? AND candidate_id = ?",
      companyId,
      candidateId
    );

    run(
      `INSERT INTO pipeline_entry (company_id, candidate_id, role_id, stage, position, updated_at)
       VALUES (?,?,?,?,?,?)
       ON CONFLICT(company_id, candidate_id)
       DO UPDATE SET stage = excluded.stage, position = excluded.position, updated_at = excluded.updated_at`,
      companyId,
      candidateId,
      current?.role_id ?? null,
      stage,
      -1, // placeholder; renumbered below
      now
    );

    const column = all<{ candidate_id: string }>(
      `SELECT candidate_id FROM pipeline_entry
        WHERE company_id = ? AND stage = ? AND candidate_id <> ?
        ORDER BY position`,
      companyId,
      stage,
      candidateId
    ).map((r) => r.candidate_id);

    const clamped = Math.max(0, Math.min(index, column.length));
    column.splice(clamped, 0, candidateId);
    column.forEach((id, i) =>
      run(
        "UPDATE pipeline_entry SET position = ? WHERE company_id = ? AND candidate_id = ?",
        i,
        companyId,
        id
      )
    );

    if (current && current.stage !== stage) {
      const source = all<{ candidate_id: string }>(
        "SELECT candidate_id FROM pipeline_entry WHERE company_id = ? AND stage = ? ORDER BY position",
        companyId,
        current.stage
      ).map((r) => r.candidate_id);
      source.forEach((id, i) =>
        run(
          "UPDATE pipeline_entry SET position = ? WHERE company_id = ? AND candidate_id = ?",
          i,
          companyId,
          id
        )
      );
    }
  });

  revalidatePath("/employer/pipeline");
}

export async function removeFromPipeline(candidateId: string) {
  const { companyId } = await requireEmployer();
  run(
    "DELETE FROM pipeline_entry WHERE company_id = ? AND candidate_id = ?",
    companyId,
    candidateId
  );
  revalidatePath("/employer/pipeline");
}

// --- Saved candidates ------------------------------------------------------

export async function toggleSavedCandidate(candidateId: string): Promise<boolean> {
  const { companyId } = await requireEmployer();
  const existing = get<{ candidate_id: string }>(
    "SELECT candidate_id FROM saved_candidate WHERE company_id = ? AND candidate_id = ?",
    companyId,
    candidateId
  );

  if (existing) {
    run(
      "DELETE FROM saved_candidate WHERE company_id = ? AND candidate_id = ?",
      companyId,
      candidateId
    );
    revalidatePath("/employer/saved");
    return false;
  }

  run(
    "INSERT INTO saved_candidate (company_id, candidate_id, saved_at) VALUES (?,?,?)",
    companyId,
    candidateId,
    new Date().toISOString()
  );
  revalidatePath("/employer/saved");
  return true;
}

/** Record a search so it can be returned to. Silently ignores duplicates and signed-out use. */
export async function recordSearch(query: string): Promise<void> {
  const q = query.trim().slice(0, 500);
  if (!q) return;

  const account = await getCurrentAccount();
  if (!account?.companyId) return;

  const existing = get<{ id: string }>(
    "SELECT id FROM saved_search WHERE company_id = ? AND LOWER(query) = LOWER(?)",
    account.companyId,
    q
  );
  if (existing) return;

  run(
    "INSERT INTO saved_search (id, company_id, query, created_at) VALUES (?,?,?,?)",
    randomUUID(),
    account.companyId,
    q,
    new Date().toISOString()
  );
  revalidatePath("/employer/searches");
}

export async function deleteSearch(id: string): Promise<void> {
  const { companyId } = await requireEmployer();
  run("DELETE FROM saved_search WHERE id = ? AND company_id = ?", id, companyId);
  revalidatePath("/employer/searches");
}

// --- Invites ---------------------------------------------------------------

export async function sendInvite(input: {
  candidateId: string;
  roleTitle: string;
  message: string;
  compensationRange?: string;
  roleId?: string;
}) {
  const { companyId } = await requireEmployer();
  const company = getCompanyById(companyId);
  if (!company) throw new Error("Unknown company.");

  if (!isCandidateVisibleTo(input.candidateId, company.name)) {
    throw new Error("That profile is not available to you.");
  }

  const now = new Date().toISOString();
  transaction(() => {
    run(
      `INSERT INTO invite (id, candidate_id, company_id, role_id, role_title, message,
                           compensation_range, status, created_at)
       VALUES (?,?,?,?,?,?,?,'sent',?)`,
      randomUUID(),
      input.candidateId,
      companyId,
      input.roleId ?? null,
      input.roleTitle,
      input.message,
      input.compensationRange ?? null,
      now
    );

    // Reaching out is a pipeline stage. Recording it in one place and not the other is how the
    // board drifts away from what actually happened.
    run(
      `INSERT INTO pipeline_entry (company_id, candidate_id, role_id, stage, position, updated_at)
       VALUES (?,?,?,'reached-out',0,?)
       ON CONFLICT(company_id, candidate_id)
       DO UPDATE SET stage = 'reached-out', updated_at = excluded.updated_at`,
      companyId,
      input.candidateId,
      input.roleId ?? null,
      now
    );
  });

  revalidatePath("/employer/responses");
  revalidatePath("/employer/pipeline");
}

/** Mark an invite seen. Only the invite's own recipient can do this. */
export async function markInviteViewed(inviteId: string) {
  const { candidateId } = await requireCandidate();
  run(
    "UPDATE invite SET status = 'viewed' WHERE id = ? AND candidate_id = ? AND status = 'sent'",
    inviteId,
    candidateId
  );
  revalidatePath("/talent/opportunities");
}

export async function respondToInvite(
  inviteId: string,
  decision: "accepted" | "declined",
  reply?: string
) {
  const { candidateId } = await requireCandidate();

  const invite = get<{ company_id: string }>(
    "SELECT company_id FROM invite WHERE id = ? AND candidate_id = ?",
    inviteId,
    candidateId
  );
  if (!invite) throw new Error("Invite not found.");

  const now = new Date().toISOString();
  transaction(() => {
    run(
      "UPDATE invite SET status = ?, responded_at = ? WHERE id = ?",
      decision,
      now,
      inviteId
    );
    if (reply?.trim()) {
      run(
        "INSERT INTO invite_message (id, invite_id, sender, body, created_at) VALUES (?,?,?,?,?)",
        randomUUID(),
        inviteId,
        "candidate",
        reply.trim(),
        now
      );
    }
    // Accepting means you're in conversation; declining takes you off their board entirely.
    if (decision === "accepted") {
      run(
        `UPDATE pipeline_entry SET stage = 'talking', updated_at = ?
          WHERE company_id = ? AND candidate_id = ?`,
        now,
        invite.company_id,
        candidateId
      );
    } else {
      run(
        "DELETE FROM pipeline_entry WHERE company_id = ? AND candidate_id = ?",
        invite.company_id,
        candidateId
      );
    }
  });

  revalidatePath("/talent/opportunities");
  revalidatePath("/employer/responses");
  revalidatePath("/employer/pipeline");
}

/** Append to a thread. Either side may post, but only on their own conversation. */
export async function sendInviteMessage(inviteId: string, body: string) {
  if (!body.trim()) return;

  const account = await requireAccountForInvite(inviteId);
  run(
    "INSERT INTO invite_message (id, invite_id, sender, body, created_at) VALUES (?,?,?,?,?)",
    randomUUID(),
    inviteId,
    account.sender,
    body.trim(),
    new Date().toISOString()
  );
  revalidatePath("/talent/opportunities");
  revalidatePath("/employer/responses");
}

/**
 * Resolve which side of a conversation the caller is on, rejecting anyone who is on neither.
 * Without this a signed-in user could post into a stranger's thread by guessing an id.
 */
async function requireAccountForInvite(inviteId: string): Promise<{ sender: "employer" | "candidate" }> {
  const { getCurrentAccount } = await import("../auth");
  const account = await getCurrentAccount();
  if (!account) throw new Error("Not signed in.");

  const invite = get<{ candidate_id: string; company_id: string }>(
    "SELECT candidate_id, company_id FROM invite WHERE id = ?",
    inviteId
  );
  if (!invite) throw new Error("Invite not found.");

  if (account.role === "talent" && account.candidateId === invite.candidate_id) {
    return { sender: "candidate" };
  }
  if (account.role === "employer" && account.companyId === invite.company_id) {
    return { sender: "employer" };
  }
  throw new Error("You are not part of this conversation.");
}
