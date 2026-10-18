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
                <summary className="flex cursor-pointer list-none items-center gap-6">
                  <ChevronDown className="h-4 w-4 shrink-0 text-ink-faint transition-transform group-open:rotate-180" />
                  <span className="w-48 shrink-0 text-[15px] font-medium text-ink sm:w-56">
                    {capability.label}
                  </span>
                  <EvidencePips count={capability.evidenceCount} className="flex-1" />
                  <span className="w-36 shrink-0 text-right text-xs text-ink-faint">
                    {capability.evidenceCount} piece{capability.evidenceCount === 1 ? "" : "s"} of evidence
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
