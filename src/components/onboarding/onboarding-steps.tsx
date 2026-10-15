"use client";

import { useState } from "react";
import {
  Check,
  FolderGit2,
  Loader2,
  Lock,
  Plus,
  Trash2,
} from "lucide-react";
import type {
  AvailabilityStatus,
  Discoverability,
  OnboardingDraft,
  Project,
  WorkArrangement,
} from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ChipInput } from "@/components/ui/chip-input";
import { CapabilityPicker } from "@/components/ui/capability-picker";
import { WorkPromptDeck } from "@/components/onboarding/work-prompt-deck";
import type { WorkPrompt } from "@/lib/work-prompts";
import { StrengthBar } from "@/components/ui/strength-bar";
import { capabilityLabel } from "@/lib/capabilities";
import { computeCapabilities } from "@/lib/capability-scoring";
import { isSafeHttpUrl, slugify, uniqueSlug } from "@/lib/project-input";
import { importGitHubRepos } from "@/server/actions/github-import";
import { cn } from "@/lib/utils";

export interface StepProps {
  draft: OnboardingDraft;
  patch: (partial: Partial<OnboardingDraft>) => void;
}

/**
 * Owner id for work captured during onboarding.
 *
 * These projects live in the browser until the final step writes them to the database under the
 * real candidate id, so this is only ever a local grouping key. It used to be the literal string
 * "william-sandford", which meant everyone's onboarding wrote into one seeded person's profile.
 */
export const DRAFT_OWNER_ID = "onboarding-draft";

// --- shared small controls ------------------------------------------------

function OptionButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "border px-4 py-2 text-sm transition-colors",
        active ? "border-accent bg-accent-soft text-ink" : "border-ink/15 text-ink-soft hover:border-ink"
      )}
    >
      {children}
    </button>
  );
}

const AVAILABILITY_OPTIONS: { value: AvailabilityStatus; label: string }[] = [
  { value: "open", label: "Open to opportunities" },
  { value: "selectively-open", label: "Selectively open" },
  { value: "not-looking", label: "Not looking right now" },
];

const ARRANGEMENT_OPTIONS: { value: WorkArrangement; label: string }[] = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "Onsite" },
];

// --- Step 1: Hook ---------------------------------------------------------

export function HookStep({ draft, patch }: StepProps) {
  return (
    <div className="space-y-6">
      <StepIntro
        eyebrow="Let's start with the real you"
        title="What do you actually do that your job title doesn't capture?"
        body="This is the thing no CV ever asks. Write it like you'd say it to a friend — we'll shape it into your profile later."
      />
      <Textarea
        autoFocus
        rows={4}
        maxLength={400}
        placeholder="My title says Operations Associate, but I actually build the internal tools the whole team runs on…"
        value={draft.titleGap}
        onChange={(e) => patch({ titleGap: e.target.value })}
      />
      <p className="flex items-center gap-2 text-sm text-ink-faint">
        <Lock className="h-3.5 w-3.5" />
        Private by default. Your current employer will never see this unless you choose to be found.
      </p>
    </div>
  );
}

// --- Step 2: Identity -----------------------------------------------------

export function IdentityStep({
  draft,
  patch,
  password,
  onPasswordChange,
  signedIn,
}: StepProps & {
  password: string;
  onPasswordChange: (value: string) => void;
  /** Someone already signed in keeps the credentials they have — don't ask again. */
  signedIn: boolean;
}) {
  return (
    <div className="space-y-6">
      <StepIntro
        eyebrow="The basics"
        title="A few details, then we're onto your work."
        body="No CV required. This is the minimum we need — everything heavier is optional and comes later."
      />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Name">
          <Input
            value={draft.name}
            onChange={(e) => patch({ name: e.target.value })}
            placeholder="Alex Morgan"
            disabled={signedIn}
          />
        </Field>
        <Field label="Email">
          <Input
            type="email"
            value={draft.email}
            onChange={(e) => patch({ email: e.target.value })}
            placeholder="you@example.com"
            disabled={signedIn}
          />
        </Field>
        {!signedIn && (
          <Field label="Password">
            <Input
              type="password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="At least 10 characters"
              autoComplete="new-password"
            />
            <p className="mt-2 text-xs leading-relaxed text-ink-faint">
              The only thing we ask you to remember. Your draft stays in this browser as you go —
              the password is never saved alongside it.
            </p>
          </Field>
        )}
        <Field label="Location">
          <Input
            value={draft.location}
            onChange={(e) => patch({ location: e.target.value })}
            placeholder="London, UK"
          />
        </Field>
        <Field label="Current job title">
          <Input
            value={draft.currentTitle}
            onChange={(e) => patch({ currentTitle: e.target.value })}
            placeholder="Operations Associate"
          />
        </Field>
      </div>
      <Field label="Availability">
        <div className="flex flex-wrap gap-2">
          {AVAILABILITY_OPTIONS.map((o) => (
            <OptionButton
              key={o.value}
              active={draft.availability === o.value}
              onClick={() => patch({ availability: o.value })}
            >
              {o.label}
            </OptionButton>
          ))}
        </div>
      </Field>
    </div>
  );
}

// --- Step 3: Non-negotiables ---------------------------------------------

export function NonNegotiablesStep({ draft, patch }: StepProps) {
  const nn = draft.nonNegotiables;
  function patchNn(partial: Partial<typeof nn>) {
    patch({ nonNegotiables: { ...nn, ...partial } });
  }

  function toggleArrangement(value: WorkArrangement) {
    const has = nn.workArrangements.includes(value);
    patchNn({
      workArrangements: has
        ? nn.workArrangements.filter((a) => a !== value)
        : [...nn.workArrangements, value],
    });
  }

  return (
    <div className="space-y-6">
      <StepIntro
        eyebrow="Your terms"
        title="Your non-negotiables."
        body="You're setting the terms here, not applying. This stays private and is only ever used to filter what reaches you — never shown to employers."
      />
      <Field label="Roles / seniority you'd consider">
        <ChipInput
          values={nn.roleTypes}
          onChange={(roleTypes) => patchNn({ roleTypes })}
          placeholder="e.g. Head of Internal Tools"
        />
      </Field>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Compensation floor (private)">
          <Input
            value={nn.compFloor ?? ""}
            onChange={(e) => patchNn({ compFloor: e.target.value })}
            placeholder="£75,000"
          />
        </Field>
        <Field label="Location constraint (optional)">
          <Input
            value={nn.locationConstraint ?? ""}
            onChange={(e) => patchNn({ locationConstraint: e.target.value })}
            placeholder="London or remote-first only"
          />
        </Field>
      </div>
      <Field label="Work arrangement">
        <div className="flex flex-wrap gap-2">
          {ARRANGEMENT_OPTIONS.map((o) => (
            <OptionButton
              key={o.value}
              active={nn.workArrangements.includes(o.value)}
              onClick={() => toggleArrangement(o.value)}
            >
              {o.label}
            </OptionButton>
          ))}
        </div>
      </Field>
      <Field label="Deal-breakers">
        <ChipInput
          values={nn.dealbreakers}
          onChange={(dealbreakers) => patchNn({ dealbreakers })}
          placeholder="e.g. no on-call, no 5-day RTO"
        />
      </Field>
    </div>
  );
}

// --- Step 4: Capability hypothesis ---------------------------------------

export function HypothesisStep({ draft, patch }: StepProps) {
  return (
    <div className="space-y-6">
      <StepIntro
        eyebrow="Your starting scoreboard"
        title="Here's what we think you're good at."
        body="Based on what you told us. These bars are empty on purpose — you'll fill them with real evidence next. Adjust the set so it feels like you."
      />
      <div className="divide-y divide-ink/10 border-y border-ink/10">
        {draft.hypothesisTags.length === 0 && (
          <p className="py-5 text-sm text-ink-faint">
            No capabilities selected yet — pick a few below to start your scoreboard.
          </p>
        )}
        {draft.hypothesisTags.map((tag) => (
          <div key={tag} className="flex items-center gap-6 py-4">
            <span className="w-48 shrink-0 text-[15px] font-medium text-ink sm:w-56">
              {capabilityLabel(tag)}
            </span>
            <StrengthBar score={0} className="flex-1" />
            <span className="w-28 shrink-0 text-right text-xs text-ink-faint">no evidence yet</span>
          </div>
        ))}
      </div>
      <Field label="Adjust your capabilities">
        <CapabilityPicker
          selected={draft.hypothesisTags}
          onChange={(hypothesisTags) => patch({ hypothesisTags })}
        />
      </Field>
    </div>
  );
}

// --- Step 5: Accelerators -------------------------------------------------

export function AcceleratorsStep({
  patch,
  onImportGitHub,
}: StepProps & { onImportGitHub: (projects: Project[]) => void }) {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imported, setImported] = useState<number | null>(null);

  async function doGitHub() {
    setLoading(true);
    setError(null);
    const result = await importGitHubRepos(username);
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    onImportGitHub(result.projects);
    setImported(result.projects.length);
    patch({ githubConnected: true });
  }

  return (
    <div className="space-y-6">
      <StepIntro
        eyebrow="Optional — skip this entirely"
        title="Got public code? We can save you some typing."
        body="Repos come in as drafts for you to review and tag. Nothing publishes until you confirm it, and an import can never set your capability scores — only work you've tagged does that."
      />

      <div className="border border-ink/15 p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-paper-dim/60 text-ink-soft">
            <FolderGit2 className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-ink">Import from GitHub</p>
            <p className="mt-0.5 text-xs leading-relaxed text-ink-faint">
              Public repositories only. No sign-in, and we never ask for access to anything private.
            </p>

            {imported !== null ? (
              <p className="mt-4 flex items-center gap-2 text-sm text-ink">
                <Check className="h-4 w-4 text-evidence" />
                {imported} {imported === 1 ? "repo" : "repos"} brought in as drafts — you&rsquo;ll
                tag them on the next step.
              </p>
            ) : (
              <>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Input
                    className="max-w-xs"
                    placeholder="your-github-username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (username.trim() && !loading) void doGitHub();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={doGitHub}
                    disabled={!username.trim() || loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Reading
                      </>
                    ) : (
                      "Import"
                    )}
                  </Button>
                </div>
                {error && (
                  <p role="alert" className="mt-3 text-sm text-accent">
                    {error}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/*
        CV and LinkedIn both need something we don't have yet — a parser and an OAuth app
        respectively. They used to be buttons that returned a seeded demo person's job history,
        which meant a real candidate could watch somebody else's career appear as their own. An
        honest "not yet" is worth more than a button that lies.
      */}
      <div className="border border-dashed border-ink/20 p-5">
        <p className="text-sm font-medium text-ink">Coming later: CV and LinkedIn</p>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
          Both will fill in your work history and education only — never your capabilities. For now
          you can add those by hand on the background step, and honestly, the work you describe
          matters far more than either of them.
        </p>
      </div>
    </div>
  );
}

// --- Step 6: First evidence ----------------------------------------------

export function EvidenceStep({
  draft,
  ownProjects,
  onAddProject,
  onPublishDraft,
  onRemoveProject,
}: StepProps & {
  ownProjects: Project[];
  onAddProject: (project: Project) => void;
  onPublishDraft: (id: string, capabilities: string[]) => void;
  onRemoveProject: (id: string) => void;
}) {
  const drafts = ownProjects.filter((p) => p.status === "draft");
  const published = ownProjects.filter((p) => p.status !== "draft");
  const [prompt, setPrompt] = useState<WorkPrompt | null>(null);

  return (
    <div className="space-y-6">
      <StepIntro
        eyebrow="The part that counts"
        title="Add your first piece of evidence."
        body="One real thing you built. Tag what it demonstrates — this is what actually moves your capability bars. No CV bullet points here."
      />

      {drafts.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
            From GitHub — review &amp; publish
          </p>
          {drafts.map((p) => (
            <DraftProjectReview
              key={p.id}
              project={p}
              suggestedTags={draft.hypothesisTags}
              onPublish={(caps) => onPublishDraft(p.id, caps)}
              onDiscard={() => onRemoveProject(p.id)}
            />
          ))}
        </div>
      )}

      {published.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
            Your evidence ({published.length})
          </p>
          {published.map((p) => (
            <div key={p.id} className="flex items-center gap-3 border border-ink/15 px-4 py-3">
              <Check className="h-4 w-4 shrink-0 text-evidence" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{p.title}</p>
                <p className="truncate text-xs text-ink-faint">
                  {p.capabilities.map(capabilityLabel).join(" · ") || "No capabilities tagged"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRemoveProject(p.id)}
                className="text-ink-faint hover:text-accent"
                aria-label={`Remove ${p.title}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* The deck is biased toward work this person hasn't evidenced yet, so someone with three
          automation projects is asked about the reporting nobody else understands. */}
      <WorkPromptDeck
        className="border-t border-ink/10 pt-7"
        evidencedTags={published.flatMap((p) => p.capabilities)}
        onChoose={setPrompt}
      />

      <ManualEvidenceForm
        onAdd={onAddProject}
        prompt={prompt}
        onClearPrompt={() => setPrompt(null)}
      />
    </div>
  );
}

function DraftProjectReview({
  project,
  suggestedTags,
  onPublish,
  onDiscard,
}: {
  project: Project;
  suggestedTags: string[];
  onPublish: (capabilities: string[]) => void;
  onDiscard: () => void;
}) {
  const [caps, setCaps] = useState<string[]>(
    project.capabilities.length ? project.capabilities : suggestedTags.slice(0, 2)
  );
  return (
    <div className="border border-ink/15 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink">{project.title}</p>
          <p className="mt-1 text-xs text-ink-faint">{project.description}</p>
        </div>
        <span className="shrink-0 border border-ink/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-ink-faint">
          Draft
        </span>
      </div>
      <div className="mt-3">
        <Label className="mb-2 block text-xs">What does this demonstrate?</Label>
        <CapabilityPicker selected={caps} onChange={setCaps} />
      </div>
      <div className="mt-4 flex gap-2">
        <Button type="button" variant="accent" size="sm" onClick={() => onPublish(caps)} disabled={caps.length === 0}>
          Publish to profile
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onDiscard}>
          Discard
        </Button>
      </div>
    </div>
  );
}

function ManualEvidenceForm({
  onAdd,
  prompt,
  onClearPrompt,
}: {
  onAdd: (project: Project) => void;
  /** A question chosen from the deck, shown above the form to frame the answer. */
  prompt?: WorkPrompt | null;
  onClearPrompt?: () => void;
}) {
  const [openedManually, setOpenedManually] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [whatIBuilt, setWhatIBuilt] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [caps, setCaps] = useState<string[]>([]);

  // Derived rather than synced in an effect: choosing a question *is* opening the form, so there
  // is no second piece of state that could disagree with the first.
  const open = openedManually || Boolean(prompt);

  const canSubmit = title.trim() && description.trim() && whatIBuilt.trim() && caps.length > 0;

  function reset() {
    setTitle("");
    setDescription("");
    setWhatIBuilt("");
    setRepoUrl("");
    setCaps([]);
  }

  function submit() {
    if (!canSubmit) return;
    const slug = uniqueSlug(slugify(title), []);
    const id = `custom-${Date.now()}`;
    const evidence = repoUrl.trim() && isSafeHttpUrl(repoUrl.trim())
      ? [{ id: `${id}-repo`, type: "demo-link" as const, label: "Repository", url: repoUrl.trim() }]
      : [];
    onAdd({
      id,
      slug,
      ownerId: DRAFT_OWNER_ID,
      title: title.trim(),
      description: description.trim(),
      thumbnailSeed: slug,
      capabilities: caps,
      tools: [],
      evidence,
      outcome: "",
      problem: "",
      whatIBuilt: whatIBuilt.trim(),
      myContribution: "",
      process: [],
      mediaGallery: [slug],
      demoUrl: undefined,
      status: "published",
      source: "manual",
    });
    reset();
    setOpenedManually(false);
    onClearPrompt?.();
  }

  if (!open) {
    return (
      <Button type="button" variant="outline" onClick={() => setOpenedManually(true)}>
        <Plus className="h-4 w-4" /> Add a project manually
      </Button>
    );
  }

  return (
    <div className="space-y-4 border border-ink/15 p-4">
      {prompt && (
        <div className="-m-4 mb-0 border-b border-ink/10 bg-accent-soft px-4 py-3">
          <p className="font-serif-display text-[17px] leading-snug text-ink">{prompt.question}</p>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{prompt.nudge}</p>
        </div>
      )}

      <Field label="Title">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="AI-powered invoice triage" />
      </Field>
      <Field label="One-line description">
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A tool that classifies and routes inbound invoices automatically."
        />
      </Field>
      <Field label="What you built">
        <Textarea rows={3} value={whatIBuilt} onChange={(e) => setWhatIBuilt(e.target.value)} />
      </Field>
      <Field label="Repository or demo link (optional)">
        <Input value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} placeholder="https://github.com/you/project" />
      </Field>
      <Field label="What does this demonstrate?">
        <CapabilityPicker selected={caps} onChange={setCaps} />
      </Field>
      <div className="flex gap-2">
        <Button type="button" variant="accent" size="sm" onClick={submit} disabled={!canSubmit}>
          Add evidence
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => { reset(); setOpenedManually(false); onClearPrompt?.(); }}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

// --- Step 7: Score reveal -------------------------------------------------

export function ScoreRevealStep({ ownProjects }: StepProps & { ownProjects: Project[] }) {
  const published = ownProjects.filter((p) => p.status !== "draft");
  const capabilities = computeCapabilities(published);

  return (
    <div className="space-y-6">
      <StepIntro
        eyebrow="This is the difference"
        title="Your capabilities, earned from real work."
        body="No CV produces this. Every bar below traces back to something you actually built. Add two or three pieces and the picture gets genuinely credible."
      />
      {capabilities.length === 0 ? (
        <p className="border border-dashed border-ink/20 p-6 text-center text-sm text-ink-faint">
          No evidence yet — go back a step and add your first project to see this come alive.
        </p>
      ) : (
        <div className="divide-y divide-ink/10 border-y border-ink/10">
          {capabilities.map((c) => (
            <div key={c.tag} className="flex items-center gap-6 py-4">
              <span className="w-48 shrink-0 text-[15px] font-medium text-ink sm:w-56">{c.label}</span>
              <StrengthBar score={c.score} className="flex-1" />
              <span className="w-32 shrink-0 text-right text-xs text-ink-faint">
                {c.evidenceCount} {c.evidenceCount === 1 ? "piece" : "pieces"} of evidence
              </span>
            </div>
          ))}
        </div>
      )}
      <p className="text-sm text-ink-faint">
        A single data point isn&apos;t a credible score — but it&apos;s a real start. You can keep adding evidence any time.
      </p>
    </div>
  );
}

// --- Step 8: Background ----------------------------------------------------

export function BackgroundStep({ draft, patch }: StepProps) {
  const hasImport = draft.importedExperience.length > 0 || draft.importedEducation.length > 0;
  return (
    <div className="space-y-6">
      <StepIntro
        eyebrow="Context, not headline"
        title="Your background."
        body="Useful context — but it sits behind your capabilities, not in front of them. Your title describes where you've been; your evidence describes what you can do."
      />
      {hasImport ? (
        <div className="space-y-5">
          {draft.importedExperience.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">Experience</p>
              <div className="divide-y divide-ink/10 border-y border-ink/10">
                {draft.importedExperience.map((e, i) => (
                  <div key={i} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-ink">{e.role}</p>
                      <p className="text-xs text-ink-faint">{e.company}</p>
                    </div>
                    <span className="text-xs text-ink-faint">
                      {e.startDate} – {e.endDate}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {draft.importedEducation.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">Education</p>
              <div className="divide-y divide-ink/10 border-y border-ink/10">
                {draft.importedEducation.map((e, i) => (
                  <div key={i} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-ink">{e.qualification}</p>
                      <p className="text-xs text-ink-faint">{e.institution}</p>
                    </div>
                    <span className="text-xs text-ink-faint">{e.endYear}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <p className="text-xs text-ink-faint">Imported from your CV / LinkedIn. You can refine this on your profile later.</p>
        </div>
      ) : (
        <div className="space-y-5">
          <p className="text-sm text-ink-faint">
            You skipped the CV and LinkedIn shortcuts — that&apos;s fine. You can add experience and education from your
            profile whenever you like. Your evidence is what matters most here.
          </p>
          <Field label="Current title (for context)">
            <Input
              value={draft.currentTitle}
              onChange={(e) => patch({ currentTitle: e.target.value })}
              placeholder="Operations Associate"
            />
          </Field>
        </div>
      )}
    </div>
  );
}

// --- Step 9: Visibility gate ----------------------------------------------

const DISCOVERABILITY_OPTIONS: { value: Discoverability; label: string; body: string }[] = [
  { value: "hidden", label: "Hidden", body: "No employer can find you. You can still be invited if you share your profile." },
  { value: "selectively-open", label: "Selectively open", body: "Discoverable, but you review every approach." },
  { value: "open", label: "Open", body: "Fully discoverable to employers searching for your capabilities." },
];

export function VisibilityStep({ draft, patch }: StepProps) {
  return (
    <div className="space-y-6">
      <StepIntro
        eyebrow="You decide who sees this"
        title="Visibility is yours to control."
        body="Your profile stays hidden from employer search until you choose otherwise — being complete doesn't make you discoverable."
      />
      <Field label="Who can find you">
        <div className="space-y-2">
          {DISCOVERABILITY_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => patch({ discoverability: o.value })}
              aria-pressed={draft.discoverability === o.value}
              className={cn(
                "flex w-full items-start gap-3 border p-4 text-left transition-colors",
                draft.discoverability === o.value
                  ? "border-accent bg-accent-soft"
                  : "border-ink/15 hover:border-ink"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                  draft.discoverability === o.value ? "border-accent" : "border-ink/30"
                )}
              >
                {draft.discoverability === o.value && <span className="h-2 w-2 rounded-full bg-accent" />}
              </span>
              <span>
                <span className="block text-sm font-medium text-ink">{o.label}</span>
                <span className="block text-xs text-ink-faint">{o.body}</span>
              </span>
            </button>
          ))}
        </div>
      </Field>
      <Field label="Hide my profile from these companies">
        <ChipInput
          values={draft.blockedCompanies}
          onChange={(blockedCompanies) => patch({ blockedCompanies })}
          placeholder="e.g. my-current-employer.com"
        />
      </Field>
      <p className="flex items-center gap-2 border-t border-ink/10 pt-4 text-sm text-ink-faint">
        <Lock className="h-3.5 w-3.5" />
        {draft.discoverability === "hidden"
          ? "Currently hidden from employer search."
          : "Discoverable to employers."}{" "}
        {draft.blockedCompanies.length} {draft.blockedCompanies.length === 1 ? "company" : "companies"} blocked.
      </p>
    </div>
  );
}

// --- shared layout helpers ------------------------------------------------

function StepIntro({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div className="max-w-xl">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">{eyebrow}</p>
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
