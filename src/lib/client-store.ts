"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  CompanySetupDraft,
  Invite,
  InviteMessage,
  OnboardingDraft,
  PipelineEntry,
  PipelineStage,
  Project,
  SearchBrief,
} from "@/types";

const INVITES_KEY = "disruptajob:invites";
const SAVED_CANDIDATES_KEY = "disruptajob:saved-candidates";
const SAVED_SEARCHES_KEY = "disruptajob:saved-searches";
const CUSTOM_PROJECTS_KEY = "disruptajob:custom-projects";
const ONBOARDING_DRAFT_KEY = "disruptajob:onboarding-draft";
const DEMO_SEEDED_KEY = "disruptajob:demo-seeded";
const COMPANY_SETUP_KEY = "disruptajob:company-setup";
const PIPELINE_KEY = "disruptajob:pipeline";
const PIPELINE_SEEDED_KEY = "disruptajob:pipeline-seeded";

const DEMO_INVITES: Invite[] = [
  {
    id: "invite-demo-1",
    candidateId: "william-sandford",
    employerId: "employer-1",
    roleTitle: "AI Operations Lead",
    companyName: "Meridian Robotics",
    message:
      "We came across your AI Daily Signal build — the scoring and summarisation approach is exactly the kind of internal tooling we need someone to own. Open to a conversation?",
    compensationRange: "£65,000 – £80,000",
    status: "sent",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  },
  {
    id: "invite-demo-2",
    candidateId: "william-sandford",
    employerId: "employer-2",
    roleTitle: "Automation & AI Enablement Manager",
    companyName: "Halcyon Systems",
    message:
      "Your Automated Outreach Workflow write-up is close to a problem we're actively trying to solve for our ops team. Would love to talk through what you'd build here.",
    status: "sent",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
  {
    id: "invite-demo-3",
    candidateId: "william-sandford",
    employerId: "employer-3",
    roleTitle: "Head of Internal Tools",
    companyName: "Nordstar Analytics",
    message:
      "We're a small team drowning in manual ops work and liked how fast you shipped the AI Prototype Portfolio. Keen to find 20 minutes to discuss a role.",
    compensationRange: "£75,000 – £95,000",
    status: "accepted",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    respondedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    messages: [
      {
        id: "msg-demo-3-1",
        from: "candidate",
        body: "Thanks for reaching out — the internal tooling problem is exactly what I like building for. Happy to find 20 minutes this week.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
      },
      {
        id: "msg-demo-3-2",
        from: "employer",
        body: "Brilliant. Does Thursday at 2pm work? I'll send a short outline of where we're stuck beforehand.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      },
    ],
  },
];

const DEMO_SAVED_CANDIDATES: SavedCandidateRecord[] = [
  { candidateId: "priya-nair", savedAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString() },
  { candidateId: "daniel-cho", savedAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString() },
];

const DEMO_SAVED_SEARCHES: SavedSearchRecord[] = [
  {
    id: "search-demo-1",
    query:
      "Looking for an AI Operations Manager. They need to demonstrate: Internal AI implementation, Automation, Working with senior stakeholders, Rapid prototyping, Communication. Nice to have: Startup experience, London-based.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(),
  },
];

const DEMO_PIPELINE: PipelineEntry[] = [
  { candidateId: "william-sandford", stage: "talking", position: 0, roleId: "role-meridian-1", updatedAt: new Date().toISOString() },
  { candidateId: "grace-odunsi", stage: "shortlisted", position: 0, roleId: "role-meridian-1", updatedAt: new Date().toISOString() },
  { candidateId: "elena-kovac", stage: "shortlisted", position: 1, roleId: "role-meridian-1", updatedAt: new Date().toISOString() },
  { candidateId: "priya-nair", stage: "reviewing", position: 0, roleId: "role-meridian-1", updatedAt: new Date().toISOString() },
  { candidateId: "daniel-cho", stage: "reviewing", position: 1, roleId: "role-meridian-1", updatedAt: new Date().toISOString() },
  { candidateId: "sofia-almeida", stage: "reached-out", position: 0, roleId: "role-meridian-1", updatedAt: new Date().toISOString() },
];

/**
 * Seed demo data, tracked per feature rather than behind one global flag.
 *
 * A single flag meant anyone who had already used the app never received data for features added
 * later — their pipeline would simply be empty forever. Each marker is also only ever set once,
 * so deliberately clearing a board doesn't resurrect it on the next load.
 */
function seedDemoDataIfNeeded() {
  if (typeof window === "undefined") return;

  if (!window.localStorage.getItem(DEMO_SEEDED_KEY)) {
    window.localStorage.setItem(DEMO_SEEDED_KEY, "1");
    writeList(INVITES_KEY, DEMO_INVITES);
    writeList(SAVED_CANDIDATES_KEY, DEMO_SAVED_CANDIDATES);
    writeList(SAVED_SEARCHES_KEY, DEMO_SAVED_SEARCHES);
  }

  if (!window.localStorage.getItem(PIPELINE_SEEDED_KEY)) {
    window.localStorage.setItem(PIPELINE_SEEDED_KEY, "1");
    writeList(PIPELINE_KEY, DEMO_PIPELINE);
  }
}

function readList<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function writeList<T>(key: string, value: T[]) {
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new StorageEvent("storage", { key }));
}

function useLocalList<T>(key: string) {
  const [items, setItems] = useState<T[]>([]);

  useEffect(() => {
    seedDemoDataIfNeeded();
    setItems(readList<T>(key));
    const handler = (e: StorageEvent) => {
      if (e.key === key || e.key === null) setItems(readList<T>(key));
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [key]);

  const add = useCallback(
    (item: T) => {
      const next = [item, ...readList<T>(key)];
      writeList(key, next);
      setItems(next);
    },
    [key]
  );

  const remove = useCallback(
    (predicate: (item: T) => boolean) => {
      const next = readList<T>(key).filter((i) => !predicate(i));
      writeList(key, next);
      setItems(next);
    },
    [key]
  );

  const update = useCallback(
    (predicate: (item: T) => boolean, updater: (item: T) => T) => {
      const next = readList<T>(key).map((i) => (predicate(i) ? updater(i) : i));
      writeList(key, next);
      setItems(next);
    },
    [key]
  );

  return { items, add, remove, update };
}

function readObject<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeObject<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new StorageEvent("storage", { key }));
}

/** Single-object localStorage store (vs. useLocalList). Used for resumable onboarding progress. */
function useLocalObject<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readObject<T>(key);
    if (stored) setValue(stored);
    setHydrated(true);
    const handler = (e: StorageEvent) => {
      if (e.key === key || e.key === null) {
        const next = readObject<T>(key);
        if (next) setValue(next);
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [key]);

  const patch = useCallback(
    (partial: Partial<T>) => {
      setValue((prev) => {
        const next = { ...prev, ...partial };
        writeObject(key, next);
        return next;
      });
    },
    [key]
  );

  const reset = useCallback(() => {
    if (typeof window !== "undefined") window.localStorage.removeItem(key);
    setValue(initial);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new StorageEvent("storage", { key }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { value, patch, reset, hydrated };
}

function makeMessage(from: InviteMessage["from"], body: string): InviteMessage {
  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    from,
    body: body.trim(),
    createdAt: new Date().toISOString(),
  };
}

export function useInvites() {
  const store = useLocalList<Invite>(INVITES_KEY);
  const { update } = store;

  /** Flip unopened invites to "viewed" once the candidate has seen them. */
  const markViewed = useCallback(
    (id: string) => {
      update(
        (i) => i.id === id && i.status === "sent",
        (i) => ({ ...i, status: "viewed" })
      );
    },
    [update]
  );

  /** Candidate accepts or declines, optionally with an opening reply. */
  const respond = useCallback(
    (id: string, decision: "accepted" | "declined", reply?: string) => {
      update(
        (i) => i.id === id,
        (i) => ({
          ...i,
          status: decision,
          respondedAt: new Date().toISOString(),
          messages: reply?.trim()
            ? [...(i.messages ?? []), makeMessage("candidate", reply)]
            : i.messages,
        })
      );
    },
    [update]
  );

  /** Append a message to the thread from either side. */
  const sendMessage = useCallback(
    (id: string, from: InviteMessage["from"], body: string) => {
      if (!body.trim()) return;
      update(
        (i) => i.id === id,
        (i) => ({ ...i, messages: [...(i.messages ?? []), makeMessage(from, body)] })
      );
    },
    [update]
  );

  return { ...store, markViewed, respond, sendMessage };
}

export interface SavedCandidateRecord {
  candidateId: string;
  savedAt: string;
}

export function useSavedCandidates() {
  return useLocalList<SavedCandidateRecord>(SAVED_CANDIDATES_KEY);
}

export interface SavedSearchRecord {
  id: string;
  query: string;
  createdAt: string;
}

export function useSavedSearches() {
  return useLocalList<SavedSearchRecord>(SAVED_SEARCHES_KEY);
}

/** Projects a candidate has manually attached or imported (repo, demo, etc). */
export function useCustomProjects() {
  return useLocalList<Project>(CUSTOM_PROJECTS_KEY);
}

export const EMPTY_ONBOARDING_DRAFT: OnboardingDraft = {
  step: 0,
  titleGap: "",
  name: "",
  email: "",
  location: "",
  currentTitle: "",
  availability: "open",
  nonNegotiables: {
    roleTypes: [],
    compFloor: "",
    workArrangements: [],
    locationConstraint: "",
    dealbreakers: [],
  },
  hypothesisTags: [],
  cvImported: false,
  linkedinConnected: false,
  githubConnected: false,
  importedExperience: [],
  importedEducation: [],
  discoverability: "hidden",
  blockedCompanies: [],
  updatedAt: "",
};

/** Resumable onboarding progress. Never stores capabilities/evidence — see OnboardingDraft. */
export function useOnboardingDraft() {
  const { value, patch, reset, hydrated } = useLocalObject<OnboardingDraft>(
    ONBOARDING_DRAFT_KEY,
    EMPTY_ONBOARDING_DRAFT
  );
  return { draft: value, patch, reset, hydrated };
}

// --- Company side ----------------------------------------------------------

export const EMPTY_COMPANY_SETUP: CompanySetupDraft = {
  step: 0,
  name: "",
  contactEmail: "",
  website: "",
  blurb: "",
  teamSize: "",
  location: "",
  websiteConnected: false,
  roleTitle: "",
  whyThisRole: "",
  workExamples: [],
  terms: {
    compRange: "",
    workArrangements: [],
    location: "",
    startWindow: "",
    constraints: [],
  },
  updatedAt: "",
};

/** Resumable company setup — the employer-side mirror of `useOnboardingDraft`. */
export function useCompanySetup() {
  const { value, patch, reset, hydrated } = useLocalObject<CompanySetupDraft>(
    COMPANY_SETUP_KEY,
    EMPTY_COMPANY_SETUP
  );
  return { setup: value, patch, reset, hydrated };
}

/**
 * The hiring pipeline. Ordering within a column is explicit (`position`) rather than implied by
 * array order, so a drag survives a reload and two columns can't fight over the same index.
 */
export function usePipeline() {
  const store = useLocalList<PipelineEntry>(PIPELINE_KEY);
  const { items, add, remove, update } = store;

  /** Move a candidate to a stage, inserting at `index` and renumbering that column. */
  const moveTo = useCallback(
    (candidateId: string, stage: PipelineStage, index: number) => {
      const all = readList<PipelineEntry>(PIPELINE_KEY);
      const moving = all.find((e) => e.candidateId === candidateId);
      const rest = all.filter((e) => e.candidateId !== candidateId);

      const column = rest
        .filter((e) => e.stage === stage)
        .sort((a, b) => a.position - b.position);

      const entry: PipelineEntry = {
        ...(moving ?? { candidateId, roleId: undefined, note: undefined }),
        candidateId,
        stage,
        position: 0,
        updatedAt: new Date().toISOString(),
      };

      const clamped = Math.max(0, Math.min(index, column.length));
      column.splice(clamped, 0, entry);

      const renumbered = column.map((e, i) => ({ ...e, position: i }));

      // Renumber the column it left too, otherwise positions go sparse (a 0-less column) and
      // drift further apart with every move.
      const sourceStage = moving?.stage;
      const others = rest
        .filter((e) => e.stage !== stage)
        .sort((a, b) => a.position - b.position);
      const compacted =
        sourceStage && sourceStage !== stage
          ? (() => {
              let i = 0;
              return others.map((e) =>
                e.stage === sourceStage ? { ...e, position: i++ } : e
              );
            })()
          : others;

      const next = [...compacted, ...renumbered];

      writeList(PIPELINE_KEY, next);
      return next;
    },
    []
  );

  const addCandidate = useCallback(
    (candidateId: string, stage: PipelineStage = "reviewing", roleId?: string) => {
      const all = readList<PipelineEntry>(PIPELINE_KEY);
      if (all.some((e) => e.candidateId === candidateId)) return;
      const column = all.filter((e) => e.stage === stage);
      add({
        candidateId,
        stage,
        position: column.length,
        roleId,
        updatedAt: new Date().toISOString(),
      });
    },
    [add]
  );

  return { items, add, remove, update, moveTo, addCandidate };
}

export type { Invite, SearchBrief };
