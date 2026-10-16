import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentAccount } from "@/server/auth";
import { VerifyEmailNotice } from "@/components/settings/verify-email-notice";
import { YourData } from "@/components/settings/your-data";

export const metadata: Metadata = { title: "Account — Disruptajob" };
export const dynamic = "force-dynamic";

/**
 * The employer's account page.
 *
 * Thin on purpose — a company's hiring settings live with the role they belong to. This exists so
 * that export and deletion are reachable from both sides: the obligation is to the person holding
 * the account, and that person has an email address and a password here whichever door they came
 * through.
 */
export default async function EmployerSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ verification?: string }>;
}) {
  const { verification } = await searchParams;
  const account = await getCurrentAccount();

  if (account?.role !== "employer") {
    return (
      <main className="mx-auto max-w-[700px] px-6 py-24 text-center">
        <h1 className="font-serif-display text-2xl text-ink">Sign in to manage your account</h1>
        <Link href="/signin" className="mt-6 inline-block text-sm text-ink underline-grow">
          Go to sign in
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[760px] px-6 py-14">
      <VerifyEmailNotice accountId={account.id} email={account.email} sent={verification === "sent"} />
      <h1 className="font-serif-display text-3xl text-ink">Account</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
        Signed in as {account.email}.
      </p>

      <YourData email={account.email} />
    </main>
  );
}
