"use client";

import { Check } from "lucide-react";
import { CAPABILITY_DEFINITIONS } from "@/lib/capabilities";
import { cn } from "@/lib/utils";

/**
 * Multi-select of platform capability tags. Capabilities are a fixed, shared vocabulary
 * (CAPABILITY_DEFINITIONS) — candidates tag their evidence against them, they are not free text.
 */
export function CapabilityPicker({
  selected,
  onChange,
  max,
}: {
  selected: string[];
  onChange: (tags: string[]) => void;
  /** Optional cap on how many can be selected. */
  max?: number;
}) {
  function toggle(tag: string) {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag));
    } else {
      if (max && selected.length >= max) return;
      onChange([...selected, tag]);
    }
  }

  const atMax = Boolean(max && selected.length >= max);

  return (
    <div className="flex flex-wrap gap-2">
      {CAPABILITY_DEFINITIONS.map((cap) => {
        const active = selected.includes(cap.tag);
        const disabled = !active && atMax;
        return (
          <button
            key={cap.tag}
            type="button"
            onClick={() => toggle(cap.tag)}
            disabled={disabled}
            title={cap.description}
            aria-pressed={active}
            className={cn(
              "inline-flex items-center gap-1.5 border px-3 py-1.5 text-xs transition-colors",
              active
                ? "border-accent bg-accent-soft text-ink"
                : "border-ink/15 text-ink-soft hover:border-ink hover:text-ink",
              disabled && "cursor-not-allowed opacity-40 hover:border-ink/15 hover:text-ink-soft"
            )}
          >
            {active && <Check className="h-3 w-3 text-accent" />}
            {cap.label}
          </button>
        );
      })}
    </div>
  );
}
