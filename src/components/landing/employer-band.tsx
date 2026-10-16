import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

/**
 * A visible change of audience.
 *
 * Everything above this on the page is written to a candidate. Everything inside it is written to
 * a company, and until now a reader had to work that out from the copy — which meant a job-seeker
 * scrolled into "every CV on your desk is now perfect" and briefly thought it was about them.
 *
 * A cooler paper plus a stated label, rather than a full inversion: Tailwind's `@theme inline`
 * resolves colour tokens at build time, so re-pointing --ink inside a wrapper silently does
 * nothing and leaves dark text on a dark ground. A distinct tone achieves the same signal without
 * fighting the build.
 *
 * Not a separate tab, either. A candidate seeing what we say to employers is an argument in our
 * favour — we tell companies to judge the work. Hiding it would imply we say different things to
 * each side.
 */
export function EmployerBand({ children }: { children: ReactNode }) {
  return (
    <div className="border-y-2 border-ink/20 bg-paper-company">
      <div className="mx-auto max-w-[1400px] px-6 pt-16 lg:px-10 lg:pt-20">
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-ink/15 pb-6">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
            From here down — for companies
          </p>
          <Link
            href="/employer"
            className="inline-flex items-center gap-1.5 text-sm text-ink-soft transition-colors hover:text-ink"
          >
            I&rsquo;m hiring
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
      {children}
    </div>
  );
}
