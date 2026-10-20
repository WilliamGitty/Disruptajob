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
 * Same order on every device: headline, model line, the ask, then the argument (the why and
 * the serif roll) for whoever wants it. The ask used to sit below the argument on desktop;
 * the founder moved it up once the argument grew to full height.
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
            {/* The why and the who, on the page's one centre axis. The previous version was
                two left-aligned columns with bullet lists jammed between centred blocks; the
                founder disliked it on every screen size and he was right: the circumstances
                are the most emotional copy on the site, so they are set as a serif roll,
                typography instead of list furniture. order-2 on phones so the button stays
                near the headline. */}
            <div className="order-2 mt-14 border-t border-ink/10 pt-12 text-center">
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
                Why we built this
              </p>
              <h2 className="font-serif-display text-2xl leading-tight text-ink sm:text-3xl">
                Paper lies. Work doesn&rsquo;t.
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-[16px] leading-relaxed text-ink-soft">
                Two hundred applications, four replies. That market is broken beyond repair, so
                we built a different one. Here, nobody applies. You publish real work you have
                done. Companies read it and come to you. No AI rates you. No keyword filter
                bins you.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2">
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

              <p className="mb-5 mt-12 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
                Who it&rsquo;s for
              </p>
              <div className="space-y-2.5">
                {whoFor.map((line) => (
                  <p
                    key={line}
                    className="font-serif-display text-xl leading-snug text-ink sm:text-2xl"
                  >
                    {line}
                  </p>
                ))}
              </div>
              <p className="mx-auto mt-7 max-w-xl text-[16px] font-medium leading-relaxed text-ink">
                If your CV undersells you, you are who this is for.
              </p>
              {/* The anti-pitch qualifies the buyer, Hopkins-style, and costs us nobody we want. */}
              <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-ink-faint">
                And if you want to send fifty applications tonight, it is not for you. There is
                no apply button here.
              </p>
            </div>

            {/* The ask sits between the lead and the why on every device now (founder call):
                headline, model line, button, then the argument for whoever wants it. */}
            <div className="order-1 flex flex-col items-center text-center">
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
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
