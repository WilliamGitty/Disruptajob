import Link from "next/link";
import { ArrowRight, Clock, Eye, Heart, Link as LinkIcon, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * The opening: headline, then the why and the who, then the ask.
 *
 * Founder call after round three: testers who never clicked through to /why bounced without
 * hearing the reason this exists, so the argument moved into the opening viewport and the
 * thesis drawing moved below it (illustration-band.tsx), where it assembles slowly.
 *
 * Order differs by device on purpose, because the founder's own worry was "word heavy on
 * mobile": desktop reads headline, argument, button; a phone reads headline, button, argument,
 * so the first screen stays light and the case still arrives one swipe later.
 */
export function Hero({
  ctaLabel = "Add your first project",
  ctaHref = "/talent/onboarding",
}: {
  ctaLabel?: string;
  ctaHref?: string;
}) {
  const whoFor = [
    "The gap that was a caring year",
    "Six jobs in six years",
    "The switcher with no matching job title",
    "The ops person whose proof is that nothing broke",
    "The self-taught, with no paper at all",
  ];

  return (
    <section className="relative border-b border-ink/10">
      <div className="mx-auto max-w-[1400px] px-6 pb-16 pt-16 lg:px-10 lg:pb-20 lg:pt-24">
        <div className="animate-fade-up">
          <p className="mb-6 text-center text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
            For people the CV format punishes
          </p>
          {/* The accent marks the villain and nothing else; a tester read the old two-word
              highlight as an accident, which means it was decoration. */}
          <h1 className="mx-auto max-w-4xl text-center font-serif-display text-[2.75rem] leading-[1.05] tracking-tight text-ink sm:text-[3.5rem] lg:text-[4.25rem]">
            Your <span className="text-accent">CV</span> doesn&rsquo;t do you justice.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-relaxed text-ink-soft">
            A CV turns gaps and job changes into red flags. Here, you show your work instead.
          </p>

          <div className="flex flex-col">
            {/* The why and the who. order-2 on phones so the button stays near the headline. */}
            <div className="order-2 mt-12 grid grid-cols-1 gap-10 border-t border-ink/10 pt-10 md:grid-cols-2 md:gap-16 lg:order-1 lg:gap-24">
              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
                  Why we built this
                </p>
                <h2 className="font-serif-display text-2xl leading-tight text-ink">
                  Paper lies. Work doesn&rsquo;t.
                </h2>
                <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-ink-soft">
                  Two hundred applications, four replies. That market is broken beyond repair,
                  so we built a different one.
                </p>
                <p className="mt-3 text-[16px] leading-relaxed text-ink-soft">
                  Here, nobody applies. You publish real work you have done. Companies read it
                  and come to you. No AI rates you. No keyword filter bins you.
                </p>
                <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
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
                <ul className="space-y-2">
                  {whoFor.map((line) => (
                    <li key={line} className="flex gap-3 text-[16px] leading-relaxed text-ink-soft">
                      <span aria-hidden className="mt-[0.65em] h-1.5 w-1.5 shrink-0 bg-accent" />
                      {line}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-[16px] leading-relaxed text-ink">
                  If your CV undersells you, you are who this is for.
                </p>
                {/* The anti-pitch qualifies the buyer, Hopkins-style, and costs us nobody we want. */}
                <p className="mt-2 text-sm leading-relaxed text-ink-faint">
                  And if you want to send fifty applications tonight, it is not for you. There
                  is no apply button here.
                </p>
              </div>
            </div>

            {/* The ask, centred: the founder wanted the button and its reassurances in the
                middle of the page rather than hugging the left margin. order-1 on phones so
                the first screen stays light. */}
            <div className="order-1 flex flex-col items-center text-center lg:order-2">
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:mt-14">
                <Button asChild size="lg" variant="accent">
                  <Link href={ctaHref}>
                    {ctaLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <ul className="mt-7 flex max-w-4xl flex-wrap justify-center gap-x-7 gap-y-3 text-sm text-ink-soft">
                {/* The denial goes where the suspicion forms. A tester read this site as "AI
                    analyses your CV", the exact product the one rule forbids. */}
                <Reassurance icon={<UserCheck className="h-3.5 w-3.5" />}>
                  No AI rates you. Companies read the work itself
                </Reassurance>
                <Reassurance icon={<Heart className="h-3.5 w-3.5" />}>
                  Free, always. Companies pay; you don&rsquo;t
                </Reassurance>
                <Reassurance icon={<Eye className="h-3.5 w-3.5" />}>
                  Hidden until you say otherwise
                </Reassurance>
                <Reassurance icon={<LinkIcon className="h-3.5 w-3.5" />}>
                  One link you can send anywhere, from day one
                </Reassurance>
                <Reassurance icon={<Clock className="h-3.5 w-3.5" />}>
                  One real project, about ten minutes
                </Reassurance>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Reassurance({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2">
      <span className="text-evidence">{icon}</span>
      {children}
    </li>
  );
}
