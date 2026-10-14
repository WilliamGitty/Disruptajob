import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { CandidateProfile, Project } from "@/types";
import { capabilityLabel } from "@/lib/capabilities";
import { isSafeHttpUrl } from "@/lib/project-input";
import { ProjectThumbnail } from "@/components/ui/project-thumbnail";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ProjectDetailView({
  candidate,
  project,
}: {
  candidate: CandidateProfile;
  project: Project;
}) {
  return (
    <>
      <div className="mx-auto max-w-[1000px] px-6 pb-4 pt-6 lg:px-10">
        <ProjectThumbnail seed={project.thumbnailSeed} variant="hero" className="aspect-[16/9] w-full" />
      </div>

      <div className="mx-auto max-w-[1000px] px-6 py-8 lg:px-10">
        <div className="flex flex-wrap items-start justify-between gap-6 border-b border-ink/10 pb-8">
          <div>
            <h1 className="font-serif-display text-3xl text-ink sm:text-4xl">{project.title}</h1>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-soft">{project.description}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {project.capabilities.map((tag) => (
                <Badge key={tag} variant="default">
                  {capabilityLabel(tag)}
                </Badge>
              ))}
            </div>
          </div>
          {project.demoUrl && isSafeHttpUrl(project.demoUrl) && (
            <Button asChild variant="outline">
              <a href={project.demoUrl} target="_blank" rel="noreferrer">
                View demo
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-12 py-12 lg:grid-cols-[1fr_280px]">
          <div className="space-y-12">
            {project.problem && <ProseBlock heading="Problem" body={project.problem} />}
            <ProseBlock heading="What I built" body={project.whatIBuilt} />
            {project.myContribution && (
              <ProseBlock heading="My contribution" body={project.myContribution} />
            )}

            {project.process.length > 0 && (
              <div>
                <h2 className="mb-5 font-serif-display text-xl text-ink">Process</h2>
                <ol className="space-y-5 border-l border-ink/10 pl-6">
                  {project.process.map((step, i) => (
                    <li key={i} className="relative">
                      <span className="absolute -left-[29px] top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-ink bg-paper text-[9px] text-ink" />
                      <h3 className="text-[15px] font-medium text-ink">{step.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-ink-soft">{step.description}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {project.outcome && (
              <div className="border border-evidence/25 bg-evidence-soft p-6">
                <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-evidence">Outcome</h2>
                <p className="text-[15px] leading-relaxed text-ink">{project.outcome}</p>
              </div>
            )}

            {project.mediaGallery.length > 1 && (
              <div>
                <h2 className="mb-5 font-serif-display text-xl text-ink">Media gallery</h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {project.mediaGallery.map((seed, i) => (
                    <ProjectThumbnail key={i} seed={seed} className="aspect-[4/3] w-full" />
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-8">
            {project.tools.length > 0 && (
              <div>
                <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-ink-faint">Tools used</h3>
                <ul className="space-y-1.5 text-sm text-ink-soft">
                  {project.tools.map((tool) => (
                    <li key={tool}>{tool}</li>
                  ))}
                </ul>
              </div>
            )}

            {project.evidence.length > 0 && (
              <div>
                <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-ink-faint">Evidence</h3>
                <ul className="space-y-2">
                  {project.evidence.map((e) => (
                    <li key={e.id} className="border border-ink/10 px-3 py-2 text-xs text-ink-soft">
                      {e.url && isSafeHttpUrl(e.url) ? (
                        <a
                          href={e.url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-ink underline-grow"
                        >
                          {e.label}
                        </a>
                      ) : (
                        <span className="font-medium text-ink">{e.label}</span>
                      )}
                      {e.description && <div className="mt-0.5 text-ink-faint">{e.description}</div>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {project.capabilities.length > 0 && (
              <div>
                <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-ink-faint">Related capabilities</h3>
                <div className="flex flex-wrap gap-1.5">
                  {project.capabilities.map((tag) => (
                    <Link key={tag} href={`/profile/${candidate.slug}#capabilities`}>
                      <Badge variant="accent">{capabilityLabel(tag)}</Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}

function ProseBlock({ heading, body }: { heading: string; body: string }) {
  return (
    <div>
      <h2 className="mb-3 font-serif-display text-xl text-ink">{heading}</h2>
      <p className="max-w-2xl text-[15px] leading-relaxed text-ink-soft">{body}</p>
    </div>
  );
}
