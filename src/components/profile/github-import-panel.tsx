"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, Sparkles } from "lucide-react";
import type { Project } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { importGitHubToProfile } from "@/server/actions/github-import";
import { publishDraftProject } from "@/server/actions/evidence";
import { CAPABILITY_DEFINITIONS } from "@/lib/capabilities";
import { cn } from "@/lib/utils";

/**
 * GitHub import's home since onboarding became four questions, plus the review desk where
 * drafts become evidence.
 *
 * The AI boundary, visible in the UI itself: suggested tags arrive UNCHECKED with a "suggested"
 * mark. The publish action requires the human's own ticks — a suggestion that never gets ticked
 * never existed. Pre-ticking is the one thing this component must never do; this codebase
 * deleted a whole onboarding step for that sin.
 */
export function GitHubImportPanel({ drafts }: { drafts: Project[] }) {
  const [username, setUsername] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Record<string, string[]>>({});
  const [importing, startImporting] = useTransition();

  function runImport() {
    setNotice(null);
    startImporting(async () => {
      const result = await importGitHubToProfile(username);
      if (!result.ok) {
        setNotice(result.error ?? "That didn't work — try again in a minute.");
        return;
      }
      setSuggestions((prev) => ({ ...prev, ...(result.suggestions ?? {}) }));
      setNotice(
        `${result.imported} repositor${result.imported === 1 ? "y" : "ies"} imported as drafts below.` +
          (result.aiEnriched
            ? ` ${result.aiEnriched} arrived pre-drafted from their READMEs — edit the words until they're yours, then tag what's true.`
            : " Describe each in your own words, then tag what's true.")
      );
    });
  }

  return (
    <section className="mx-auto max-w-[1000px] px-6 py-10 lg:px-10" aria-label="Import work from GitHub">
      <div className="border border-ink/15 bg-paper-dim p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-md">
            <p className="flex items-center gap-2 font-serif-display text-lg text-ink">
              Import from GitHub
            </p>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">
              Public repos arrive as drafts — nothing shows on your profile until you&rsquo;ve
              made each one yours and tagged it.
            </p>
          </div>
          <div className="flex items-end gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="gh-user" className="text-xs text-ink-soft">
                GitHub username
              </Label>
              <Input
                id="gh-user"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="octocat"
                className="w-44"
              />
            </div>
            <Button type="button" variant="outline" onClick={runImport} disabled={importing || !username.trim()}>
              {importing ? (
                <>
                  Importing <Loader2 className="h-4 w-4 animate-spin" />
                </>
              ) : (
                "Import"
              )}
            </Button>
          </div>
        </div>
        {notice && <p className="mt-4 border-t border-ink/10 pt-3 text-sm text-ink-soft">{notice}</p>}
      </div>

      {drafts.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
            Drafts — only you can see these
          </p>
          <div className="space-y-4">
            {drafts.map((d) => (
              <DraftReview key={d.id} draft={d} suggested={suggestions[d.id] ?? []} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function DraftReview({ draft, suggested }: { draft: Project; suggested: string[] }) {
  const [description, setDescription] = useState(draft.description);
  const [outcome, setOutcome] = useState(draft.outcome);
  const [ticked, setTicked] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [gone, setGone] = useState(false);
  const [publishing, startPublishing] = useTransition();

  if (gone) return null;

  function publish() {
    setError(null);
    startPublishing(async () => {
      const result = await publishDraftProject({
        projectId: draft.id,
        description,
        whatIBuilt: draft.whatIBuilt,
        problem: draft.problem,
        outcome,
        capabilities: ticked,
      });
      if (!result.ok) {
        setError(result.error ?? "Couldn't publish just now.");
        return;
      }
      setGone(true);
    });
  }

  return (
    <div className="border border-ink/15 bg-paper p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="font-serif-display text-[17px] text-ink">{draft.title}</p>
        <span className="border border-ink/20 bg-paper-dim px-2 py-0.5 text-[11px] uppercase tracking-wide text-ink-soft">
          Draft
        </span>
      </div>

      <div className="mt-4 space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor={`${draft.id}-desc`} className="text-xs text-ink-soft">
            What is it? (your words — edit anything that doesn&rsquo;t sound like you)
          </Label>
          <textarea
            id={`${draft.id}-desc`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            maxLength={400}
            className="w-full border border-ink/15 bg-paper px-3 py-2 text-sm leading-relaxed text-ink outline-none focus:border-ink/40"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${draft.id}-outcome`} className="text-xs text-ink-soft">
            What changed because of it? (optional)
          </Label>
          <Input
            id={`${draft.id}-outcome`}
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            maxLength={400}
          />
        </div>

        <div>
          <p className="text-xs text-ink-soft">
            Tick what this work genuinely proves{suggested.length > 0 && (
              <span className="text-ink-faint"> · <Sparkles className="inline h-3 w-3" /> marks AI suggestions — they count for nothing until you tick them</span>
            )}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {CAPABILITY_DEFINITIONS.map((c) => {
              const on = ticked.includes(c.tag);
              const hint = suggested.includes(c.tag);
              return (
                <button
                  key={c.tag}
                  type="button"
                  title={c.description}
                  onClick={() =>
                    setTicked((t) => (on ? t.filter((x) => x !== c.tag) : [...t, c.tag]))
                  }
                  className={cn(
                    "border px-2.5 py-1.5 text-xs transition-colors",
                    on
                      ? "border-accent bg-accent-soft text-accent-dark"
                      : hint
                        ? "border-ink/35 bg-paper text-ink"
                        : "border-ink/15 bg-paper text-ink-soft hover:border-ink/35"
                  )}
                >
                  {hint && !on && <Sparkles className="mr-1 inline h-3 w-3 text-ink-faint" />}
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <p className="border border-accent/30 bg-accent-soft px-3 py-2 text-sm text-ink">{error}</p>
        )}

        <Button type="button" variant="accent" size="sm" onClick={publish} disabled={publishing}>
          {publishing ? (
            <>
              Publishing <Loader2 className="h-3.5 w-3.5 animate-spin" />
            </>
          ) : (
            <>
              Publish as evidence <Check className="h-3.5 w-3.5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
