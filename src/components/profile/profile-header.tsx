"use client";

import { DemoBadge } from "@/components/ui/demo-badge";
import { useState, useTransition } from "react";
import { Bookmark, BookmarkCheck, MessageSquarePlus } from "lucide-react";
import type { CandidateProfile } from "@/types";
import { InitialsMark } from "@/components/ui/initials-mark";
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
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-5">
            <InitialsMark initials={candidate.avatarInitials} index={candidate.accentIndex} size="lg" />
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-serif-display text-3xl text-ink sm:text-4xl">{candidate.name}</h1>
                {candidate.isDemo && <DemoBadge />}
              </div>
              <p className="mt-1.5 text-[15px] font-medium text-ink-soft">{candidate.headline}</p>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ink-soft">
                {candidate.shortDescription ? `“${candidate.shortDescription}”` : null}
              </p>
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
