import { ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

const TRADITIONAL = ["Job title", "CV", "Keywords", "Application", "Screening"];
const DISRUPTAJOB = ["Work", "Capabilities", "Evidence", "Match", "Conversation"];

export function Comparison() {
  return (
    <section className="border-b border-ink/10">
      <div className="mx-auto max-w-[1400px] px-6 py-20 lg:px-10 lg:py-28">
        <div className="mb-14 max-w-2xl">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
            Two different routes
          </p>
          <h2 className="font-serif-display text-3xl leading-tight text-ink sm:text-4xl">
            Hiring spends its time on the wrong thing.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-ink-soft">
            One route judges a document about you. The other starts from something you actually
            made.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
          <Flow heading="The usual route" items={TRADITIONAL} />
          <Flow heading="Here" items={DISRUPTAJOB} accent />
        </div>
      </div>
    </section>
  );
}

function Flow({ heading, items, accent }: { heading: string; items: string[]; accent?: boolean }) {
  return (
    <div className={cn("border p-8", accent ? "border-ink bg-paper" : "border-ink/15 bg-paper/60")}>
      <h3
        className={cn(
          "mb-8 text-sm font-medium uppercase tracking-wide",
          accent ? "text-ink" : "text-ink-faint"
        )}
      >
        {heading}
      </h3>
      <ol className="space-y-0">
        {items.map((item, i) => (
          <li key={item}>
            <div
              className={cn(
                "py-3 text-lg",
                accent ? "font-serif-display text-ink" : "text-ink-soft"
              )}
            >
              {item}
            </div>
            {i < items.length - 1 && (
              <div className="flex">
                <ArrowDown
                  className={cn("h-4 w-4", accent ? "text-accent" : "text-ink-faint/60")}
                />
              </div>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
