import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * The why and the who, directly under the hero's button.
 *
 * Founder call after round three: testers who never clicked through to /why bounced without
 * ever hearing the reason this exists, so the reason moves onto the homepage. The register is
 * deliberately blunter than the rest of the site (the Galloway note): short declaratives,
 * swagger aimed at the system, warmth aimed at the reader. Every line still passes the house
 * test of being sayable to someone eleven months into a search.
 */
export function WhyBand() {
  const whoFor = [
    "The gap that was a caring year",
    "Six jobs in six years",
    "The switcher with no matching job title",
    "The ops person whose proof is that nothing broke",
    "The self-taught, with no paper at all",
  ];

  return (
    <section className="border-b border-ink/10 bg-paper-dim/60">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-12 px-6 py-16 lg:grid-cols-2 lg:gap-16 lg:px-10 lg:py-20">
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
            Why we built this
          </p>
          <h2 className="font-serif-display text-3xl leading-tight text-ink sm:text-[2.25rem]">
            Paper lies. Work doesn&rsquo;t.
          </h2>
          <p className="mt-5 text-[17px] leading-relaxed text-ink-soft">
            Two hundred applications, four replies. That market is broken beyond repair, so we
            built a different one.
          </p>
          <p className="mt-4 text-[17px] leading-relaxed text-ink-soft">
            Here, nobody applies. You publish real work you have done. Companies read it and
            come to you. No AI rates you. No keyword filter bins you. No feed begs you to come
            back.
          </p>
          <div className="mt-7 flex flex-wrap gap-x-7 gap-y-3">
            <Link
              href="/why"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-ink underline-grow"
            >
              What an account gets you
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/about" className="text-sm text-ink-soft underline-grow">
              The full story
            </Link>
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
            Who it&rsquo;s for
          </p>
          <h2 className="font-serif-display text-3xl leading-tight text-ink sm:text-[2.25rem]">
            People the CV format punishes.
          </h2>
          <ul className="mt-5 space-y-2.5">
            {whoFor.map((line) => (
              <li key={line} className="flex gap-3 text-[16px] leading-relaxed text-ink-soft">
                <span aria-hidden className="mt-[0.65em] h-1.5 w-1.5 shrink-0 bg-accent" />
                {line}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-[16px] leading-relaxed text-ink">
            If your CV undersells you, you are who this is for.
          </p>
          {/* The anti-pitch qualifies the buyer, Hopkins-style, and costs us nobody we want. */}
          <p className="mt-3 text-sm leading-relaxed text-ink-faint">
            And if you want to send fifty applications tonight, it is not for you. There is no
            apply button here.
          </p>
        </div>
      </div>
    </section>
  );
}
