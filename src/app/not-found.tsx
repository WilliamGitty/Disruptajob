import Link from "next/link";

/**
 * The 404, in the house style instead of a black default screen.
 *
 * Someone landing here may be holding a link to a profile that went hidden — which is the
 * product working, not breaking — so the copy allows for that without confirming anything
 * about whether such a profile exists.
 */
export default function NotFound() {
  return (
    <main className="mx-auto max-w-[560px] px-6 py-24 text-center">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">404</p>
      <h1 className="font-serif-display text-3xl text-ink">This page isn&rsquo;t here.</h1>
      <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-ink-soft">
        Either it never existed, or it belongs to someone who has chosen not to be visible right
        now — people here control who sees them, and sometimes the answer is nobody.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
        <Link href="/" className="text-ink underline-grow">
          Home
        </Link>
        <Link href="/people" className="text-ink underline-grow">
          Browse people
        </Link>
        <Link href="/articles" className="text-ink underline-grow">
          Articles
        </Link>
        <Link href="/signin" className="text-ink underline-grow">
          Sign in
        </Link>
      </div>
    </main>
  );
}
