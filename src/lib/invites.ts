import type { Invite } from "@/types";

/**
 * Whose turn it is in a conversation, derived from the thread rather than tracked as read state.
 *
 * Read receipts answer "did you look at this", which isn't the question either side has. The
 * question is "do I owe a reply", and the last message already answers it.
 */

function lastSender(invite: Invite): "employer" | "candidate" | null {
  const messages = invite.messages ?? [];
  return messages.length > 0 ? messages[messages.length - 1].from : null;
}

/** Needs the candidate: an unanswered invite, or the employer spoke last. */
export function awaitsCandidate(invite: Invite): boolean {
  if (invite.status === "sent" || invite.status === "viewed") return true;
  if (invite.status !== "accepted") return false;
  // No replies yet means the employer's opening message is still the latest thing said.
  return lastSender(invite) !== "candidate";
}

/** Needs the employer: the candidate accepted and the ball is now in the employer's court. */
export function awaitsEmployer(invite: Invite): boolean {
  if (invite.status !== "accepted") return false;
  return lastSender(invite) === "candidate";
}

export function countAwaitingCandidate(invites: Invite[], candidateId: string): number {
  return invites.filter((i) => i.candidateId === candidateId && awaitsCandidate(i)).length;
}

export function countAwaitingEmployer(invites: Invite[]): number {
  return invites.filter(awaitsEmployer).length;
}
