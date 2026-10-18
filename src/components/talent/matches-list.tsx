"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { capabilityLabel } from "@/lib/capabilities";
import { registerRoleInterest, withdrawRoleInterest } from "@/server/actions/interest";
import type { RoleMatch } from "@/server/repositories/matches";
import { cn } from "@/lib/utils";

/**
 * The mirror, filterable. Filters run client-side over the server-scored rows; nothing here
 * re-scores anything, so the page stays as explainable as the repository that fed it.
 */
export function MatchesList({ matches }: { matches: RoleMatch[] }) {
  const [arrangement, setArrangement] = useState<string>("any");
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [, startSaving] = useTransition();

  function toggleInterest(m: RoleMatch, currentlyInterested: boolean) {
    setNotice(null);
    startSaving(async () => {
      const result = currentlyInterested
        ? await withdrawRoleInterest(m.roleId)
        : await registerRoleInterest(m.roleId);
      if (!result.ok) {
        setNotice(result.error ?? "That didn't work just now.");
        return;
      }
      setOverrides((o) => ({ ...o, [m.roleId]: !currentlyInterested }));
    });
  }
  const [minPct, setMinPct] = useState<number>(0);
  const [hideConflicts, setHideConflicts] = useState(false);

  const shown = useMemo(
    () =>
      matches.filter((m) => {
        if (arrangement !== "any" && !m.terms.arrangements.includes(arrangement)) return false;
        if (m.pct < minPct) return false;
        if (hideConflicts && m.conflict) return false;
        return true;
      }),
    [matches, arrangement, minPct, hideConflicts]
  );

  return (
    <div>
      {notice && (
        <p className="mb-3 border border-accent/30 bg-accent-soft px-3 py-2 text-sm text-ink">{notice}</p>
      )}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-y border-ink/10 py-3 text-sm">
        <label className="flex items-center gap-2 text-ink-soft">
          Arrangement
          <select
            value={arrangement}
            onChange={(e) => setArrangement(e.target.value)}
            className="border border-ink/15 bg-paper px-2 py-1 text-sm text-ink"
          >
            <option value="any">Any</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">On site</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-ink-soft">
          Match at least
          <select
            value={minPct}
            onChange={(e) => setMinPct(Number(e.target.value))}
            className="border border-ink/15 bg-paper px-2 py-1 text-sm text-ink"
          >
            <option value={0}>Any</option>
            <option value={40}>40%</option>
            <option value={60}>60%</option>
            <option value={80}>80%</option>
          </select>
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-ink-soft">
          <input
            type="checkbox"
            checked={hideConflicts}
            onChange={(e) => setHideConflicts(e.target.checked)}
          />
          Hide roles that clash with my terms
        </label>
        <span className="ml-auto text-xs text-ink-faint">
          {shown.length} of {matches.length}
        </span>
      </div>

      <ul className="divide-y divide-ink/10">
        {shown.map((m) => (
          <li key={`${m.companySlug}-${m.roleTitle}`} className="py-5">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span
                className={cn(
                  "font-serif-display text-xl",
                  m.pct >= 70 ? "text-accent-dark" : "text-ink"
                )}
              >
                {m.pct}%
              </span>
              <Link href={`/company/${m.companySlug}`} className="font-medium text-ink underline-grow">
                {m.companyName}
              </Link>
              {m.demo && (
                <span className="border border-ink/20 bg-paper-dim px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-ink-soft">
                  Example
                </span>
              )}
              <span className="text-ink-soft">{m.roleTitle}</span>
            </div>
            <p className="mt-1.5 text-sm text-ink-soft">
              Because your evidence covers{" "}
              <span className="text-ink">{m.covered.map(capabilityLabel).join(", ")}</span>
              {m.missing.length > 0 && (
                <span className="text-ink-faint">
                  {" "}
                  · they also ask for {m.missing.map(capabilityLabel).join(", ")}
                </span>
              )}
            </p>
            <p className="mt-1 text-xs text-ink-faint">
              {[m.terms.compRange, m.terms.location, m.terms.arrangements.join("/")]
                .filter(Boolean)
                .join(" · ")}
              {m.conflict && (
                <span className="text-accent-dark"> · clashes with your terms</span>
              )}
            </p>
            {(() => {
              const interested = overrides[m.roleId] ?? m.interested;
              return (
                <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <button
                    type="button"
                    onClick={() => toggleInterest(m, interested)}
                    className={cn(
                      "border px-3 py-1.5 text-xs font-medium transition-colors",
                      interested
                        ? "border-evidence/40 bg-evidence-soft text-ink"
                        : "border-ink/20 text-ink hover:border-ink/50"
                    )}
                  >
                    {interested ? "Interest registered ✓ (withdraw)" : "Register interest"}
                  </button>
                  <span className="text-xs text-ink-faint">
                    {interested
                      ? `${m.companyName} can now see your profile. Withdraw any time; you never owe a reason.`
                      : `Lets ${m.companyName} see your profile, even while you're hidden. Nothing is sent.`}
                  </span>
                </div>
              );
            })()}
          </li>
        ))}
      </ul>

      {shown.length === 0 && (
        <p className="py-10 text-center text-sm text-ink-soft">
          Nothing passes those filters right now. Loosen them, or add evidence and watch the
          percentages move.
        </p>
      )}
    </div>
  );
}
