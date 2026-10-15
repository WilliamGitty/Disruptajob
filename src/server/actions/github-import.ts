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
