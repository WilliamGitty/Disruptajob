"use client";

import Link from "next/link";
import { DemoBadge } from "@/components/ui/demo-badge";
import { useState, useTransition } from "react";
import { Bookmark, BookmarkCheck, MessageSquarePlus } from "lucide-react";
import type { CandidateProfile } from "@/types";
import { InitialsMark } from "@/components/ui/initials-mark";
import { CapabilityConstellation } from "@/components/ui/capability-constellation";
import { Button } from "@/components/ui/button";
import { InviteModal } from "@/components/employer/invite-modal";
import { toggleSavedCandidate } from "@/server/actions/hiring";
import { cn } from "@/lib/utils";

const AVAILABILITY_LABEL: Record<CandidateProfile["availability"], string> = {
  open: "Open to opportunities",
  "selectively-open": "Selectively open",
  "not-looking": "Not currently looking",
};

export function ProfileHeader({
  candidate,
  isOwnProfile = false,
  initiallySaved = false,
}: {
  candidate: CandidateProfile;
  isOwnProfile?: boolean;
  /** Decided on the server from the signed-in company, so it's right on first paint. */
  initiallySaved?: boolean;
}) {
  const [isSaved, setIsSaved] = useState(initiallySaved);
  const [, startTransition] = useTransition();

  function toggleSave() {
    startTransition(async () => {
      try {
        setIsSaved(await toggleSavedCandidate(candidate.id));
      } catch {
        // Only employers can save; silently leave the state alone for anyone else.
      }
    });
  }

  return (
    <section className="border-b border-ink/10">
      <div className="mx-auto max-w-[1100px] px-6 py-14 lg:px-10 lg:py-20">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-5">
            <InitialsMark initials={candidate.avatarInitials} index={candidate.accentIndex} size="lg" />
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-serif-display text-3xl text-ink sm:text-4xl">{candidate.name}</h1>
                {candidate.isDemo && <DemoBadge />}
              </div>
              {candidate.shortDescription ? (
                <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ink-soft">
                  &ldquo;{candidate.shortDescription}&rdquo;
                </p>
              ) : isOwnProfile ? (
                // The founder's own page showed him: a missing sentence here reads as an
                // unfinished site, not an unfinished profile. Owner only; visitors see nothing.
                <Link
                  href="/talent/settings"
                  className="mt-3 inline-block max-w-md border border-dashed border-ink/25 px-3 py-2 text-sm text-ink-soft transition-colors hover:border-ink/50 hover:text-ink"
                >
                  Add a sentence about yourself. It sits right here, in your words.
                </Link>
              ) : null}
              {/* The title is context, not the headline act. Two testers pointed out that
                  billing it second under the name contradicts the site's own argument. */}
              <p className="mt-1.5 text-sm text-ink-faint">{candidate.headline}</p>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-ink-faint">
                <span>{candidate.location}</span>
                <span className="h-1 w-1 rounded-full bg-ink-faint/50" />
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      candidate.availability === "open" ? "bg-evidence" : "bg-ink-faint"
                    )}
                  />
                  {AVAILABILITY_LABEL[candidate.availability]}
                </span>
              </div>
            </div>
          </div>

          {/* The whole person at a glance, before the breakdown: a tester wearing her
              employer hat asked for exactly this. Renders only once two capabilities have
              published evidence, so an empty page never shows an empty chart. */}
          <CapabilityConstellation
            capabilities={candidate.capabilities}
            seed={candidate.slug}
            className="w-full max-w-[420px] border border-ink/10 lg:shrink-0"
          />

          {!isOwnProfile && (
            <div className="flex shrink-0 items-center gap-3">
              <Button variant="outline" size="icon" onClick={toggleSave} aria-label="Save candidate">
                {isSaved ? <BookmarkCheck className="h-4 w-4 text-accent" /> : <Bookmark className="h-4 w-4" />}
              </Button>
              <InviteModal
                candidateId={candidate.id}
                candidateName={candidate.name}
                trigger={
                  <Button variant="accent">
                    <MessageSquarePlus className="h-4 w-4" />
                    Invite to conversation
                  </Button>
                }
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
