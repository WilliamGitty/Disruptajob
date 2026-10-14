import Link from "next/link";
import { Check } from "lucide-react";
import type { CandidateMatch, CandidateProfile } from "@/types";
import { InitialsMark } from "@/components/ui/initials-mark";
import { Button } from "@/components/ui/button";
import { InviteModal } from "@/components/employer/invite-modal";
import { TermsVerdictLine } from "@/components/employer/terms-summary";
import { AddToPipelineButton } from "@/components/employer/add-to-pipeline";

export function ResultCard({
  candidate,
  match,
  alreadyOnBoard = false,
}: {
  candidate: CandidateProfile;
  match: CandidateMatch;
  alreadyOnBoard?: boolean;
}) {
  const metRequirements = match.matchedRequirements.filter((r) => r.met);

  return (
    <div className="border border-ink/10 bg-paper p-7 transition-colors hover:border-ink/25">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex gap-4">
          <InitialsMark initials={candidate.avatarInitials} index={candidate.accentIndex} />
          <div>
            <Link href={`/employer/candidate/${candidate.slug}?q=${encodeURIComponent(match.query)}`}>
              <h3 className="font-serif-display text-xl text-ink underline-grow">{candidate.name}</h3>
            </Link>
            <p className="mt-0.5 text-sm text-ink-soft">{candidate.headline}</p>
            <p className="mt-0.5 text-xs text-ink-faint">{candidate.location}</p>
          </div>
        </div>
        <div className="shrink-0 border border-accent/30 bg-accent-soft px-3 py-1.5 text-right">
          <div className="text-lg font-semibold leading-none text-accent-dark">{match.fitScore}%</div>
          <div className="text-[10px] uppercase tracking-wide text-accent-dark/80">demonstrated fit</div>
        </div>
      </div>

      {metRequirements.length > 0 && (
        <ul className="mt-5 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {metRequirements.map((req) => (
            <li key={req.id} className="flex items-start gap-2 text-sm text-ink-soft">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-evidence" />
              {req.requirementLabel}
            </li>
          ))}
        </ul>
      )}

      {match.termsFit.notes.length > 0 && (
        <div className="mt-5">
          <TermsVerdictLine fit={match.termsFit} />
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-ink/10 pt-5">
        <span className="text-xs text-ink-faint">
          Supporting evidence: {match.supportingProjectCount} relevant project
          {match.supportingProjectCount === 1 ? "" : "s"}
        </span>
        <div className="flex items-center gap-3">
          <AddToPipelineButton candidateId={candidate.id} alreadyOnBoard={alreadyOnBoard} />
          <InviteModal
            candidateId={candidate.id}
            candidateName={candidate.name}
            trigger={<Button variant="outline" size="sm">Invite to conversation</Button>}
          />
          <Button asChild size="sm" variant="primary">
            <Link href={`/employer/candidate/${candidate.slug}?q=${encodeURIComponent(match.query)}`}>
              View evidence
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
