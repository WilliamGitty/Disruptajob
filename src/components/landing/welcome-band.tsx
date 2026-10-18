import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * The strip a signed-in person sees above the pitch. The pitch below stays for a reason: a
 * member showing this page to a friend is the cheapest distribution we have, so the homepage
 * keeps selling while this band serves the person who already bought. One number, two doors,
 * no feed theatre.
 */
export function WelcomeBand({
  firstName,
  line,
  primary,
  secondary,
}: {
  firstName: string;
  line: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
}) {
  return (
    <div className="border-b border-ink/10 bg-paper-dim">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-4 lg:px-10">
        <p className="text-[15px] leading-relaxed text-ink">
          <span className="font-serif-display">Welcome back, {firstName}.</span>{" "}
          <span className="text-ink-soft">{line}</span>
        </p>
        <div className="flex items-center gap-3">
          <Link
            href={primary.href}
            className="inline-flex h-9 items-center gap-1.5 bg-ink px-4 text-sm font-medium text-paper transition-colors hover:bg-accent"
          >
            {primary.label} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link href={secondary.href} className="text-sm text-ink underline-grow">
            {secondary.label}
          </Link>
        </div>
      </div>
    </div>
  );
}
