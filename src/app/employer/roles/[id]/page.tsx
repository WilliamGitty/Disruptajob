import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Minus } from "lucide-react";
import { getCandidateById } from "@/server/repositories/candidates";
import { capabilitiesForRole, getCompanyById, getRoleById } from "@/server/repositories/companies";
import { pipelineCandidateIds } from "@/server/repositories/pipeline";
import { getProjectById } from "@/server/repositories/projects";
import { matchCandidatesForRole } from "@/server/matching";
import { assessMutualFit } from "@/lib/role-matching";
import { capabilityLabel } from "@/lib/capabilities";
import { requireEmployer } from "@/server/auth";
import { InitialsMark } from "@/components/ui/initials-mark";
import { Button } from "@/components/ui/button";
import { InviteModal } from "@/components/employer/invite-modal";
import { TermsVerdictLine } from "@/components/employer/terms-summary";
import { AddToPipelineButton } from "@/components/employer/add-to-pipeline";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const role = getRoleById(id);
  return role ? { title: `${role.title} — matches` } : {};
}

/**
 * Candidates matched to a role by the capabilities its work demands.
 *
 * Every row is explainable twice over: which required capabilities they have evidence for, and
 * whether the two sides' terms are compatible. The capability score and the terms verdict stay
 * visually separate — one is proof, the other is preference.
 */
export default async function RoleMatchesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const role = getRoleById(id);
  if (!role) notFound();

  // A role's matches are its owner's business and nobody else's.
  const account = await requireEmployer();
  if (role.companyId !== account.companyId) notFound();

  const company = getCompanyById(role.companyId);
  if (!company) notFound();

  const required = capabilitiesForRole(role);
  const matches = matchCandidatesForRole(role, company.name);
  const onBoard = new Set(pipelineCandidateIds(account.companyId));

  return (
    <main>
      <div className="border-b border-ink/10">
        <div className="mx-auto max-w-[900px] px-6 py-10 lg:px-10">
          <Link
            href="/employer"
            className="inline-flex items-center gap-2 text-sm text-ink-faint transition-colors hover:text-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to hiring
          </Link>

          <h1 className="mt-6 font-serif-display text-3xl text-ink sm:text-4xl">{role.title}</h1>
          {role.whyThisRole && (
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
              {role.whyThisRole}
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            {required.map((tag) => (
              <span
                key={tag}
                className="border border-ink/15 bg-paper px-2.5 py-1 text-xs text-ink-soft"
              >
                {capabilityLabel(tag)}
              </span>
            ))}
          </div>

          <p className="mt-6 text-sm text-ink-faint">
            Candidates see this as{" "}
            <Link href={`/company/${company.slug}`} className="text-ink underline-grow">
              your company page
            </Link>{" "}
            — the real work, not a job ad.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[900px] px-6 py-12 lg:px-10">
        <h2 className="mb-8 text-sm font-medium text-ink-faint">
          {matches.length} {matches.length === 1 ? "person has" : "people have"} evidence for this
          work
        </h2>

        {matches.length === 0 ? (
          <p className="border border-dashed border-ink/20 p-10 text-center text-sm text-ink-soft">
            Nobody discoverable matches these capabilities yet.
          </p>
        ) : (
          <div className="space-y-5">
            {matches.map((match) => {
              const candidate = getCandidateById(match.candidateId);
              if (!candidate) return null;
              const mutual = assessMutualFit(role.terms, candidate);
              // From the database, not the demo module (audit D1) — with the old lookup a real
              // candidate's supporting work silently vanished on the page where an employer
              // decides whether to reach out.
              const projects = match.supportingProjectIds
                .map((pid) => getProjectById(pid))
                .filter((p): p is NonNullable<typeof p> => Boolean(p))
                .slice(0, 3);

              return (
                <div
                  key={candidate.id}
                  className="border border-ink/10 bg-paper p-7 transition-colors hover:border-ink/25"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <InitialsMark
                        initials={candidate.avatarInitials}
                        index={candidate.accentIndex}
                      />
                      <div>
                        <Link href={`/employer/candidate/${candidate.slug}`}>
                          <h3 className="font-serif-display text-xl text-ink underline-grow">
                            {candidate.name}
                          </h3>
                        </Link>
                        <p className="mt-0.5 text-sm text-ink-soft">{candidate.headline}</p>
                        <p className="mt-0.5 text-xs text-ink-faint">{candidate.location}</p>
                      </div>
                    </div>
                    <div className="shrink-0 border border-accent/30 bg-accent-soft px-3 py-1.5 text-right">
                      <div className="text-lg font-semibold leading-none text-accent-dark">
                        {match.fitScore}%
                      </div>
                      <div className="text-[10px] uppercase tracking-wide text-accent-dark/80">
                        demonstrated fit
                      </div>
                    </div>
                  </div>

                  <ul className="mt-5 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                    {required.map((tag) => {
                      const has = match.matchedCapabilities.includes(tag);
                      return (
                        <li
                          key={tag}
                          className={cn(
                            "flex items-start gap-2 text-sm",
                            has ? "text-ink-soft" : "text-ink-faint"
                          )}
                        >
                          {has ? (
                            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-evidence" />
                          ) : (
                            <Minus className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          )}
                          {capabilityLabel(tag)}
                        </li>
                      );
                    })}
                  </ul>

                  {projects.length > 0 && (
                    <div className="mt-5">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-faint">
                        Backed by
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

                  {mutual.notes.length > 0 && (
                    <div className="mt-5">
                      <TermsVerdictLine
                        fit={{
                          compensation: mutual.compensation,
                          workArrangement: mutual.workArrangement,
                          notes: mutual.notes,
                        }}
                      />
                    </div>
                  )}

                  <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-ink/10 pt-5">
                    <AddToPipelineButton
                      candidateId={candidate.id}
                      roleId={role.id}
                      alreadyOnBoard={onBoard.has(candidate.id)}
                    />
                    <InviteModal
                      candidateId={candidate.id}
                      candidateName={candidate.name}
                      trigger={
                        <Button variant="outline" size="sm">
                          Invite to conversation
                        </Button>
                      }
                    />
                    <Button asChild size="sm" variant="primary">
                      <Link href={`/employer/candidate/${candidate.slug}`}>View evidence</Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
