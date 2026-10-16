import { all, get } from "../db";
import type {
  CompanyProfile,
  CompanyStage,
  Role,
  RoleStatus,
  WorkArrangement,
  WorkExample,
} from "@/types";

/**
 * Companies, roles and the real work attached to them.
 *
 * This is now the single source of truth. Previously seeded roles lived in `mock-data.ts` while
 * anything a user published lived in localStorage, which is why completing company setup produced
 * a role that appeared nowhere. One table, one answer.
 */

interface CompanyRow {
  id: string;
  slug: string;
  name: string;
  blurb: string;
  website: string | null;
  stage: string | null;
  team_size: string | null;
  location: string | null;
  avatar_initials: string;
  accent_index: number;
  published: number;
  demo: number;
}

function hydrateCompany(row: CompanyRow): CompanyProfile {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    blurb: row.blurb,
    website: row.website ?? undefined,
    stage: (row.stage as CompanyStage) ?? undefined,
    teamSize: row.team_size ?? undefined,
    location: row.location ?? undefined,
    avatarInitials: row.avatar_initials,
    accentIndex: row.accent_index,
    published: row.published === 1,
    isDemo: row.demo === 1,
  };
}

const SELECT_COMPANY = `
  SELECT id, slug, name, blurb, website, stage, team_size, location,
         avatar_initials, accent_index, published, demo
    FROM company`;

export function listCompanies(): CompanyProfile[] {
  return all<CompanyRow>(`${SELECT_COMPANY} ORDER BY name`).map(hydrateCompany);
}

export function listPublishedCompanies(): CompanyProfile[] {
  return all<CompanyRow>(`${SELECT_COMPANY} WHERE published = 1 ORDER BY name`).map(hydrateCompany);
}

export function getCompanyBySlug(slug: string): CompanyProfile | undefined {
  const row = get<CompanyRow>(`${SELECT_COMPANY} WHERE slug = ?`, slug);
  return row ? hydrateCompany(row) : undefined;
}

export function getCompanyById(id: string): CompanyProfile | undefined {
  const row = get<CompanyRow>(`${SELECT_COMPANY} WHERE id = ?`, id);
  return row ? hydrateCompany(row) : undefined;
}

export function getCompanyByName(name: string): CompanyProfile | undefined {
  const row = get<CompanyRow>(`${SELECT_COMPANY} WHERE LOWER(name) = LOWER(?)`, name.trim());
  return row ? hydrateCompany(row) : undefined;
}

// --- Roles -----------------------------------------------------------------

interface RoleRow {
  id: string;
  company_id: string;
  title: string;
  why_this_role: string;
  status: string;
  comp_range: string | null;
  location: string | null;
  start_window: string | null;
  created_at: string;
}

function workExamplesFor(roleId: string): WorkExample[] {
  const rows = all<{
    id: string;
    title: string;
    description: string;
    timeframe: string | null;
  }>(
    "SELECT id, title, description, timeframe FROM work_example WHERE role_id = ? ORDER BY sort_order",
    roleId
  );

  return rows.map((w) => ({
    id: w.id,
    title: w.title,
    description: w.description,
    timeframe: w.timeframe ?? undefined,
    whatYoudDo: all<{ step: string }>(
      "SELECT step FROM work_example_step WHERE work_example_id = ? ORDER BY sort_order",
      w.id
    ).map((s) => s.step),
    capabilities: all<{ tag: string }>(
      "SELECT tag FROM work_example_capability WHERE work_example_id = ?",
      w.id
    ).map((c) => c.tag),
    attachments: all<{ id: string; name: string; url: string | null; kind: string }>(
      "SELECT id, name, url, kind FROM work_example_attachment WHERE work_example_id = ?",
      w.id
    ).map((a) => ({
      id: a.id,
      name: a.name,
      url: a.url ?? undefined,
      kind: a.kind as "file" | "link",
    })),
  }));
}

function hydrateRole(row: RoleRow): Role {
  return {
    id: row.id,
    companyId: row.company_id,
    title: row.title,
    whyThisRole: row.why_this_role,
    status: row.status as RoleStatus,
    createdAt: row.created_at,
    workExamples: workExamplesFor(row.id),
    terms: {
      compRange: row.comp_range ?? undefined,
      location: row.location ?? undefined,
      startWindow: row.start_window ?? undefined,
      workArrangements: all<{ arrangement: string }>(
        "SELECT arrangement FROM role_arrangement WHERE role_id = ?",
        row.id
      ).map((r) => r.arrangement as WorkArrangement),
      constraints: all<{ constraint_text: string }>(
        "SELECT constraint_text FROM role_constraint WHERE role_id = ?",
        row.id
      ).map((r) => r.constraint_text),
    },
  };
}

const SELECT_ROLE = `
  SELECT id, company_id, title, why_this_role, status, comp_range, location, start_window, created_at
    FROM role`;

export function listRoles(): Role[] {
  return all<RoleRow>(`${SELECT_ROLE} ORDER BY created_at DESC`).map(hydrateRole);
}

export function getRoleById(id: string): Role | undefined {
  const row = get<RoleRow>(`${SELECT_ROLE} WHERE id = ?`, id);
  return row ? hydrateRole(row) : undefined;
}

export function getRolesForCompany(companyId: string): Role[] {
  return all<RoleRow>(`${SELECT_ROLE} WHERE company_id = ? ORDER BY created_at DESC`, companyId).map(
    hydrateRole
  );
}

export function getOpenRolesForCompany(companyId: string): Role[] {
  return getRolesForCompany(companyId).filter((r) => r.status === "open");
}

/** Every capability any of a role's work examples demands, de-duplicated. */
export function capabilitiesForRole(role: Role): string[] {
  return [...new Set(role.workExamples.flatMap((w) => w.capabilities))];
}
