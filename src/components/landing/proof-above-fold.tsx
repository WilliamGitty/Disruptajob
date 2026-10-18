import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { listDiscoverableCandidates } from "@/server/repositories/discovery";
import { listPublishedProjects } from "@/server/repositories/projects";
import { InitialsMark } from "@/components/ui/initials-mark";
import { Reveal } from "@/components/landing/reveal";

/**
 * The mechanism, shown rather than described.
 *
 * Everything else on this page makes an argument about evidence. This is the only block that
 * *is* the evidence: a real profile, a real capability, and the actual project underneath it. The
 * example profile used to live in the footer, which meant the one thing that proves the claim was
 * filed where nobody looks.
 *
 * Deliberately one person, not a grid. A grid asks you to browse; this asks you to understand one
 * thing — that a capability here is a claim with a receipt attached.
 */
export function ProofAboveFold() {
  // Public page: only people who opted into being discoverable. An empty viewer means no company
  // blocklist applies, because nobody is being shown to a named employer here.
  const discoverable = listDiscoverableCandidates("").filter((c) =>
    c.capabilities.some((cap) => cap.evidenceCount > 0)
  );
  // Lead with the person whose evidence is workshops, events and writing, not code. The
  // deterrence is asymmetric: a developer isn't scared off by a care worker's example, but a
  // care worker reading an all-tech example correctly concludes the site isn't for her, and
  // two real testers did exactly that.
  const candidate =
    discoverable.find((c) => c.slug === "maya-okonkwo") ??
    [...discoverable].sort((a, b) => b.capabilities.length - a.capabilities.length)[0];

  if (!candidate) return null;

  const capability = [...candidate.capabilities]
    .filter((c) => c.evidenceCount > 0)
    .sort((a, b) => b.evidenceCount - a.evidenceCount)[0];
  if (!capability) return null;

  const projects = listPublishedProjects(candidate.id).filter((p) =>
    capability.projectIds.includes(p.id)
  );
  if (projects.length === 0) return null;

  return (
    <section className="border-b border-ink/10 bg-paper-dim/60">
      <div className="mx-auto max-w-[1400px] px-6 py-16 lg:px-10 lg:py-20">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <Reveal>
            <p className="mb-5 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
              What a profile looks like
            </p>
            {/* A tester told us the old three-sentence explainer was "VERY confusing" and that
                the imperative alone was "very effective". She was right: this block demonstrates,
                it shouldn't also narrate. */}
            <h2 className="font-serif-display text-3xl leading-tight text-ink sm:text-[2.25rem]">
              Every claim has the work attached.
            </h2>
            <p className="mt-5 text-[17px] leading-relaxed text-ink-soft">
              Open a project and see for yourself.
            </p>
          </Reveal>

          <Reveal className="border border-ink/15 bg-paper" delay={180}>
            <div className="flex items-start gap-4 border-b border-ink/10 p-6">
              <InitialsMark initials={candidate.avatarInitials} index={candidate.accentIndex} />
              <div className="min-w-0">
                <h3 className="font-serif-display text-xl text-ink">{candidate.name}</h3>
                <p className="mt-1 text-sm text-ink-soft">{candidate.headline}</p>
                {candidate.location && (
                  <p className="mt-1 text-xs text-ink-faint">{candidate.location}</p>
                )}
                {/* The link lives with the person it belongs to; a tester went looking for it
                    here and found it floating outside the card instead. */}
                <Link
                  href={`/profile/${candidate.slug}`}
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-ink underline-grow"
                >
                  See the whole profile
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Their own words, so the card isn't only a scoreboard. */}
            {candidate.shortDescription && (
              <p className="border-b border-ink/10 px-6 py-4 text-[15px] leading-relaxed text-ink-soft">
                &ldquo;{candidate.shortDescription}&rdquo;
              </p>
            )}

            {/* The claim. */}
            <div className="flex items-center justify-between gap-4 px-6 py-5">
              <span className="font-serif-display text-lg text-ink">{capability.label}</span>
              <span className="flex items-center gap-1.5 whitespace-nowrap border border-evidence/30 bg-evidence-soft px-2.5 py-1 text-xs text-ink">
                <Check className="h-3 w-3 text-evidence" />
                {capability.evidenceCount}{" "}
                {capability.evidenceCount === 1 ? "piece of evidence" : "pieces of evidence"}
              </span>
            </div>

            {/* The receipt. */}
            <div className="border-t border-dashed border-ink/15 bg-paper-dim/50 px-6 py-5">
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.14em] text-ink-faint">
                Backed by
              </p>
              <ul className="space-y-4">
                {projects.slice(0, 2).map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/profile/${candidate.slug}/projects/${p.slug}`}
                      className="group block"
                    >
                      <span className="font-medium text-ink underline-grow">{p.title}</span>
                      <p className="mt-1 text-sm leading-relaxed text-ink-soft">{p.description}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
