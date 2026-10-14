import type { Metadata } from "next";
import Link from "next/link";
import { listAccounts } from "@/server/auth";
import { DEMO_MODE, SIGNUP_ENABLED } from "@/server/config";
import { signInAction } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = { title: "Sign in — Disruptajob" };
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
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const accounts = listAccounts();

  return (
    <main className="mx-auto max-w-[480px] px-6 py-20">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
        Sign in
      </p>
      <h1 className="font-serif-display text-3xl text-ink">Who are you today?</h1>
      <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
        Both sides of the marketplace share one database now, so you can open this in a second
        browser, sign in as the other side, and watch things appear.
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
            placeholder="will@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" autoComplete="current-password" />
        </div>
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

      {accounts.length > 0 && (
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
            {DEMO_MODE
              ? "These are the way in. Ask whoever shared this link for the password."
              : "Accounts created before passwords existed can still sign in without one — a real credential is required before this is genuinely public."}
          </p>
        </div>
      )}
    </main>
  );
}
