import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import type { CandidateProfile, Project } from "@/types";
import { assessPortfolio, type StrengthBand } from "@/lib/portfolio-strength";

/**
 * "Is this any good, and what should I do next?"
 *
 * The question everyone asks after writing their first project, which the product previously had
 * no answer to. Shown only to the owner of a profile — nobody else ever sees how someone was
 * advised to improve.
 *
 * Deliberately not a progress bar. A percentage invites you to fill boxes; a named band plus two
 * specific actions invites you to add work. Only the top two suggestions appear, because a list of
 * nine things to fix is how you make someone close the tab.
 */

const BAND_COPY: Record<StrengthBand, { marker: string; tone: string }> = {
  empty: { marker: ", ", tone: "text-ink-faint" },
  started: { marker: "1 of 3", tone: "text-ink-soft" },
  credible: { marker: "2 of 3", tone: "text-ink" },
  strong: { marker: "3 of 3", tone: "text-evidence" },
};

export function PortfolioCoach({
  candidate,
  projects,
}: {
  candidate: CandidateProfile;
  projects: Project[];
}) {
  const assessment = assessPortfolio(projects, candidate);
  const top = assessment.suggestions.slice(0, 2);
  const band = BAND_COPY[assessment.band];

  return (
    <section className="border border-ink/15 bg-paper-dim/50">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-ink/10 px-6 py-4">
        <h2 className="font-serif-display text-lg text-ink">{assessment.headline}</h2>
        <span className={`text-xs font-medium uppercase tracking-[0.14em] ${band.tone}`}>
          {band.marker}
        </span>
      </div>

      <div className="px-6 py-5">
        <p className="text-[15px] leading-relaxed text-ink-soft">{assessment.summary}</p>

        {top.length > 0 ? (
          <>
            <p className="mt-6 text-xs font-medium uppercase tracking-[0.14em] text-ink-faint">
              {top.length === 1 ? "What would help most" : "What would help most, in order"}
            </p>
            <ol className="mt-4 space-y-5">
              {top.map((s, i) => (
                <li key={s.id} className="flex gap-4">
                  <span className="mt-0.5 font-serif-display text-sm text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="font-medium text-ink">{s.title}</p>
                    <p className="mt-1 text-[15px] leading-relaxed text-ink-soft">{s.why}</p>
                  </div>
                </li>
              ))}
            </ol>

            <Link
              href="/talent/onboarding"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink underline-grow"
            >
              Add to your portfolio
              <ArrowRight className="h-4 w-4" />
            </Link>
          </>
        ) : (
          <p className="mt-5 flex items-center gap-2 text-[15px] text-ink">
            <Check className="h-4 w-4 text-evidence" />
            Nothing we&rsquo;d change. Add new work as you ship it.
          </p>
        )}
      </div>
    </section>
  );
}
