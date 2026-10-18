import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentAccount } from "@/server/auth";
import { all } from "@/server/db";
import { InterestedList } from "@/components/talent/interested-list";

export const metadata: Metadata = { title: "Registered interest · Disruptajob" };
export const dynamic = "force-dynamic";

interface InterestRow {
  role_id: string;
  title: string;
  company_name: string;
  company_slug: string;
  demo: number;
  status: string;
  created_at: string;
}

/** The roles this person has raised a hand for, each one a standing, withdrawable grant. */
export default async function InterestedPage() {
  const account = await getCurrentAccount();
  if (!account?.candidateId) {
    return (
      <main className="mx-auto max-w-[700px] px-6 py-24 text-center">
        <h1 className="font-serif-display text-2xl text-ink">Sign in to see your registered interest</h1>
        <Link href="/signin" className="mt-6 inline-block text-sm text-ink underline-grow">
          Go to sign in
        </Link>
      </main>
    );
  }

  const rows = all<InterestRow>(
    `SELECT ri.role_id, r.title, co.name AS company_name, co.slug AS company_slug,
            co.demo, r.status, ri.created_at
       FROM role_interest ri
       JOIN role r    ON r.id = ri.role_id
       JOIN company co ON co.id = r.company_id
      WHERE ri.candidate_id = ?
      ORDER BY ri.created_at DESC`,
    account.candidateId
  );

  return (
    <main className="mx-auto max-w-[760px] px-6 py-14 lg:py-20">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
        Registered interest
      </p>
      <h1 className="font-serif-display text-3xl leading-tight text-ink sm:text-4xl">
        Where you&rsquo;ve raised a hand.
      </h1>
      <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
        Each of these companies can see your profile while the interest stands, even if
        you&rsquo;re otherwise hidden. Withdraw any one of them any time; you never owe a
        reason, and withdrawing restores the wall immediately.
      </p>

      {rows.length === 0 ? (
        <p className="mt-12 border border-ink/10 bg-paper-dim px-6 py-10 text-center text-[15px] text-ink-soft">
          Nothing yet. Raise a hand from{" "}
          <Link href="/talent/matches" className="text-ink underline-grow">
            the job roles available
          </Link>{" "}
          when one deserves it.
        </p>
      ) : (
        <InterestedList
          rows={rows.map((r) => ({
            roleId: r.role_id,
            roleTitle: r.title,
            companyName: r.company_name,
            companySlug: r.company_slug,
            demo: r.demo === 1,
            closed: r.status !== "open",
            since: r.created_at,
          }))}
        />
      )}
    </main>
  );
}
