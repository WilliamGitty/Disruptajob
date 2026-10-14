"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteSearch } from "@/server/actions/hiring";

export function DeleteSearchButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-label="Delete this search"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await deleteSearch(id);
          router.refresh();
        })
      }
      className="shrink-0 text-ink-faint transition-colors hover:text-accent"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
