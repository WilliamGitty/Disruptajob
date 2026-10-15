"use client";

import { useState } from "react";
import { Check, Copy, Mail } from "lucide-react";
import type { Handoff } from "@/server/repositories/handoff";

/**
 * What a company gets the moment a candidate says yes.
 *
 * Shown only on acceptance, because that is the only point at which contact details exist for
 * anyone but their owner. The copy says so plainly — an employer who understands *why* they didn't
 * get an email address on day one is an employer who trusts that candidates are real people who
 * chose to be here.
 */
export function HandoffPanel({ handoff, roleTitle }: { handoff: Handoff; roleTitle: string }) {
  const [copied, setCopied] = useState<string | null>(null);

  if (!handoff.email) return null;

  const firstName = handoff.candidateName.split(" ")[0];
  const subject = `${roleTitle} — following up`;
  const body = `Hi ${firstName},\n\nThanks for coming back to me about ${roleTitle}. Good to hear you're open to a conversation.\n\nWhen would suit you for a short call?\n\n`;

  async function copy(label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  }

  const atsBlock = [
    `Name: ${handoff.candidateName}`,
    `Email: ${handoff.email}`,
    `Role: ${roleTitle}`,
    `Source: Disruptajob`,
    `Profile: ${handoff.profileUrl}`,
  ].join("\n");

  return (
    <div className="mt-4 border border-evidence/30 bg-evidence-soft/40 p-5">
      <p className="flex items-center gap-2 text-sm font-medium text-ink">
        <Check className="h-4 w-4 text-evidence" />
        {firstName} accepted — here are their details.
      </p>
      <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
        You&rsquo;re seeing this because they said yes. It wasn&rsquo;t available before, and it
        wouldn&rsquo;t have been if they&rsquo;d declined.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="border border-ink/15 bg-paper px-3 py-1.5 text-sm text-ink">
          {handoff.email}
        </span>
        <button
          type="button"
          onClick={() => copy("email", handoff.email!)}
          className="inline-flex items-center gap-1.5 text-sm text-ink-soft underline-grow hover:text-ink"
        >
          <Copy className="h-3.5 w-3.5" />
          {copied === "email" ? "Copied" : "Copy"}
        </button>
      </div>

      {handoff.channel === "email" && (
        <a
          href={`mailto:${handoff.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`}
          className="mt-4 inline-flex items-center gap-2 border border-ink/20 bg-paper px-4 py-2 text-sm text-ink transition-colors hover:border-ink"
        >
          <Mail className="h-4 w-4" />
          Open a draft in your mail app
        </a>
      )}

      {handoff.channel === "ats" && (
        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-faint">
            For {handoff.detail || "your ATS"}
          </p>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap border border-ink/15 bg-paper px-4 py-3 text-xs leading-relaxed text-ink">
            {atsBlock}
          </pre>
          <button
            type="button"
            onClick={() => copy("ats", atsBlock)}
            className="mt-2 inline-flex items-center gap-1.5 text-sm text-ink-soft underline-grow hover:text-ink"
          >
            <Copy className="h-3.5 w-3.5" />
            {copied === "ats" ? "Copied" : "Copy all"}
          </button>
        </div>
      )}
    </div>
  );
}
