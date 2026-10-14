import { all, get } from "../db";
import { capabilityLabel } from "@/lib/capabilities";
import { scoreFromEvidenceCount } from "@/lib/capability-scoring";
import type {
  AvailabilityStatus,
  CandidateProfile,
  Capability,
  Discoverability,
  WorkArrangement,
} from "@/types";

/**
 * Reading candidates out of the database.
 *
 * Capability scores are computed here, at read time, from tagged published projects — there is no
 * score column to read and nothing can write one. That keeps the platform's central promise
 * ("demonstrated, never declared") enforced by the shape of the data rather than by discipline.
 *
 * Everything loads in batch. Assembling a candidate touches eight child tables, so doing it one
 * person at a time meant a list of N people cost 8N queries — at a couple of thousand candidates
 * that was tens of thousands of queries for a single search, and the page fell over. These
 * functions issue a fixed nine queries whether you ask for one candidate or ten thousand.
 */

interface CandidateRow {
  id: string;
  slug: string;
  name: string;
  headline: string;
  short_description: string;
  location: string;
  availability: string;
  avatar_initials: string;
  accent_index: number;
  discoverability: string;
  comp_floor: string | null;
  location_constraint: string | null;
}

const SELECT_CANDIDATE = `
  SELECT id, slug, name, headline, short_description, location, availability,
         avatar_initials, accent_index, discoverability, comp_floor, location_constraint
    FROM candidate`;

/** `?,?,?` for an IN clause. SQLite has no array parameter type. */
function placeholders(count: number): string {
  return new Array(count).fill("?").join(",");
}

/** Collect rows into a Map keyed by candidate id. */
function groupBy<T extends { candidate_id: string }, R>(
  rows: T[],
  map: (row: T) => R
): Map<string, R[]> {
  const out = new Map<string, R[]>();
  for (const row of rows) {
    const list = out.get(row.candidate_id);
    if (list) list.push(map(row));
    else out.set(row.candidate_id, [map(row)]);
  }
  return out;
}

/**
 * Turn candidate rows into full profiles, loading every child table once.
 *
 * The capability query is the interesting one: it groups by (owner, tag) so a single pass over
 * `project` produces the whole population's capability graph, with evidence weighted per project
 * and floored at 1 so a tagged project with no artefacts still counts once.
 */
function hydrateMany(rows: CandidateRow[]): CandidateProfile[] {
  if (rows.length === 0) return [];

  const ids = rows.map((r) => r.id);
  const ph = placeholders(ids.length);

  const roleTypes = groupBy(
    all<{ candidate_id: string; role_type: string }>(
      `SELECT candidate_id, role_type FROM candidate_role_type WHERE candidate_id IN (${ph})`,
      ...ids
    ),
    (r) => r.role_type
  );

  const arrangements = groupBy(
    all<{ candidate_id: string; arrangement: string }>(
      `SELECT candidate_id, arrangement FROM candidate_arrangement WHERE candidate_id IN (${ph})`,
      ...ids
    ),
    (r) => r.arrangement as WorkArrangement
  );

  const dealbreakers = groupBy(
    all<{ candidate_id: string; dealbreaker: string }>(
      `SELECT candidate_id, dealbreaker FROM candidate_dealbreaker WHERE candidate_id IN (${ph})`,
      ...ids
    ),
    (r) => r.dealbreaker
  );

  const blocked = groupBy(
    all<{ candidate_id: string; company_name: string }>(
      `SELECT candidate_id, company_name FROM blocked_company WHERE candidate_id IN (${ph})`,
      ...ids
    ),
    (r) => r.company_name
  );

  const experience = groupBy(
    all<{
      candidate_id: string;
      company: string;
      role: string;
      start_date: string;
      end_date: string;
    }>(
      `SELECT candidate_id, company, role, start_date, end_date FROM experience
        WHERE candidate_id IN (${ph}) ORDER BY sort_order`,
      ...ids
    ),
    (r) => ({ company: r.company, role: r.role, startDate: r.start_date, endDate: r.end_date })
  );

  const education = groupBy(
    all<{
      candidate_id: string;
      institution: string;
      qualification: string;
      end_year: string;
    }>(
      `SELECT candidate_id, institution, qualification, end_year FROM education
        WHERE candidate_id IN (${ph}) ORDER BY sort_order`,
      ...ids
    ),
    (r) => ({ institution: r.institution, qualification: r.qualification, endYear: r.end_year })
  );

  const projectIds = groupBy(
    all<{ candidate_id: string; id: string }>(
      `SELECT owner_id AS candidate_id, id FROM project
        WHERE owner_id IN (${ph}) AND status = 'published' ORDER BY created_at`,
      ...ids
    ),
    (r) => r.id
  );

  const capabilityRows = all<{
    candidate_id: string;
    tag: string;
    evidence_count: number;
    project_ids: string;
  }>(
    `SELECT p.owner_id                        AS candidate_id,
            pc.tag                            AS tag,
            SUM(MAX(1, COALESCE(e.n, 0)))     AS evidence_count,
            GROUP_CONCAT(p.id)                AS project_ids
       FROM project p
       JOIN project_capability pc ON pc.project_id = p.id
       LEFT JOIN (SELECT project_id, COUNT(*) AS n FROM evidence GROUP BY project_id) e
              ON e.project_id = p.id
      WHERE p.owner_id IN (${ph}) AND p.status = 'published'
      GROUP BY p.owner_id, pc.tag`,
    ...ids
  );

  const capabilities = groupBy(
    capabilityRows,
    (r): Capability => ({
      tag: r.tag,
      label: capabilityLabel(r.tag),
      score: scoreFromEvidenceCount(r.evidence_count),
      evidenceCount: r.evidence_count,
      projectIds: r.project_ids ? r.project_ids.split(",") : [],
    })
  );

  return rows.map((row) => {
    const rt = roleTypes.get(row.id) ?? [];
    const wa = arrangements.get(row.id) ?? [];
    const db = dealbreakers.get(row.id) ?? [];

    const hasTerms =
      rt.length > 0 ||
      wa.length > 0 ||
      db.length > 0 ||
      Boolean(row.comp_floor) ||
      Boolean(row.location_constraint);

    return {
      id: row.id,
      slug: row.slug,
      userId: `u-${row.id}`,
      name: row.name,
      headline: row.headline,
      shortDescription: row.short_description,
      location: row.location,
      availability: row.availability as AvailabilityStatus,
      avatarInitials: row.avatar_initials,
      accentIndex: row.accent_index,
      capabilities: (capabilities.get(row.id) ?? []).sort((a, b) => b.score - a.score),
      projectIds: projectIds.get(row.id) ?? [],
      experience: experience.get(row.id) ?? [],
      education: education.get(row.id) ?? [],
      discoverability: row.discoverability as Discoverability,
      blockedCompanies: blocked.get(row.id) ?? [],
      nonNegotiables: hasTerms
        ? {
            roleTypes: rt,
            compFloor: row.comp_floor ?? undefined,
            workArrangements: wa,
            locationConstraint: row.location_constraint ?? undefined,
            dealbreakers: db,
          }
        : undefined,
    };
  });
}

export function listCandidates(): CandidateProfile[] {
  return hydrateMany(all<CandidateRow>(`${SELECT_CANDIDATE} ORDER BY name`));
}

/** Load many by id in one go — the path search and the pipeline use. */
export function listCandidatesByIds(ids: string[]): CandidateProfile[] {
  if (ids.length === 0) return [];
  const rows = all<CandidateRow>(
    `${SELECT_CANDIDATE} WHERE id IN (${placeholders(ids.length)})`,
    ...ids
  );
  // Preserve the caller's ordering, which is usually a ranking.
  const byId = new Map(hydrateMany(rows).map((c) => [c.id, c]));
  return ids.map((id) => byId.get(id)).filter((c): c is CandidateProfile => Boolean(c));
}

export function getCandidateBySlug(slug: string): CandidateProfile | undefined {
  const row = get<CandidateRow>(`${SELECT_CANDIDATE} WHERE slug = ?`, slug);
  return row ? hydrateMany([row])[0] : undefined;
}

export function getCandidateById(id: string): CandidateProfile | undefined {
  const row = get<CandidateRow>(`${SELECT_CANDIDATE} WHERE id = ?`, id);
  return row ? hydrateMany([row])[0] : undefined;
}

/** Total population size, without loading anyone. */
export function countCandidates(): number {
  return get<{ n: number }>("SELECT COUNT(*) AS n FROM candidate")?.n ?? 0;
}
