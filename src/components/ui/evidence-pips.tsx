import { cn } from "@/lib/utils";

/**
 * Evidence as discrete blocks, because evidence IS discrete: three pieces of evidence reads as
 * three solid squares, not as 31% of an abstract line. The analog bar invited "what does 60%
 * mean?" — a question with no honest answer, since there is no stored score, only counted work.
 */
const MAX_PIPS = 8;

export function EvidencePips({ count, className }: { count: number; className?: string }) {
  const filled = Math.min(count, MAX_PIPS);
  return (
    <div className={cn("flex items-center gap-1.5", className)} aria-hidden>
      {Array.from({ length: MAX_PIPS }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-3.5 w-5",
            i < filled ? "bg-ink group-hover:bg-accent transition-colors" : "border border-ink/15"
          )}
        />
      ))}
      {count > MAX_PIPS && <span className="ml-1 text-xs text-ink-faint">+{count - MAX_PIPS}</span>}
    </div>
  );
}
