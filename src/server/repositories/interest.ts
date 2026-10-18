import { all } from "../db";

/**
 * Reading registered interest, for the employer surfaces that may see it. Deliberately thin:
 * the full interested/contacted/shortlisted dashboard the founder sketched waits for the
 * employer rebuild after founder interviews. Today interest appears where employers already
 * look, as a marker, never as a pile.
 */

export interface RoleInterestRow {
  candidateId: string;
  roleId: string;
  roleTitle: string;
  createdAt: string;
}

/** All standing interest in a company's open roles. */
export function interestInCompany(companyId: string): RoleInterestRow[] {
  return all<{ candidate_id: string; role_id: string; title: string; created_at: string }>(
    `SELECT ri.candidate_id, ri.role_id, r.title, ri.created_at
       FROM role_interest ri
       JOIN role r ON r.id = ri.role_id AND r.status = 'open'
      WHERE r.company_id = ?
      ORDER BY ri.created_at DESC`,
    companyId
  ).map((r) => ({
    candidateId: r.candidate_id,
    roleId: r.role_id,
    roleTitle: r.title,
    createdAt: r.created_at,
  }));
}
