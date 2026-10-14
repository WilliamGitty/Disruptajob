"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, SkipForward } from "lucide-react";
import type { Project } from "@/types";
import { Button } from "@/components/ui/button";
import { useCustomProjects, useOnboardingDraft } from "@/lib/client-store";
import { proposeCapabilities } from "@/lib/capabilities";
import { cn } from "@/lib/utils";
import {
  AcceleratorsStep,
  BackgroundStep,
  EvidenceStep,
  HookStep,
  HypothesisStep,
  IdentityStep,
  NonNegotiablesStep,
  ScoreRevealStep,
  VisibilityStep,
} from "@/components/onboarding/onboarding-steps";

const OWNER_ID = "william-sandford";

interface StepMeta {
  label: string;
  /** Whether this step can be skipped without input (accelerators, imports, extra evidence). */
  optional?: boolean;
}

const STEPS: StepMeta[] = [
  { label: "Your work" },
  { label: "Basics" },
  { label: "Your terms", optional: true },
  { label: "Capabilities", optional: true },
  { label: "Shortcuts", optional: true },
  { label: "Evidence" },
  { label: "Your scores", optional: true },
  { label: "Background", optional: true },
  { label: "Visibility" },
];

const LAST_STEP = STEPS.length - 1;

export function OnboardingFlow() {
  const { draft, patch, reset, hydrated } = useOnboardingDraft();
  const { items: customProjects, add, remove, update } = useCustomProjects();

  const ownProjects = useMemo(
    () => customProjects.filter((p) => p.ownerId === OWNER_ID),
    [customProjects]
  );
  const publishedCount = ownProjects.filter((p) => p.status !== "draft").length;

  if (!hydrated) {
    return <div className="min-h-[60vh]" aria-hidden />;
  }

  if (draft.completedAt) {
    return <CompletedView onReset={reset} />;
  }

  const step = Math.min(draft.step, LAST_STEP);
  const meta = STEPS[step];

  // Per-step gate for the primary "continue" action. Everything past identity is skippable.
  const canContinue = (() => {
    if (step === 0) return draft.titleGap.trim().length > 0;
    if (step === 1) return draft.name.trim().length > 0 && draft.email.trim().length > 0;
    if (step === 5) return publishedCount > 0; // need at least one real piece of evidence
    return true;
  })();

  function goTo(next: number) {
    const clamped = Math.max(0, Math.min(LAST_STEP, next));
    const partial: Partial<typeof draft> = { step: clamped, updatedAt: new Date().toISOString() };
    // When arriving at the capability step, seed the hypothesis from the candidate's own words.
    if (clamped === 3 && draft.hypothesisTags.length === 0 && draft.titleGap.trim()) {
      partial.hypothesisTags = proposeCapabilities(draft.titleGap);
    }
    patch(partial);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function finish() {
    patch({ completedAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function addProject(project: Project) {
    add(project);
  }
  function publishDraft(id: string, capabilities: string[]) {
    update((p) => p.id === id, (p) => ({ ...p, capabilities, status: "published" }));
  }
  function removeProject(id: string) {
    remove((p) => p.id === id);
  }
  function importGitHub(projects: Project[]) {
    projects.forEach(add);
  }

  return (
    <div className="mx-auto max-w-[760px] px-6 py-10 lg:py-14">
      <ProgressRail step={step} />

      <div className="mt-10 min-h-[320px]">
        {step === 0 && <HookStep draft={draft} patch={patch} />}
        {step === 1 && <IdentityStep draft={draft} patch={patch} />}
        {step === 2 && <NonNegotiablesStep draft={draft} patch={patch} />}
        {step === 3 && <HypothesisStep draft={draft} patch={patch} />}
        {step === 4 && <AcceleratorsStep draft={draft} patch={patch} onImportGitHub={importGitHub} />}
        {step === 5 && (
          <EvidenceStep
            draft={draft}
            patch={patch}
            ownProjects={ownProjects}
            onAddProject={addProject}
            onPublishDraft={publishDraft}
            onRemoveProject={removeProject}
          />
        )}
        {step === 6 && <ScoreRevealStep draft={draft} patch={patch} ownProjects={ownProjects} />}
        {step === 7 && <BackgroundStep draft={draft} patch={patch} />}
        {step === 8 && <VisibilityStep draft={draft} patch={patch} />}
      </div>

      <div className="mt-10 flex items-center justify-between border-t border-ink/10 pt-6">
        <Button
          type="button"
          variant="ghost"
          onClick={() => goTo(step - 1)}
          disabled={step === 0}
          className={cn(step === 0 && "invisible")}
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        <div className="flex items-center gap-3">
          {meta.optional && step !== LAST_STEP && (
            <Button type="button" variant="ghost" onClick={() => goTo(step + 1)}>
              <SkipForward className="h-4 w-4" /> Skip
            </Button>
          )}
          {step === LAST_STEP ? (
            <Button type="button" variant="accent" onClick={finish}>
              Finish <Check className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="button" variant="accent" onClick={() => goTo(step + 1)} disabled={!canContinue}>
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-ink-faint">
        Progress saves automatically — you can leave and pick up right here any time.
      </p>
    </div>
  );
}

function ProgressRail({ step }: { step: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-ink-faint">
        <span className="font-medium text-ink">{STEPS[step].label}</span>
        <span>
          Step {step + 1} of {STEPS.length}
        </span>
      </div>
      <div className="mt-3 flex gap-1.5">
        {STEPS.map((s, i) => (
          <div
            key={s.label}
            className={cn("h-1 flex-1 transition-colors", i <= step ? "bg-accent" : "bg-ink/10")}
          />
        ))}
      </div>
    </div>
  );
}

function CompletedView({ onReset }: { onReset: () => void }) {
  return (
    <div className="mx-auto max-w-[620px] px-6 py-20 text-center">
      <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center border border-evidence/30 bg-evidence-soft">
        <Check className="h-6 w-6 text-evidence" />
      </div>
      <h1 className="font-serif-display text-3xl text-ink">Your profile is live for you.</h1>
      <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-ink-soft">
        You&apos;ve turned real work into a capability profile no CV could produce. Keep adding evidence as you ship —
        that&apos;s what makes you findable for the right reasons.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button asChild variant="accent">
          <Link href={`/profile/${OWNER_ID}`}>
            View your profile <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button type="button" variant="ghost" onClick={onReset}>
          Start over
        </Button>
      </div>
    </div>
  );
}
