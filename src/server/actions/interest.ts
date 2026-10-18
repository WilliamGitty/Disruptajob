"use server";

import { revalidatePath } from "next/cache";
import { get, run } from "../db";
import { requireCandidate } from "../auth";
import { rateLimit } from "../rate-limit";
import { callerKey } from "../request-identity";

/**
 * Registering and withdrawing interest in a role.
 *
 * This is the consequential kind of click: a standing interest lets the role's company see
 * this candidate (repositories/discovery.ts), so the UI says that before the click and this
 * file keeps the write honest. There is still no application here: no message is sent, no
 * document attached, nothing lands in anyone's inbox. The company sees the marker when it
 * searches; the work still does the talking.
 */

export type InterestResult = { ok: boolean; error?: string };

export async function registerRoleInterest(roleId: string): Promise<InterestResult> {
  const { candidateId } = await requireCandidate();

  const limited = rateLimit("roleInterestByIp", await callerKey());
  if (!limited.allowed) {
    return { ok: false, error: "That's a lot of interest at once. Give it a little while." };
  }

  const role = get<{ id: string; company_id: string }>(
    "SELECT id, company_id FROM role WHERE id = ? AND status = 'open'",
    roleId
  );
  if (!role) return { ok: false, error: "That role is no longer open." };

  // Belt and braces: the mirror never shows blocked companies, but a crafted request must not
  // let interest be registered at one either, or the grant would fight the blocklist.
  const blocked = get<{ n: number }>(
    `SELECT COUNT(*) AS n FROM blocked_company b
       JOIN company co ON co.id = ?
      WHERE b.candidate_id = ? AND LOWER(co.name) LIKE '%' || LOWER(b.company_name) || '%'`,
    role.company_id,
    candidateId
  );
  if ((blocked?.n ?? 0) > 0) {
    return { ok: false, error: "You've blocked this company, so interest can't be registered." };
  }

  run(
    "INSERT OR IGNORE INTO role_interest (candidate_id, role_id, created_at) VALUES (?,?,?)",
    candidateId,
    roleId,
    new Date().toISOString()
  );
  revalidatePath("/talent/matches");
  return { ok: true };
}

export async function withdrawRoleInterest(roleId: string): Promise<InterestResult> {
  const { candidateId } = await requireCandidate();
  run("DELETE FROM role_interest WHERE candidate_id = ? AND role_id = ?", candidateId, roleId);
  revalidatePath("/talent/matches");
  return { ok: true };
}
