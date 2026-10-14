import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * The employer door.
 *
 * Employers are the paying side, and their pain is just as concrete as the candidate's: a stack
 * of applications that all read identically now that AI writes them, and no way to tell which
 * claims are real. Confident but not preachy — they're buying signal, not a thesis.
 */

const WHAT_YOU_GET = [
  {
    heading: "See the work, not a summary of it",
    body: "Every capability on a profile links back to the project that demonstrates it. Open it and judge the thing yourself.",
  },
  {
    heading: "Search by what people can do",
    body: "Describe the capability you need in plain English. Results come back ranked by evidence, with the reasoning shown.",
  },
  {
    heading: "Start a conversation, not a process",
    body: "Reach out directly to someone whose work fits. No application stage, no pipeline to manage.",
  },
];

export function ClaimsSection() {
  return (
    <section className="border-b border-ink/10 bg-paper-dim/60">
      <div className="mx-auto max-w-[1400px] px-6 py-20 lg:px-10 lg:py-28">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
          <div>
            <p className="mb-5 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
              If you&rsquo;re hiring
            </p>
            <h2 className="font-serif-display text-3xl leading-tight text-ink sm:text-4xl lg:text-[2.75rem]">
              Every CV on your desk is now perfect.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-ink-soft">
              AI writes a flawless application in seconds, so polish no longer separates anyone.
              Screening on documents means sorting 400 candidates who all sound equally strong —
              and finding out who was telling the truth in week three.
            </p>
            <p className="mt-5 text-lg leading-relaxed text-ink-soft">
              We give you the harder-to-fake version: a body of work you can actually inspect.
            </p>
            <Button asChild size="lg" variant="accent" className="mt-8">
              <Link href="/employer">
                Search by capability
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-px self-start border border-ink/10 bg-ink/10">
            {WHAT_YOU_GET.map((item) => (
              <div key={item.heading} className="bg-paper p-7">
                <h3 className="font-serif-display text-lg text-ink">{item.heading}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
