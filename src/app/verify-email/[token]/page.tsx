import type { Metadata } from "next";
import Link from "next/link";
import { completeEmailVerification } from "@/server/email-verification";

export const metadata: Metadata = { title: "Email confirmed — Disruptajob" };
export const dynamic = "force-dynamic";

/**
 * The page a verification link lands on. Visiting it spends the token — unlike a password reset,
 * the action here is harmless if a mail scanner triggers it early: the email demonstrably reached
 * the inbox either way, which is the only thing being proven.
 */
export default async function VerifyEmailPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const verified = completeEmailVerification(token);

  return (
    <main className="mx-auto max-w-[480px] px-6 py-20">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
        Email
      </p>
      {verified ? (
        <>
          <h1 className="font-serif-display text-3xl text-ink">Confirmed. That&rsquo;s it.</h1>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
            Your address is verified, which mostly matters for one thing: if you ever forget your
            password, recovery will actually reach you.
          </p>
          <p className="mt-6 text-sm text-ink-soft">
            <Link href="/" className="text-ink underline-grow">
              Carry on
            </Link>
          </p>
        </>
      ) : (
        <>
          <h1 className="font-serif-display text-3xl text-ink">This link has already done its job</h1>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
            Either the address is already confirmed — most likely — or the link expired. Nothing
            here needs fixing; sign in as usual.
          </p>
          <p className="mt-6 text-sm text-ink-soft">
            <Link href="/signin" className="text-ink underline-grow">
              Sign in
            </Link>
          </p>
        </>
      )}
    </main>
  );
}
