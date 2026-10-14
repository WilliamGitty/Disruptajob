"use client";

import { useState, useTransition } from "react";
import { Check, Columns3 } from "lucide-react";
import { addToPipeline } from "@/server/actions/hiring";
import { Button } from "@/components/ui/button";

/**
 * Puts someone on the hiring board.
 *
 * Whether they're already on it is decided on the server and passed in — asking the client to
 * work that out would mean shipping the whole board to every page that renders this button.
 */
export function AddToPipelineButton({
  candidateId,
  roleId,
  alreadyOnBoard = false,
  size = "sm",
}: {
  candidateId: string;
  roleId?: string;
  alreadyOnBoard?: boolean;
  size?: "sm" | "default";
}) {
  const [added, setAdded] = useState(alreadyOnBoard);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (added) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-evidence">
        <Check className="h-3.5 w-3.5" />
        On your board
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2">
      <Button
        variant="ghost"
        size={size}
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            try {
              await addToPipeline(candidateId, roleId);
              setAdded(true);
            } catch {
              // The action rejects if you're not signed in as an employer, or if this candidate
              // has hidden from you since the page rendered.
              setError("Couldn't add — check you're signed in as a company.");
            }
          })
        }
      >
        <Columns3 className="h-4 w-4" />
        {pending ? "Adding…" : "Add to pipeline"}
      </Button>
      {error && <span className="text-xs text-accent">{error}</span>}
    </span>
  );
}
