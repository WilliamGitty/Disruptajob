import type { Metadata } from "next";
import Link from "next/link";
import { listDiscoverableCandidates } from "@/server/repositories/discovery";
import { capabilityLabel } from "@/lib/capabilities";

export const metadata: Metadata = {
  title: "People — Disruptajob",
  description:
    "Browse the people here by the work they've published, not the titles they've held. No account needed to look.",
  alternates: { canonical: "/people" },
};

// Reads live candidates, so it renders per request.
export const dynamic = "force-dynamic";

/**
 * The public shop window — the read-only sample an employer (or anyone) can browse without an
 * account.
 *
 * Privacy shape: this uses the identical anonymous-viewer query as the landing grid, so it can
 * only ever show people who explicitly opened their profile. It is not a search (no filtering by
 * capability, no ranking) — evaluating people against a role is deliberately reserved for a
 * signed-in, named company, because that's what blocklists are checked against.
 */
export default function PeoplePage() {
  const candidates = listDiscoverableCandidates("");

  return (
    <main className="mx-auto max-w-[1100px] px-6 py-14 lg:py-20">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">People</p>
      <h1 className="font-serif-display text-3xl leading-tight text-ink sm:text-4xl">
        Evidence first. Browse freely.
      </h1>
      <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
        Everyone here chose to be visible, and every capability you see is backed by published
        work — nothing is self-declared. Searching by what a role actually needs, and saving or
        contacting people, needs a company account:{" "}
        <Link href="/employer" className="text-ink underline-grow">
          how hiring works here
        </Link>
        .
      </p>

      {candidates.length === 0 ? (
        <p className="mt-14 border border-ink/10 bg-paper-dim px-6 py-10 text-center text-[15px] text-ink-soft">
          Nobody has opened their profile yet — we&rsquo;re new, and we won&rsquo;t pretend
          otherwise. The people come before the crowd does.
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-px border border-ink/10 bg-ink/10 sm:grid-cols-2 lg:grid-cols-3">
          {candidates.map((c) => (
            <Link
              key={c.id}
              href={`/profile/${c.slug}`}
              className="group bg-paper p-6 transition-colors hover:bg-paper-dim"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-ink/15 bg-paper-dim font-serif-display text-ink">
                  {c.avatarInitials}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-serif-display text-lg text-ink group-hover:underline">
                    {c.name}
                  </span>
                  <span className="block truncate text-xs text-ink-soft">{c.headline}</span>
                </span>
              </div>
              {c.shortDescription && (
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                  {c.shortDescription.length > 120
                    ? `${c.shortDescription.slice(0, 120)}…`
                    : c.shortDescription}
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {c.capabilities.slice(0, 4).map((cap) => (
                  <span
                    key={cap.tag}
                    className="border border-ink/15 bg-paper-dim px-2 py-0.5 text-[11px] text-ink-soft"
                  >
                    {capabilityLabel(cap.tag)}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
