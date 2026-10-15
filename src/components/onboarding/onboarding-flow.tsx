"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Loader2, SkipForward } from "lucide-react";
import type { Project } from "@/types";
import { Button } from "@/components/ui/button";
import { useCustomProjects, useOnboardingDraft } from "@/lib/client-store";
import { proposeCapabilities } from "@/lib/capabilities";
import { completeCandidateOnboarding } from "@/server/actions/onboarding";
import { trackEvent } from "@/server/actions/track";
import { EVENTS } from "@/lib/events";
import { cn } from "@/lib/utils";
import {
  AcceleratorsStep,
  BackgroundStep,
  DRAFT_OWNER_ID,
  EvidenceStep,
  HookStep,
  HypothesisStep,
  IdentityStep,
  NonNegotiablesStep,
  ScoreRevealStep,
  VisibilityStep,
} from "@/components/onboarding/onboarding-steps";

/** Set when the account already exists, so onboarding tops up a profile instead of creating one. */
export interface OnboardingSession {
  name: string;
  email: string;
}

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

export function OnboardingFlow({ session }: { session?: OnboardingSession }) {
  const { draft, patch, reset, hydrated } = useOnboardingDraft();
  const { items: customProjects, add, remove, update } = useCustomProjects();

  // Never written to the draft, because the draft is persisted to localStorage.
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [profileSlug, setProfileSlug] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();

  const ownProjects = useMemo(
    () => customProjects.filter((p) => p.ownerId === DRAFT_OWNER_ID),
    [customProjects]
  );
  const published = useMemo(
    () => ownProjects.filter((p) => p.status !== "draft"),
    [ownProjects]
  );

  if (!hydrated) {
    return <div className="min-h-[60vh]" aria-hidden />;
  }

  if (draft.completedAt && profileSlug) {
    return <CompletedView slug={profileSlug} onReset={handleReset} />;
  }

  const step = Math.min(draft.step, LAST_STEP);
  const meta = STEPS[step];

  // Per-step gate for the primary "continue" action. Everything past identity is skippable.
  const canContinue = (() => {
    if (step === 0) return draft.titleGap.trim().length > 0;
    if (step === 1) {
      const identified = draft.name.trim().length > 0 && draft.email.trim().length > 0;
      // The password is what turns this draft into a real account, so it's required here rather
      // than sprung on someone at the end after they've done all the work.
      return identified && (Boolean(session) || password.length >= 10);
    }
    if (step === 5) return published.length > 0; // need at least one real piece of evidence
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
    // Which step someone reaches is the whole point of measuring this: the drop-off tells you
    // which question is too much to ask, which no amount of looking at the page will.
    void trackEvent(EVENTS.onboardingStep, { step: clamped, label: STEPS[clamped].label });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /**
   * The only moment the draft becomes real.
   *
   * Everything up to here lives in the browser, so this is where the account, the profile and all
   * the evidence get written in one transaction. The draft is cleared only on success — if the
   * write fails, the work someone just spent twenty minutes on is still sitting in this browser.
   */
  function finish() {
    setError(null);

    // The password is deliberately not persisted with the draft, so someone who closed the tab
    // and came back no longer has one. Without this they'd be told "use at least 10 characters"
    // on a step that has no password field — send them to the field instead of describing it.
    if (!session && password.length < 10) {
      setError("Set a password to finish — we don't store it with your draft, so it's gone after a reload.");
      goTo(1);
      return;
    }

    startSaving(async () => {
      const result = await completeCandidateOnboarding({
        name: draft.name,
        email: draft.email,
        password: session ? undefined : password,
        location: draft.location,
        currentTitle: draft.currentTitle,
        availability: draft.availability,
        titleGap: draft.titleGap,
        nonNegotiables: draft.nonNegotiables,
        discoverability: draft.discoverability,
        blockedCompanies: draft.blockedCompanies,
        projects: published.map((p) => ({
          title: p.title,
          description: p.description,
          problem: p.problem,
          whatIBuilt: p.whatIBuilt,
          outcome: p.outcome,
          repoUrl: p.evidence.find((e) => e.label === "Repository")?.url,
          demoUrl: p.demoUrl,
          tools: p.tools,
          capabilities: p.capabilities,
        })),
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      void trackEvent(EVENTS.onboardingComplete, { projects: published.length });
      setProfileSlug(result.slug);
      patch({ completedAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      // The projects are in the database now; leaving them in localStorage would double them up
      // if this browser ever ran onboarding again.
      published.forEach((p) => remove((q) => q.id === p.id));
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function handleReset() {
    setProfileSlug(null);
    setPassword("");
    setError(null);
    reset();
  }

  function addProject(project: Project) {
    add(project);
    void trackEvent(EVENTS.onboardingProject);
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
        {step === 1 && (
          <IdentityStep
            draft={draft}
            patch={patch}
            password={password}
            onPasswordChange={setPassword}
            signedIn={Boolean(session)}
          />
        )}
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

      {error && (
        <p
          role="alert"
          className="mt-8 border border-accent/30 bg-accent-soft px-4 py-3 text-[15px] leading-relaxed text-ink"
        >
          {error}{" "}
          <span className="text-ink-soft">
            Nothing you&rsquo;ve written is lost — it&rsquo;s still here when you try again.
          </span>
        </p>
      )}

      <div className="mt-10 flex items-center justify-between border-t border-ink/10 pt-6">
        <Button
          type="button"
          variant="ghost"
          onClick={() => goTo(step - 1)}
          disabled={step === 0 || saving}
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
            <Button type="button" variant="accent" onClick={finish} disabled={saving}>
              {saving ? (
                <>
                  Saving your profile <Loader2 className="h-4 w-4 animate-spin" />
                </>
              ) : (
                <>
                  Finish <Check className="h-4 w-4" />
                </>
              )}
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

function CompletedView({ slug, onReset }: { slug: string; onReset: () => void }) {
  return (
    <div className="mx-auto max-w-[620px] px-6 py-20 text-center">
      <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center border border-evidence/30 bg-evidence-soft">
        <Check className="h-6 w-6 text-evidence" />
      </div>
      <h1 className="font-serif-display text-3xl text-ink">Your profile is saved.</h1>
      <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-ink-soft">
        You&apos;ve turned real work into a capability profile no CV could produce. Keep adding
        evidence as you ship — that&apos;s what makes you findable for the right reasons.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button asChild variant="accent">
          <Link href={`/profile/${slug}`}>
            View your profile <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button type="button" variant="ghost" onClick={onReset}>
          Start another draft
        </Button>
      </div>
    </div>
  );
}
