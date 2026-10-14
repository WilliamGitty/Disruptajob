import type { CandidateProfile, Project } from "@/types";
import { ProjectCard } from "@/components/profile/project-card";
import { AddProjectModal } from "@/components/profile/add-project-modal";
import { RemoveProjectButton } from "@/components/profile/remove-project-button";
import { EmptyShelf } from "@/components/illustrations/empty-states";

/**
 * Someone's body of work.
 *
 * Projects now come from the database rather than the browser, so what a visitor sees is what
 * the owner actually published — and the same rows that produce their capability scores.
 */
export function FeaturedWorkSection({
  candidate,
  projects,
  isOwnProfile,
}: {
  candidate: CandidateProfile;
  projects: Project[];
  isOwnProfile: boolean;
}) {
  return (
    <section id="work" className="border-b border-ink/10 scroll-mt-16">
      <div className="mx-auto max-w-[1100px] px-6 py-16 lg:px-10 lg:py-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
              Featured work
            </p>
            <h2 className="font-serif-display text-3xl text-ink">The evidence, not the résumé.</h2>
          </div>
          {isOwnProfile && <AddProjectModal />}
        </div>

        {projects.length === 0 ? (
          <div className="border border-dashed border-ink/20 p-10 text-center">
            <EmptyShelf className="mx-auto mb-6 h-24 w-40" />
            <p className="font-serif-display text-xl text-ink">
              {isOwnProfile ? "Nothing here yet." : "No published work yet."}
            </p>
            {isOwnProfile && (
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
                One project is enough to start. Tag what it demonstrates and your capability bars
                begin to mean something.
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {projects.map((project) => (
              <div key={project.id} className="relative">
                <ProjectCard project={project} candidateSlug={candidate.slug} />
                {isOwnProfile && <RemoveProjectButton projectId={project.id} />}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
