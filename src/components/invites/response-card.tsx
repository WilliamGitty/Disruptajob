"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { Invite, NonNegotiables } from "@/types";
import { sendInviteMessage } from "@/server/actions/hiring";
import { awaitsEmployer } from "@/lib/invites";
import { toEmployerSafeTerms } from "@/lib/terms";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { InviteStatusBadge } from "@/components/invites/invite-status-badge";
import { InviteThread } from "@/components/invites/invite-thread";
import { TermsSummary } from "@/components/employer/terms-summary";

/**
 * One conversation, from the company's side.
 *
 * `terms` arrives as the candidate's full non-negotiables and is narrowed with
 * `toEmployerSafeTerms` before rendering, so the private comp floor is structurally absent from
 * what this component can display.
 */
export function ResponseCard({
  invite,
  candidateName,
  candidateSlug,
  terms,
}: {
  invite: Invite;
  candidateName: string;
  candidateSlug?: string;
  terms?: NonNegotiables;
}) {
  const [followUp, setFollowUp] = useState("");
  const [busy, startTransition] = useTransition();

  return (
    <div className="border border-ink/10 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-medium text-ink">
            {invite.roleTitle} ·{" "}
            {candidateSlug ? (
              <Link href={`/employer/candidate/${candidateSlug}`} className="underline-grow">
                {candidateName}
              </Link>
            ) : (
              candidateName
            )}
          </h3>
          <p className="text-sm text-ink-faint">{invite.companyName}</p>
        </div>
        <div className="flex items-center gap-2">
          {awaitsEmployer(invite) && (
            <span className="bg-accent px-2.5 py-1 text-xs font-medium text-paper">Your turn</span>
          )}
          <InviteStatusBadge status={invite.status} />
        </div>
      </div>

      <div className="mt-5">
        <InviteThread invite={invite} viewerSide="employer" candidateName={candidateName} />
      </div>

      {invite.status === "sent" && (
        <p className="mt-5 border-t border-ink/10 pt-5 text-sm text-ink-faint">
          Sent — {candidateName} hasn&rsquo;t opened this yet.
        </p>
      )}
      {invite.status === "viewed" && (
        <p className="mt-5 border-t border-ink/10 pt-5 text-sm text-ink-faint">
          {candidateName} has viewed your invite and hasn&rsquo;t responded yet.
        </p>
      )}
      {invite.status === "declined" && (
        <p className="mt-5 border-t border-ink/10 pt-5 text-sm text-ink-faint">
          {candidateName} declined this invite.
        </p>
      )}

      {/* Terms surface the moment they accept — so nobody discovers a mismatch three weeks in. */}
      {invite.status === "accepted" && terms && (
        <div className="mt-5">
          <TermsSummary terms={toEmployerSafeTerms(terms)} />
        </div>
      )}

      {invite.status === "accepted" && (
        <div className="mt-5 border-t border-ink/10 pt-5">
          <div className="flex items-end gap-3">
            <Textarea
              rows={2}
              className="min-h-0 flex-1"
              placeholder={`Reply to ${candidateName}…`}
              value={followUp}
              onChange={(e) => setFollowUp(e.target.value)}
            />
            <Button
              size="sm"
              disabled={!followUp.trim() || busy}
              onClick={() =>
                startTransition(async () => {
                  await sendInviteMessage(invite.id, followUp);
                  setFollowUp("");
                })
              }
            >
              Send
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
