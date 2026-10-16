import { DemoBadge } from "@/components/ui/demo-badge";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { listDiscoverableCandidates } from "@/server/repositories/discovery";
import { InitialsMark } from "@/components/ui/initials-mark";
import { StrengthBar } from "@/components/ui/strength-bar";
import { Reveal } from "@/components/landing/reveal";

export function CandidatePreviewGrid() {
  // A public page, so only people who have opted into being discoverable appear here. Passing an
  // empty viewer means no company blocklist applies — nobody is being shown to a named employer.
  const candidates = listDiscoverableCandidates("").slice(0, 4);

  return (
    <section className="border-b border-ink/10">
      <div className="mx-auto max-w-[1400px] px-6 py-20 lg:px-10 lg:py-28">
        <Reveal className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
              People already here
            </p>
            <h2 className="font-serif-display text-3xl leading-tight text-ink sm:text-4xl">
              A body of work, not a headline.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-ink-soft">
              Every one of these started as one project written up by someone who thought their
              CV wasn&rsquo;t doing them justice.
            </p>
          </div>
          <Link href="/people" className="text-sm font-medium text-ink underline-grow">
            Browse everyone &rarr;
          </Link>
        </Reveal>

        <Reveal
          className="grid grid-cols-1 gap-px border border-ink/10 bg-ink/10 sm:grid-cols-2 lg:grid-cols-4"
          stagger
          delay={100}
        >
          {candidates.map((c) => (
            <Link
              key={c.slug}
              href={`/profile/${c.slug}`}
              className="group flex flex-col justify-between bg-paper p-7 transition-colors hover:bg-paper-dim/60"
            >
              <div>
                <div className="flex items-start justify-between">
                  <InitialsMark initials={c.avatarInitials} index={c.accentIndex} />
                  <ArrowUpRight className="h-4 w-4 text-ink-faint transition-colors group-hover:text-accent" />
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <h3 className="font-serif-display text-lg text-ink">{c.name}</h3>
                  {c.isDemo && <DemoBadge />}
                </div>
                <p className="mt-1 text-sm leading-snug text-ink-soft">{c.headline}</p>
                <p className="mt-2 text-xs text-ink-faint">{c.location}</p>
              </div>

              <div className="mt-6 space-y-2.5">
                {c.capabilities.slice(0, 2).map((cap) => (
                  <div key={cap.tag}>
                    <div className="mb-1 flex items-center justify-between text-[11px] text-ink-faint">
                      <span>{cap.label}</span>
                      <span>{cap.evidenceCount} piece{cap.evidenceCount === 1 ? "" : "s"} of evidence</span>
                    </div>
                    <StrengthBar score={cap.score} />
                  </div>
                ))}
              </div>
            </Link>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
