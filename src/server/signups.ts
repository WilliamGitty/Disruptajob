import { ADMIN_EMAILS } from "./config";
import { all } from "./db";

export interface RealSignup {
  name: string;
  createdAt: string;
  publishedProjects: number;
  discoverability: string;
  emailVerified: boolean;
}

/**
 * Ground truth for "did someone actually go through the whole thing": real candidate accounts,
 * read from the database rather than inferred from visitor events. The demo population is
 * excluded by its structural flag, and the admin's own accounts by the same ADMIN_EMAILS list
 * that guards this page, so the founder's test runs never flatter the numbers.
 */
export function realSignups(adminEmails: string[] = ADMIN_EMAILS): RealSignup[] {
  const placeholders = adminEmails.map(() => "?").join(",") || "''";
  return all<{
    name: string;
    created_at: string;
    published: number;
    discoverability: string;
    verified: number;
  }>(
    `SELECT c.name, a.created_at, c.discoverability,
            (SELECT COUNT(*) FROM project p WHERE p.owner_id = c.id AND p.status = 'published') AS published,
            (a.email_verified_at IS NOT NULL) AS verified
       FROM account a
       JOIN candidate c ON c.id = a.candidate_id
      WHERE c.demo = 0
        AND LOWER(a.email) NOT IN (${placeholders})
      ORDER BY a.created_at DESC`,
    ...adminEmails.map((e) => e.toLowerCase())
  ).map((r) => ({
    name: r.name,
    createdAt: r.created_at,
    publishedProjects: r.published,
    discoverability: r.discoverability,
    emailVerified: r.verified === 1,
  }));
}
