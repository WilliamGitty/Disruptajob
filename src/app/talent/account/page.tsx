import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentAccount } from "@/server/auth";
import { isEmailVerified } from "@/server/email-verification";
import {
  changeEmailAction,
  changePasswordAction,
  updateDisplayNameAction,
} from "@/server/actions/account";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = { title: "My profile · Disruptajob" };
export const dynamic = "force-dynamic";

/**
 * The identity page from the founder's menu restructure: name, email, password, nothing else.
 * Visibility, terms and data rights stay in Account management (settings), where their
 * ceremony lives.
 */
export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { saved, error } = await searchParams;
  const account = await getCurrentAccount();

  if (!account) {
    return (
      <main className="mx-auto max-w-[700px] px-6 py-24 text-center">
        <h1 className="font-serif-display text-2xl text-ink">Sign in to manage your profile</h1>
        <Link href="/signin" className="mt-6 inline-block text-sm text-ink underline-grow">
          Go to sign in
        </Link>
      </main>
    );
  }

  const verified = isEmailVerified(account.id);
  const savedNote = (label: string) => (
    <p className="mt-3 inline-flex border border-evidence/30 bg-evidence-soft px-3 py-1.5 text-sm text-ink">
      {label}
    </p>
  );

  return (
    <main className="mx-auto max-w-[560px] px-6 py-14 lg:py-20">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
        My profile
      </p>
      <h1 className="font-serif-display text-3xl text-ink">Who the account belongs to</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
        Name, email and password. Visibility, terms and your data live in{" "}
        <Link href="/talent/settings" className="text-ink underline-grow">
          account management
        </Link>
        .
      </p>

      {error && (
        <p className="mt-6 border border-accent/30 bg-accent-soft px-3 py-2 text-sm text-ink">
          {error}
        </p>
      )}

      <section className="mt-10 border-t border-ink/10 pt-6">
        <h2 className="font-serif-display text-lg text-ink">Name</h2>
        {saved === "name" && savedNote("Name saved.")}
        <form action={updateDisplayNameAction} className="mt-4 flex max-w-sm items-end gap-3">
          <div className="flex-1 space-y-2">
            <Label htmlFor="name">Your name</Label>
            <Input id="name" name="name" defaultValue={account.displayName} maxLength={80} />
          </div>
          <Button type="submit" variant="outline">
            Save
          </Button>
        </form>
      </section>

      <section className="mt-10 border-t border-ink/10 pt-6">
        <h2 className="font-serif-display text-lg text-ink">Email</h2>
        <p className="mt-2 text-sm text-ink-soft">
          Currently <span className="text-ink">{account.email}</span>
          {verified ? (
            <span className="text-evidence"> · confirmed</span>
          ) : (
            <span className="text-ink-faint"> · not yet confirmed</span>
          )}
        </p>
        {saved === "email" &&
          savedNote("Email changed. A confirmation link is on its way to the new address.")}
        <form action={changeEmailAction} className="mt-4 max-w-sm space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newEmail">New email</Label>
            <Input id="newEmail" name="newEmail" type="email" required autoComplete="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currentPasswordE">Current password</Label>
            <Input
              id="currentPasswordE"
              name="currentPassword"
              type="password"
              autoComplete="current-password"
            />
            <p className="text-xs text-ink-faint">
              Asked for because changing the email changes who owns the account.
            </p>
          </div>
          <Button type="submit" variant="outline">
            Change email
          </Button>
        </form>
      </section>

      <section className="mt-10 border-t border-ink/10 pt-6">
        <h2 className="font-serif-display text-lg text-ink">Password</h2>
        {saved === "password" &&
          savedNote("Password changed. Every other signed-in device was signed out.")}
        <form action={changePasswordAction} className="mt-4 max-w-sm space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPasswordP">Current password</Label>
            <Input
              id="currentPasswordP"
              name="currentPassword"
              type="password"
              autoComplete="current-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              autoComplete="new-password"
            />
            <p className="text-xs text-ink-faint">
              At least 10 characters. Changing it signs out every other device.
            </p>
          </div>
          <Button type="submit" variant="outline">
            Change password
          </Button>
        </form>
      </section>
    </main>
  );
}
