import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES } from "@/content/guides";

export const metadata: Metadata = {
  title: "Guides · Disruptajob",
  description:
    "Straight answers to the questions job-seekers actually ask: portfolios, evidence, and getting seen without the right job title.",
  alternates: { canonical: "/guides" },
};

export default function GuidesPage() {
  const guides = [...GUIDES].sort((a, b) => b.updated.localeCompare(a.updated));

  return (
    <main className="mx-auto max-w-[760px] px-6 py-14 lg:py-20">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">Guides</p>
      <h1 className="font-serif-display text-3xl leading-tight text-ink sm:text-4xl">
        Questions, answered properly.
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
        Each guide answers one real question properly. You do not need an account here for
        them to be useful. The opinions live in{" "}
        <Link href="/articles" className="text-ink underline-grow">
          the articles
        </Link>
        ; these are the answers.
      </p>

      <div className="mt-12 space-y-10">
        {guides.map((g) => (
          <article key={g.slug} className="border-t border-ink/10 pt-8">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-ink-faint">
              {g.minutes} min
            </p>
            <h2 className="mt-2 font-serif-display text-2xl leading-snug text-ink">
              <Link href={`/guides/${g.slug}`} className="underline-grow">
                {g.question}
              </Link>
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
              {g.answer.split(". ").slice(0, 2).join(". ")}.
            </p>
          </article>
        ))}
      </div>
    </main>
  );
}
