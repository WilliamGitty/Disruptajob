import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentAccount } from "@/server/auth";
import { getCandidateById } from "@/server/repositories/candidates";
import { listPublishedProjects } from "@/server/repositories/projects";
import { rolesMatchingCandidate } from "@/server/repositories/matches";
import { MatchesList } from "@/components/talent/matches-list";

export const metadata: Metadata = { title: "Job roles available · Disruptajob" };
export const dynamic = "force-dynamic";

/**
 * The proactive door the founder asked for after coffee-shop testing, kept inside the line
 * strategy §5a draws: a filterable mirror of open roles scored against your evidence, with
 * nothing to apply to, and the two honest levers stated: evidence raises percentages, terms
 * narrow the list.
 */
export default async function MatchesPage() {
  const account = await getCurrentAccount();
  if (!account?.candidateId) {
    return (
      <main className="mx-auto max-w-[700px] px-6 py-24 text-center">
        <h1 className="font-serif-display text-2xl text-ink">Sign in to see the job roles available</h1>
        <p className="mx-auto mt-3 max-w-md text-[15px] text-ink-soft">
          This page scores open roles against your published evidence, so it needs to know
          whose evidence to score.
        </p>
        <Link href="/signin" className="mt-6 inline-block text-sm text-ink underline-grow">
          Go to sign in
        </Link>
      </main>
    );
  }

  const me = getCandidateById(account.candidateId);
  if (!me) {
    return (
      <main className="mx-auto max-w-[700px] px-6 py-24 text-center">
        <p className="text-sm text-ink-soft">We couldn&rsquo;t load your profile.</p>
      </main>
    );
  }

  const published = listPublishedProjects(me.id).length;
  const matches = rolesMatchingCandidate(me);
  const hidden = (me.discoverability ?? "hidden") === "hidden";
  const termsSet = Boolean(
    me.nonNegotiables &&
      (me.nonNegotiables.workArrangements.length > 0 ||
        me.nonNegotiables.compFloor ||
        me.nonNegotiables.locationConstraint)
  );

  return (
    <main className="mx-auto max-w-[860px] px-6 py-14 lg:py-20">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
        Job roles available
      </p>
      <h1 className="font-serif-display text-3xl leading-tight text-ink sm:text-4xl">
        Open roles, scored against your evidence.
      </h1>
      <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
        Every percentage is explainable: how much of what the role asks for your published
        work already covers, weighted by the depth behind it. No model guesses, and there is
        nothing to apply to, on purpose. Companies reach out when they can see you
        {hidden ? ", and right now you're hidden" : ""}.
      </p>

      <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 border border-ink/15 bg-paper-dim px-5 py-4 text-sm text-ink-soft">
        <span>
          <Link href="/talent/onboarding" className="font-medium text-ink underline-grow">
            Add evidence
          </Link>{" "}
          and the percentages rise.
        </span>
        <span>
          <Link href="/talent/settings" className="font-medium text-ink underline-grow">
            {termsSet ? "Adjust your terms" : "Set your terms"}
          </Link>{" "}
          and the list narrows to what fits.
        </span>
        {hidden && (
          <span>
            <Link href="/talent/settings" className="font-medium text-ink underline-grow">
              Decide who finds you
            </Link>{" "}
            and matching companies can.
          </span>
        )}
      </div>

      {published === 0 ? (
        <p className="mt-12 border border-ink/10 bg-paper-dim px-6 py-10 text-center text-[15px] text-ink-soft">
          Publish one piece of work and this page comes alive: every open role gets scored
          against what your evidence proves.
        </p>
      ) : (
        <div className="mt-8">
          <MatchesList matches={matches} />
        </div>
      )}
    </main>
  );
}
