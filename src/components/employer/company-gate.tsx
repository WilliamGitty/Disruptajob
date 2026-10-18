import Link from "next/link";

/**
 * The wall in front of employer tooling.
 *
 * Search and candidate detail used to be reachable signed out, with the anonymous viewer treated
 * as "no company in particular" — which skipped every blocklist by design. That contract is right
 * for the landing page's preview grid and wrong for a full search tool: it meant any blocked
 * recruiter could see the person who blocked them by simply signing out. Audit finding S2.
 *
 * The blocklist can only ever be checked against a named company, so the tools that honour it
 * require one.
 */
export function CompanyGate({ title = "Sign in as a company" }: { title?: string }) {
  return (
    <main className="mx-auto max-w-[700px] px-6 py-24 text-center">
      <h1 className="font-serif-display text-2xl text-ink">{title}</h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
        Candidate search works against each person&rsquo;s privacy choices, including the
        companies they&rsquo;ve blocked. That check needs to know who&rsquo;s asking, so searching
        requires a signed-in company account.
      </p>
      <div className="mt-8 flex items-center justify-center gap-5 text-sm">
        <Link href="/signin" className="font-medium text-ink underline-grow">
          Sign in
        </Link>
        <Link href="/employer/setup" className="text-ink-soft underline-grow hover:text-ink">
          Set up your company
        </Link>
      </div>
    </main>
  );
}
