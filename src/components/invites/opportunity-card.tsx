"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import type { Invite } from "@/types";
import {
  markInviteViewed,
  respondToInvite,
  sendInviteMessage,
} from "@/server/actions/hiring";
import { awaitsCandidate } from "@/lib/invites";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { InviteStatusBadge } from "@/components/invites/invite-status-badge";
import { InviteThread } from "@/components/invites/invite-thread";

/**
 * One approach, from the candidate's side.
 *
 * All four interactions go through server actions that re-check from the session that this invite
 * is actually yours — previously any browser could have answered anyone's.
 */
export function OpportunityCard({
  invite,
  candidateName,
  companySlug,
}: {
  invite: Invite;
  candidateName: string;
  companySlug?: string;
}) {
  const pending = invite.status === "sent" || invite.status === "viewed";
  const [reply, setReply] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [busy, startTransition] = useTransition();

  // Opening the inbox counts as having seen it — a read receipt the employer relies on.
  const marked = useRef(false);
  useEffect(() => {
    if (invite.status === "sent" && !marked.current) {
      marked.current = true;
      void markInviteViewed(invite.id);
    }
  }, [invite.id, invite.status]);

  return (
    <div className="border border-ink/10 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-medium text-ink">{invite.roleTitle}</h3>
          {/* Companies are inspectable too — read their real work before replying. */}
          {companySlug ? (
            <Link href={`/company/${companySlug}`} className="text-sm text-ink-soft underline-grow">
              {invite.companyName} — see their work
            </Link>
          ) : (
            <p className="text-sm text-ink-faint">{invite.companyName}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {invite.status === "accepted" && awaitsCandidate(invite) && (
            <span className="bg-accent px-2.5 py-1 text-xs font-medium text-paper">Your turn</span>
          )}
          <InviteStatusBadge status={invite.status} />
        </div>
      </div>

      {invite.compensationRange && (
        <p className="mt-3 text-xs text-ink-faint">Compensation: {invite.compensationRange}</p>
      )}

      <div className="mt-5">
        <InviteThread invite={invite} viewerSide="candidate" candidateName={candidateName} />
      </div>

      {pending && (
        <div className="mt-5 border-t border-ink/10 pt-5">
          <label htmlFor={`reply-${invite.id}`} className="text-xs font-medium text-ink-soft">
            Want to say something? Optional.
          </label>
          <Textarea
            id={`reply-${invite.id}`}
            rows={3}
            className="mt-2"
            placeholder="A line in your own words — no need to be formal."
            value={reply}
            onChange={(e) => setReply(e.target.value)}
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button
              variant="accent"
              size="sm"
              disabled={busy}
              onClick={() =>
                startTransition(async () => {
                  await respondToInvite(invite.id, "accepted", reply);
                })
              }
            >
              Yes, I&rsquo;d like to talk
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() =>
                startTransition(async () => {
                  await respondToInvite(invite.id, "declined", reply);
                })
              }
            >
              Not this one
            </Button>
            <span className="text-xs text-ink-faint">You never owe anyone a reason.</span>
          </div>
        </div>
      )}

      {invite.status === "accepted" && (
        <div className="mt-5 border-t border-ink/10 pt-5">
          <div className="flex items-end gap-3">
            <Textarea
              rows={2}
              className="min-h-0 flex-1"
              placeholder={`Reply to ${invite.companyName}…`}
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

      {invite.status === "declined" && (
        <p className="mt-5 border-t border-ink/10 pt-5 text-sm text-ink-faint">
          You passed on this one. {invite.companyName} has been let know — nothing further needed
          from you.
        </p>
      )}
    </div>
  );
}
