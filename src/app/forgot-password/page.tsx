import type { Metadata } from "next";
import Link from "next/link";
import { requestPasswordResetAction } from "@/server/actions/password-reset";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = { title: "Forgot password · Disruptajob" };
export const dynamic = "force-dynamic";

/**
 * Request a reset link.
 *
 * The confirmation screen is shown whether or not the address has an account — saying "no account
 * found" here would let anyone test addresses against the user base, which is a disclosure about
 * a person who never consented to being looked up.
 */
export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { sent, error } = await searchParams;

  return (
    <main className="mx-auto max-w-[480px] px-6 py-20">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
        Password
      </p>
      <h1 className="font-serif-display text-3xl text-ink">Forgotten it? Happens.</h1>

      {sent ? (
        <div className="mt-6 space-y-4">
          <p className="text-[15px] leading-relaxed text-ink-soft">
            If that address has an account, a reset link is on its way. It works once and lasts
            an hour, check spam if it hasn&rsquo;t landed in a couple of minutes.
          </p>
          <p className="text-sm text-ink-soft">
            <Link href="/signin" className="text-ink underline-grow">
              Back to sign in
            </Link>
          </p>
        </div>
      ) : (
        <>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
            Tell us the email on the account and we&rsquo;ll send a link to set a new one.
          </p>
          <form action={requestPasswordResetAction} className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
              />
            </div>
            {error && (
              <p className="border border-accent/30 bg-accent-soft px-3 py-2 text-sm text-accent-dark">
                {error}
              </p>
            )}
            <Button type="submit" variant="accent" className="w-full">
              Send the link
            </Button>
          </form>
        </>
      )}
    </main>
  );
}
