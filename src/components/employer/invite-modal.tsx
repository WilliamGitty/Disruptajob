"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { sendInvite } from "@/server/actions/hiring";

const DEFAULT_MESSAGE =
  "Your work looks highly relevant to something we are building. Would you be interested in a conversation?";

export function InviteModal({
  candidateId,
  candidateName,
  trigger,
}: {
  candidateId: string;
  candidateName: string;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roleTitle, setRoleTitle] = useState("");
  const [message, setMessage] = useState(
    `Your work on ${candidateName.split(" ")[0]}'s recent projects looks highly relevant to something we are building. Would you be interested in a conversation?`
  );
  const [compensationRange, setCompensationRange] = useState("");

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      // The company on the invite comes from the session, not from a field anyone can edit —
      // you can only ever reach out as yourself. The action also moves them to "reached out",
      // so the board and the conversation can't disagree.
      await sendInvite({
        candidateId,
        roleTitle: roleTitle || "Untitled opportunity",
        message: message || DEFAULT_MESSAGE,
        compensationRange: compensationRange || undefined,
      });
      setSent(true);
    } catch {
      setError("Couldn't send — check you're signed in as a company.");
    } finally {
      setSending(false);
    }
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setTimeout(() => {
        setSent(false);
        setRoleTitle("");
        setCompensationRange("");
      }, 200);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        {sent ? (
          <div className="flex flex-col items-center py-6 text-center">
            <div className="mb-5 flex h-12 w-12 items-center justify-center border border-evidence/30 bg-evidence-soft">
              <Check className="h-5 w-5 text-evidence" />
            </div>
            <h3 className="font-serif-display text-xl text-ink">Invite sent to {candidateName}</h3>
            <p className="mt-2 max-w-sm text-sm text-ink-soft">
              Disruptajob has recorded this invite. {candidateName.split(" ")[0]} will see it the
              next time they check their opportunities.
            </p>
            <Button className="mt-6" variant="outline" onClick={() => handleOpenChange(false)}>
              Close
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Invite {candidateName} to a conversation</DialogTitle>
              <DialogDescription>
                Disruptajob connects you directly — no application, no job board.
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-5" onSubmit={handleSend}>
              {/* No company field: you reach out as whoever you're signed in as, and letting
                  someone type a different company would make impersonation a text input. */}
              <div className="space-y-2">
                <Label htmlFor="role-title">Role / opportunity title</Label>
                <Input
                  id="role-title"
                  required
                  placeholder="AI Operations Manager"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Short message</Label>
                <Textarea
                  id="message"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="comp-range">Compensation range (optional)</Label>
                <Input
                  id="comp-range"
                  placeholder="£70,000 – £90,000"
                  value={compensationRange}
                  onChange={(e) => setCompensationRange(e.target.value)}
                />
              </div>

              {error && (
                <p className="border border-accent/30 bg-accent-soft px-3 py-2 text-sm text-accent-dark">
                  {error}
                </p>
              )}
              <Button type="submit" variant="accent" className="w-full" disabled={sending}>
                {sending ? "Sending…" : "Send invite"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
