import Link from "next/link";
import { ArrowRight, Clock, Eye, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectThumbnail } from "@/components/ui/project-thumbnail";

/**
 * Two doors, candidate first.
 *
 * The person we most need to reach has usually been applying for months and is tired of being
 * addressed as "talent" in someone else's hiring funnel. So the headline names their experience
 * rather than our thesis, and the three reassurances answer what they're actually anxious about
 * before they'll click: does this cost me, will my employer find out, how long will this take.
 */
export function Hero() {
  return (
    <section className="relative border-b border-ink/10">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-10 px-6 pb-16 pt-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:px-10 lg:pb-24 lg:pt-24">
        <div className="animate-fade-up">
          <p className="mb-6 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
            For people whose title says one thing
          </p>
          <h1 className="font-serif-display text-[2.75rem] leading-[1.05] tracking-tight text-ink sm:text-[3.5rem] lg:text-[4.25rem]">
            Your job title doesn&rsquo;t do you justice.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
            You do the ops, and the automation, and half of product. Your CV has room for one
            line of that. If you&rsquo;ve been applying for months and hearing nothing back, it
            probably isn&rsquo;t you — it&rsquo;s the format. Here you show the work instead.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button asChild size="lg" variant="accent">
              <Link href="/talent/onboarding">
                Show what you can do
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/employer">I&rsquo;m hiring</Link>
            </Button>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-7 gap-y-3 text-sm text-ink-soft">
            <Reassurance icon={<Heart className="h-3.5 w-3.5" />}>
              Free, always — companies pay, you don&rsquo;t
            </Reassurance>
            <Reassurance icon={<Eye className="h-3.5 w-3.5" />}>
              Hidden until you say otherwise
            </Reassurance>
            <Reassurance icon={<Clock className="h-3.5 w-3.5" />}>
              Start with one project, about 10 minutes
            </Reassurance>
          </ul>
        </div>

        <div className="relative hidden lg:block">
          <div className="absolute -inset-4 border border-ink/10" />
          <ProjectThumbnail seed="disruptajob-hero" variant="hero" className="h-full min-h-[360px] w-full" />
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between border border-ink/10 bg-paper/95 px-4 py-3 text-xs">
            <span className="text-ink-faint">What you built, not what you claimed</span>
            <span className="font-medium text-ink">Real work</span>
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
