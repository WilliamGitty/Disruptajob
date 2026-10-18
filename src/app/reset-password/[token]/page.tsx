import type { Metadata } from "next";
import Link from "next/link";
import { isResetTokenValid } from "@/server/password-reset";
import { completePasswordResetAction } from "@/server/actions/password-reset";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = { title: "Set a new password · Disruptajob" };
export const dynamic = "force-dynamic";

/**
 * The page a reset link lands on.
 *
 * Rendering checks the token but does not spend it — email security scanners follow links, and a
 * link that died because an inbox provider peeked at it would fail the exact person it was for.
 * The token is only consumed when the form is submitted.
 */
export default async function ResetPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { token } = await params;
  const { error } = await searchParams;
  const valid = isResetTokenValid(token);

  return (
    <main className="mx-auto max-w-[480px] px-6 py-20">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
        Password
      </p>

      {valid ? (
        <>
          <h1 className="font-serif-display text-3xl text-ink">Set a new password</h1>
          <form action={completePasswordResetAction} className="mt-8 space-y-4">
            <input type="hidden" name="token" value={token} />
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
              />
            </div>
            {error && (
              <p className="border border-accent/30 bg-accent-soft px-3 py-2 text-sm text-accent-dark">
                {error}
              </p>
            )}
            <Button type="submit" variant="accent" className="w-full">
              Save and sign in
            </Button>
            <p className="text-xs text-ink-faint">
              Saving signs you out everywhere else, so an old session can&rsquo;t outlive the
              password it was opened with.
            </p>
          </form>
        </>
      ) : (
        <>
          <h1 className="font-serif-display text-3xl text-ink">That link has expired</h1>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
            Reset links work once and last an hour. No harm done. Ask for a fresh one and it
            will arrive in a minute.
          </p>
          <p className="mt-6 text-sm text-ink-soft">
            <Link href="/forgot-password" className="text-ink underline-grow">
              Send me a new link
            </Link>
          </p>
        </>
      )}
    </main>
  );
}
