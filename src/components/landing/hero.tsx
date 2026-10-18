import Link from "next/link";
import { ArrowRight, Clock, Eye, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TitleVsWork } from "@/components/illustrations/title-vs-work";
import { Reveal } from "@/components/landing/reveal";

/**
 * Two doors, candidate first.
 *
 * The person we most need to reach has usually been applying for months and is tired of being
 * addressed as "talent" in someone else's hiring funnel. So the headline names their experience
 * rather than our thesis, and the three reassurances answer what they're actually anxious about
 * before they'll click: does this cost me, will my employer find out, how long will this take.
 */
export function Hero({
  ctaLabel = "Add your first project",
  ctaHref = "/talent/onboarding",
}: {
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <section className="relative border-b border-ink/10">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-10 px-6 pb-16 pt-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:px-10 lg:pb-24 lg:pt-24">
        <div className="animate-fade-up">
          <p className="mb-6 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
            For people the CV format punishes
          </p>
          {/* The accent lands on the two words that carry the argument, not the whole line , 
              colour marks one thing or it marks nothing. */}
          <h1 className="font-serif-display text-[2.75rem] leading-[1.05] tracking-tight text-ink sm:text-[3.5rem] lg:text-[4.25rem]">
            Your <span className="text-accent">job title</span> doesn&rsquo;t do you justice.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
            One year of experience when the filter demands two. Four roles in three years that
            read as a risk instead of range. A master&rsquo;s full of real research and no job
            title to show for it. The CV was built for tidy decade careers; it punishes everyone
            else. Here you show the work instead: projects, research, systems, the things you
            actually did. Build your page once and there is nothing left to pull out at 11pm.
            It&rsquo;s a link that works everywhere today, and companies searching this place
            and finding you is the upside, not the ask.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button asChild size="lg" variant="accent">
              <Link href={ctaHref}>
                {ctaLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-7 gap-y-3 text-sm text-ink-soft">
            <Reassurance icon={<Heart className="h-3.5 w-3.5" />}>
              Free, always. Companies pay; you don&rsquo;t
            </Reassurance>
            <Reassurance icon={<Eye className="h-3.5 w-3.5" />}>
              Hidden until you say otherwise
            </Reassurance>
            <Reassurance icon={<Clock className="h-3.5 w-3.5" />}>
              One piece of work, about 10 minutes
            </Reassurance>
          </ul>
        </div>

        {/* The thesis, drawn, someone should understand this company before reading a word. */}
        <div className="relative hidden lg:block">
          <div className="absolute -inset-4 border border-ink/10" />
          {/* The argument assembles in the order it's made: the small box, then what it hides. */}
          <Reveal className="h-full w-full" stagger="svg > g, svg > text" delay={200}>
            <TitleVsWork className="h-full w-full" />
          </Reveal>
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between border border-ink/10 bg-paper/95 px-4 py-3 text-xs">
            <span className="text-ink-faint">One line on a CV</span>
            <span className="font-medium text-ink">Six months of real work</span>
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
