"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { withdrawRoleInterest } from "@/server/actions/interest";

interface Row {
  roleId: string;
  roleTitle: string;
  companyName: string;
  companySlug: string;
  demo: boolean;
  closed: boolean;
  since: string;
}

export function InterestedList({ rows }: { rows: Row[] }) {
  const [gone, setGone] = useState<Set<string>>(new Set());
  const [, startWithdrawing] = useTransition();

  function withdraw(roleId: string) {
    startWithdrawing(async () => {
      await withdrawRoleInterest(roleId);
      setGone((g) => new Set([...g, roleId]));
    });
  }

  const shown = rows.filter((r) => !gone.has(r.roleId));
  if (shown.length === 0) {
    return (
      <p className="mt-12 border border-ink/10 bg-paper-dim px-6 py-10 text-center text-[15px] text-ink-soft">
        All withdrawn. The wall is back up everywhere.
      </p>
    );
  }

  return (
    <ul className="mt-10 divide-y divide-ink/10">
      {shown.map((r) => (
        <li key={r.roleId} className="flex flex-wrap items-baseline gap-x-3 gap-y-2 py-4">
          <Link href={`/company/${r.companySlug}`} className="font-medium text-ink underline-grow">
            {r.companyName}
          </Link>
          {r.demo && (
            <span className="border border-ink/20 bg-paper-dim px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-ink-soft">
              Example
            </span>
          )}
          <span className="text-ink-soft">{r.roleTitle}</span>
          {r.closed && <span className="text-xs text-ink-faint">role now closed</span>}
          <span className="text-xs text-ink-faint">
            since{" "}
            {new Date(r.since).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
          </span>
          <button
            type="button"
            onClick={() => withdraw(r.roleId)}
            className="ml-auto border border-ink/20 px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-ink/50"
          >
            Withdraw
          </button>
        </li>
      ))}
    </ul>
  );
}
