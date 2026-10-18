import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentAccount } from "@/server/auth";
import { listPipelineForCompany } from "@/server/repositories/pipeline";
import { PipelineBoard, type BoardCard } from "@/components/employer/pipeline-board";

export const metadata: Metadata = {
  title: "Pipeline · Disruptajob",
  description: "Move candidates through your hiring stages.",
};

export const dynamic = "force-dynamic";

export default async function PipelinePage() {
  const account = await getCurrentAccount();

  if (!account?.companyId) {
    return (
      <main className="mx-auto max-w-[700px] px-6 py-24 text-center">
        <h1 className="font-serif-display text-2xl text-ink">Sign in as a company</h1>
        <p className="mt-3 text-sm text-ink-soft">
          A pipeline belongs to a company account, there&rsquo;s no shared board.
        </p>
        <Link href="/signin" className="mt-6 inline-block text-sm text-ink underline-grow">
          Go to sign in
        </Link>
      </main>
    );
  }

  const cards: BoardCard[] = listPipelineForCompany(account.companyId).map((c) => ({
    candidateId: c.candidate.id,
    slug: c.candidate.slug,
    name: c.candidate.name,
    location: c.candidate.location,
    avatarInitials: c.candidate.avatarInitials,
    accentIndex: c.candidate.accentIndex,
    stage: c.stage,
    position: c.position,
  }));

  return (
    <main>
      <div className="mx-auto max-w-[1400px] px-6 py-14 lg:px-10">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
              {account.displayName}
            </p>
            <h1 className="font-serif-display text-3xl text-ink sm:text-4xl">Pipeline</h1>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
              Drag people between stages. Anyone who changes their visibility settings drops off
              here automatically, the board only ever shows people you&rsquo;re allowed to see.
            </p>
          </div>
          <Link href="/employer" className="text-sm text-ink underline-grow">
            Find more people &rarr;
          </Link>
        </div>

        <PipelineBoard cards={cards} />
      </div>
    </main>
  );
}
