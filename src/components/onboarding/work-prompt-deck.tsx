"use client";

import { useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { suggestPrompts, WORK_PROMPTS, type WorkPrompt } from "@/lib/work-prompts";
import { cn } from "@/lib/utils";

/**
 * "What do you do that your CV has never mentioned?"
 *
 * Asking someone for their skills gets you their job title back. Asking what would break if they
 * went away for a month gets you the truth. This is a deck of those questions, biased toward kinds
 * of work the person hasn't evidenced yet.
 *
 * Choosing one tags nothing and scores nothing — it hands the question to the project form so the
 * answer arrives as described work the person tags themselves. That distinction is the whole
 * product: a question that could award a capability would make this a CV with extra steps.
 */
export function WorkPromptDeck({
  evidencedTags,
  onChoose,
  className,
}: {
  evidencedTags: string[];
  onChoose: (prompt: WorkPrompt) => void;
  className?: string;
}) {
  const [offset, setOffset] = useState(0);

  const deck = useMemo(() => {
    const prioritised = suggestPrompts(evidencedTags, WORK_PROMPTS.length);
    // Rotate rather than randomise, so "show me others" is predictable and nothing repeats until
    // the deck has been seen.
    const start = offset % prioritised.length;
    return [...prioritised.slice(start), ...prioritised.slice(0, start)].slice(0, 3);
  }, [evidencedTags, offset]);

  return (
    <div className={className}>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
            Stuck for what to add
          </p>
          <h3 className="mt-2 font-serif-display text-xl leading-snug text-ink">
            What do you do that your CV has never mentioned?
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setOffset((o) => o + 3)}
          className="inline-flex items-center gap-1.5 text-sm text-ink-soft underline-grow hover:text-ink"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Show me others
        </button>
      </div>

      <ul className="mt-5 grid grid-cols-1 gap-px border border-ink/10 bg-ink/10 sm:grid-cols-3">
        {deck.map((prompt) => (
          <li key={prompt.id}>
            <button
              type="button"
              onClick={() => onChoose(prompt)}
              className={cn(
                "flex h-full w-full flex-col justify-between gap-4 bg-paper p-5 text-left transition-colors",
                "hover:bg-accent-soft"
              )}
            >
              <span className="font-serif-display text-[17px] leading-snug text-ink">
                {prompt.question}
              </span>
              <span className="text-[13px] leading-relaxed text-ink-soft">{prompt.nudge}</span>
            </button>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-xs leading-relaxed text-ink-faint">
        Picking one just sets the question. Nothing is added to your profile until you describe the
        work and tag it yourself.
      </p>
    </div>
  );
}
