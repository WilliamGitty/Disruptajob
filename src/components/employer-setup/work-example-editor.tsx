"use client";

import { useState } from "react";
import { GripVertical, Paperclip, Plus, Trash2, X } from "lucide-react";
import type { WorkAttachment, WorkExample } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CapabilityPicker } from "@/components/ui/capability-picker";
import { ChipInput } from "@/components/ui/chip-input";
import { capabilityLabel } from "@/lib/capabilities";
import { isSafeHttpUrl } from "@/lib/project-input";
import { cn } from "@/lib/utils";

/**
 * The company-side equivalent of adding a project: describe a real piece of work the hire would
 * own, and tag what it demands. This replaces the job description entirely.
 *
 * Ordering is meaningful — the first example is the one a candidate reads first — so the list is
 * drag-reorderable via native HTML5 drag and drop (no dependency).
 */

function newExample(): WorkExample {
  return {
    id: `we-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: "",
    description: "",
    whatYoudDo: [],
    capabilities: [],
    timeframe: "",
    attachments: [],
  };
}

export function WorkExampleEditor({
  examples,
  onChange,
  suggestedCapabilities = [],
}: {
  examples: WorkExample[];
  onChange: (next: WorkExample[]) => void;
  suggestedCapabilities?: string[];
}) {
  const [editing, setEditing] = useState<WorkExample | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  function save(example: WorkExample) {
    const exists = examples.some((e) => e.id === example.id);
    onChange(exists ? examples.map((e) => (e.id === example.id ? example : e)) : [...examples, example]);
    setEditing(null);
  }

  function reorder(from: number, to: number) {
    if (from === to) return;
    const next = [...examples];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  }

  if (editing) {
    return (
      <WorkExampleForm
        value={editing}
        suggestedCapabilities={suggestedCapabilities}
        onCancel={() => setEditing(null)}
        onSave={save}
      />
    );
  }

  return (
    <div className="space-y-4">
      {examples.length === 0 && (
        <div className="border border-dashed border-ink/20 p-10 text-center">
          <p className="font-serif-display text-xl text-ink">No work added yet.</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
            Describe something this person would genuinely spend their first months on. One real
            example tells a candidate more than a page of responsibilities.
          </p>
        </div>
      )}

      {examples.map((example, i) => (
        <div
          key={example.id}
          draggable
          onDragStart={() => setDragIndex(i)}
          onDragEnd={() => {
            setDragIndex(null);
            setOverIndex(null);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            if (dragIndex !== null && i !== overIndex) setOverIndex(i);
          }}
          onDrop={(e) => {
            e.preventDefault();
            if (dragIndex !== null) reorder(dragIndex, i);
            setDragIndex(null);
            setOverIndex(null);
          }}
          className={cn(
            "flex gap-4 border bg-paper p-5 transition-colors",
            dragIndex === i ? "opacity-40" : "opacity-100",
            overIndex === i && dragIndex !== i ? "border-accent" : "border-ink/15"
          )}
        >
          <div className="flex cursor-grab items-start pt-0.5 text-ink-faint active:cursor-grabbing">
            <GripVertical className="h-4 w-4" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.12em] text-ink-faint">
                  {i === 0 ? "They read this first" : `Work ${i + 1}`}
                </p>
                <h4 className="mt-1 font-serif-display text-lg text-ink">
                  {example.title || "Untitled work"}
                </h4>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => setEditing(example)}>
                  Edit
                </Button>
                <button
                  type="button"
                  aria-label="Remove this work example"
                  onClick={() => onChange(examples.filter((e) => e.id !== example.id))}
                  className="flex h-8 w-8 items-center justify-center text-ink-faint transition-colors hover:text-accent"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {example.description && (
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-soft">
                {example.description}
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {example.capabilities.map((tag) => (
                <span key={tag} className="border border-ink/15 px-2 py-0.5 text-xs text-ink-soft">
                  {capabilityLabel(tag)}
                </span>
              ))}
              {example.attachments.length > 0 && (
                <span className="flex items-center gap-1 text-xs text-ink-faint">
                  <Paperclip className="h-3 w-3" />
                  {example.attachments.length}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}

      <Button variant="outline" onClick={() => setEditing(newExample())}>
        <Plus className="h-4 w-4" />
        Add a piece of work
      </Button>

      {examples.length > 1 && (
        <p className="text-xs text-ink-faint">Drag to reorder, the first one is read first.</p>
      )}
    </div>
  );
}

function WorkExampleForm({
  value,
  suggestedCapabilities,
  onCancel,
  onSave,
}: {
  value: WorkExample;
  suggestedCapabilities: string[];
  onCancel: () => void;
  onSave: (example: WorkExample) => void;
}) {
  const [title, setTitle] = useState(value.title);
  const [description, setDescription] = useState(value.description);
  const [whatYoudDo, setWhatYoudDo] = useState<string[]>(value.whatYoudDo);
  const [timeframe, setTimeframe] = useState(value.timeframe ?? "");
  const [capabilities, setCapabilities] = useState<string[]>(
    value.capabilities.length ? value.capabilities : suggestedCapabilities
  );
  const [attachments, setAttachments] = useState<WorkAttachment[]>(value.attachments);
  const [linkDraft, setLinkDraft] = useState("");
  const [dropActive, setDropActive] = useState(false);

  const linkInvalid = linkDraft.trim().length > 0 && !isSafeHttpUrl(linkDraft.trim());
  const canSave = title.trim().length > 0 && description.trim().length > 0 && capabilities.length > 0;

  function addFiles(files: FileList) {
    const added: WorkAttachment[] = Array.from(files).map((f) => ({
      id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: f.name,
      kind: "file",
    }));
    setAttachments((prev) => [...prev, ...added]);
  }

  function addLink() {
    const url = linkDraft.trim();
    if (!url || !isSafeHttpUrl(url)) return;
    setAttachments((prev) => [
      ...prev,
      { id: `att-${Date.now()}`, name: url.replace(/^https?:\/\//, ""), url, kind: "link" },
    ]);
    setLinkDraft("");
  }

  return (
    <div className="border border-ink/15 bg-paper p-6">
      <h4 className="font-serif-display text-xl text-ink">Describe a real piece of work</h4>
      <p className="mt-1.5 text-sm text-ink-soft">
        Not responsibilities, something that actually needs doing, in the words you&rsquo;d use
        to explain it to the person on their first day.
      </p>

      <div className="mt-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="we-title">What is it?</Label>
          <Input
            id="we-title"
            placeholder="Replace the manual dispatch spreadsheet"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="we-desc">Why does it need doing?</Label>
          <Textarea
            id="we-desc"
            rows={4}
            placeholder="Every morning a coordinator rebuilds the day's routing by hand. It takes two hours and breaks when they're away."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>What they&rsquo;d actually do</Label>
          <ChipInput
            values={whatYoudDo}
            onChange={setWhatYoudDo}
            placeholder="Add a step and press enter"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="we-when">Rough horizon (optional)</Label>
          <Input
            id="we-when"
            placeholder="First 90 days"
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>What does this work demand?</Label>
          <p className="text-xs text-ink-faint">
            This is what we match against candidates&rsquo; evidence, pick what the work genuinely
            needs, not a wish-list.
          </p>
          <CapabilityPicker selected={capabilities} onChange={setCapabilities} />
        </div>

        <div className="space-y-2">
          <Label>Attach the real thing (optional)</Label>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDropActive(true);
            }}
            onDragLeave={() => setDropActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDropActive(false);
              if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
            }}
            className={cn(
              "border border-dashed p-6 text-center transition-colors",
              dropActive ? "border-accent bg-accent-soft/40" : "border-ink/20"
            )}
          >
            <Paperclip className="mx-auto h-4 w-4 text-ink-faint" />
            <p className="mt-2 text-sm text-ink-soft">
              Drop a brief, doc or screenshot here
            </p>
            <label className="mt-2 inline-block cursor-pointer text-xs text-ink underline-grow">
              or choose a file
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.length) addFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
            <p className="mt-2 text-[11px] text-ink-faint">
              Nothing is uploaded in this prototype, we record the file name only.
            </p>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="…or paste a link"
              value={linkDraft}
              onChange={(e) => setLinkDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addLink();
                }
              }}
            />
            <Button variant="outline" onClick={addLink} disabled={!linkDraft.trim() || linkInvalid}>
              Add
            </Button>
          </div>
          {linkInvalid && <p className="text-xs text-accent">Must be a valid http(s) link</p>}

          {attachments.length > 0 && (
            <ul className="space-y-1.5 pt-1">
              {attachments.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between border border-ink/10 px-3 py-2 text-sm text-ink-soft"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <Paperclip className="h-3.5 w-3.5 shrink-0 text-ink-faint" />
                    <span className="truncate">{a.name}</span>
                  </span>
                  <button
                    type="button"
                    aria-label={`Remove ${a.name}`}
                    onClick={() => setAttachments((prev) => prev.filter((x) => x.id !== a.id))}
                    className="text-ink-faint transition-colors hover:text-accent"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-7 flex items-center gap-3 border-t border-ink/10 pt-5">
        <Button
          variant="accent"
          disabled={!canSave}
          onClick={() =>
            onSave({
              ...value,
              title: title.trim(),
              description: description.trim(),
              whatYoudDo,
              timeframe: timeframe.trim() || undefined,
              capabilities,
              attachments,
            })
          }
        >
          Save this work
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        {!canSave && (
          <span className="text-xs text-ink-faint">
            Needs a title, a description, and at least one capability.
          </span>
        )}
      </div>
    </div>
  );
}
