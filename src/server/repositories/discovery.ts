import { all } from "../db";
import { listCandidatesByIds } from "./candidates";
import type { CandidateProfile } from "@/types";

/**
 * Who an employer is allowed to see, decided in the query.
 *
 * Previously this filtering lived in application code that every call site had to remember to
 * apply. One forgotten call and a candidate who hid from their employer shows up in that
 * employer's search — the single worst failure this product can have, because someone could lose
 * their job over it. Making it a WHERE clause means the default is safe and the unsafe version
 * has to be written deliberately.
 *
 * Company-name matching is intentionally fuzzy in the same way the UI promises: a candidate who
 * blocks "Meridian" is also hidden from "Meridian Robotics Ltd".
 */

/**
 * Normalised comparison for blocklists. Mirrors `normaliseCompany` in lib/visibility.ts — SQLite
 * has no regex, so the shared suffix stripping happens in JS and the result is passed in.
 */
function normalise(value: string): string {
  const tokens = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
  const noise = new Set([
    "ltd", "limited", "inc", "llc", "plc", "gmbh", "co", "corp", "sa", "bv",
    "com", "uk", "io", "ai", "net", "org", "dev", "app",
  ]);
  while (tokens.length > 1 && noise.has(tokens[tokens.length - 1])) tokens.pop();
  return tokens.join(" ");
}

/**
 * Candidate ids this company may see: discoverable, and not blocking them.
 *
 * The discoverability test is done in SQL. The blocklist test needs normalisation SQLite can't
 * express, so blocked names are fetched and compared in JS — still centralised here rather than
 * scattered across call sites.
 */
export function discoverableCandidateIds(viewingCompany: string): string[] {
  const rows = all<{ id: string; blocked: string | null }>(
    `SELECT c.id                             AS id,
            GROUP_CONCAT(b.company_name, '|') AS blocked
       FROM candidate c
       LEFT JOIN blocked_company b ON b.candidate_id = c.id
      WHERE c.discoverability <> 'hidden'
      GROUP BY c.id`
  );

  const target = normalise(viewingCompany);
  if (!target) return rows.map((r) => r.id);

  const blockedCheck = (blockedRaw: string | null): boolean => {
    const blocked = (blockedRaw ?? "").split("|").filter(Boolean).map(normalise);
    return blocked.some((b) => b === target || b.includes(target) || target.includes(b));
  };

  const visible = rows.filter((r) => !blockedCheck(r.blocked)).map((r) => r.id);

  // Registered interest is a scoped consent grant: it makes the candidate visible to the ONE
  // company whose open role they raised a hand for, hidden or not. Two deliberate asymmetries
  // with the blocklist: the grant matches company names STRICTLY (fuzzy matching may deny
  // access, never give it), and a blocklist entry beats a standing interest, because blocking
  // is the later, harder promise.
  const interested = all<{ candidate_id: string; company_name: string; blocked: string | null }>(
    `SELECT DISTINCT ri.candidate_id AS candidate_id, co.name AS company_name,
            (SELECT GROUP_CONCAT(b.company_name, '|') FROM blocked_company b
              WHERE b.candidate_id = ri.candidate_id) AS blocked
       FROM role_interest ri
       JOIN role r    ON r.id = ri.role_id AND r.status = 'open'
       JOIN company co ON co.id = r.company_id`
  )
    .filter((r) => normalise(r.company_name) === target && !blockedCheck(r.blocked))
    .map((r) => r.candidate_id);

  return [...new Set([...visible, ...interested])];
}

/** Full profiles this company may see, loaded in one batch rather than one query per person. */
export function listDiscoverableCandidates(viewingCompany: string): CandidateProfile[] {
  return listCandidatesByIds(discoverableCandidateIds(viewingCompany));
}

/** Whether one specific candidate is visible — used to gate profile pages by id, not by list. */
export function isCandidateVisibleTo(candidateId: string, viewingCompany: string): boolean {
  return discoverableCandidateIds(viewingCompany).includes(candidateId);
}

/** How many profiles were withheld — aggregate only, never who or why. */
export function withheldCount(viewingCompany: string): number {
  const total = all<{ n: number }>("SELECT COUNT(*) AS n FROM candidate")[0]?.n ?? 0;
  return total - discoverableCandidateIds(viewingCompany).length;
}
