import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentAccount } from "@/server/auth";
import { all } from "@/server/db";
import { getCandidateById } from "@/server/repositories/candidates";
import { getCompanyById } from "@/server/repositories/companies";
import { discoverableCandidateIds } from "@/server/repositories/discovery";
import { pipelineCandidateIds } from "@/server/repositories/pipeline";
import { InitialsMark } from "@/components/ui/initials-mark";
import { Button } from "@/components/ui/button";
import { InviteModal } from "@/components/employer/invite-modal";
import { AddToPipelineButton } from "@/components/employer/add-to-pipeline";
import type { CandidateProfile } from "@/types";

export const metadata: Metadata = { title: "Saved — Disruptajob" };
export const dynamic = "force-dynamic";

export default async function SavedPage() {
  const account = await getCurrentAccount();

  if (!account?.companyId) {
    return (
      <main className="mx-auto max-w-[700px] px-6 py-24 text-center">
        <h1 className="font-serif-display text-2xl text-ink">Sign in as a company</h1>
        <p className="mt-3 text-sm text-ink-soft">Saved people belong to a company account.</p>
        <Link href="/signin" className="mt-6 inline-block text-sm text-ink underline-grow">
          Go to sign in
        </Link>
      </main>
    );
  }

  const company = getCompanyById(account.companyId);
  // Visibility is re-applied on read: someone who hides after being saved disappears from here
  // too, rather than lingering in a list that outlives their consent.
  const allowed = new Set(discoverableCandidateIds(company?.name ?? ""));
  const onBoard = new Set(pipelineCandidateIds(account.companyId));

  const saved = all<{ candidate_id: string }>(
    "SELECT candidate_id FROM saved_candidate WHERE company_id = ? ORDER BY saved_at DESC",
    account.companyId
  )
    .filter((r) => allowed.has(r.candidate_id))
    .map((r) => getCandidateById(r.candidate_id))
    .filter((c): c is CandidateProfile => Boolean(c));

  return (
    <main>
      <div className="mx-auto max-w-[900px] px-6 py-16 lg:px-10">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
          {account.displayName}
        </p>
        <h1 className="font-serif-display text-3xl text-ink sm:text-4xl">Saved people</h1>

        {saved.length === 0 ? (
          <div className="mt-10 border border-dashed border-ink/20 p-10 text-center">
            <p className="text-sm text-ink-soft">
              Nobody saved yet.{" "}
              <Link href="/employer" className="text-ink underline-grow">
                Find people by capability
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="mt-10 space-y-4">
            {saved.map((candidate) => (
              <div
                key={candidate.id}
                className="flex flex-wrap items-center justify-between gap-4 border border-ink/10 p-5"
              >
                <div className="flex items-center gap-4">
                  <InitialsMark
                    initials={candidate.avatarInitials}
                    index={candidate.accentIndex}
                  />
                  <div>
                    <Link href={`/employer/candidate/${candidate.slug}`}>
                      <h3 className="font-serif-display text-lg text-ink underline-grow">
                        {candidate.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-ink-faint">{candidate.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <AddToPipelineButton
                    candidateId={candidate.id}
                    alreadyOnBoard={onBoard.has(candidate.id)}
                  />
                  <InviteModal
                    candidateId={candidate.id}
                    candidateName={candidate.name}
                    trigger={
                      <Button variant="outline" size="sm">
                        Invite
                      </Button>
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
