"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import type { Project } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCustomProjects, useOnboardingDraft } from "@/lib/client-store";
import { completeCandidateOnboarding } from "@/server/actions/onboarding";
import { trackEvent } from "@/server/actions/track";
import { EVENTS } from "@/lib/events";
import { CAPABILITY_DEFINITIONS, capabilityLabel } from "@/lib/capabilities";
import { DictateButton } from "@/components/onboarding/dictate-button";
import { cn } from "@/lib/utils";

/**
 * The conversational onboarding — a person asking questions, not a system collecting fields.
 *
 * Design decisions this file exists to keep:
 *
 *  - **One question per screen.** The audience has filled in ten thousand forms; a grid of
 *    labelled inputs is the uniform of every system that ignored them. Big serif question,
 *    bare writing space, dictation as an equal way to answer.
 *  - **The progress indicator is the profile, assembling.** No step dots, no percentages
 *    (design-principles.md bans them anyway). As you answer, your actual page builds beside
 *    you — motivation, preview and proof of progress in one device.
 *  - **Sign-up is the last step, not the first.** Nothing is asked for until something real
 *    exists on screen to claim. The draft lives in localStorage until the claim; the server
 *    hears nothing before it (which is also the privacy-correct order).
 *  - **Four beats.** Terms, visibility, imports and background all left onboarding (October
 *    roundtable): they're asked where they matter — settings, the first discoverability
 *    toggle — not at the door. Visibility isn't a question here because the answer is fixed:
 *    every new profile starts hidden.
 *
 * The one rule is untouched: the capability chips tag *described work*; nothing typed here
 * moves a score except through evidence.
 */

export interface OnboardingSession {
  name: string;
  email: string;
}

const BEATS = ["gap", "work", "proof", "you", "claim"] as const;
type Beat = (typeof BEATS)[number];
const LAST = BEATS.length - 1;

/** The single project this conversation builds, kept in the resumable client store. */
const CONVO_PROJECT_ID = "convo-project";
const DRAFT_OWNER_ID = "onboarding-draft";

const EMPTY_PROJECT: Project = {
  id: CONVO_PROJECT_ID,
  slug: "first-work",
  ownerId: DRAFT_OWNER_ID,
  title: "",
  description: "",
  thumbnailSeed: "first-work",
  capabilities: [],
  tools: [],
  evidence: [],
  outcome: "",
  problem: "",
  whatIBuilt: "",
  myContribution: "",
  process: [],
  mediaGallery: [],
  status: "draft",
  source: "manual",
};

export function ConversationFlow({ session }: { session?: OnboardingSession }) {
  const { draft, patch, reset, hydrated } = useOnboardingDraft();
  const { items, add, update, remove } = useCustomProjects();

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ slug: string; capabilities: string[]; fresh: boolean } | null>(null);
  const [saving, startSaving] = useTransition();

  const project = useMemo(
    () => items.find((p) => p.id === CONVO_PROJECT_ID) ?? EMPTY_PROJECT,
    [items]
  );

  if (!hydrated) return <div className="min-h-[60vh]" aria-hidden />;

  if (done) {
    return <PayoffView slug={done.slug} capabilities={done.capabilities} signedUpFresh={done.fresh} />;
  }
  if (draft.completedAt) {
    // A reload after finishing: the slug lives only in memory, but the profile is real.
    return <AlreadyDoneView onReset={() => { reset(); remove((p) => p.id === CONVO_PROJECT_ID); }} />;
  }

  const beat: Beat = BEATS[Math.min(draft.step, LAST)];
  const beatIndex = BEATS.indexOf(beat);

  function patchProject(fields: Partial<Project>) {
    if (items.some((p) => p.id === CONVO_PROJECT_ID)) {
      update((p) => p.id === CONVO_PROJECT_ID, (p) => ({ ...p, ...fields }));
    } else {
      add({ ...EMPTY_PROJECT, ...fields });
    }
  }

  const canContinue = (() => {
    if (beat === "gap") return draft.titleGap.trim().length > 0;
    if (beat === "work") return project.description.trim().length > 0 && project.title.trim().length > 0;
    if (beat === "proof") return project.capabilities.length > 0;
    if (beat === "you") return session ? true : draft.name.trim().length > 0;
    return true;
  })();

  function goTo(next: number) {
    const clamped = Math.max(0, Math.min(LAST, next));
    patch({ step: clamped, updatedAt: new Date().toISOString() });
    void trackEvent(EVENTS.onboardingStep, { step: clamped, label: BEATS[clamped] });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function finish() {
    setError(null);
    if (!session && password.length < 10) {
      setError("Pick a password of at least 10 characters. It isn't stored with your draft, so this is the only place we ask.");
      return;
    }

    const link = project.demoUrl?.trim();
    const isRepo = link ? /github\.com|gitlab\.com|bitbucket\.org/.test(link) : false;

    startSaving(async () => {
      const result = await completeCandidateOnboarding({
        name: draft.name.trim() || session?.name || "",
        email: session?.email ?? draft.email,
        password: session ? undefined : password,
        location: draft.location,
        currentTitle: draft.currentTitle,
        availability: "open",
        titleGap: draft.titleGap,
        // Deliberately empty: terms and visibility are asked where they matter, not at the door.
        // Every new profile starts hidden — settings is where that changes, with full ceremony.
        nonNegotiables: { roleTypes: [], workArrangements: [], dealbreakers: [] },
        discoverability: "hidden",
        blockedCompanies: [],
        projects: [
          {
            title: project.title,
            description: project.description,
            outcome: project.outcome,
            repoUrl: isRepo ? link : undefined,
            demoUrl: !isRepo ? link : undefined,
            capabilities: project.capabilities,
          },
        ],
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      void trackEvent(EVENTS.onboardingComplete, { projects: 1 });
      // `fresh` is captured here, not derived from the prop at render time: the action's RSC
      // refresh re-renders this component with a session that didn't exist when the user started.
      setDone({ slug: result.slug, capabilities: project.capabilities, fresh: !session });
      patch({ completedAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      remove((p) => p.id === CONVO_PROJECT_ID);
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  return (
    <div className="mx-auto max-w-[1060px] px-6 py-10 lg:py-16">
      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          {beat === "gap" && (
            <Screen
              kicker="First, the gap"
              question="What do you actually do that your job title doesn't say?"
              hint="Say it like you'd tell a friend. The automations nobody asked you to build, the product calls you somehow ended up running: the stuff with no line on your CV."
            >
              <Writing
                value={draft.titleGap}
                onChange={(v) => patch({ titleGap: v, updatedAt: new Date().toISOString() })}
                placeholder="Officially I'm an ops manager. Actually, I…"
              />
            </Screen>
          )}

          {beat === "work" && (
            <Screen
              kicker="Now the work"
              question="Tell us about one piece of work you're proud of."
              hint="One real thing you built, ran or fixed. A good test: what would break, or just quietly stop happening, if you went away for a month?"
            >
              <Writing
                value={project.description}
                onChange={(v) => patchProject({ description: v })}
                placeholder="There was no system for…, so I…"
              />
              <div className="mt-6 max-w-sm space-y-2">
                <Label htmlFor="work-title" className="text-ink-soft">
                  Give it a short name
                </Label>
                <Input
                  id="work-title"
                  value={project.title}
                  onChange={(e) => patchProject({ title: e.target.value })}
                  placeholder="The invoice automation"
                  maxLength={120}
                />
              </div>
            </Screen>
          )}

          {beat === "proof" && (
            <Screen
              kicker="What it proves"
              question="Which of these did that work genuinely involve?"
              hint="Pick only what is true. Employers search by these tags, and every one you pick points straight at the work you just described."
            >
              <div className="flex flex-wrap gap-2">
                {CAPABILITY_DEFINITIONS.map((c) => {
                  const on = project.capabilities.includes(c.tag);
                  return (
                    <button
                      key={c.tag}
                      type="button"
                      title={c.description}
                      onClick={() =>
                        patchProject({
                          capabilities: on
                            ? project.capabilities.filter((t) => t !== c.tag)
                            : [...project.capabilities, c.tag],
                        })
                      }
                      className={cn(
                        "border px-3 py-2 text-sm transition-colors",
                        on
                          ? "border-accent bg-accent-soft text-accent-dark"
                          : "border-ink/15 bg-paper text-ink-soft hover:border-ink/35"
                      )}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="work-outcome" className="text-ink-soft">
                    What changed because of it? <span className="text-ink-faint">(optional)</span>
                  </Label>
                  <Input
                    id="work-outcome"
                    value={project.outcome}
                    onChange={(e) => patchProject({ outcome: e.target.value })}
                    placeholder="Invoicing went from 3 days a month to 2 hours"
                    maxLength={400}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="work-link" className="text-ink-soft">
                    A link, if one exists <span className="text-ink-faint">(optional)</span>
                  </Label>
                  <Input
                    id="work-link"
                    value={project.demoUrl ?? ""}
                    onChange={(e) => patchProject({ demoUrl: e.target.value })}
                    placeholder="https://github.com/you/the-thing"
                  />
                </div>
              </div>
            </Screen>
          )}

          {beat === "you" && (
            <Screen
              kicker="The person behind it"
              question="Who should this page belong to?"
              hint={session ? "You're signed in. Check these are right." : "Just enough to put a name on the work. Everything stays hidden until you say otherwise."}
            >
              <div className="max-w-sm space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="you-name">Your name</Label>
                  <Input
                    id="you-name"
                    value={session && !draft.name ? session.name : draft.name}
                    onChange={(e) => patch({ name: e.target.value, updatedAt: new Date().toISOString() })}
                    placeholder="Sam Achebe"
                    maxLength={80}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="you-title">
                    The job title that undersells you <span className="text-ink-faint">(optional)</span>
                  </Label>
                  <Input
                    id="you-title"
                    value={draft.currentTitle}
                    onChange={(e) => patch({ currentTitle: e.target.value, updatedAt: new Date().toISOString() })}
                    placeholder="Operations Manager"
                    maxLength={160}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="you-location">
                    Where you&rsquo;re based <span className="text-ink-faint">(optional)</span>
                  </Label>
                  <Input
                    id="you-location"
                    value={draft.location}
                    onChange={(e) => patch({ location: e.target.value, updatedAt: new Date().toISOString() })}
                    placeholder="Manchester, UK"
                    maxLength={120}
                  />
                </div>
              </div>
            </Screen>
          )}

          {beat === "claim" && (
            <Screen
              kicker="Last thing"
              question="This page exists. Claim it."
              hint={
                session
                  ? "You're signed in, so it's one press. Your page publishes to your profile and stays hidden from every search until you choose."
                  : "An email and a password, and the page you just made is yours. It stays hidden from every search until you choose otherwise."
              }
            >
              {!session && (
                <div className="max-w-sm space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="claim-email">Email</Label>
                    <Input
                      id="claim-email"
                      type="email"
                      autoComplete="email"
                      value={draft.email}
                      onChange={(e) => patch({ email: e.target.value, updatedAt: new Date().toISOString() })}
                      placeholder="you@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="claim-password">Password</Label>
                    <Input
                      id="claim-password"
                      type="password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <p className="text-xs text-ink-faint">
                      At least 10 characters. Never saved with your draft.
                    </p>
                  </div>
                </div>
              )}
              <div className="mt-8">
                <Button type="button" variant="accent" size="lg" onClick={finish} disabled={saving}>
                  {saving ? (
                    <>
                      Making it real <Loader2 className="h-4 w-4 animate-spin" />
                    </>
                  ) : (
                    <>
                      {session ? "Publish my page" : "Claim my page"} <Check className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </Screen>
          )}

          {error && (
            <p role="alert" className="mt-8 border border-accent/30 bg-accent-soft px-4 py-3 text-[15px] leading-relaxed text-ink">
              {error}{" "}
              <span className="text-ink-soft">Nothing you&rsquo;ve written is lost. It&rsquo;s all still here.</span>
            </p>
          )}

          <div className="mt-10 flex items-center justify-between border-t border-ink/10 pt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => goTo(beatIndex - 1)}
              disabled={beatIndex === 0 || saving}
              className={cn(beatIndex === 0 && "invisible")}
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            {beat !== "claim" && (
              <Button type="button" variant="accent" onClick={() => goTo(beatIndex + 1)} disabled={!canContinue}>
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>

          <p className="mt-6 text-xs text-ink-faint">
            Everything saves in this browser as you go. Leave any time; pick up right here.
          </p>
        </div>

        <PagePreview
          name={draft.name || session?.name || ""}
          title={draft.currentTitle}
          location={draft.location}
          gap={draft.titleGap}
          project={project}
        />
      </div>
    </div>
  );
}

/** One question, asked the way a person asks it. */
function Screen({
  kicker,
  question,
  hint,
  children,
}: {
  kicker: string;
  question: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">{kicker}</p>
      <h1 className="font-serif-display text-3xl leading-tight text-ink sm:text-4xl">{question}</h1>
      <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-soft">{hint}</p>
      <div className="mt-8">{children}</div>
    </div>
  );
}

/**
 * The bare writing space — no border, no field chrome. Looks like replying to a message,
 * with dictation as an equal way of answering.
 */
function Writing({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="border-l-2 border-ink/10 pl-5 focus-within:border-accent">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={6}
        maxLength={4000}
        autoFocus
        className="w-full resize-none bg-transparent font-serif-display text-xl leading-relaxed text-ink outline-none placeholder:text-ink-faint/60"
      />
      <div className="mt-2">
        <DictateButton onTranscript={(chunk) => onChange(value ? `${value} ${chunk}` : chunk)} />
      </div>
    </div>
  );
}

/** The page, assembling — the only progress indicator this flow has. */
function PagePreview({
  name,
  title,
  location,
  gap,
  project,
}: {
  name: string;
  title: string;
  location: string;
  gap: string;
  project: Project;
}) {
  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "?";
  const empty = !gap && !project.description && !name;

  return (
    <aside className="lg:sticky lg:top-10 lg:self-start" aria-label="Your page so far">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
        Your page, so far
      </p>
      <div className="border border-ink/15 bg-paper p-6 shadow-[2px_2px_0_rgba(26,24,21,0.06)]">
        {empty ? (
          <p className="py-10 text-center text-sm leading-relaxed text-ink-faint">
            As you answer, your page builds itself right here.
          </p>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-ink/15 bg-paper-dim font-serif-display text-ink">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate font-serif-display text-lg text-ink">{name || "Your name"}</p>
                <p className="truncate text-xs text-ink-soft">
                  {[title, location].filter(Boolean).join(" · ") || " "}
                </p>
              </div>
            </div>
            {gap && (
              <p className="mt-4 border-l-2 border-accent/40 pl-3 text-sm italic leading-relaxed text-ink-soft">
                &ldquo;{gap.length > 180 ? `${gap.slice(0, 180)}…` : gap}&rdquo;
              </p>
            )}
            {(project.title || project.description) && (
              <div className="mt-5 border-t border-ink/10 pt-4">
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-faint">
                  Evidence
                </p>
                <p className="mt-1.5 font-serif-display text-[15px] text-ink">
                  {project.title || "Your first piece of work"}
                </p>
                {project.description && (
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
                    {project.description.length > 140
                      ? `${project.description.slice(0, 140)}…`
                      : project.description}
                  </p>
                )}
                {project.outcome && (
                  <p className="mt-1.5 text-[13px] text-evidence">↳ {project.outcome}</p>
                )}
                {project.capabilities.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {project.capabilities.map((tag) => (
                      <span key={tag} className="border border-ink/15 bg-paper-dim px-2 py-0.5 text-[11px] text-ink-soft">
                        {capabilityLabel(tag)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
            <p className="mt-5 border-t border-ink/10 pt-3 text-[11px] text-ink-faint">
              Hidden from every search until you say otherwise.
            </p>
          </>
        )}
      </div>
    </aside>
  );
}

/** The flow ends on recognition, not a tick. */
function PayoffView({
  slug,
  capabilities,
  signedUpFresh,
}: {
  slug: string;
  capabilities: string[];
  signedUpFresh: boolean;
}) {
  return (
    <div className="mx-auto max-w-[640px] px-6 py-20">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
        Published
      </p>
      <h1 className="font-serif-display text-3xl leading-tight text-ink sm:text-4xl">
        Here&rsquo;s what your title never said.
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
        The work you just published proves these capabilities. Employers here search by
        capabilities, not job titles:
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        {capabilities.map((tag) => (
          <span key={tag} className="border border-evidence/30 bg-evidence-soft px-3 py-1.5 text-sm text-ink">
            {capabilityLabel(tag)} <span className="text-ink-faint">· evidenced</span>
          </span>
        ))}
      </div>
      <p className="mt-6 text-[15px] leading-relaxed text-ink-soft">
        When a company needs what you&rsquo;ve just proven, you surface. No application, no
        keyword lottery. Your page is live and <strong className="text-ink">hidden</strong>: no
        employer sees it until you decide. Even hidden it earns its keep: a link for
        applications and LinkedIn the moment you open it up. Evidence, where everyone else
        attaches a PDF.
      </p>
      {signedUpFresh && (
        <p className="mt-3 text-sm text-ink-faint">
          We&rsquo;ve emailed you a confirmation link. No rush; nothing is locked behind it.
        </p>
      )}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild variant="accent">
          <Link href={`/profile/${slug}`}>
            See your page <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/talent/settings">Decide who finds you</Link>
        </Button>
      </div>
    </div>
  );
}

function AlreadyDoneView({ onReset }: { onReset: () => void }) {
  return (
    <div className="mx-auto max-w-[620px] px-6 py-20 text-center">
      <h1 className="font-serif-display text-3xl text-ink">Your profile is already made.</h1>
      <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-ink-soft">
        This browser finished onboarding before. Add more work from your profile, or start a fresh
        draft if this is someone else&rsquo;s machine.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button asChild variant="accent">
          <Link href="/talent/settings">Go to your settings</Link>
        </Button>
        <Button type="button" variant="ghost" onClick={onReset}>
          Start fresh
        </Button>
      </div>
    </div>
  );
}
