import Link from "next/link";
import { Eye, Search } from "lucide-react";
import { capabilityLabel } from "@/lib/capabilities";
import type { DemandSummary } from "@/server/repositories/demand";

/**
 * "Who's looking for what you can do" — with nothing to apply to.
 *
 * This is where a job board would go, and deliberately isn't one. A board turns the candidate back
 * into an applicant, which is the dynamic that put them eleven months into a search feeling
 * invisible. So this shows the demand and offers two actions, neither of which is an application:
 * add evidence, or decide to be visible.
 *
 * It's also the honest alternative to gamification. Streaks and badges are what you invent when a
 * product has no real feedback to give. "Three companies described work you can evidence, and two
 * of them can't see you" is a better reason to come back than any badge, because it's true.
 */
export function DemandPanel({ demand, ownerFirstName }: { demand: DemandSummary; ownerFirstName: string }) {
  // Nothing to say yet — and saying "0 companies want you" to someone job-hunting would be cruel.
  if (demand.matchingRoles === 0) {
    if (demand.gaps.length === 0) return null;

    return (
      <section className="border border-ink/15 p-6">
        <h2 className="font-serif-display text-lg text-ink">What companies here are asking for</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
          Nobody has described work matching your evidence yet, there simply aren&rsquo;t many
          companies on here so far. These are the capabilities being asked for most:
        </p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {demand.gaps.map((g) => (
            <li key={g.tag} className="border border-ink/15 px-3 py-1.5 text-sm text-ink-soft">
              {capabilityLabel(g.tag)}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-ink-faint">
          If you&rsquo;ve done work that demonstrates any of those, it&rsquo;s worth writing up.
        </p>
      </section>
    );
  }

  const roleWord = demand.matchingRoles === 1 ? "open role mostly matches" : "open roles mostly match";

  return (
    <section className="border border-ink/15 p-6">
      <div className="flex items-start gap-3">
        <Search className="mt-1 h-4 w-4 shrink-0 text-ink-faint" />
        <div>
          <h2 className="font-serif-display text-lg leading-snug text-ink">
            {demand.matchingRoles} {roleWord} the work you can already evidence.
          </h2>
          {demand.inDemand.length > 0 && (
            <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
              They&rsquo;re asking for{" "}
              {demand.inDemand.slice(0, 3).map((d) => capabilityLabel(d.tag)).join(", ")}.
            </p>
          )}
        </div>
      </div>

      {demand.matchingRoleDetails.length > 0 && (
        <div className="mt-5 border-t border-ink/10 pt-5">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-ink-faint">
            Who, and for what
          </p>
          <ul className="mt-3 space-y-2.5">
            {demand.matchingRoleDetails.map((r) => (
              <li key={`${r.companySlug}-${r.roleTitle}`} className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
                <Link href={`/company/${r.companySlug}`} className="font-medium text-ink underline-grow">
                  {r.companyName}
                </Link>
                {r.demo && (
                  <span className="border border-ink/20 bg-paper-dim px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-ink-soft">
                    Example
                  </span>
                )}
                <span className="text-ink-soft">{r.roleTitle}</span>
                <span className="text-ink-faint">
                  needs {r.tags.map((t) => capabilityLabel(t)).join(", ")}
                </span>
                {!r.canSee && (
                  <span className="text-xs text-accent-dark">can&rsquo;t see you yet</span>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs leading-relaxed text-ink-faint">
            There is nothing to apply to, on purpose. Companies reach out when they can see you;
            the list is here so you know what your evidence is already worth.
          </p>
        </div>
      )}

      {demand.invisibleTo > 0 && (
        <div className="mt-5 border-t border-ink/10 pt-5">
          <p className="flex items-start gap-3 text-[15px] leading-relaxed text-ink">
            <Eye className="mt-1 h-4 w-4 shrink-0 text-accent" />
            <span>
              {demand.invisibleTo} of {demand.matchingRoles === demand.invisibleTo ? "them" : `those ${demand.matchingRoles}`}{" "}
              can&rsquo;t currently see you
              {demand.hiddenEntirely ? ", because your profile is hidden" : ""}.
            </span>
          </p>
          <p className="mt-2 pl-7 text-sm leading-relaxed text-ink-soft">
            That&rsquo;s entirely your call, and staying hidden is a perfectly good answer. If
            you&rsquo;d rather be found, you can open up and still block your current employer by
            name.
          </p>
          <Link
            href="/talent/settings"
            className="mt-3 inline-block pl-7 text-sm font-medium text-ink underline-grow"
          >
            Review who can see you
          </Link>
        </div>
      )}

      {demand.gaps.length > 0 && (
        <div className="mt-5 border-t border-ink/10 pt-5">
          <p className="text-sm leading-relaxed text-ink-soft">
            Also being asked for, which {ownerFirstName === "you" ? "you have" : "you have"} no
            evidence for yet:{" "}
            {demand.gaps.slice(0, 3).map((g) => capabilityLabel(g.tag)).join(", ")}.
          </p>
        </div>
      )}

      {/* Deliberately no "apply" and no list of roles to browse. */}
    </section>
  );
}
