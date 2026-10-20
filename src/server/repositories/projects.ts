import { all, get } from "../db";
import type { Evidence, EvidenceType, Project, ProjectStatus } from "@/types";

/**
 * Projects — the evidence behind every capability score.
 *
 * Reads only; writes live in `actions/evidence.ts` so they pass through an authorization check.
 */

interface ProjectRow {
  id: string;
  owner_id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail_seed: string;
  outcome: string;
  problem: string;
  what_i_built: string;
  my_contribution: string;
  demo_url: string | null;
  status: string;
  source: string;
}

const SELECT_PROJECT = `
  SELECT id, owner_id, slug, title, description, thumbnail_seed, outcome, problem,
         what_i_built, my_contribution, demo_url, status, source
    FROM project`;

function hydrate(row: ProjectRow): Project {
  return {
    id: row.id,
    ownerId: row.owner_id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    thumbnailSeed: row.thumbnail_seed,
    outcome: row.outcome,
    problem: row.problem,
    whatIBuilt: row.what_i_built,
    myContribution: row.my_contribution,
    demoUrl: row.demo_url ?? undefined,
    status: row.status as ProjectStatus,
    source: row.source as Project["source"],
    capabilities: all<{ tag: string }>(
      "SELECT tag FROM project_capability WHERE project_id = ?",
      row.id
    ).map((r) => r.tag),
    tools: all<{ tool: string }>("SELECT tool FROM project_tool WHERE project_id = ?", row.id).map(
      (r) => r.tool
    ),
    evidence: all<{
      id: string;
      type: string;
      label: string;
      description: string | null;
      url: string | null;
    }>(
      "SELECT id, type, label, description, url FROM evidence WHERE project_id = ? ORDER BY sort_order",
      row.id
    ).map(
      (e): Evidence => ({
        id: e.id,
        type: e.type as EvidenceType,
        label: e.label,
        description: e.description ?? undefined,
        url: e.url ?? undefined,
      })
    ),
    process: all<{ title: string; description: string }>(
      "SELECT title, description FROM project_process_step WHERE project_id = ? ORDER BY sort_order",
      row.id
    ),
    mediaGallery: [],
  };
}

export function listProjectsForCandidate(candidateId: string): Project[] {
  return all<ProjectRow>(
    `${SELECT_PROJECT} WHERE owner_id = ? ORDER BY created_at DESC`,
    candidateId
  ).map(hydrate);
}

/** Published only — drafts are the candidate's private workspace. */
export function listPublishedProjects(candidateId: string): Project[] {
  return listProjectsForCandidate(candidateId).filter((p) => p.status !== "draft");
}

/**
 * Published projects by real people — the demo population is excluded, because a stat that
 * counts invented people is the "213 companies" mistake wearing a different hat.
 */
export function countPublishedProjects(): number {
  return (
    get<{ n: number }>(
      `SELECT COUNT(*) AS n FROM project p
        JOIN candidate c ON c.id = p.owner_id
       WHERE p.status = 'published' AND c.demo = 0`
    )?.n ?? 0
  );
}

/** Evidence artefacts on real people's published projects. Demo excluded, same reason. */
export function countEvidence(): number {
  return (
    get<{ n: number }>(
      `SELECT COUNT(*) AS n FROM evidence e
        JOIN project p ON p.id = e.project_id
        JOIN candidate c ON c.id = p.owner_id
       WHERE p.status = 'published' AND c.demo = 0`
    )?.n ?? 0
  );
}

export function getProjectById(id: string): Project | undefined {
  const row = get<ProjectRow>(`${SELECT_PROJECT} WHERE id = ?`, id);
  return row ? hydrate(row) : undefined;
}

export function getProjectBySlug(candidateId: string, slug: string): Project | undefined {
  const row = get<ProjectRow>(
    `${SELECT_PROJECT} WHERE owner_id = ? AND slug = ?`,
    candidateId,
    slug
  );
  return row ? hydrate(row) : undefined;
}

/** Projects demonstrating a capability — the "show me the evidence" link on a profile. */
export function projectsForCapability(candidateId: string, tag: string): Project[] {
  return all<ProjectRow>(
    `${SELECT_PROJECT} p
      WHERE p.owner_id = ? AND p.status = 'published'
        AND EXISTS (SELECT 1 FROM project_capability pc WHERE pc.project_id = p.id AND pc.tag = ?)`,
    candidateId,
    tag
  ).map(hydrate);
}
