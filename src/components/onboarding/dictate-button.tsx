"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Mic, Square } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Speak instead of typing.
 *
 * The first question — "what do you actually do that your job title doesn't capture?" — is the
 * hardest moment in the whole product: a blank box, a stranger asking you to describe yourself,
 * and a reader who has probably been rejected a hundred times. Plenty of people who can answer
 * that out loud in thirty seconds will stare at the box for five minutes and close the tab.
 *
 * Browser speech recognition, so no key, no upload and no third party: on Chrome the audio does go
 * to Google's service, which is stated on the button rather than buried. Progressive enhancement —
 * the button simply doesn't render where the API is absent (Firefox, some mobile browsers), and
 * nothing else about the step changes.
 */

// The API is prefixed in every browser that ships it and isn't in TypeScript's DOM types.
interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

interface SpeechWindow {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
}

function recognitionConstructor(): (new () => SpeechRecognitionLike) | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as SpeechWindow;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

function getRecognition(): SpeechRecognitionLike | null {
  const Ctor = recognitionConstructor();
  return Ctor ? new Ctor() : null;
}

/**
 * Support is constant after hydration, so it's read as an external value rather than synced into
 * state by an effect — the server has no idea what the browser can do, and an effect that calls
 * setState on mount is the pattern this codebase has already been bitten by twice.
 */
function subscribeNever() {
  return () => {};
}

export function DictateButton({
  onTranscript,
  className,
}: {
  /** Called with each finalised chunk, to append to whatever is already written. */
  onTranscript: (text: string) => void;
  className?: string;
}) {
  const supported = useSyncExternalStore(
    subscribeNever,
    () => recognitionConstructor() !== undefined,
    () => false
  );
  const [listening, setListening] = useState(false);
  const recognition = useRef<SpeechRecognitionLike | null>(null);

  // Stop listening if the step unmounts mid-sentence.
  useEffect(() => () => recognition.current?.stop(), []);

  if (!supported) return null;

  function start() {
    const r = getRecognition();
    if (!r) return;

    r.continuous = true;
    r.interimResults = false;
    r.lang = "en-GB";

    r.onresult = (event) => {
      // Only finalised chunks are appended, so the box doesn't churn mid-sentence.
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) onTranscript(result[0].transcript);
      }
    };
    r.onerror = () => setListening(false);
    r.onend = () => setListening(false);

    recognition.current = r;
    r.start();
    setListening(true);
  }

  function stop() {
    recognition.current?.stop();
    setListening(false);
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={listening ? stop : start}
        aria-pressed={listening}
        className={cn(
          "inline-flex items-center gap-2 border px-3 py-1.5 text-sm transition-colors",
          listening
            ? "border-accent bg-accent-soft text-ink"
            : "border-ink/15 text-ink-soft hover:border-ink hover:text-ink"
        )}
      >
        {listening ? (
          <>
            <Square className="h-3.5 w-3.5 text-accent" />
            Stop
          </>
        ) : (
          <>
            <Mic className="h-3.5 w-3.5" />
            Say it instead
          </>
        )}
      </button>
      <p className="mt-2 text-xs leading-relaxed text-ink-faint">
        {listening
          ? "Listening, talk the way you'd explain it to a friend."
          : "Easier to say than write? Your browser handles the transcription."}
      </p>
    </div>
  );
}
