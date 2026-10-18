import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { GUIDES, getGuide } from "@/content/guides";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};
  return {
    title: `${guide.question} · Disruptajob`,
    description: guide.answer.slice(0, 155),
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: { title: guide.question, description: guide.answer.slice(0, 180), type: "article" },
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  // FAQPage structured data: the direct answer plus every FAQ, in the shape assistants
  // and search engines cite. The content is identical to what the human reads.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: guide.question, acceptedAnswer: { "@type": "Answer", text: guide.answer } },
      ...guide.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    ],
  };

  const updated = new Date(guide.updated).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="mx-auto max-w-[680px] px-6 py-14 lg:py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Link
        href="/guides"
        className="inline-flex items-center gap-2 text-sm text-ink-faint transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All guides
      </Link>

      <p className="mt-8 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
        Guide · updated {updated} · {guide.minutes} min
      </p>
      <h1 className="mt-3 font-serif-display text-3xl leading-tight text-ink sm:text-[2.4rem] sm:leading-[1.15]">
        {guide.question}
      </h1>

      <div className="mt-6 border border-ink/15 bg-paper-dim p-5">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-ink-faint">
          The short answer
        </p>
        <p className="mt-2 text-[16px] leading-[1.7] text-ink">{guide.answer}</p>
      </div>

      <div className="mt-10 space-y-8">
        {guide.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="font-serif-display text-xl text-ink">{s.heading}</h2>
            {s.paragraphs.map((p, i) => (
              <p key={i} className="mt-3 text-[16px] leading-[1.75] text-ink">
                {p}
              </p>
            ))}
          </section>
        ))}
      </div>

      <section className="mt-12 border-t border-ink/10 pt-8">
        <h2 className="font-serif-display text-xl text-ink">Common questions</h2>
        <div className="mt-4 space-y-5">
          {guide.faqs.map((f) => (
            <div key={f.q}>
              <h3 className="text-[16px] font-medium text-ink">{f.q}</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-14 border-t border-ink/10 pt-8">
        <p className="text-[15px] leading-relaxed text-ink-soft">
          Disruptajob is the evidence page this guide describes: publish real work, tagged with
          what it proves, hidden until you say otherwise, free for candidates.{" "}
          <Link href="/talent/onboarding" className="text-ink underline-grow">
            Build yours in about ten minutes
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
