import { cn } from "@/lib/utils";
import type { Invite } from "@/types";

function formatWhen(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Renders an invite as a conversation: the employer's opening `message` first,
 * then every reply. `viewerSide` decides which bubbles are "You" (right-aligned).
 */
export function InviteThread({
  invite,
  viewerSide,
  candidateName,
}: {
  invite: Invite;
  viewerSide: "candidate" | "employer";
  candidateName: string;
}) {
  const turns = [
    { id: "opener", from: "employer" as const, body: invite.message, createdAt: invite.createdAt },
    ...(invite.messages ?? []),
  ];

  return (
    <div className="space-y-3">
      {turns.map((turn) => {
        const mine = turn.from === viewerSide;
        const label = mine
          ? "You"
          : turn.from === "employer"
            ? invite.companyName
            : candidateName;
        return (
          <div key={turn.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[85%] border px-3.5 py-2.5",
                mine
                  ? "border-accent/25 bg-accent-soft"
                  : "border-ink/10 bg-ink/[0.02]"
              )}
            >
              <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.12em] text-ink-faint">
                {label}
              </p>
              <p className="text-sm leading-relaxed text-ink">{turn.body}</p>
              <p className="mt-1.5 text-[11px] text-ink-faint">{formatWhen(turn.createdAt)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
