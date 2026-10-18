"use client";

import { useRef, useState } from "react";
import { Loader2, MessageCircleQuestion, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The quiet help corner. Strategy §5c applies in full: it never opens itself, never greets,
 * never nudges; a small mark for the stuck, invisible to everyone else. The disclosure line
 * is not legal garnish, it is the deal: questions are saved with your name (when signed in)
 * so the founder can fix what confused you.
 */

interface Turn {
  role: "user" | "assistant";
  content: string;
}

export function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function send() {
    const question = draft.trim();
    if (!question || busy) return;
    const next: Turn[] = [...turns, { role: "user", content: question }];
    setTurns(next);
    setDraft("");
    setBusy(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = (await res.json()) as { answer?: string };
      setTurns((t) => [
        ...t,
        { role: "assistant", content: data.answer ?? "Something went wrong. Try once more?" },
      ]);
    } catch {
      setTurns((t) => [
        ...t,
        { role: "assistant", content: "Couldn't reach the assistant. hello@disruptajob.com works." },
      ]);
    } finally {
      setBusy(false);
      setTimeout(() => scrollRef.current?.scrollTo({ top: 99999 }), 50);
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Close help" : "Stuck? Ask a question"}
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-5 z-50 flex h-11 w-11 items-center justify-center border border-ink/20 bg-paper text-ink shadow-[2px_2px_0_rgba(26,24,21,0.12)] transition-colors hover:border-ink/50"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircleQuestion className="h-5 w-5" />}
      </button>

      {open && (
        <div className="fixed bottom-20 right-5 z-50 flex max-h-[70vh] w-[min(360px,calc(100vw-2.5rem))] flex-col border border-ink/20 bg-paper shadow-[3px_3px_0_rgba(26,24,21,0.1)]">
          <div className="border-b border-ink/10 px-4 py-3">
            <p className="font-serif-display text-[15px] text-ink">Stuck? Ask.</p>
            <p className="mt-0.5 text-[11px] leading-snug text-ink-faint">
              Answers come from AI and cover using this site. Questions are saved, with your
              name if you&rsquo;re signed in, so the founder can fix whatever confused you.
            </p>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {turns.length === 0 && (
              <p className="text-sm text-ink-faint">
                Things like: where do I change who can see me? How do imports work? Why does my
                link 404 for my friend?
              </p>
            )}
            {turns.map((t, i) => (
              <p
                key={i}
                className={cn(
                  "max-w-[90%] whitespace-pre-wrap text-sm leading-relaxed",
                  t.role === "user"
                    ? "ml-auto border border-ink/15 bg-paper-dim px-3 py-2 text-ink"
                    : "text-ink-soft"
                )}
              >
                {t.content}
              </p>
            ))}
            {busy && <Loader2 className="h-4 w-4 animate-spin text-ink-faint" />}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
            className="flex items-center gap-2 border-t border-ink/10 p-2"
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={1000}
              placeholder="Ask about using the site"
              className="flex-1 bg-transparent px-2 py-1.5 text-sm text-ink outline-none placeholder:text-ink-faint"
            />
            <button
              type="submit"
              disabled={busy || !draft.trim()}
              className="border border-ink/20 px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-ink/50 disabled:opacity-40"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
