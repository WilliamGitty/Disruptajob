import type { MetadataRoute } from "next";
import { listDiscoverableCandidates } from "@/server/repositories/discovery";
import { getProjectById } from "@/server/repositories/projects";
import { listPublishedCompanies } from "@/server/repositories/companies";

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

  for (const company of listPublishedCompanies()) {
    pages.push({ url: `${base}/company/${company.slug}`, changeFrequency: "monthly", priority: 0.4 });
  }

  return pages;
}
