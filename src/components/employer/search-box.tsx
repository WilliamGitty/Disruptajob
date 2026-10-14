"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const EXAMPLE_QUERY =
  "We need someone in London who has built internal AI tools, automated business processes, worked with senior leaders and can prototype quickly.";

export function SearchBox({
  defaultValue = "",
  size = "lg",
  autoFocus = false,
}: {
  defaultValue?: string;
  size?: "lg" | "md";
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    router.push(`/employer/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div
        className={cn(
          "flex items-start gap-3 border border-ink/20 bg-paper transition-colors focus-within:border-ink",
          size === "lg" ? "p-2" : "p-1.5"
        )}
      >
        <Search className={cn("mt-3.5 shrink-0 text-ink-faint", size === "lg" ? "ml-3 h-5 w-5" : "ml-2 h-4 w-4")} />
        <textarea
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          rows={size === "lg" ? 2 : 1}
          placeholder="Describe the person you need…"
          className={cn(
            "flex-1 resize-none bg-transparent py-3 text-ink placeholder:text-ink-faint focus:outline-none",
            size === "lg" ? "text-lg leading-snug" : "text-sm leading-snug"
          )}
        />
        <button
          type="submit"
          className={cn(
            "mt-1.5 flex shrink-0 items-center gap-2 bg-ink px-5 font-medium text-paper transition-colors hover:bg-accent",
            size === "lg" ? "h-12 text-sm" : "h-9 text-xs"
          )}
        >
          Search
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      {size === "lg" && (
        <button
          type="button"
          onClick={() => setValue(EXAMPLE_QUERY)}
          className="mt-3 text-left text-xs text-ink-faint underline-grow hover:text-ink"
        >
          Try an example: &ldquo;{EXAMPLE_QUERY}&rdquo;
        </button>
      )}
    </form>
  );
}
