import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentAccount } from "@/server/auth";
import { listInvitesForCompany } from "@/server/repositories/invites";
import { getCandidateById } from "@/server/repositories/candidates";
import { awaitsEmployer } from "@/lib/invites";
import { ResponseCard } from "@/components/invites/response-card";
import { handoffForInvite } from "@/server/repositories/handoff";

export const metadata: Metadata = { title: "Conversations · Disruptajob" };
export const dynamic = "force-dynamic";

export default async function ResponsesPage() {
  const account = await getCurrentAccount();

  if (!account?.companyId) {
    return (
      <main className="mx-auto max-w-[700px] px-6 py-24 text-center">
        <h1 className="font-serif-display text-2xl text-ink">Sign in as a company</h1>
        <p className="mt-3 text-sm text-ink-soft">
          Conversations belong to a company account.
        </p>
        <Link href="/signin" className="mt-6 inline-block text-sm text-ink underline-grow">
          Go to sign in
        </Link>
      </main>
    );
  }

  // Ones needing a reply from us first.
  const sent = listInvitesForCompany(account.companyId).sort(
    (a, b) => Number(awaitsEmployer(b)) - Number(awaitsEmployer(a))
  );

  const counts = {
    yourTurn: sent.filter(awaitsEmployer).length,
    awaiting: sent.filter((i) => i.status === "sent" || i.status === "viewed").length,
    accepted: sent.filter((i) => i.status === "accepted").length,
    declined: sent.filter((i) => i.status === "declined").length,
  };

  return (
    <main>
      <div className="mx-auto max-w-[800px] px-6 py-16 lg:px-10 lg:py-20">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
          {account.displayName}
        </p>
        <h1 className="font-serif-display text-3xl text-ink sm:text-4xl">Conversations</h1>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-soft">
          Every invite you&rsquo;ve sent, and where it stands. Candidates reply here once they
          accept, no inbox hunting, no application pipeline.
        </p>

        {sent.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-6 text-sm text-ink-soft">
            {counts.yourTurn > 0 && (
              <span className="text-accent-dark">
                <span className="font-medium">{counts.yourTurn}</span> need you
              </span>
            )}
            <span>
              <span className="font-medium text-ink">{counts.awaiting}</span> awaiting them
            </span>
            <span>
              <span className="font-medium text-ink">{counts.accepted}</span> accepted
            </span>
            <span>
              <span className="font-medium text-ink">{counts.declined}</span> declined
            </span>
          </div>
        )}

        {sent.length === 0 ? (
          <div className="mt-10 border border-dashed border-ink/20 p-10 text-center">
            <p className="text-sm text-ink-soft">
              No invites sent yet.{" "}
              <Link href="/employer" className="text-ink underline-grow">
                Find someone to reach out to
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="mt-10 space-y-6">
            {sent.map((invite) => {
              const candidate = getCandidateById(invite.candidateId);
              return (
                <ResponseCard
                  key={invite.id}
                  invite={invite}
                  candidateName={candidate?.name ?? "Candidate"}
                  candidateSlug={candidate?.slug}
                  terms={candidate?.nonNegotiables}
                  handoff={
                    invite.status === "accepted"
                      ? handoffForInvite(invite.id, account.companyId!)
                      : undefined
                  }
                />
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
