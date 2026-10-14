"use client";

import { useOptimistic, useState, useTransition } from "react";
import Link from "next/link";
import { GripVertical, X } from "lucide-react";
import type { PipelineStage } from "@/types";
import { PIPELINE_STAGES } from "@/types";
import { movePipelineEntry, removeFromPipeline } from "@/server/actions/hiring";
import { InitialsMark } from "@/components/ui/initials-mark";
import { cn } from "@/lib/utils";

/**
 * The hiring board.
 *
 * Cards arrive already filtered by the server — anyone who has hidden from this company is gone
 * before the data reaches the browser. Native HTML5 drag and drop, no dependency.
 *
 * Moves are optimistic: a drag repaints instantly and the server action reconciles. Dragging a
 * card and watching it snap back for 200ms while a round-trip completes feels broken, and this is
 * the one screen a recruiter lives in.
 */

const STAGE_META: Record<PipelineStage, { label: string; hint: string }> = {
  reviewing: { label: "Reviewing", hint: "Looking at their evidence" },
  shortlisted: { label: "Shortlisted", hint: "Worth a conversation" },
  "reached-out": { label: "Reached out", hint: "Invite sent" },
  talking: { label: "Talking", hint: "In conversation" },
};

export interface BoardCard {
  candidateId: string;
  slug: string;
  name: string;
  location: string;
  avatarInitials: string;
  accentIndex: number;
  stage: PipelineStage;
  position: number;
}

export function PipelineBoard({ cards }: { cards: BoardCard[] }) {
  const [, startTransition] = useTransition();
  const [dragging, setDragging] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<PipelineStage | null>(null);

  const [optimistic, applyOptimistic] = useOptimistic(
    cards,
    (state: BoardCard[], move: { candidateId: string; stage: PipelineStage; index: number }) => {
      const moving = state.find((c) => c.candidateId === move.candidateId);
      if (!moving) return state;
      const rest = state.filter((c) => c.candidateId !== move.candidateId);
      const column = rest
        .filter((c) => c.stage === move.stage)
        .sort((a, b) => a.position - b.position);
      const clamped = Math.max(0, Math.min(move.index, column.length));
      column.splice(clamped, 0, { ...moving, stage: move.stage });
      const renumbered = column.map((c, i) => ({ ...c, position: i }));
      return [...rest.filter((c) => c.stage !== move.stage), ...renumbered];
    }
  );

  function move(candidateId: string, stage: PipelineStage, index: number) {
    startTransition(async () => {
      applyOptimistic({ candidateId, stage, index });
      await movePipelineEntry(candidateId, stage, index);
    });
  }

  function drop(candidateId: string) {
    startTransition(async () => {
      await removeFromPipeline(candidateId);
    });
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {PIPELINE_STAGES.map((stage) => {
        const column = optimistic
          .filter((c) => c.stage === stage)
          .sort((a, b) => a.position - b.position);

        return (
          <div
            key={stage}
            onDragOver={(e) => {
              e.preventDefault();
              setOverStage(stage);
            }}
            onDragLeave={() => setOverStage((s) => (s === stage ? null : s))}
            onDrop={(e) => {
              e.preventDefault();
              if (dragging) move(dragging, stage, column.length);
              setDragging(null);
              setOverStage(null);
            }}
            className={cn(
              "flex min-h-[260px] flex-col border bg-paper-dim/30 transition-colors",
              overStage === stage ? "border-accent bg-accent-soft/30" : "border-ink/10"
            )}
          >
            <div className="border-b border-ink/10 px-4 py-3">
              <div className="flex items-baseline justify-between">
                <h3 className="text-sm font-medium text-ink">{STAGE_META[stage].label}</h3>
                <span className="text-xs text-ink-faint">{column.length}</span>
              </div>
              <p className="mt-0.5 text-[11px] text-ink-faint">{STAGE_META[stage].hint}</p>
            </div>

            <div className="flex-1 space-y-2 p-3">
              {column.length === 0 && (
                <p className="px-1 py-6 text-center text-xs text-ink-faint">Drag someone here</p>
              )}

              {column.map((card, index) => (
                <div
                  key={card.candidateId}
                  draggable
                  onDragStart={() => setDragging(card.candidateId)}
                  onDragEnd={() => {
                    setDragging(null);
                    setOverStage(null);
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (dragging) move(dragging, stage, index);
                    setDragging(null);
                    setOverStage(null);
                  }}
                  className={cn(
                    "group cursor-grab border bg-paper p-3 transition-colors active:cursor-grabbing",
                    dragging === card.candidateId
                      ? "border-accent opacity-50"
                      : "border-ink/10 hover:border-ink/30"
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    <GripVertical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-faint" />
                    <InitialsMark initials={card.avatarInitials} index={card.accentIndex} />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/employer/candidate/${card.slug}`}
                        className="block truncate text-sm font-medium text-ink underline-grow"
                      >
                        {card.name}
                      </Link>
                      <p className="truncate text-[11px] text-ink-faint">{card.location}</p>
                    </div>
                    <button
                      type="button"
                      aria-label={`Remove ${card.name} from pipeline`}
                      onClick={() => drop(card.candidateId)}
                      className="shrink-0 text-ink-faint opacity-0 transition-opacity hover:text-accent group-hover:opacity-100"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
