"use server";

import { DRAFT_OWNER_ID } from "@/lib/github-import";
import type { Project } from "@/types";

/**
 * Importing someone's public GitHub repositories, for real.
 *
 * This was a stub that returned three invented repositories belonging to a seeded demo person, so
 * a real candidate clicking "Connect GitHub" would have watched somebody else's work appear as
 * their own. That is a worse outcome than the button not existing.
 *
 * GitHub's public API needs no key, no OAuth and no account, which is what makes this possible
 * inside the constraint the rest of this project keeps: `npm ci && npm run dev` on any machine,
 * no secrets to paste. The cost is 60 requests per hour per IP — fine for a prototype, and
 * handled explicitly rather than failing mysteriously when it runs out.
 *
 * The trust boundary is unchanged and is the whole point: repositories arrive as DRAFT projects
 * with `capabilities: []`. Nothing scores, nothing publishes, and the candidate tags each one
 * themselves. An import that could assign capabilities would let anyone manufacture a profile by
 * forking repositories.
 */

const API = "https://api.github.com";
const MAX_REPOS = 12;

export type GitHubImportResult =
  | { ok: true; projects: Project[]; skipped: number }
  | { ok: false; error: string };

interface Repo {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  fork: boolean;
  archived: boolean;
  stargazers_count: number;
  language: string | null;
  pushed_at: string;
}

/** GitHub usernames: alphanumeric and single hyphens, 39 chars max. Validated before use in a URL. */
const USERNAME = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;

export async function importGitHubRepos(rawUsername: string): Promise<GitHubImportResult> {
  const username = rawUsername.trim().replace(/^@/, "").replace(/^https?:\/\/github\.com\//, "").replace(/\/$/, "");

  if (!USERNAME.test(username)) {
    return { ok: false, error: "That doesn't look like a GitHub username." };
  }

  let response: Response;
  try {
    response = await fetch(
      `${API}/users/${username}/repos?sort=pushed&per_page=${MAX_REPOS * 2}&type=owner`,
      {
        headers: { Accept: "application/vnd.github+json", "User-Agent": "disruptajob" },
        // Repositories don't change minute to minute, and this is the rate limit's main defence.
        next: { revalidate: 600 },
      }
    );
  } catch {
    return { ok: false, error: "Couldn't reach GitHub just now. You can add work manually instead." };
  }

  if (response.status === 404) {
    return { ok: false, error: `No public profile found for "${username}".` };
  }
  if (response.status === 403) {
    // Unauthenticated requests share one allowance per IP, so this is a real possibility.
    return { ok: false, error: "GitHub is rate-limiting us at the moment. Try again in a few minutes, or add work manually." };
  }
  if (!response.ok) {
    return { ok: false, error: "GitHub returned something unexpected. You can add work manually instead." };
  }

  const repos = (await response.json()) as Repo[];

  // Forks and archives are rarely the person's own work, and a wall of them buries the real
  // projects. Counted and reported rather than silently dropped.
  const own = repos.filter((r) => !r.fork && !r.archived);
  const skipped = repos.length - own.length;

  const projects: Project[] = own.slice(0, MAX_REPOS).map((repo, i) => ({
    id: `gh-${Date.now()}-${i}`,
    slug: repo.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || `repo-${i}`,
    ownerId: DRAFT_OWNER_ID,
    title: repo.name,
    description: repo.description?.trim() || "",
    thumbnailSeed: repo.name,
    // The boundary: never populated by an import.
    capabilities: [],
    tools: repo.language ? [repo.language] : [],
    evidence: [
      { id: `${repo.name}-repo`, type: "demo-link" as const, label: "Repository", url: repo.html_url },
    ],
    outcome: "",
    problem: "",
    whatIBuilt: "",
    myContribution: "",
    process: [],
    mediaGallery: [repo.name],
    demoUrl: repo.homepage?.trim() || undefined,
    status: "draft" as const,
    source: "github-import" as const,
  }));

  if (projects.length === 0) {
    return { ok: false, error: `"${username}" has no public repositories we can import.` };
  }

  return { ok: true, projects, skipped };
}

// --- Profile-side import (the feature's home since onboarding became four questions) ---------

export interface ProfileImportResult {
  ok: boolean;
  error?: string;
  imported?: number;
  skipped?: number;
  /** AI-suggested tags per created draft id — rendered UNCHECKED, never written to the DB. */
  suggestions?: Record<string, string[]>;
  aiEnriched?: number;
}

/** How many imported repos get the AI treatment per run — bounded for cost and rate limits. */
const ENRICH_LIMIT = 6;

/**
 * Import repos as DB draft projects on the signed-in candidate's profile and, when an
 * ANTHROPIC_API_KEY is configured, draft each write-up from the repo's README.
 *
 * Boundaries, restated because they're the product:
 *  - Drafts only. Nothing here publishes, nothing here scores.
 *  - `project_capability` is untouched. AI tag suggestions travel in the RETURN VALUE to be
 *    shown unchecked; if the page is never submitted they never existed.
 *  - No key, or any AI failure → the import still lands, as bare drafts. Same for READMEs
 *    GitHub won't give us.
 */
export async function importGitHubToProfile(rawUsername: string): Promise<ProfileImportResult> {
  const { requireCandidate } = await import("../auth");
  const { get, run } = await import("../db");
  const { draftProjectFromReadme } = await import("../ai");
  const { randomUUID } = await import("node:crypto");

  const account = await requireCandidate();
  const fetched = await importGitHubRepos(rawUsername);
  if (!fetched.ok) return { ok: false, error: fetched.error };

  const username = rawUsername.trim().replace(/^@/, "").replace(/^https?:\/\/github\.com\//, "").replace(/\/$/, "");
  const now = new Date().toISOString();
  const suggestions: Record<string, string[]> = {};
  let imported = 0;
  let aiEnriched = 0;

  for (const [i, p] of fetched.projects.entries()) {
    // Re-importing shouldn't duplicate: one draft per repo slug per owner.
    const exists = get<{ id: string }>(
      "SELECT id FROM project WHERE owner_id = ? AND slug = ?",
      account.candidateId,
      p.slug
    );
    if (exists) continue;

    let description = p.description;
    let problem = "";
    let whatIBuilt = "";
    let outcome = "";

    if (i < ENRICH_LIMIT) {
      const readme = await fetchReadme(username, p.title);
      if (readme) {
        const draft = await draftProjectFromReadme(p.title, p.tools[0], readme);
        if (draft) {
          description = draft.description || description;
          problem = draft.problem;
          whatIBuilt = draft.whatIBuilt;
          outcome = draft.outcome;
          aiEnriched += 1;
          if (draft.suggestedTags.length > 0) suggestions[`gh-${p.slug}`] = draft.suggestedTags;
        }
      }
    }

    const id = `proj-${randomUUID()}`;
    run(
      `INSERT INTO project (id, owner_id, slug, title, description, thumbnail_seed, outcome,
                            problem, what_i_built, my_contribution, demo_url, status, source, created_at)
       VALUES (?,?,?,?,?,?,?,?,?,'',?,'draft','github-import',?)`,
      id,
      account.candidateId,
      p.slug,
      p.title,
      description,
      p.slug,
      outcome,
      problem,
      whatIBuilt,
      p.demoUrl ?? null,
      now
    );
    run(
      "INSERT INTO evidence (id, project_id, type, label, url, sort_order) VALUES (?,?,?,?,?,0)",
      `ev-${randomUUID()}`,
      id,
      "demo-link",
      "Repository",
      p.evidence[0]?.url ?? `https://github.com/${username}/${p.title}`
    );
    for (const tool of p.tools) {
      run("INSERT OR IGNORE INTO project_tool (project_id, tool) VALUES (?,?)", id, tool);
    }
    // The suggestions key must match the draft the UI renders, so re-key by real id.
    if (suggestions[`gh-${p.slug}`]) {
      suggestions[id] = suggestions[`gh-${p.slug}`];
      delete suggestions[`gh-${p.slug}`];
    }
    imported += 1;
  }

  const { revalidatePath } = await import("next/cache");
  revalidatePath("/profile/[slug]", "page");

  if (imported === 0) {
    return { ok: false, error: "Everything there is already on your profile as a draft or project." };
  }
  return { ok: true, imported, skipped: fetched.skipped, suggestions, aiEnriched };
}

async function fetchReadme(username: string, repo: string): Promise<string | null> {
  try {
    const res = await fetch(`${API}/repos/${username}/${encodeURIComponent(repo)}/readme`, {
      headers: { Accept: "application/vnd.github.raw+json", "User-Agent": "disruptajob" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const text = await res.text();
    return text.trim() ? text : null;
  } catch {
    return null;
  }
}

// --- CV / LinkedIn-export import: same desk, same boundary --------------------------------

const MAX_CV_BYTES = 4 * 1024 * 1024;

/**
 * Turn an uploaded CV (or LinkedIn's own profile PDF export) into draft projects.
 *
 * The founder's instruction, kept inside the one rule: AI reads the document and PRE-DRAFTS
 * pieces of work for the person to finish or discard. Drafts only, suggested tags travel in
 * the return value and render unchecked, publishing still demands the owner's own ticks. The
 * document itself is read once for drafting and never stored.
 *
 * LinkedIn arrives as the PDF LinkedIn exports of a profile, because reading profiles from a
 * URL is something LinkedIn does not permit, and this product does not do what sites forbid.
 */
export async function importCvToProfile(formData: FormData): Promise<ProfileImportResult> {
  const { requireCandidate } = await import("../auth");
  const { get, run } = await import("../db");
  const { draftProjectsFromCv, AI_ENABLED } = await import("../ai");
  const { randomUUID } = await import("node:crypto");

  const account = await requireCandidate();

  if (!AI_ENABLED) {
    return { ok: false, error: "CV drafting is switched off on this machine. You can add the work manually, which works just as well." };
  }

  const file = formData.get("cv");
  const pasted = String(formData.get("cvText") ?? "").trim();

  let pdfBase64: string | undefined;
  let text: string | undefined;

  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_CV_BYTES) {
      return { ok: false, error: "That file is over 4MB. Export a lighter PDF, or paste the text instead." };
    }
    const bytes = Buffer.from(await file.arrayBuffer());
    const isPdf = bytes.subarray(0, 5).toString() === "%PDF-";
    if (isPdf) {
      pdfBase64 = bytes.toString("base64");
    } else {
      text = bytes.toString("utf8");
    }
  } else if (pasted) {
    text = pasted;
  } else {
    return { ok: false, error: "Drop a PDF or paste the text first." };
  }

  const drafts = await draftProjectsFromCv({ pdfBase64, text });
  if (!drafts) {
    return { ok: false, error: "We couldn't draft anything readable from that. Paste the text instead, or add the work manually." };
  }

  const now = new Date().toISOString();
  const suggestions: Record<string, string[]> = {};
  let imported = 0;

  const slugify = (v: string) =>
    v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "work";

  for (const d of drafts) {
    let slug = slugify(d.title);
    let n = 2;
    while (get<{ id: string }>("SELECT id FROM project WHERE owner_id = ? AND slug = ?", account.candidateId, slug)) {
      slug = `${slugify(d.title)}-${n++}`;
    }
    const id = `proj-${randomUUID()}`;
    run(
      `INSERT INTO project (id, owner_id, slug, title, description, thumbnail_seed, outcome,
                            problem, what_i_built, my_contribution, demo_url, status, source, created_at)
       VALUES (?,?,?,?,?,?,?,?,?,'',NULL,'draft','cv-import',?)`,
      id, account.candidateId, slug, d.title, d.description, slug, d.outcome, d.problem, d.whatIBuilt, now
    );
    if (d.suggestedTags.length > 0) suggestions[id] = d.suggestedTags;
    imported += 1;
  }

  const { revalidatePath } = await import("next/cache");
  revalidatePath("/profile/[slug]", "page");

  return { ok: true, imported, suggestions, aiEnriched: imported };
}
