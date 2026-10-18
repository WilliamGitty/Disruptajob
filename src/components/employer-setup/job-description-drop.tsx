"use client";

import { useRef, useState } from "react";
import { FileText, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { parseJobDescription, type JobDescriptionDraft } from "@/lib/job-description";
import { capabilityLabel } from "@/lib/capabilities";
import { cn } from "@/lib/utils";

/**
 * "Drop in the job description you already have."
 *
 * The honest tension: this product's whole argument is that job descriptions are the problem, and
 * here we are accepting one. The resolution is that we take it as *raw material* and show the
 * company what we could and couldn't find — which is itself the argument. Watching a parser pull
 * four real duties out and leave "5+ years of experience" on the floor teaches the point faster
 * than any amount of copy on the landing page.
 *
 * Nothing is applied until the company presses apply, and every tag stays a suggestion they then
 * confirm in the picker. Parsing happens here in the browser: no upload, no API key, no document
 * sitting on a server.
 */
export function JobDescriptionDrop({
  onApply,
}: {
  onApply: (draft: JobDescriptionDraft) => void;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [draft, setDraft] = useState<JobDescriptionDraft | null>(null);
  const [dragging, setDragging] = useState(false);
  const [reading, setReading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function readFile(file: File) {
    setError(null);
    // Plain text only, and said plainly: silently failing on a .docx would be worse than refusing.
    if (file.size > 1_000_000) {
      setError("That file is unusually large for a job description. Paste the text instead.");
      return;
    }
    setReading(true);
    try {
      const content = await file.text();
      // A .docx or .pdf read as text is mostly binary noise; detect rather than parse rubbish.
      const printable = content.replace(/[^\x20-\x7E\s]/g, "").length / Math.max(1, content.length);
      if (printable < 0.8) {
        setError("We can read plain text and Markdown. For a Word or PDF file, copy the text and paste it below.");
        return;
      }
      setText(content);
      setDraft(parseJobDescription(content));
    } finally {
      setReading(false);
    }
  }

  function parsePasted() {
    setError(null);
    setDraft(parseJobDescription(text));
  }

  function reset() {
    setText("");
    setDraft(null);
    setError(null);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 border border-dashed border-ink/20 px-5 py-4 text-left transition-colors hover:border-ink/40"
      >
        <FileText className="h-4 w-4 shrink-0 text-ink-faint" />
        <span>
          <span className="text-[15px] font-medium text-ink">
            Already have a job description? Start from that.
          </span>
          <span className="mt-0.5 block text-sm text-ink-soft">
            We&rsquo;ll pull out the real work and leave the wish-list behind.
          </span>
        </span>
      </button>
    );
  }

  return (
    <div className="border border-ink/15 bg-paper-dim/40">
      <div className="flex items-center justify-between border-b border-ink/10 px-5 py-3">
        <span className="text-sm font-medium text-ink">Start from a job description</span>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            reset();
          }}
          aria-label="Close"
          className="text-ink-faint hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="p-5">
        {!draft ? (
          <>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                const file = e.dataTransfer.files[0];
                if (file) void readFile(file);
              }}
              className={cn(
                "flex flex-col items-center justify-center border border-dashed px-6 py-10 text-center transition-colors",
                dragging ? "border-accent bg-accent-soft" : "border-ink/20"
              )}
            >
              {reading ? (
                <Loader2 className="h-5 w-5 animate-spin text-ink-faint" />
              ) : (
                <Upload className="h-5 w-5 text-ink-faint" />
              )}
              <p className="mt-3 text-[15px] text-ink">Drop a .txt or .md file here</p>
              <p className="mt-1 text-sm text-ink-soft">
                It&rsquo;s read in your browser, nothing is uploaded.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => inputRef.current?.click()}
              >
                Choose a file
              </Button>
              <input
                ref={inputRef}
                type="file"
                accept=".txt,.md,.markdown,text/plain,text/markdown"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void readFile(file);
                }}
              />
            </div>

            <p className="mt-5 text-sm text-ink-soft">Or paste it:</p>
            <Textarea
              rows={6}
              className="mt-2"
              placeholder="Paste the job description here…"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <Button
              type="button"
              variant="accent"
              size="sm"
              className="mt-3"
              disabled={text.trim().length < 40}
              onClick={parsePasted}
            >
              Read it
            </Button>

            {error && (
              <p role="alert" className="mt-4 text-sm text-accent">
                {error}
              </p>
            )}
          </>
        ) : (
          <Review
            draft={draft}
            onBack={reset}
            onApply={() => {
              onApply(draft);
              setOpen(false);
              reset();
            }}
          />
        )}
      </div>
    </div>
  );
}

function Review({
  draft,
  onApply,
  onBack,
}: {
  draft: JobDescriptionDraft;
  onApply: () => void;
  onBack: () => void;
}) {
  return (
    <div>
      <p className="text-[15px] leading-relaxed text-ink">
        {draft.workExamples.length > 0 ? (
          <>
            We found <strong>{draft.workExamples.length}</strong>{" "}
            {draft.workExamples.length === 1 ? "piece" : "pieces"} of real work in there.
          </>
        ) : (
          <>We couldn&rsquo;t find anything describing what the person would actually do.</>
        )}
      </p>

      {draft.roleTitle && (
        <p className="mt-4 text-sm text-ink-soft">
          Role: <span className="text-ink">{draft.roleTitle}</span>
        </p>
      )}

      {draft.workExamples.length > 0 && (
        <ul className="mt-4 space-y-3">
          {draft.workExamples.map((w, i) => (
            <li key={i} className="border border-ink/10 bg-paper px-4 py-3">
              <p className="text-[15px] text-ink">{w.title}</p>
              {w.suggestedCapabilities.length > 0 && (
                <p className="mt-1.5 text-xs text-ink-faint">
                  Suggested: {w.suggestedCapabilities.map(capabilityLabel).join(" · ")}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      {draft.missing.length > 0 && (
        <div className="mt-5 border-l-2 border-accent/40 pl-4">
          <p className="text-sm text-ink">
            Not in the document, so you&rsquo;ll want to add it: {draft.missing.join(", ")}.
          </p>
        </div>
      )}

      <p className="mt-5 text-sm leading-relaxed text-ink-soft">
        Everything here is a starting point. You confirm each capability yourself, nothing is
        published until you say so.
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <Button type="button" variant="accent" size="sm" onClick={onApply}>
          Use this as a starting point
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onBack}>
          Try a different one
        </Button>
      </div>
    </div>
  );
}
