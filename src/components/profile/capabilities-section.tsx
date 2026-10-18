import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { CandidateProfile, Project } from "@/types";
import { EvidencePips } from "@/components/ui/evidence-pips";

/**
 * The capability graph.
 *
 * Scores arrive already computed from the candidate's published, tagged projects — there is no
 * stored score anywhere to read, which is what keeps "demonstrated, never declared" true rather
 * than merely stated.
 */
export function CapabilitiesSection({
  candidate,
  projects,
}: {
  candidate: CandidateProfile;
  projects: Project[];
}) {
  const capabilities = candidate.capabilities;
  const projectById = new Map<string, Project>(projects.map((p) => [p.id, p]));

  return (
    <section id="capabilities" className="border-b border-ink/10 scroll-mt-16">
      <div className="mx-auto max-w-[1100px] px-6 py-16 lg:px-10 lg:py-20">
        <div className="mb-10 max-w-xl">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
            Capability graph
          </p>
          <h2 className="font-serif-display text-3xl text-ink">Demonstrated Capabilities</h2>
          <p className="mt-4 text-sm text-ink-faint">
            Capability scores are based on demonstrated work, not self-declared skills.
          </p>
        </div>

        <div className="divide-y divide-ink/10 border-t border-ink/10">
          {capabilities.map((capability) => {
            const projects = capability.projectIds
              .map((id) => projectById.get(id))
              .filter((p): p is Project => Boolean(p));
            return (
              <details key={capability.tag} className="group py-5">
                <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-6 gap-y-2 sm:flex-nowrap">
                  <span className="flex min-w-0 items-center gap-3 sm:w-60 sm:shrink-0">
                    <ChevronDown className="h-4 w-4 shrink-0 text-ink-faint transition-transform group-open:rotate-180" />
                    <span className="truncate text-[15px] font-medium text-ink">{capability.label}</span>
                  </span>
                  <span className="flex w-full items-center justify-between gap-4 pl-7 sm:w-auto sm:flex-1 sm:pl-0">
                    <EvidencePips count={capability.evidenceCount} className="flex-1 sm:max-w-none" />
                    <span className="shrink-0 whitespace-nowrap text-right text-xs text-ink-faint">
                      {capability.evidenceCount} piece{capability.evidenceCount === 1 ? "" : "s"}
                    </span>
                  </span>
                </summary>

                <div className="ml-10 mt-4 flex flex-wrap gap-2">
                  {projects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/profile/${candidate.slug}/projects/${project.slug}`}
                      className="border border-ink/15 px-3 py-1.5 text-xs text-ink-soft transition-colors hover:border-ink hover:text-ink"
                    >
                      {project.title}
                    </Link>
                  ))}
                </div>
              </details>
            );
          })}
        </div>
      </div>
    </section>
  );
}
