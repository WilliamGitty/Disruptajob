import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentAccount } from "@/server/auth";
import { all } from "@/server/db";
import { DeleteSearchButton } from "@/components/employer/delete-search-button";

export const metadata: Metadata = { title: "Searches · Disruptajob" };
export const dynamic = "force-dynamic";

export default async function SearchesPage() {
  const account = await getCurrentAccount();

  if (!account?.companyId) {
    return (
      <main className="mx-auto max-w-[700px] px-6 py-24 text-center">
        <h1 className="font-serif-display text-2xl text-ink">Sign in as a company</h1>
        <p className="mt-3 text-sm text-ink-soft">Your searches are kept per company account.</p>
        <Link href="/signin" className="mt-6 inline-block text-sm text-ink underline-grow">
          Go to sign in
        </Link>
      </main>
    );
  }

  const searches = all<{ id: string; query: string; created_at: string }>(
    "SELECT id, query, created_at FROM saved_search WHERE company_id = ? ORDER BY created_at DESC",
    account.companyId
  );

  return (
    <main>
      <div className="mx-auto max-w-[900px] px-6 py-16 lg:px-10 lg:py-20">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
          {account.displayName}
        </p>
        <h1 className="font-serif-display text-3xl text-ink sm:text-4xl">Searches</h1>

        {searches.length === 0 ? (
          <div className="mt-10 border border-dashed border-ink/20 p-10 text-center">
            <p className="text-sm text-ink-soft">
              Your past searches will appear here so you can quickly return to them.
            </p>
            <Link
              href="/employer"
              className="mt-4 inline-block text-sm font-medium text-ink underline-grow"
            >
              Run a search
            </Link>
          </div>
        ) : (
          <div className="mt-10 divide-y divide-ink/10 border-t border-ink/10">
            {searches.map((s) => (
              <div key={s.id} className="flex items-start justify-between gap-4 py-5">
                <Link
                  href={`/employer/search?q=${encodeURIComponent(s.query)}`}
                  className="min-w-0 flex-1"
                >
                  <p className="text-sm leading-relaxed text-ink underline-grow">{s.query}</p>
                  <p className="mt-1 text-xs text-ink-faint">
                    {new Date(s.created_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </Link>
                <DeleteSearchButton id={s.id} />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
