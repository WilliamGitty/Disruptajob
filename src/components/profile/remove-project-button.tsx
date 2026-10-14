"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { removeProject } from "@/server/actions/evidence";

/** Removing your own work. The action verifies ownership; this only asks. */
export function RemoveProjectButton({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-label="Remove this project"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await removeProject(projectId);
          router.refresh();
        })
      }
      className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center border border-ink/10 bg-paper/90 text-ink-faint transition-colors hover:border-accent hover:text-accent"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}
