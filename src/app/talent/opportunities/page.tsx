import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentAccount } from "@/server/auth";
import { listInvitesForCandidate } from "@/server/repositories/invites";
import { getCandidateById } from "@/server/repositories/candidates";
import { getCompanyById } from "@/server/repositories/companies";
import { awaitsCandidate } from "@/lib/invites";
import { OpportunityCard } from "@/components/invites/opportunity-card";
import { QuietInbox } from "@/components/illustrations/empty-states";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Who's interested — Disruptajob" };
export const dynamic = "force-dynamic";

export default async function OpportunitiesPage() {
  const account = await getCurrentAccount();

  if (!account?.candidateId) {
    return (
      <main className="mx-auto max-w-[700px] px-6 py-24 text-center">
        <h1 className="font-serif-display text-2xl text-ink">Sign in to see your approaches</h1>
        <p className="mt-3 text-sm text-ink-soft">
          These are yours alone — nobody else can read them.
        </p>
        <Link href="/signin" className="mt-6 inline-block text-sm text-ink underline-grow">
          Go to sign in
        </Link>
      </main>
    );
  }

  const candidate = getCandidateById(account.candidateId);
  // Anything needing a response from you comes first.
  const invites = listInvitesForCandidate(account.candidateId).sort(
    (a, b) => Number(awaitsCandidate(b)) - Number(awaitsCandidate(a))
  );

  return (
    <main>
      <div className="mx-auto max-w-[800px] px-6 py-16 lg:px-10 lg:py-20">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
          Your approaches
        </p>
        <h1 className="font-serif-display text-3xl text-ink sm:text-4xl">
          Where companies come to you.
        </h1>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-soft">
          Anyone here has already looked at your work before reaching out — there&rsquo;s nothing
          to apply for. Say yes to start talking, or no thanks to pass. Either is fine, and
          declining costs you nothing.
        </p>

        {invites.length === 0 ? (
          <div className="mt-10 border border-dashed border-ink/20 p-10 text-center">
            <QuietInbox className="mx-auto mb-6 h-24 w-40" />
            <p className="font-serif-display text-xl text-ink">Quiet so far — that&rsquo;s normal.</p>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
              Companies here search for proven capability, so the more of your work is written
              up, the more often you turn up in what they&rsquo;re looking for. Adding one more
              project is the single best thing you can do.
            </p>
            <Button asChild variant="accent" size="sm" className="mt-6">
              <Link href="/talent/onboarding">Add a project</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-10 space-y-6">
            {invites.map((invite) => {
              const company = getCompanyById(invite.companyId);
              return (
                <OpportunityCard
                  key={invite.id}
                  invite={invite}
                  candidateName={candidate?.name ?? "You"}
                  companySlug={company?.slug}
                />
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
