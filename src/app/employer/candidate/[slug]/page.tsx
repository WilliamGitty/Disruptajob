import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Minus } from "lucide-react";
import { PROJECTS } from "@/lib/mock-data";
import { getCandidateBySlug } from "@/server/repositories/candidates";
import { matchCandidate } from "@/lib/search";
import { CompanyGate } from "@/components/employer/company-gate";
import { isCandidateVisibleTo } from "@/server/repositories/discovery";
import { pipelineCandidateIds } from "@/server/repositories/pipeline";
import { getCompanyById } from "@/server/repositories/companies";
import { getCurrentAccount } from "@/server/auth";
import { toEmployerSafeTerms } from "@/lib/terms";
import { TermsSummary } from "@/components/employer/terms-summary";
import { AddToPipelineButton } from "@/components/employer/add-to-pipeline";
import { InitialsMark } from "@/components/ui/initials-mark";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InviteModal } from "@/components/employer/invite-modal";
import { cn } from "@/lib/utils";
import type { MatchStrength } from "@/types";

const STRENGTH_LABEL: Record<MatchStrength, string> = {
  exploratory: "Exploratory",
  solid: "Solid",
  strong: "Strong",
  high: "High",
};

// Visibility depends on who is asking, so this can never be prerendered.
export const dynamic = "force-dynamic";

export default async function CandidateMatchPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { slug } = await params;
  const { q = "" } = await searchParams;
  const candidate = getCandidateBySlug(slug);
  if (!candidate) notFound();

  // The search gate is not enough on its own — without this, pasting a profile URL would walk
  // straight past a candidate's blocklist. And the blocklist can only be checked against a named
  // company (audit S2), so this employer view requires one; the check then uses its real name.
  const account = await getCurrentAccount();
  const company = account?.companyId ? getCompanyById(account.companyId) : undefined;
  if (!company) return <CompanyGate title="Sign in to view candidates" />;
  if (!isCandidateVisibleTo(candidate.id, company.name)) notFound();

  const match = matchCandidate(candidate, q);
  const onBoard = account?.companyId
    ? pipelineCandidateIds(account.companyId).includes(candidate.id)
    : false;

  return (
    <main>
      <div className="border-b border-ink/10">
        <div className="mx-auto max-w-[900px] px-6 py-10 lg:px-10">
          <Link
            href={q ? `/employer/search?q=${encodeURIComponent(q)}` : "/employer"}
            className="inline-flex items-center gap-2 text-sm text-ink-faint transition-colors hover:text-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to results
          </Link>

          <div className="mt-6 flex flex-wrap items-start justify-between gap-6">
            <div className="flex gap-4">
              <InitialsMark initials={candidate.avatarInitials} index={candidate.accentIndex} size="lg" />
              <div>
                <h1 className="font-serif-display text-3xl text-ink">{candidate.name}</h1>
                <p className="mt-1 text-sm text-ink-soft">{candidate.headline}</p>
                <p className="mt-1 text-xs text-ink-faint">{candidate.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {match && (
                <div className="border border-accent/30 bg-accent-soft px-4 py-2 text-right">
                  <div className="text-2xl font-semibold leading-none text-accent-dark">{match.fitScore}%</div>
                  <div className="text-[10px] uppercase tracking-wide text-accent-dark/80">demonstrated fit</div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <InviteModal
              candidateId={candidate.id}
              candidateName={candidate.name}
              trigger={<Button variant="accent">Invite to conversation</Button>}
            />
            <AddToPipelineButton
              candidateId={candidate.id}
              size="default"
              alreadyOnBoard={onBoard}
            />
            <Button asChild variant="outline">
              <Link href={`/profile/${candidate.slug}`}>View full profile</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[900px] px-6 py-14 lg:px-10">
        <div className="mb-10 max-w-2xl">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
            Explainable match
          </p>
          <h2 className="font-serif-display text-3xl text-ink">Why this person matches</h2>
          {q && (
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">
              Your search: <span className="italic text-ink">&ldquo;{q}&rdquo;</span> was broken into the
              requirements below. Every match points to real projects — inspect the evidence, don&rsquo;t
              just trust the score.
            </p>
          )}
        </div>

        {!match || match.matchedRequirements.length === 0 ? (
          <p className="text-sm text-ink-faint">
            No specific requirements were extracted from this search. View the full profile to see all
            demonstrated capabilities.
          </p>
        ) : (
          <div className="space-y-4">
            {match.matchedRequirements.map((req) => {
              const projects = req.evidenceProjectIds
                .map((id) => PROJECTS.find((p) => p.id === id))
                .filter((p): p is NonNullable<typeof p> => Boolean(p));

              return (
                <div
                  key={req.id}
                  className={cn(
                    "border p-6",
                    req.met ? "border-ink/10 bg-paper" : "border-ink/10 bg-paper-dim/40"
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      {req.met ? (
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-evidence" />
                      ) : (
                        <Minus className="mt-0.5 h-4 w-4 shrink-0 text-ink-faint" />
                      )}
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">
                          Requirement
                        </p>
                        <h3 className="mt-1 text-[15px] font-medium text-ink">{req.requirementLabel}</h3>
                      </div>
                    </div>
                    <Badge variant={req.met ? "evidence" : "default"}>
                      {req.met ? STRENGTH_LABEL[req.strength] : "No evidence yet"}
                    </Badge>
                  </div>

                  {req.met && projects.length > 0 && (
                    <div className="ml-7 mt-4">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-faint">
                        Evidence
                      </p>
                      <div className="flex flex-wrap gap-2">
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
                    </div>
                  )}

                  {!req.met && (
                    <p className="ml-7 mt-3 text-sm text-ink-faint">
                      No projects on this profile currently demonstrate this.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {match && (
          <p className="mt-10 text-xs text-ink-faint">
            Supported by {match.supportingProjectCount} relevant project
            {match.supportingProjectCount === 1 ? "" : "s"} across {candidate.name.split(" ")[0]}&rsquo;s profile.
          </p>
        )}

        {candidate.nonNegotiables && (
          <div className="mt-12">
            <TermsSummary
              terms={toEmployerSafeTerms(candidate.nonNegotiables)}
              fit={match?.termsFit}
            />
          </div>
        )}
      </div>
    </main>
  );
}
