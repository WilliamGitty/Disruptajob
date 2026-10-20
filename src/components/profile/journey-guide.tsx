import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The journey, numbered, where the owner can see it. The founder walked his own product and
 * got lost ("even I'm getting confused"), so the next step is now always stated: import or
 * add work, publish the drafts, see the page as a company would, then see the roles that
 * match. Ticks come from actual database state, never from engagement theatre, and there is
 * no completion percentage anywhere: steps, not scores.
 */
export function JourneyGuide({
  slug,
  publishedCount,
  draftCount,
}: {
  slug: string;
  publishedCount: number;
  draftCount: number;
}) {
  const steps = [
    {
      n: 1,
      label: "Add or import your work",
      done: publishedCount + draftCount > 0,
      href: "#imports",
    },
    {
      n: 2,
      label:
        draftCount > 0
          ? `Review and publish ${draftCount} draft${draftCount === 1 ? "" : "s"}`
          : "Review and publish your drafts",
      done: draftCount === 0 && publishedCount > 0,
      href: "#draft-desk",
    },
    {
      n: 3,
      label: "See your page as a company sees it",
      done: false,
      href: `/profile/${slug}?view=company`,
    },
    {
      n: 4,
      label: "See roles that match your evidence",
      done: false,
      href: "/talent/matches",
    },
  ];

  return (
    <nav
      aria-label="Your next steps"
      className="border-b border-ink/10 bg-paper-dim/70"
    >
      <ol className="mx-auto flex max-w-[1100px] flex-wrap items-center gap-x-7 gap-y-2 px-6 py-3 lg:px-10">
        {steps.map((s) => (
          <li key={s.n}>
            <Link
              href={s.href}
              className={cn(
                "inline-flex items-center gap-2 text-[13px] transition-colors",
                s.done ? "text-ink-faint" : "text-ink hover:text-accent-dark"
              )}
            >
              <span
                className={cn(
                  "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px]",
                  s.done
                    ? "border-evidence/40 bg-evidence-soft text-evidence"
                    : "border-ink/25 font-medium"
                )}
              >
                {s.done ? <Check className="h-3 w-3" /> : s.n}
              </span>
              <span className={cn(s.done && "line-through decoration-ink/20")}>{s.label}</span>
              {!s.done && <ArrowRight className="h-3 w-3 text-ink-faint" />}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
