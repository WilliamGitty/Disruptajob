"use client";

import { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerInterest } from "@/server/actions/track";

/**
 * The exit for someone who understood the pitch and hasn't got ten minutes today.
 *
 * Without this, a visitor who is interested but not ready leaves no trace and there is no way to
 * ever reach them again — which, with no ad budget, means the most expensive thing on the site is
 * the people it already convinced.
 *
 * The ask is deliberately small and the promise is specific: not "join our newsletter" (which
 * nobody wants) but one message when the thing they'd actually come back for exists.
 */
export function InterestCapture() {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, startSending] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    startSending(async () => {
      const result = await registerInterest(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDone(true);
    });
  }

  return (
    <section className="border-b border-ink/10">
      <div className="mx-auto max-w-[760px] px-6 py-16 text-center lg:py-20">
        {done ? (
          <div>
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center border border-evidence/30 bg-evidence-soft">
              <Check className="h-5 w-5 text-evidence" />
            </div>
            <h2 className="font-serif-display text-2xl text-ink">
              That&rsquo;s all we needed.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-ink-soft">
              One message when companies start searching. Nothing else, and one click takes you off
              the list. Your profile will take about ten minutes whenever you&rsquo;re ready.
            </p>
          </div>
        ) : (
          <>
            <h2 className="font-serif-display text-2xl leading-tight text-ink sm:text-3xl">
              Not today? That&rsquo;s completely fine.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[16px] leading-relaxed text-ink-soft">
              Leave an email and we&rsquo;ll tell you once there are companies here searching for
              what you can do. No newsletter, no drip campaign. One message, when it&rsquo;s
              actually worth your time.
            </p>

            <form
              action={onSubmit}
              className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
            >
              <input type="hidden" name="side" value="talent" />
              <Input
                type="email"
                name="email"
                required
                placeholder="you@example.com"
                aria-label="Your email address"
                className="flex-1"
              />
              <Button type="submit" variant="accent" disabled={sending}>
                {sending ? (
                  <>
                    Saving <Loader2 className="h-4 w-4 animate-spin" />
                  </>
                ) : (
                  "Tell me when"
                )}
              </Button>
            </form>

            {error && (
              <p role="alert" className="mt-4 text-sm text-accent">
                {error}
              </p>
            )}

            <p className="mt-5 text-xs text-ink-faint">
              We never pass your address to a company, and we don&rsquo;t create a profile for you.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
