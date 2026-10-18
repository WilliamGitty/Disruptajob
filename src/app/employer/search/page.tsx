import Link from "next/link";
import { Lock } from "lucide-react";
import { matchCandidate } from "@/lib/search";
import { getCurrentAccount } from "@/server/auth";
import { getCompanyById } from "@/server/repositories/companies";
import { listDiscoverableCandidates, withheldCount } from "@/server/repositories/discovery";
import { pipelineCandidateIds } from "@/server/repositories/pipeline";

import { SearchBox } from "@/components/employer/search-box";
import { ResultCard } from "@/components/employer/result-card";
import { RecordSearch } from "@/components/employer/record-search";
import { NoMatches } from "@/components/illustrations/empty-states";
import { CompanyGate } from "@/components/employer/company-gate";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function EmployerSearchResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q = "", page } = await searchParams;

  // Audit finding S2: this page was reachable signed out, and an anonymous viewer skips every
  // blocklist (the landing-page contract, misapplied to a full search tool). Blocklists can only
  // be honoured against a named company, so the tool requires one.
  const account = await getCurrentAccount();
  const company = account?.companyId ? getCompanyById(account.companyId) : undefined;
  if (!company) return <CompanyGate />;

  if (!q.trim()) {
    return (
      <main className="mx-auto max-w-[900px] px-6 py-24 text-center lg:px-10">
        <h1 className="font-serif-display text-2xl text-ink">Describe who you&rsquo;re looking for</h1>
        <p className="mt-3 text-sm text-ink-soft">
          Head back to search and describe the capabilities that matter.
        </p>
        <Link href="/employer" className="mt-6 inline-block text-sm font-medium text-ink underline-grow">
          Back to search
        </Link>
      </main>
    );
  }

  const viewingCompany = company.name;

  const population = listDiscoverableCandidates(viewingCompany);
  const ranked = population
    .map((c) => matchCandidate(c, q))
    .sort((a, b) => b.fitScore - a.fitScore);

  // Render a page at a time. Every result card carries a dialog, so rendering an unbounded list
  // doesn't just get slow — past a couple of thousand it fails outright, and nobody reads past
  // the first screen of a ranked list anyway.
  const pageNumber = Math.max(1, Number(page) || 1);
  const totalPages = Math.max(1, Math.ceil(ranked.length / PAGE_SIZE));
  const current = Math.min(pageNumber, totalPages);
  const matches = ranked.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const byId = new Map(population.map((c) => [c.id, c]));
  const withheld = withheldCount(viewingCompany);
  const onBoard = new Set(account?.companyId ? pipelineCandidateIds(account.companyId) : []);

  return (
    <main>
      <RecordSearch query={q} />
      <div className="border-b border-ink/10">
        <div className="mx-auto max-w-[900px] px-6 py-10 lg:px-10">
          <SearchBox defaultValue={q} size="md" />
        </div>
      </div>

      <div className="mx-auto max-w-[900px] px-6 py-12 lg:px-10">
        <div className="mb-8 flex items-baseline justify-between">
          <h1 className="text-sm font-medium text-ink-faint">
            {ranked.length} people ranked by demonstrated capability
          </h1>
          <Link href="/employer/brief" className="text-xs text-ink-faint underline-grow hover:text-ink">
            Prefer a structured brief?
          </Link>
        </div>

        {withheld > 0 && (
          <p className="mb-6 flex items-start gap-2 border border-ink/10 bg-ink/[0.02] px-4 py-3 text-xs text-ink-faint">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              {withheld} {withheld === 1 ? "profile is" : "profiles are"} not shown.
              Those people control who can find them. Candidates choose their own visibility, and
              can hide from named companies.
            </span>
          </p>
        )}

        {ranked.length === 0 ? (
          <div className="border border-dashed border-ink/20 p-12 text-center">
            <NoMatches className="mx-auto mb-6 h-24 w-40" />
            <p className="font-serif-display text-xl text-ink">
              Nobody has evidence for that yet.
            </p>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
              We only return people whose projects actually demonstrate what you asked for, so an
              empty result is honest rather than a failure. Try describing the capability more
              broadly, &ldquo;automation&rdquo; rather than a specific tool.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {matches.map((match) => {
              const candidate = byId.get(match.candidateId)!;
              return (
                <ResultCard
                  key={candidate.id}
                  candidate={candidate}
                  match={match}
                  alreadyOnBoard={onBoard.has(candidate.id)}
                />
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <nav className="mt-10 flex items-center justify-between border-t border-ink/10 pt-6 text-sm">
            {current > 1 ? (
              <Link
                href={`/employer/search?q=${encodeURIComponent(q)}&page=${current - 1}`}
                className="text-ink underline-grow"
              >
                &larr; Previous
              </Link>
            ) : (
              <span />
            )}
            <span className="text-ink-faint">
              Page {current} of {totalPages}
            </span>
            {current < totalPages ? (
              <Link
                href={`/employer/search?q=${encodeURIComponent(q)}&page=${current + 1}`}
                className="text-ink underline-grow"
              >
                Next &rarr;
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </div>
    </main>
  );
}
