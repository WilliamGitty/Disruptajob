import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { getCandidateBySlug } from "@/server/repositories/candidates";
import { viewerMaySeeCandidate } from "@/server/candidate-gate";
import { getCurrentAccount } from "@/server/auth";
import { getProjectBySlug } from "@/server/repositories/projects";
import { ProjectDetailView } from "@/components/profile/project-detail-view";

// Projects live in the database and change as people publish work.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; projectSlug: string }>;
}): Promise<Metadata> {
  const { slug, projectSlug } = await params;
  const candidate = getCandidateBySlug(slug);
  const project = candidate ? getProjectBySlug(candidate.id, projectSlug) : undefined;
  if (!candidate || !project) return {};
  if (!(await viewerMaySeeCandidate(candidate.id))) return {};
  return {
    title: `${project.title} · Disruptajob`,
    description: project.description,
    alternates: { canonical: `/profile/${candidate.slug}/projects/${project.slug}` },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string; projectSlug: string }>;
}) {
  const { slug, projectSlug } = await params;
  const candidate = getCandidateBySlug(slug);
  if (!candidate) notFound();

  // The same wall the profile page has: a hidden person's project is as private as their page.
  if (!(await viewerMaySeeCandidate(candidate.id))) notFound();

  const project = getProjectBySlug(candidate.id, projectSlug);
  if (!project) notFound();

  // Drafts (unreviewed imports) are visible to their owner only, even on an open profile.
  if (project.status === "draft") {
    const viewer = await getCurrentAccount();
    if (viewer?.candidateId !== candidate.id) notFound();
  }

  return (
    <main>
      <div className="mx-auto max-w-[1000px] px-6 pt-10 lg:px-10">
        <Link
          href={`/profile/${candidate.slug}#work`}
          className="inline-flex items-center gap-2 text-sm text-ink-faint transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to {candidate.name.split(" ")[0]}&rsquo;s profile
        </Link>
      </div>

      <ProjectDetailView candidate={candidate} project={project} />
    </main>
  );
}
