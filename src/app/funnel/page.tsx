import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { funnelReport, type FunnelStep } from "@/server/analytics";
import { realSignups } from "@/server/signups";
import { all } from "@/server/db";
import { getCurrentAccount } from "@/server/auth";
import { isAdminEmail } from "@/server/config";

export const metadata: Metadata = {
  title: "Funnel · Disruptajob",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * The numbers, for the person running this.
 *
 * Private by default: with ADMIN_EMAILS unset this route does not exist, so forgetting to lock it
 * is not one of the ways it can go wrong. notFound() rather than a 403 because a 403 confirms the
 * page is there.
 */
export default async function FunnelPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const account = await getCurrentAccount();
  if (!isAdminEmail(account?.email)) notFound();

  const { days: daysParam } = await searchParams;
  const days = Math.min(365, Math.max(1, Number(daysParam) || 30));
  const report = funnelReport(days);
  const signups = realSignups();
  const questions = all<{ account_name: string | null; question: string; created_at: string }>(
    "SELECT account_name, question, created_at FROM assistant_message ORDER BY created_at DESC LIMIT 30"
  );

  return (
    <main className="mx-auto max-w-[900px] px-6 py-14">
      <header className="mb-10">
        <h1 className="font-serif-display text-3xl text-ink">Funnel</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
          Last {report.days} days · {report.totalEvents.toLocaleString()} events. Counted as
          distinct visitors, first-party only, nothing here was shared with anyone.
        </p>
        <nav className="mt-4 flex gap-4 text-sm">
          {[7, 30, 90].map((d) => (
            <a
              key={d}
              href={`/funnel?days=${d}`}
              className={d === report.days ? "font-medium text-ink" : "text-ink-soft underline-grow"}
            >
              {d} days
            </a>
          ))}
        </nav>
      </header>

      <section className="border border-ink/15 bg-paper-dim p-6">
        <h2 className="font-serif-display text-xl text-ink">
          Real people: {signups.length}
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          Actual candidate accounts, straight from the database. Demo accounts and yours are
          excluded, so this number only moves when a stranger finishes the whole thing.
        </p>
        {signups.length === 0 ? (
          <p className="mt-4 text-sm text-ink-faint">Nobody yet. The next one is the first.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {signups.map((su) => (
              <li key={`${su.name}-${su.createdAt}`} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
                <span className="font-medium text-ink">{su.name}</span>
                <span className="text-ink-faint">
                  joined {new Date(su.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </span>
                <span className="text-ink-soft">
                  {su.publishedProjects} published project{su.publishedProjects === 1 ? "" : "s"}
                </span>
                <span className="text-ink-faint">· {su.discoverability}</span>
                {!su.emailVerified && <span className="text-ink-faint">· unverified email</span>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <Funnel title="Candidates" steps={report.candidate} />
      <Funnel title="Companies" steps={report.employer} />

      <section className="border border-ink/15 p-6">
        <h2 className="font-serif-display text-xl text-ink">What people asked the assistant</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Every question is a place someone got stuck. Named when they were signed in.
        </p>
        {questions.length === 0 ? (
          <p className="mt-4 text-sm text-ink-faint">No questions yet.</p>
        ) : (
          <ul className="mt-4 space-y-2.5">
            {questions.map((q, i) => (
              <li key={i} className="text-sm leading-relaxed">
                <span className="font-medium text-ink">{q.account_name ?? "Signed out"}</span>{" "}
                <span className="text-ink-faint">
                  {new Date(q.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </span>
                <span className="block text-ink-soft">&ldquo;{q.question}&rdquo;</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <h2 className="font-serif-display text-xl text-ink">Where candidates stop</h2>
        <p className="mt-2 text-sm text-ink-soft">
          Distinct visitors who reached each onboarding step. The biggest fall is the question
          that&rsquo;s too much to ask.
        </p>
        {report.stepDropOff.length === 0 ? (
          <Empty>No onboarding steps recorded yet.</Empty>
        ) : (
          <ul className="mt-5 space-y-px border border-ink/10 bg-ink/10">
            {report.stepDropOff.map((s) => (
              <li key={s.step} className="flex items-center justify-between bg-paper px-5 py-3">
                <span className="text-sm text-ink">
                  <span className="mr-3 font-serif-display text-ink-faint">
                    {String(s.step + 1).padStart(2, "0")}
                  </span>
                  {s.label}
                </span>
                <span className="font-serif-display text-lg text-ink">{s.visitors}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <h2 className="font-serif-display text-xl text-ink">
          Waiting to hear ({report.interest.total} in {report.days} days)
        </h2>
        {report.interest.recent.length === 0 ? (
          <Empty>Nobody has left an address yet.</Empty>
        ) : (
          <ul className="mt-5 space-y-px border border-ink/10 bg-ink/10">
            {report.interest.recent.map((i) => (
              <li
                key={i.email}
                className="flex flex-wrap items-center justify-between gap-2 bg-paper px-5 py-3 text-sm"
              >
                <span className="text-ink">{i.email}</span>
                <span className="text-ink-faint">
                  {i.side} · {new Date(i.createdAt).toLocaleDateString("en-GB")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function Funnel({ title, steps }: { title: string; steps: FunnelStep[] }) {
  const top = steps[0]?.visitors ?? 0;

  return (
    <section className="mt-10">
      <h2 className="font-serif-display text-xl text-ink">{title}</h2>
      <ul className="mt-5 space-y-px border border-ink/10 bg-ink/10">
        {steps.map((s, i) => {
          // Width relative to the top of the funnel, so the shape is readable at a glance.
          const width = top === 0 ? 0 : Math.round((s.visitors / top) * 100);
          const collapsed = s.retainedPct !== null && s.retainedPct < 40;
          return (
            <li key={s.event} className="relative overflow-hidden bg-paper px-5 py-4">
              <div
                className="absolute inset-y-0 left-0 bg-evidence/10"
                style={{ width: `${width}%` }}
                aria-hidden
              />
              <div className="relative flex items-center justify-between gap-4">
                <span className="text-sm text-ink">
                  <span className="mr-3 font-serif-display text-ink-faint">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {s.label}
                </span>
                <span className="flex items-baseline gap-3 whitespace-nowrap">
                  {s.retainedPct !== null && (
                    <span className={collapsed ? "text-xs text-accent" : "text-xs text-ink-faint"}>
                      {s.retainedPct}% of previous
                    </span>
                  )}
                  <span className="font-serif-display text-lg text-ink">{s.visitors}</span>
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-5 border border-dashed border-ink/15 px-5 py-6 text-sm text-ink-faint">
      {children}
    </p>
  );
}
