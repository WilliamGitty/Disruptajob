import { all } from "../db";
import type { Invite, InviteMessage, InviteStatus } from "@/types";

/**
 * Conversations.
 *
 * Always scoped by owner — there is no "list all invites" export, because the only legitimate
 * reads are "mine as a candidate" and "mine as a company". Making the unscoped version absent
 * rather than merely discouraged keeps a future call site from leaking someone's inbox.
 */

interface InviteRow {
  id: string;
  candidate_id: string;
  company_id: string;
  company_name: string;
  role_id: string | null;
  role_title: string;
  message: string;
  compensation_range: string | null;
  status: string;
  responded_at: string | null;
  created_at: string;
}

const SELECT_INVITE = `
  SELECT i.id, i.candidate_id, i.company_id, co.name AS company_name, i.role_id,
         i.role_title, i.message, i.compensation_range, i.status, i.responded_at, i.created_at
    FROM invite i
    JOIN company co ON co.id = i.company_id`;

function messagesFor(inviteId: string): InviteMessage[] {
  return all<{ id: string; sender: string; body: string; created_at: string }>(
    "SELECT id, sender, body, created_at FROM invite_message WHERE invite_id = ? ORDER BY created_at",
    inviteId
  ).map((m) => ({
    id: m.id,
    from: m.sender as "employer" | "candidate",
    body: m.body,
    createdAt: m.created_at,
  }));
}

/** Domain `Invite` carries the company's display name; the row also gives us its id. */
export interface InviteWithCompany extends Invite {
  companyId: string;
  roleId?: string;
}

function hydrate(row: InviteRow): InviteWithCompany {
  return {
    id: row.id,
    candidateId: row.candidate_id,
    employerId: row.company_id,
    companyId: row.company_id,
    roleId: row.role_id ?? undefined,
    roleTitle: row.role_title,
    companyName: row.company_name,
    message: row.message,
    compensationRange: row.compensation_range ?? undefined,
    status: row.status as InviteStatus,
    respondedAt: row.responded_at ?? undefined,
    createdAt: row.created_at,
    messages: messagesFor(row.id),
  };
}

export function listInvitesForCandidate(candidateId: string): InviteWithCompany[] {
  return all<InviteRow>(
    `${SELECT_INVITE} WHERE i.candidate_id = ? ORDER BY i.created_at DESC`,
    candidateId
  ).map(hydrate);
}

export function listInvitesForCompany(companyId: string): InviteWithCompany[] {
  return all<InviteRow>(
    `${SELECT_INVITE} WHERE i.company_id = ? ORDER BY i.created_at DESC`,
    companyId
  ).map(hydrate);
}
