import { all } from "../db";
import { getCandidateById } from "./candidates";
import { discoverableCandidateIds } from "./discovery";
import { getCompanyById } from "./companies";
import type { CandidateProfile, PipelineStage } from "@/types";

/**
 * The hiring board, scoped to one company.
 *
 * Visibility is re-applied on every read rather than trusted from when the row was written: if a
 * candidate hides or blocks this company after being added, they drop off the board immediately.
 * A pipeline is a view of people you may currently see, not a cache that outlives their consent.
 */

export interface PipelineCard {
  candidate: CandidateProfile;
  stage: PipelineStage;
  position: number;
  roleId?: string;
}

export function listPipelineForCompany(companyId: string): PipelineCard[] {
  const company = getCompanyById(companyId);
  if (!company) return [];

  const allowed = new Set(discoverableCandidateIds(company.name));

  return all<{ candidate_id: string; stage: string; position: number; role_id: string | null }>(
    `SELECT candidate_id, stage, position, role_id
       FROM pipeline_entry
      WHERE company_id = ?
      ORDER BY stage, position`,
    companyId
  )
    .filter((r) => allowed.has(r.candidate_id))
    .map((r): PipelineCard | null => {
      const candidate = getCandidateById(r.candidate_id);
      if (!candidate) return null;
      return {
        candidate,
        stage: r.stage as PipelineStage,
        position: r.position,
        roleId: r.role_id ?? undefined,
      };
    })
    .filter((c): c is PipelineCard => c !== null);
}

/** Candidate ids already on this company's board — used to avoid duplicate "add" affordances. */
export function pipelineCandidateIds(companyId: string): string[] {
  return all<{ candidate_id: string }>(
    "SELECT candidate_id FROM pipeline_entry WHERE company_id = ?",
    companyId
  ).map((r) => r.candidate_id);
}
