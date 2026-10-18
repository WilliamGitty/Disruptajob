import type { Metadata } from "next";
import Link from "next/link";
import { listDemoAccounts } from "@/server/auth";
import { DEMO_MODE, SIGNUP_ENABLED } from "@/server/config";
import { signInAction } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = { title: "Sign in · Disruptajob" };
export const dynamic = "force-dynamic";

/**
 * Sign-in.
 *
 * Email-only for now: verifying an address needs a mail provider, and this stage of the build
 * deliberately runs with no third-party accounts. The session behind it is real (opaque token,
 * httpOnly cookie, server-side lookup), so adding a credential later touches one function.
 */
export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; reset?: string }>;
}) {
  const { error, reset } = await searchParams;
  const accounts = listDemoAccounts();

  return (
    <main className="mx-auto max-w-[480px] px-6 py-20">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
        Sign in
      </p>
      <h1 className="font-serif-display text-3xl text-ink">Welcome back.</h1>
      <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
        Your work is where you left it.
      </p>

      <form action={signInAction} className="mt-8 space-y-4">
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
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-xs text-ink-soft underline-grow">
              Forgotten it?
            </Link>
          </div>
          <Input id="password" name="password" type="password" autoComplete="current-password" />
        </div>
        {reset && (
          <p className="border border-ink/15 bg-paper-dim px-3 py-2 text-sm text-ink-soft">
            New password saved. Sign in with it below.
          </p>
        )}
        {error && (
          <p className="border border-accent/30 bg-accent-soft px-3 py-2 text-sm text-accent-dark">
            That email and password don&rsquo;t match an account.
          </p>
        )}
        <Button type="submit" variant="accent" className="w-full">
          Continue
        </Button>
      </form>

      {SIGNUP_ENABLED && (
        <p className="mt-6 text-sm text-ink-soft">
          No account yet?{" "}
          <Link href="/signup" className="text-ink underline-grow">
            Create one
          </Link>
        </p>
      )}

      {DEMO_MODE && accounts.length > 0 && (
        <div className="mt-10 border-t border-ink/10 pt-6">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-ink-faint">
            Demo accounts
          </p>
          <ul className="mt-4 space-y-2">
            {accounts.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-4 text-sm">
                <span>
                  <span className="text-ink">{a.displayName}</span>{" "}
                  <span className="text-ink-faint">· {a.role === "talent" ? "candidate" : "employer"}</span>
                </span>
                <code className="text-xs text-ink-soft">{a.email}</code>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-ink-faint">
            These are the way in. Ask whoever shared this link for the password.
          </p>
        </div>
      )}
    </main>
  );
}
