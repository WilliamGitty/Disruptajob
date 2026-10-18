import type { Metadata } from "next";
import Link from "next/link";
import { ARTICLES } from "@/content/articles";
import { MarginNotes } from "@/components/illustrations/field-notes";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Articles · Disruptajob",
  description:
    "Opinion on why hiring feels broken and what evidence-first changes. Written in-house, no ghostwriters, no filler.",
  alternates: { canonical: "/articles" },
};

/**
 * Topic filtering is plain links with a query string, not client state: every filtered view
 * has a URL that can be shared and crawled, and the page needs no JavaScript to work.
 */
export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  const { topic } = await searchParams;

  const topics = [...new Set(ARTICLES.map((a) => a.topic))].sort((a, b) => a.localeCompare(b));
  const active = topics.find((t) => t === topic);
  const articles = ARTICLES.filter((a) => !active || a.topic === active).sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  const dateLabel = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

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

      <MarginNotes className="mt-8 w-full border border-ink/10" />

      <nav aria-label="Filter by topic" className="mt-10 flex flex-wrap gap-2">
        <TopicChip href="/articles" label={`All (${ARTICLES.length})`} selected={!active} />
        {topics.map((t) => (
          <TopicChip
            key={t}
            href={`/articles?topic=${encodeURIComponent(t)}`}
            label={`${t} (${ARTICLES.filter((a) => a.topic === t).length})`}
            selected={active === t}
          />
        ))}
      </nav>

      <div className="mt-10 space-y-10">
        {articles.map((a) => (
          <article key={a.slug} className="border-t border-ink/10 pt-8">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-ink-faint">
              {a.topic} · {dateLabel(a.date)} · {a.minutes} min
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

function TopicChip({ href, label, selected }: { href: string; label: string; selected: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "border px-3 py-1.5 text-[13px] font-medium transition-colors",
        selected
          ? "border-ink bg-ink text-paper"
          : "border-ink/20 text-ink-soft hover:border-ink/50 hover:text-ink"
      )}
    >
      {label}
    </Link>
  );
}
