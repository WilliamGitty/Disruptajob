import type { Metadata } from "next";
import Link from "next/link";
import { ARTICLES } from "@/content/articles";

export const metadata: Metadata = {
  title: "Articles — Disruptajob",
  description:
    "Opinion on why hiring feels broken and what evidence-first changes. Written in-house, no ghostwriters, no filler.",
  alternates: { canonical: "/articles" },
};

export default function ArticlesPage() {
  const articles = [...ARTICLES].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <main className="mx-auto max-w-[760px] px-6 py-14 lg:py-20">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">Articles</p>
      <h1 className="font-serif-display text-3xl leading-tight text-ink sm:text-4xl">
        Opinions, held in public.
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
        Why hiring feels broken, and what changes when evidence replaces claims. Written here, by
        us, with a position in every piece. Where we talk about ourselves, we say so.
      </p>

      <div className="mt-12 space-y-10">
        {articles.map((a) => (
          <article key={a.slug} className="border-t border-ink/10 pt-8">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-ink-faint">
              {a.topic} · {a.minutes} min
            </p>
            <h2 className="mt-2 font-serif-display text-2xl leading-snug text-ink">
              <Link href={`/articles/${a.slug}`} className="underline-grow">
                {a.title}
              </Link>
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{a.standfirst}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
