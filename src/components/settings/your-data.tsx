"use client";

import { useState, useTransition } from "react";
import { Download, Loader2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteMyAccount } from "@/server/actions/account-data";

/**
 * Export and deletion, in the place someone would look for them.
 *
 * Both are legal obligations, but the tone matters more than the compliance: this product asks
 * people to upload proof of their work, and the promise that they can take it back out — and make
 * it vanish — is part of why that's a reasonable thing to ask. So it's stated plainly and placed
 * in the open, not buried behind three clicks and a mailto: link.
 */
export function YourData({ email }: { email: string }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, startDeleting] = useTransition();

  function onDelete(formData: FormData) {
    setError(null);
    startDeleting(async () => {
      // Only ever returns on failure — success signs out and redirects.
      const result = await deleteMyAccount(formData);
      if (result && !result.ok) setError(result.error);
    });
  }

  return (
    <section className="mt-8 border border-ink/10 p-7">
      <h2 className="font-serif-display text-xl text-ink">Your data</h2>
      <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-ink-soft">
        Your evidence is yours. You can take a copy at any time, and you can remove it from here
        entirely, properly, not just hidden from view.
      </p>

      <div className="mt-6 border-t border-ink/10 pt-6">
        <h3 className="font-medium text-ink">Download everything</h3>
        <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-ink-soft">
          One file: your profile, every project and piece of evidence, your terms, who you blocked,
          and every conversation, including the records companies hold that mention you.
        </p>
        <Button asChild variant="outline" className="mt-4">
          <a href="/api/my-data" download>
            <Download className="h-4 w-4" />
            Download my data
          </a>
        </Button>
      </div>

      <div className="mt-8 border-t border-accent/20 pt-6">
        <h3 className="flex items-center gap-2 font-medium text-ink">
          <TriangleAlert className="h-4 w-4 text-accent" />
          Delete your account
        </h3>
        <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-ink-soft">
          This removes your profile, your projects and evidence, your conversations, and your place
          in any company&rsquo;s pipeline. It happens immediately and cannot be undone, there is no
          recycle bin and no thirty-day window. Download a copy first if you might want it.
        </p>

        {!confirming ? (
          <Button
            type="button"
            variant="outline"
            className="mt-4 border-accent/40 text-accent hover:bg-accent-soft"
            onClick={() => setConfirming(true)}
          >
            Delete my account
          </Button>
        ) : (
          <form action={onDelete} className="mt-5 max-w-md">
            <label className="block text-sm text-ink" htmlFor="confirmEmail">
              Type <span className="font-medium">{email}</span> to confirm.
            </label>
            <Input
              id="confirmEmail"
              name="confirmEmail"
              type="email"
              autoComplete="off"
              placeholder={email}
              className="mt-2"
            />
            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                type="submit"
                variant="outline"
                disabled={deleting}
                className="border-accent/40 text-accent hover:bg-accent-soft"
              >
                {deleting ? (
                  <>
                    Deleting <Loader2 className="h-4 w-4 animate-spin" />
                  </>
                ) : (
                  "Delete permanently"
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setConfirming(false);
                  setError(null);
                }}
              >
                Keep my account
              </Button>
            </div>
            {error && (
              <p role="alert" className="mt-4 text-sm text-accent">
                {error}
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
