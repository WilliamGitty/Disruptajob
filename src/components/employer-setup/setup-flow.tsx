"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompanySetup, useCustomRoles } from "@/lib/client-store";
import { CURRENT_EMPLOYER_ID } from "@/lib/current-user";
import { cn } from "@/lib/utils";
import {
  CompanyStep,
  ReviewStep,
  TermsStep,
  WorkStep,
} from "@/components/employer-setup/setup-steps";

const STEPS = [
  { label: "Your company" },
  { label: "The work" },
  { label: "Terms" },
  { label: "Who matches" },
];

const LAST_STEP = STEPS.length - 1;

export function SetupFlow() {
  const { setup, patch, reset, hydrated } = useCompanySetup();
  const { add: addRole } = useCustomRoles();

  if (!hydrated) return <div className="min-h-[60vh]" aria-hidden />;
  if (setup.completedAt) return <PublishedView onReset={reset} />;

  const step = Math.min(setup.step, LAST_STEP);

  // Gate only on what a candidate genuinely needs to see. Terms are strongly encouraged but a
  // company shouldn't be blocked from publishing because they haven't settled a range.
  const canContinue = (() => {
    if (step === 0) return setup.name.trim().length > 0 && setup.blurb.trim().length > 0;
    if (step === 1)
      return setup.roleTitle.trim().length > 0 && setup.workExamples.length > 0;
    return true;
  })();

  function goTo(next: number) {
    const clamped = Math.max(0, Math.min(LAST_STEP, next));
    patch({ step: clamped, updatedAt: new Date().toISOString() });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function publish() {
    addRole({
      id: `role-${Date.now()}`,
      companyId: CURRENT_EMPLOYER_ID,
      title: setup.roleTitle || "Untitled role",
      whyThisRole: setup.whyThisRole,
      workExamples: setup.workExamples,
      terms: setup.terms,
      status: "open",
      createdAt: new Date().toISOString(),
    });
    patch({ completedAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="mx-auto max-w-[760px] px-6 py-10 lg:py-14">
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

      <div className="mt-10 min-h-[320px]">
        {step === 0 && <CompanyStep setup={setup} patch={patch} />}
        {step === 1 && <WorkStep setup={setup} patch={patch} />}
        {step === 2 && <TermsStep setup={setup} patch={patch} />}
        {step === 3 && <ReviewStep setup={setup} patch={patch} />}
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

        {step === LAST_STEP ? (
          <Button type="button" variant="accent" onClick={publish}>
            Publish this role <Check className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            variant="accent"
            onClick={() => goTo(step + 1)}
            disabled={!canContinue}
          >
            Continue <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      <p className="mt-6 text-center text-xs text-ink-faint">
        Saves as you go — close this and pick up where you left off.
      </p>
    </div>
  );
}

function PublishedView({ onReset }: { onReset: () => void }) {
  return (
    <div className="mx-auto max-w-[620px] px-6 py-20 text-center">
      <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center border border-evidence/30 bg-evidence-soft">
        <Check className="h-6 w-6 text-evidence" />
      </div>
      <h1 className="font-serif-display text-3xl text-ink">Your role is live.</h1>
      <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-ink-soft">
        Candidates can now see the actual work rather than a job ad — and you can work through
        people who already have evidence for it.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button asChild variant="accent">
          <Link href="/employer/pipeline">
            Open your pipeline <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/employer">Search candidates</Link>
        </Button>
        <Button type="button" variant="ghost" onClick={onReset}>
          Start over
        </Button>
      </div>
    </div>
  );
}
