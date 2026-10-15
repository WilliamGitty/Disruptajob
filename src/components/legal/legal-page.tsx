import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Shared shell for the policy pages.
 *
 * Narrow measure, generous leading, real headings. Legal text is the one place a product is
 * tempted to make reading unpleasant; this one is read by people who have been treated badly by
 * hiring, so it gets the same care as the rest.
 */
export function LegalPage({
  title,
  updated,
  summary,
  children,
}: {
  title: string;
  updated: string;
  summary: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto max-w-[720px] px-6 py-16 lg:py-20">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
        Last updated {updated}
      </p>
      <h1 className="mt-4 font-serif-display text-[2.5rem] leading-[1.1] text-ink">{title}</h1>

      <div className="mt-8 border-l-2 border-accent/40 pl-5 text-[17px] leading-relaxed text-ink">
        {summary}
      </div>

      <div className="legal-body mt-12">{children}</div>

      <p className="mt-16 border-t border-ink/10 pt-6 text-sm text-ink-soft">
        <Link href="/privacy" className="text-ink underline-grow">
          Privacy
        </Link>
        {" · "}
        <Link href="/terms" className="text-ink underline-grow">
          Terms
        </Link>
        {" · "}
        <Link href="/" className="text-ink underline-grow">
          Home
        </Link>
      </p>
    </main>
  );
}

export function Section({ id, heading, children }: { id: string; heading: string; children: ReactNode }) {
  return (
    <section id={id} className="mt-10 scroll-mt-24 first:mt-0">
      <h2 className="font-serif-display text-2xl leading-snug text-ink">{heading}</h2>
      <div className="mt-4 space-y-4 text-[16px] leading-relaxed text-ink-soft">{children}</div>
    </section>
  );
}

/** A plain two-column table — used for data categories and retention periods. */
export function Rows({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <div className="mt-5 border border-ink/10">
      {rows.map(([label, value], i) => (
        <div
          key={label}
          className={`grid grid-cols-1 gap-1 px-5 py-4 sm:grid-cols-[minmax(0,13rem)_1fr] sm:gap-6 ${
            i > 0 ? "border-t border-ink/10" : ""
          }`}
        >
          <div className="text-[15px] font-medium text-ink">{label}</div>
          <div className="text-[15px] leading-relaxed text-ink-soft">{value}</div>
        </div>
      ))}
    </div>
  );
}

/** The honest caveat, shown on both pages. */
export function NotYetReviewed() {
  return (
    <div className="mt-14 border border-accent/30 bg-accent-soft px-5 py-4 text-[15px] leading-relaxed text-ink">
      <strong className="font-medium">A note on this document.</strong> It was drafted to describe
      exactly what this software does, and it has not yet been reviewed by a solicitor. The
      placeholders in square brackets must be completed before this site accepts real users.
    </div>
  );
}
