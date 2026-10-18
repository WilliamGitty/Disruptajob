import Link from "next/link";
import { Check } from "lucide-react";

/**
 * The "complete your profile" surface, moved from the depths of settings to where the owner
 * actually looks — with one deliberate deviation from what was asked: no completion percentage.
 * The design principles ban it outright (never pressure, never guilt, never a completion
 * percentage), because this page's reader may be eleven months into a search and owes us
 * nothing. What stands instead is a short list of concrete, honest moves — each one says what
 * it does for the reader, not what it does for our database. Done items stay visible as quiet
 * proof of progress, which is all the gamification this product's conscience allows.
 */

export interface StandOutItem {
  done: boolean;
  label: string;
  why: string;
  href: string;
}

export function StandOutChecklist({ items }: { items: StandOutItem[] }) {
  const remaining = items.filter((i) => !i.done);
  if (remaining.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1000px] px-6 pt-10 lg:px-10" aria-label="Ways to stand out">
      <div className="border border-ink/15 bg-paper p-6">
        <p className="font-serif-display text-lg text-ink">Make this page harder to scroll past</p>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">
          Everything here is optional, and everything here works: more evidence means more
          searches you appear in.
        </p>
        <ul className="mt-4 space-y-2.5">
          {items.map((item) => (
            <li key={item.label} className="flex items-start gap-3 text-sm">
              <span
                className={
                  item.done
                    ? "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center bg-evidence text-paper"
                    : "mt-0.5 h-4 w-4 shrink-0 border border-ink/25"
                }
              >
                {item.done && <Check className="h-3 w-3" />}
              </span>
              {item.done ? (
                <span className="text-ink-faint line-through decoration-ink/30">{item.label}</span>
              ) : (
                <span className="text-ink">
                  <Link href={item.href} className="underline-grow font-medium">
                    {item.label}
                  </Link>{" "}
                  <span className="text-ink-soft">— {item.why}</span>
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
