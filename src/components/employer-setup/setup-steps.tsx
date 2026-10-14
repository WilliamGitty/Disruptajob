"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Globe, Loader2 } from "lucide-react";
import type { CompanySetupDraft, CompanyStage, WorkArrangement } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChipInput } from "@/components/ui/chip-input";
import { WorkExampleEditor } from "@/components/employer-setup/work-example-editor";
import { importFromWebsite } from "@/lib/company-imports";
import { matchCandidatesForCapabilities } from "@/lib/role-matching";
import { capabilityLabel } from "@/lib/capabilities";
import { CANDIDATES } from "@/lib/mock-data";
import { InitialsMark } from "@/components/ui/initials-mark";
import { cn } from "@/lib/utils";

export interface StepProps {
  setup: CompanySetupDraft;
  patch: (partial: Partial<CompanySetupDraft>) => void;
}

const STAGES: { value: CompanyStage; label: string }[] = [
  { value: "pre-seed", label: "Pre-seed" },
  { value: "seed", label: "Seed" },
  { value: "series-a", label: "Series A" },
  { value: "series-b", label: "Series B" },
  { value: "growth", label: "Growth" },
  { value: "established", label: "Established" },
];

const ARRANGEMENTS: { value: WorkArrangement; label: string }[] = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "Onsite" },
];

// --- Step 1: Company -------------------------------------------------------

export function CompanyStep({ setup, patch }: StepProps) {
  const [connecting, setConnecting] = useState(false);
  const [suggested, setSuggested] = useState<string[]>([]);

  async function connect() {
    if (!setup.website.trim()) return;
    setConnecting(true);
    const imported = await importFromWebsite(setup.website);
    patch({
      name: imported.name || setup.name,
      blurb: imported.blurb || setup.blurb,
      stage: imported.stage ?? setup.stage,
      teamSize: imported.teamSize || setup.teamSize,
      location: imported.location || setup.location,
      websiteConnected: true,
    });
    setSuggested(imported.suggestedCapabilities);
    setConnecting(false);
  }

  return (
    <div className="space-y-6">
      <StepIntro
        eyebrow="Who you are"
        title="Start with your website."
        body="We'll pull the basics so you're not typing what's already public. Everything stays editable — and nothing here affects who you match with."
      />

      <Field label="Company website">
        <div className="flex gap-2">
          <Input
            placeholder="meridianrobotics.com"
            value={setup.website}
            onChange={(e) => patch({ website: e.target.value, websiteConnected: false })}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void connect();
              }
            }}
          />
          <Button variant="outline" onClick={connect} disabled={!setup.website.trim() || connecting}>
            {connecting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Reading
              </>
            ) : setup.websiteConnected ? (
              <>
                <Check className="h-4 w-4 text-evidence" /> Connected
              </>
            ) : (
              <>
                <Globe className="h-4 w-4" /> Connect
              </>
            )}
          </Button>
        </div>
        {suggested.length > 0 && (
          <p className="text-xs text-ink-faint">
            Looks like you work on {suggested.map(capabilityLabel).join(", ")} — we&rsquo;ll
            suggest those when you describe the work. You decide.
          </p>
        )}
      </Field>

      <Field label="Company name">
        <Input value={setup.name} onChange={(e) => patch({ name: e.target.value })} />
      </Field>

      <Field label="What you do, in a sentence">
        <Textarea
          rows={3}
          placeholder="We build the software that runs automated warehouses."
          value={setup.blurb}
          onChange={(e) => patch({ blurb: e.target.value })}
        />
        <p className="text-xs text-ink-faint">
          Plain language beats positioning here — a candidate is deciding whether they understand
          what you do.
        </p>
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Team size">
          <Input
            placeholder="120–180"
            value={setup.teamSize}
            onChange={(e) => patch({ teamSize: e.target.value })}
          />
        </Field>
        <Field label="Where you're based">
          <Input
            placeholder="London, UK"
            value={setup.location}
            onChange={(e) => patch({ location: e.target.value })}
          />
        </Field>
      </div>

      <Field label="Stage">
        <div className="flex flex-wrap gap-2">
          {STAGES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => patch({ stage: s.value })}
              aria-pressed={setup.stage === s.value}
              className={cn(
                "border px-3.5 py-2 text-sm transition-colors",
                setup.stage === s.value
                  ? "border-accent bg-accent-soft text-ink"
                  : "border-ink/15 text-ink-soft hover:border-ink"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </Field>
    </div>
  );
}

// --- Step 2: The work ------------------------------------------------------

export function WorkStep({ setup, patch }: StepProps) {
  return (
    <div className="space-y-6">
      <StepIntro
        eyebrow="The work, not the job title"
        title="What would they actually be doing?"
        body="We don't take job descriptions. Describe one or two real pieces of work this person would own — it's what candidates read, and it's what we match their evidence against."
      />

      <Field label="What would you call this role?">
        <Input
          placeholder="AI Operations Lead"
          value={setup.roleTitle}
          onChange={(e) => patch({ roleTitle: e.target.value })}
        />
      </Field>

      <Field label="Why does this role exist?">
        <Textarea
          rows={3}
          placeholder="Our dispatch team runs the hardest decisions of the day out of a spreadsheet one person maintains."
          value={setup.whyThisRole}
          onChange={(e) => patch({ whyThisRole: e.target.value })}
        />
        <p className="text-xs text-ink-faint">
          The honest business reason. Candidates can tell the difference between this and
          boilerplate.
        </p>
      </Field>

      <div className="space-y-3 border-t border-ink/10 pt-6">
        <Label>Real work they&rsquo;d own</Label>
        <WorkExampleEditor
          examples={setup.workExamples}
          onChange={(workExamples) => patch({ workExamples })}
        />
      </div>
    </div>
  );
}

// --- Step 3: Terms ---------------------------------------------------------

export function TermsStep({ setup, patch }: StepProps) {
  const terms = setup.terms;

  function patchTerms(partial: Partial<typeof terms>) {
    patch({ terms: { ...terms, ...partial } });
  }

  function toggleArrangement(value: WorkArrangement) {
    const next = terms.workArrangements.includes(value)
      ? terms.workArrangements.filter((a) => a !== value)
      : [...terms.workArrangements, value];
    patchTerms({ workArrangements: next });
  }

  return (
    <div className="space-y-6">
      <StepIntro
        eyebrow="Your side of the deal"
        title="Be straight about the terms."
        body="Candidates here have already stated what they need. Posting your range lets us tell both sides immediately whether this is worth a conversation — and nobody wastes three weeks finding out."
      />

      <Field label="Compensation range">
        <Input
          placeholder="£65,000 – £80,000"
          value={terms.compRange ?? ""}
          onChange={(e) => patchTerms({ compRange: e.target.value })}
        />
        <p className="text-xs text-ink-faint">
          Shown to candidates. We never show you theirs — we only tell you whether yours clears it.
        </p>
      </Field>

      <Field label="Working arrangement">
        <div className="flex flex-wrap gap-2">
          {ARRANGEMENTS.map((a) => (
            <button
              key={a.value}
              type="button"
              onClick={() => toggleArrangement(a.value)}
              aria-pressed={terms.workArrangements.includes(a.value)}
              className={cn(
                "border px-3.5 py-2 text-sm transition-colors",
                terms.workArrangements.includes(a.value)
                  ? "border-accent bg-accent-soft text-ink"
                  : "border-ink/15 text-ink-soft hover:border-ink"
              )}
            >
              {a.label}
            </button>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Location expectation">
          <Input
            placeholder="London — 2 days a week onsite"
            value={terms.location ?? ""}
            onChange={(e) => patchTerms({ location: e.target.value })}
          />
        </Field>
        <Field label="When you need someone">
          <Input
            placeholder="Within 2 months"
            value={terms.startWindow ?? ""}
            onChange={(e) => patchTerms({ startWindow: e.target.value })}
          />
        </Field>
      </div>

      <Field label="Things you genuinely can't flex on">
        <ChipInput
          values={terms.constraints}
          onChange={(constraints) => patchTerms({ constraints })}
          placeholder="e.g. UK work authorisation required"
        />
        <p className="text-xs text-ink-faint">
          The honest counterpart to a candidate&rsquo;s deal-breakers. Better said now than at offer
          stage.
        </p>
      </Field>
    </div>
  );
}

// --- Step 4: Review + the payoff ------------------------------------------

export function ReviewStep({ setup }: StepProps) {
  const required = [...new Set(setup.workExamples.flatMap((w) => w.capabilities))];
  const matches = matchCandidatesForCapabilities(required).slice(0, 4);

  return (
    <div className="space-y-8">
      <StepIntro
        eyebrow="Before you publish"
        title="Here's who already has evidence for this."
        body="Matched on the capabilities your work actually demands — not a keyword search of CVs. Every one of these people has projects backing it up."
      />

      {required.length === 0 ? (
        <p className="border border-dashed border-ink/20 p-8 text-center text-sm text-ink-soft">
          Add a piece of work with capabilities tagged, and we&rsquo;ll show you who matches.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {required.map((tag) => (
              <span
                key={tag}
                className="border border-ink/15 bg-paper px-2.5 py-1 text-xs text-ink-soft"
              >
                {capabilityLabel(tag)}
              </span>
            ))}
          </div>

          {matches.length === 0 ? (
            <p className="text-sm text-ink-soft">
              Nobody discoverable matches this combination yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-px border border-ink/10 bg-ink/10 sm:grid-cols-2">
              {matches.map((m) => {
                const candidate = CANDIDATES.find((c) => c.id === m.candidateId);
                if (!candidate) return null;
                return (
                  <div key={m.candidateId} className="bg-paper p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex gap-3">
                        <InitialsMark
                          initials={candidate.avatarInitials}
                          index={candidate.accentIndex}
                        />
                        <div>
                          <p className="font-serif-display text-base text-ink">{candidate.name}</p>
                          <p className="text-xs text-ink-faint">{candidate.location}</p>
                        </div>
                      </div>
                      <span className="shrink-0 border border-accent/30 bg-accent-soft px-2 py-1 text-xs font-medium text-accent-dark">
                        {m.fitScore}%
                      </span>
                    </div>
                    <p className="mt-3 text-xs text-ink-soft">
                      Evidence for {m.matchedCapabilities.length} of {required.length} —{" "}
                      {m.matchedCapabilities.slice(0, 2).map(capabilityLabel).join(", ")}
                      {m.matchedCapabilities.length > 2 ? "…" : ""}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          <p className="text-sm text-ink-soft">
            Publish and you can open any of these, see the actual projects behind the score, and
            start a conversation.{" "}
            <Link href="/employer" className="text-ink underline-grow">
              Or search more broadly
            </Link>
            .
          </p>
        </>
      )}
    </div>
  );
}

// --- shared layout helpers ------------------------------------------------

function StepIntro({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div className="max-w-xl">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
        {eyebrow}
      </p>
      <h2 className="font-serif-display text-2xl text-ink sm:text-3xl">{title}</h2>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{body}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
