"use client";

import { useCallback, useSyncExternalStore } from "react";
import type {
  CompanySetupDraft,
  OnboardingDraft,
  Project,
} from "@/types";

const CUSTOM_PROJECTS_KEY = "disruptajob:custom-projects";
const ONBOARDING_DRAFT_KEY = "disruptajob:onboarding-draft";
const COMPANY_SETUP_KEY = "disruptajob:company-setup";

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
  notifyListeners();
}

/**
 * Subscription plumbing shared by both stores.
 *
 * localStorage is an external system, so it is read with useSyncExternalStore rather than copied
 * into React state inside an effect. The effect version worked but caused a render, then a state
 * update, then a second render on every mount — and was flagged by the lint rule about setState in
 * effects, which was correct: this is exactly the case that hook exists for.
 */
const listeners = new Set<() => void>();

function notifyListeners() {
  for (const listener of listeners) listener();
}

function subscribeToStorage(onChange: () => void) {
  listeners.add(onChange);
  // Also listen for writes from other tabs, which never reach our in-process listener set.
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** Never fires. Used for values that are constant after hydration. */
function subscribeNever() {
  return () => {};
}

/**
 * Snapshots must be referentially stable or useSyncExternalStore re-renders forever, so each
 * parsed value is cached against the raw string it came from and only reparsed when that changes.
 */
const snapshotCache = new Map<string, { raw: string | null; parsed: unknown }>();

function cachedParse<T>(key: string, fallback: T): T {
  const raw = window.localStorage.getItem(key);
  const cached = snapshotCache.get(key);
  if (cached && cached.raw === raw) return cached.parsed as T;

  let parsed: T = fallback;
  if (raw) {
    try {
      parsed = JSON.parse(raw) as T;
    } catch {
      parsed = fallback;
    }
  }
  snapshotCache.set(key, { raw, parsed });
  return parsed;
}

/** One shared empty array, so the server snapshot is referentially stable too. */
const EMPTY_LIST: never[] = [];

function useLocalList<T>(key: string) {
  const items = useSyncExternalStore(
    subscribeToStorage,
    () => cachedParse<T[]>(key, EMPTY_LIST as unknown as T[]),
    // The server has no localStorage; it renders the empty state and hydration fills it in.
    () => EMPTY_LIST as unknown as T[]
  );

  const add = useCallback(
    (item: T) => {
      writeList(key, [item, ...readList<T>(key)]);
    },
    [key]
  );

  const remove = useCallback(
    (predicate: (item: T) => boolean) => {
      writeList(key, readList<T>(key).filter((i) => !predicate(i)));
    },
    [key]
  );

  const update = useCallback(
    (predicate: (item: T) => boolean, updater: (item: T) => T) => {
      writeList(key, readList<T>(key).map((i) => (predicate(i) ? updater(i) : i)));
    },
    [key]
  );

  return { items, add, remove, update };
}

function writeObject<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value));
  notifyListeners();
}

/** Single-object localStorage store (vs. useLocalList). Used for resumable onboarding progress. */
function useLocalObject<T>(key: string, initial: T) {
  const value = useSyncExternalStore(
    subscribeToStorage,
    () => cachedParse<T>(key, initial),
    // `initial` is a module-level constant in every call site, so this reference is stable.
    () => initial
  );

  // True only once the client has taken over. Callers render a placeholder until then rather than
  // flashing the empty default over a resumed draft.
  const hydrated = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false
  );

  const patch = useCallback(
    (partial: Partial<T>) => {
      writeObject(key, { ...cachedParse<T>(key, initial), ...partial });
    },
    // `initial` is a stable module constant; including it would churn the callback identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key]
  );

  const reset = useCallback(() => {
    window.localStorage.removeItem(key);
    notifyListeners();
  }, [key]);

  return { value, patch, reset, hydrated };
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


