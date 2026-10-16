import { Reveal } from "@/components/landing/reveal";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DescribeOneThing,
  TagWhatItProves,
  YouDecideWhoSees,
} from "@/components/illustrations/step-marks";

/**
 * The candidate's "what do I actually do here" step.
 *
 * Deliberately concrete and small: someone worn down by multi-hour applications needs to see
 * that the first ask is one project, not another ordeal — and that they stay in control of who
 * ever sees it.
 */

const STEPS = [
  {
    n: "01",
    Mark: DescribeOneThing,
    heading: "Describe one thing you built.",
    body: "A process you fixed, a tool you made, a mess you untangled. Plain words are fine — and if you'd rather speak than write, you can dictate it. Got public code? Connect GitHub and bring repos in as drafts.",
  },
  {
    n: "02",
    Mark: TagWhatItProves,
    heading: "Tag what it proves.",
    body: "You pick the capabilities that piece of work demonstrates. That’s the only thing that moves your profile — nothing you simply claim ever will.",
  },
  {
    n: "03",
    Mark: YouDecideWhoSees,
    heading: "Decide who can see you.",
    body: "You start hidden. Open up when you’re ready, and block your current employer by name so a job search never costs you the job you have.",
  },
];

export function TalentPitch() {
  return (
    <section className="border-b border-ink/10">
      <div className="mx-auto max-w-[1400px] px-6 py-20 lg:px-10 lg:py-28">
        <Reveal className="mb-14 max-w-2xl">
          <p className="mb-5 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
            How it works for you
          </p>
          <h2 className="font-serif-display text-3xl leading-tight text-ink sm:text-4xl lg:text-[2.75rem]">
            No applications. Start with one piece of work.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-ink-soft">
            You don&rsquo;t write anything here to impress anyone. You show something you
            actually did, and companies come to you because of it.
          </p>
        </Reveal>

        <Reveal stagger=":scope > ol > li" delay={120}>
          <ol className="grid grid-cols-1 gap-10 sm:grid-cols-3 lg:gap-14">
          {STEPS.map(({ n, heading, body, Mark }) => (
            <li key={n}>
              <Mark className="mb-5 h-16 w-full" />
              <span className="font-serif-display text-sm text-accent">{n}</span>
              <h3 className="mt-3 font-serif-display text-xl leading-snug text-ink">{heading}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{body}</p>
            </li>
          ))}
        </ol>
        </Reveal>

        <Reveal className="mt-14 flex flex-wrap items-center gap-5" delay={200}>
          <Button asChild size="lg" variant="accent">
            <Link href="/talent/onboarding">
              Start with one project
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <p className="text-sm text-ink-soft">
            Free forever. Leave halfway and your progress will be waiting.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
