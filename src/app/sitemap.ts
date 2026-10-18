import type { MetadataRoute } from "next";

// Rendered per request, not baked at build: CI builds without production env (and with an
// in-memory database), so a static version would freeze the wrong answer into the image.
export const dynamic = "force-dynamic";
import { listDiscoverableCandidates } from "@/server/repositories/discovery";
import { getProjectById } from "@/server/repositories/projects";
import { listPublishedCompanies } from "@/server/repositories/companies";
import { ARTICLES } from "@/content/articles";
import { GUIDES } from "@/content/guides";

/**
 * Only what an anonymous visitor can already see.
 *
 * The privacy contract decides the sitemap, not the other way round: profile URLs come from the
 * same anonymous-viewer query the landing grid uses, so a hidden or blocklist-protected person
 * can never be surfaced here by accident. Everything else is the static public pages.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://disruptajob.com";

  const pages: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/employer`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/people`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/community`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/faq`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/articles`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/guides`, changeFrequency: "weekly", priority: 0.8 },
    ...GUIDES.map((g) => ({
      url: `${base}/guides/${g.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...ARTICLES.map((a) => ({
      url: `${base}/articles/${a.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];

  for (const candidate of listDiscoverableCandidates("")) {
    pages.push({ url: `${base}/profile/${candidate.slug}`, changeFrequency: "weekly", priority: 0.7 });
    for (const pid of candidate.projectIds) {
      const project = getProjectById(pid);
      if (project && project.status !== "draft") {
        pages.push({
          url: `${base}/profile/${candidate.slug}/projects/${project.slug}`,
          changeFrequency: "monthly",
          priority: 0.5,
        });
      }
    }
  }

  // Real companies only: the invented demo population (badged, noindexed) stays out of the
  // index entirely — testers see a market, search engines see only what is real.
  for (const company of listPublishedCompanies()) {
    if (company.isDemo) continue;
    pages.push({ url: `${base}/company/${company.slug}`, changeFrequency: "monthly", priority: 0.4 });
  }

  return pages;
}
