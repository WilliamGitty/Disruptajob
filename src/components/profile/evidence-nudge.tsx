"use client";

import { useSyncExternalStore } from "react";
import { Plus, X } from "lucide-react";
import type { CandidateProfile } from "@/types";
import { Button } from "@/components/ui/button";
import { AddProjectModal } from "@/components/profile/add-project-modal";

const SNOOZE_KEY = "disruptajob:evidence-nudge-snoozed-until";
const SNOOZE_DAYS = 7;

// Minimal external store over localStorage, so the snooze state can be read during render
// (SSR-safe via the server snapshot) instead of synced in with an effect.
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

// Cached so the snapshot stays referentially stable across re-renders: the expiry comparison is
// only recomputed when the stored value actually changes, never on every render.
let cachedRaw: string | null = null;
let cachedIsSnoozed = false;

function getIsSnoozed(): boolean {
  const raw = window.localStorage.getItem(SNOOZE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedIsSnoozed = Boolean(raw) && Date.now() < Number(raw);
  }
  return cachedIsSnoozed;
}

/** Nothing is snoozed as far as the server knows — it has no access to this. */
function getServerIsSnoozed(): boolean {
  return false;
}

/**
 * The ongoing evidence loop (onboarding spec step 10).
 *
 * A CV is a snapshot; a capability graph is only worth more than a CV if it keeps growing. This
 * is the mechanic that brings someone back — and it points at their *thinnest* capability rather
 * than asking generically for "anything new", because a visible gap is a far better prompt.
 *
 * Snoozes rather than dismisses permanently: these are free users who owe us nothing, so it must
 * never become a nag, but it does need to come back.
 */
export function EvidenceNudge({ candidate }: { candidate: CandidateProfile }) {
  const snoozed = useSyncExternalStore(subscribe, getIsSnoozed, getServerIsSnoozed);

  // Already computed from this candidate's published evidence by the server.
  const capabilities = candidate.capabilities;

  // The weakest-evidenced capability is the most useful thing to ask for next.
  const thinnest = [...capabilities].sort((a, b) => a.evidenceCount - b.evidenceCount)[0];

  if (snoozed || !thinnest) return null;

  function snooze() {
    const until = Date.now() + SNOOZE_DAYS * 24 * 60 * 60 * 1000;
    window.localStorage.setItem(SNOOZE_KEY, String(until));
    listeners.forEach((l) => l());
  }

  return (
    <div className="border-b border-ink/10 bg-accent-soft/40">
      <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-4 px-6 py-4 lg:px-10">
        <div className="flex-1">
          <p className="text-sm text-ink">
            Shipped something since you last added evidence?{" "}
            <span className="text-ink-soft">
              <span className="font-medium text-ink">{thinnest.label}</span> is your thinnest
              capability — {thinnest.evidenceCount} piece
              {thinnest.evidenceCount === 1 ? "" : "s"} of evidence. One more project would make it
              credible.
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AddProjectModal
            trigger={
              <Button size="sm" variant="accent">
                <Plus className="h-4 w-4" />
                Add evidence
              </Button>
            }
          />
          <button
            type="button"
            onClick={snooze}
            aria-label="Remind me later"
            className="flex h-8 w-8 items-center justify-center text-ink-faint transition-colors hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
