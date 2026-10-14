import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import type { Project } from "@/types";
import { ProjectThumbnail } from "@/components/ui/project-thumbnail";
import { Badge } from "@/components/ui/badge";
import { capabilityLabel } from "@/lib/capabilities";

const EVIDENCE_TYPE_LABEL: Record<string, string> = {
  screenshot: "Screenshot",
  "demo-link": "Demo",
  "write-up": "Write-up",
  document: "Document",
  metric: "Metric",
  testimonial: "Testimonial",
};

export function ProjectCard({
  project,
  candidateSlug,
  onRemove,
}: {
  project: Project;
  candidateSlug: string;
  onRemove?: () => void;
}) {
  const evidenceTypes = Array.from(new Set(project.evidence.map((e) => EVIDENCE_TYPE_LABEL[e.type])));

  return (
    <Link
      href={`/profile/${candidateSlug}/projects/${project.slug}`}
      className="group relative block border border-ink/10 bg-paper transition-colors hover:border-ink/30"
    >
      {onRemove && (
        <button
          type="button"
          aria-label="Remove project"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
          }}
          className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center border border-ink/10 bg-paper text-ink-faint transition-colors hover:border-ink/30 hover:text-ink"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
      <ProjectThumbnail seed={project.thumbnailSeed} className="aspect-[16/10] w-full" />
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-serif-display text-xl text-ink">{project.title}</h3>
          <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
        </div>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">{project.description}</p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.capabilities.slice(0, 4).map((tag) => (
            <Badge key={tag} variant="default">
              {capabilityLabel(tag)}
            </Badge>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 pt-4 text-xs text-ink-faint">
          <span>{project.tools.slice(0, 3).join(" · ")}</span>
          <span>{evidenceTypes.join(" · ")}</span>
        </div>

        <p className="mt-4 text-sm italic leading-relaxed text-ink-soft">{project.outcome}</p>

        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-ink underline-grow">
          View evidence
        </span>
      </div>
    </Link>
  );
}
