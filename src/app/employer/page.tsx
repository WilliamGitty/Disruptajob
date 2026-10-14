import Link from "next/link";
import { PROJECTS } from "@/lib/mock-data";
import { listCandidates } from "@/server/repositories/candidates";
import { capabilitiesForRole, getOpenRolesForCompany } from "@/server/repositories/companies";
import { matchCandidatesForRole } from "@/server/matching";
import { getCurrentAccount } from "@/server/auth";
import { SearchBox } from "@/components/employer/search-box";
import type { Role } from "@/types";

// Reads live database state, so it can't be prerendered.
export const dynamic = "force-dynamic";

export default async function EmployerPage() {
  const evidenceCount = PROJECTS.reduce((sum, p) => sum + p.evidence.length, 0);
  const candidateCount = listCandidates().length;

  return (
    <main>
      <section className="border-b border-ink/10">
        <div className="mx-auto max-w-[900px] px-6 py-20 text-center lg:px-10 lg:py-28">
          <p className="mb-5 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
            Employer search
          </p>
          <h1 className="font-serif-display text-4xl leading-tight text-ink sm:text-5xl">
            Find people by what they can actually do.
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-[15px] leading-relaxed text-ink-soft">
            Skip the keyword matching. Describe the capability you need and Disruptajob
            surfaces people with evidence to back it up.
          </p>

          <div className="mt-10 text-left">
            <SearchBox autoFocus />
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-ink-faint">
            <span>{candidateCount} people on the platform</span>
            <span className="h-1 w-1 rounded-full bg-ink-faint/50" />
            <span>{PROJECTS.length} documented projects</span>
            <span className="h-1 w-1 rounded-full bg-ink-faint/50" />
            <span>{evidenceCount} pieces of evidence</span>
          </div>

          <p className="mt-8 text-sm text-ink-faint">
            Prefer a structured brief?{" "}
            <Link href="/employer/brief" className="text-ink underline-grow">
              Create a role brief instead
            </Link>
            {" · "}
            <Link href="/employer/searches" className="text-ink underline-grow">
              Your past searches
            </Link>
          </p>
        </div>
      </section>

      <RolesOverview />
    </main>
  );
}

/** Nothing to show until you're signed in as a company — roles belong to an account now. */
async function RolesOverview() {
  const account = await getCurrentAccount();
  if (!account?.companyId) return null;

  const { getCompanyById } = await import("@/server/repositories/companies");
  const company = getCompanyById(account.companyId);
  if (!company) return null;

  const openRoles = getOpenRolesForCompany(account.companyId);
  if (openRoles.length === 0) return null;

  return <RolesList roles={openRoles} companyName={company.name} />;
}

/**
 * The payoff of describing real work: each open role shows how many people already have evidence
 * for what it demands. This is the activation surface — a company lands here and sees matches
 * without typing a search.
 */
function RolesList({ roles, companyName }: { roles: Role[]; companyName: string }) {
  const openRoles = roles;

  return (
    <section className="mx-auto max-w-[900px] px-6 py-16 lg:px-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
            Your open roles
          </p>
          <h2 className="font-serif-display text-2xl text-ink">Matched on the work, not keywords.</h2>
        </div>
        <Link href="/employer/setup" className="text-sm text-ink underline-grow">
          Add a role &rarr;
        </Link>
      </div>

      <div className="space-y-4">
        {openRoles.map((role) => {
          const required = capabilitiesForRole(role);
          const matches = matchCandidatesForRole(role, companyName);
          const strong = matches.filter((m) => m.fitScore >= 60).length;
          return (
            <Link
              key={role.id}
              href={`/employer/roles/${role.id}`}
              className="flex flex-wrap items-center justify-between gap-4 border border-ink/10 bg-paper p-6 transition-colors hover:border-ink/30"
            >
              <div className="min-w-0">
                <h3 className="font-serif-display text-lg text-ink">{role.title}</h3>
                <p className="mt-1 text-sm text-ink-soft">
                  {role.workExamples.length} piece
                  {role.workExamples.length === 1 ? "" : "s"} of real work ·{" "}
                  {required.length} capabilities required
                </p>
              </div>
              <div className="text-right">
                <div className="font-serif-display text-2xl text-ink">{matches.length}</div>
                <div className="text-[11px] uppercase tracking-wide text-ink-faint">
                  with evidence{strong > 0 ? ` · ${strong} strong` : ""}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
