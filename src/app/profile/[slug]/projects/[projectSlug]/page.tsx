import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { getCandidateBySlug } from "@/server/repositories/candidates";
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
  if (!project) return {};
  return { title: `${project.title} — Disruptajob`, description: project.description };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string; projectSlug: string }>;
}) {
  const { slug, projectSlug } = await params;
  const candidate = getCandidateBySlug(slug);
  if (!candidate) notFound();

  const project = getProjectBySlug(candidate.id, projectSlug);
  if (!project) notFound();

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
