"use client";

import { useEffect, useState } from "react";
import { Check, Globe, Loader2 } from "lucide-react";
import type { CompanySetupDraft, CompanyStage, WorkArrangement, WorkExample } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChipInput } from "@/components/ui/chip-input";
import { WorkExampleEditor } from "@/components/employer-setup/work-example-editor";
import { JobDescriptionDrop } from "@/components/employer-setup/job-description-drop";
import type { JobDescriptionDraft } from "@/lib/job-description";
import { companyNameFromDomain } from "@/lib/company-imports";
import { previewMatchCount, type MatchPreview } from "@/server/actions/match-preview";
import { capabilityLabel } from "@/lib/capabilities";
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

export function CompanyStep({
  setup,
  patch,
  password,
  onPasswordChange,
  signedIn,
}: StepProps & {
  password: string;
  onPasswordChange: (value: string) => void;
  /** An employer already signed in keeps the account they have — don't ask again. */
  signedIn: boolean;
}) {
  // Nothing is fetched — the name is derived from the domain, which is the only thing we can
  // honestly do without reading a stranger's website. Overwrites nothing already typed.
  function applyDomainAsName() {
    if (!setup.website.trim()) return;
    const { name } = companyNameFromDomain(setup.website);
    patch({ name: setup.name.trim() || name, websiteConnected: true });
  }

  return (
    <div className="space-y-6">
      <StepIntro
        eyebrow="Who you are"
        title="Who you are, briefly."
        body="None of this affects who you match with, that comes entirely from the work you describe on the next step."
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
                applyDomainAsName();
              }
            }}
          />
          <Button variant="outline" onClick={applyDomainAsName} disabled={!setup.website.trim()}>
            {setup.websiteConnected ? (
              <>
                <Check className="h-4 w-4 text-evidence" /> Used
              </>
            ) : (
              <>
                <Globe className="h-4 w-4" /> Use as name
              </>
            )}
          </Button>
        </div>
        <p className="text-xs text-ink-faint">
          We don&rsquo;t read your site, this just saves you typing your own name. Everything that
          matters, you write yourself.
        </p>
      </Field>

      <Field label="Company name">
        <Input
          value={setup.name}
          onChange={(e) => patch({ name: e.target.value })}
          disabled={signedIn}
        />
      </Field>

      {!signedIn && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Your work email">
            <Input
              type="email"
              placeholder="you@company.com"
              value={setup.contactEmail}
              onChange={(e) => patch({ contactEmail: e.target.value })}
            />
          </Field>
          <Field label="Password">
            <Input
              type="password"
              placeholder="At least 10 characters"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              autoComplete="new-password"
            />
          </Field>
          <p className="text-xs leading-relaxed text-ink-faint sm:col-span-2">
            Your account is created when you publish, not now, so you can look around first. The
            password is never saved with your draft.
          </p>
        </div>
      )}

      <Field label="What you do, in a sentence">
        <Textarea
          rows={3}
          placeholder="We build the software that runs automated warehouses."
          value={setup.blurb}
          onChange={(e) => patch({ blurb: e.target.value })}
        />
        <p className="text-xs text-ink-faint">
          Plain language beats positioning here, a candidate is deciding whether they understand
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
  /**
   * Fill the blanks a parsed job description can legitimately fill.
   *
   * Only empty fields are written to: someone who has already typed a role title and then drops a
   * document should not watch their own words get overwritten. Work examples are appended as
   * unconfirmed entries with no capabilities applied — the company ticks those itself, because a
   * tag nobody confirmed is exactly the keyword matching this product replaces.
   */
  function applyJobDescription(draft: JobDescriptionDraft) {
    const added: WorkExample[] = draft.workExamples.map((w, i) => ({
      id: `we-jd-${Date.now()}-${i}`,
      title: w.title,
      description: w.description,
      whatYoudDo: [],
      capabilities: [],
      attachments: [],
    }));

    patch({
      roleTitle: setup.roleTitle.trim() || draft.roleTitle,
      whyThisRole: setup.whyThisRole.trim() || draft.whyThisRole,
      location: setup.location.trim() || draft.location || "",
      workExamples: [...setup.workExamples, ...added],
      terms: {
        ...setup.terms,
        compRange: setup.terms.compRange?.trim() || draft.compRange || "",
        workArrangements:
          setup.terms.workArrangements.length > 0
            ? setup.terms.workArrangements
            : draft.workArrangements,
      },
      updatedAt: new Date().toISOString(),
    });
  }

  return (
    <div className="space-y-6">
      <StepIntro
        eyebrow="The work, not the job title"
        title="What would they actually be doing?"
        body="We don't take job descriptions. Describe one or two real pieces of work this person would own, it's what candidates read, and it's what we match their evidence against."
      />

      <JobDescriptionDrop onApply={applyJobDescription} />

      <Field label="What would you call this role?">
        <Input
          placeholder="Operations Lead"
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
        body="Candidates here have already stated what they need. Posting your range lets us tell both sides immediately whether this is worth a conversation, and nobody wastes three weeks finding out."
      />

      <Field label="Compensation range">
        <Input
          placeholder="£65,000 – £80,000"
          value={terms.compRange ?? ""}
          onChange={(e) => patchTerms({ compRange: e.target.value })}
        />
        <p className="text-xs text-ink-faint">
          Shown to candidates. We never show you theirs, we only tell you whether yours clears it.
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
            placeholder="London, 2 days a week onsite"
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

  /*
   * Real numbers or nothing (audit D1). This step used to render four invented people from the
   * demo dataset as "who already has evidence for this" — at the exact moment a real company
   * decides whether to publish. Now it fetches the actual aggregate: identities stay behind the
   * signed-in gate and appear on the role page after publishing.
   */
  // The fetched count is stored WITH the capability set it answered, and rendered only while
  // that set is still current — no state resets in effects, no stale number for a changed set.
  const [fetched, setFetched] = useState<{ key: string; data: MatchPreview } | null>(null);
  const requiredKey = required.join("|");
  const preview = fetched && fetched.key === requiredKey ? fetched.data : null;

  useEffect(() => {
    if (!requiredKey) return;
    let cancelled = false;
    previewMatchCount(requiredKey.split("|"), setup.name).then((data) => {
      if (!cancelled) setFetched({ key: requiredKey, data });
    });
    return () => {
      cancelled = true;
    };
    // setup.name changes shouldn't refire a count mid-typing; the capabilities are the signal.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requiredKey]);

  return (
    <div className="space-y-8">
      <StepIntro
        eyebrow="Before you publish"
        title="Who you'll be matched against."
        body="Matching is a set overlap between the capabilities your work demands and the evidence people have published, not a keyword search of CVs."
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

          {preview === null ? (
            <p className="flex items-center gap-2 text-sm text-ink-faint">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Counting real matches…
            </p>
          ) : preview.matching > 0 ? (
            <div className="border border-evidence/30 bg-evidence-soft/40 p-6">
              <p className="font-serif-display text-2xl text-ink">
                {preview.matching} {preview.matching === 1 ? "person" : "people"} here already{" "}
                {preview.matching === 1 ? "has" : "have"} evidence for this work.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Out of {preview.discoverable} discoverable {preview.discoverable === 1 ? "profile" : "profiles"}
                {preview.total > preview.discoverable
                  ? ` (${preview.total - preview.discoverable} more are keeping themselves hidden)`
                  : ""}
                . Publish, and you&rsquo;ll see them ranked with the actual projects behind each score.
              </p>
            </div>
          ) : (
            <div className="border border-ink/15 bg-paper-dim/50 p-6">
              <p className="font-serif-display text-xl text-ink">
                Nobody here has evidenced this combination yet, you&rsquo;d be early.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                We&rsquo;re new and we won&rsquo;t pretend otherwise: {preview.discoverable}{" "}
                discoverable {preview.discoverable === 1 ? "profile is" : "profiles are"} on the
                platform today. Publishing costs nothing, your role is matched against every new
                profile as it arrives, and early roles are what tell candidates which evidence is
                worth writing up.
              </p>
            </div>
          )}

          <p className="text-sm text-ink-soft">
            Publish to see the ranked people and the work behind their scores.
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
