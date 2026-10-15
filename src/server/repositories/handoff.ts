import { get } from "../db";
import type { FollowupChannel } from "@/lib/followup";
import { isFollowupChannel } from "@/lib/followup";

/**
 * Contact details, released only once a candidate has accepted.
 *
 * This is the single place in the application that can return a candidate's email address to
 * anyone other than themselves, and it is deliberately one short file so that stays easy to
 * verify. The release condition is in the SQL, not in a caller: the query joins the invite and
 * will not return a row unless that invite is both the asking company's and accepted.
 *
 * Reaching out does not earn you someone's address. Them saying yes does.
 */

export interface Handoff {
  channel: FollowupChannel;
  detail?: string;
  candidateName: string;
  /** Present only when the candidate has accepted. */
  email?: string;
  profileUrl: string;
}

export function handoffForInvite(inviteId: string, companyId: string): Handoff | undefined {
  const row = get<{
    status: string;
    followup_channel: string | null;
    followup_detail: string | null;
    name: string;
    slug: string;
    email: string | null;
  }>(
    `SELECT i.status,
            i.followup_channel,
            i.followup_detail,
            c.name  AS name,
            c.slug  AS slug,
            -- Released by the join condition, not by the caller: no acceptance, no address.
            CASE WHEN i.status = 'accepted' THEN a.email ELSE NULL END AS email
       FROM invite i
       JOIN candidate c ON c.id = i.candidate_id
       LEFT JOIN account a ON a.candidate_id = c.id
      WHERE i.id = ? AND i.company_id = ?`,
    inviteId,
    companyId
  );

  if (!row) return undefined;

  return {
    channel: isFollowupChannel(row.followup_channel) ? row.followup_channel : "here",
    detail: row.followup_detail ?? undefined,
    candidateName: row.name,
    email: row.email ?? undefined,
    profileUrl: `/profile/${row.slug}`,
  };
}
