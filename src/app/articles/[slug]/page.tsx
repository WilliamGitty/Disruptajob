import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ARTICLES, getArticle } from "@/content/articles";

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  return {
    title: `${article.title} — Disruptajob`,
    description: article.standfirst,
    alternates: { canonical: `/articles/${article.slug}` },
    openGraph: { title: article.title, description: article.standfirst, type: "article" },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const date = new Date(article.date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="mx-auto max-w-[680px] px-6 py-14 lg:py-20">
      <Link
        href="/articles"
        className="inline-flex items-center gap-2 text-sm text-ink-faint transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All articles
      </Link>

      <p className="mt-8 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
        {article.topic} · {date} · {article.minutes} min
      </p>
      <h1 className="mt-3 font-serif-display text-3xl leading-tight text-ink sm:text-[2.6rem] sm:leading-[1.15]">
        {article.title}
      </h1>
      <p className="mt-5 border-l-2 border-accent/40 pl-4 text-lg leading-relaxed text-ink-soft">
        {article.standfirst}
      </p>

      <div className="mt-10 space-y-6">
        {article.body.map((block, i) =>
          block.startsWith("## ") ? (
            <h2 key={i} className="pt-4 font-serif-display text-xl text-ink">
              {block.slice(3)}
            </h2>
          ) : (
            <p key={i} className="text-[16px] leading-[1.75] text-ink">
              {block}
            </p>
          )
        )}
      </div>

      <div className="mt-14 border-t border-ink/10 pt-8">
        <p className="text-[15px] leading-relaxed text-ink-soft">
          Disruptajob is hiring on evidence: people publish real work, companies search what it
          proves. Free for candidates, hidden until you say otherwise.{" "}
          <Link href="/" className="text-ink underline-grow">
            See how it works
          </Link>
        </p>
      </div>
    </main>
  );
}
