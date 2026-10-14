import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Globe, MapPin, Paperclip, Users } from "lucide-react";
import { getCompanyBySlug, getOpenRolesForCompany } from "@/server/repositories/companies";
import { capabilityLabel } from "@/lib/capabilities";
import { InitialsMark } from "@/components/ui/initials-mark";
import { Badge } from "@/components/ui/badge";
import type { CompanyStage, Role } from "@/types";

const STAGE_LABEL: Record<CompanyStage, string> = {
  "pre-seed": "Pre-seed",
  seed: "Seed",
  "series-a": "Series A",
  "series-b": "Series B",
  growth: "Growth",
  established: "Established",
};

// Rendered per request: company pages now reflect live database state, so prerendering would
// serve a snapshot taken before anyone published anything.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const company = getCompanyBySlug(slug);
  if (!company) return {};
  return { title: `${company.name} — Disruptajob`, description: company.blurb };
}

/**
 * What a candidate sees about a company.
 *
 * The deliberate mirror of a candidate profile: companies here are inspectable too. Someone who
 * has been ghosted for months gets to read the actual work and the actual terms before deciding
 * whether to spend any more of themselves on it.
 */
export default async function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const company = getCompanyBySlug(slug);
  if (!company || !company.published) notFound();

  const roles = getOpenRolesForCompany(company.id);

  return (
    <main>
      <section className="border-b border-ink/10">
        <div className="mx-auto max-w-[1000px] px-6 py-14 lg:px-10">
          <div className="flex flex-wrap items-start gap-5">
            <InitialsMark initials={company.avatarInitials} index={company.accentIndex} size="lg" />
            <div className="min-w-0 flex-1">
              <h1 className="font-serif-display text-3xl text-ink sm:text-4xl">{company.name}</h1>
              <p className="mt-3 max-w-2xl text-lg leading-relaxed text-ink-soft">
                {company.blurb}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-faint">
                {company.website && (
                  <span className="flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5" />
                    {company.website}
                  </span>
                )}
                {company.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {company.location}
                  </span>
                )}
                {company.teamSize && (
                  <span className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    {company.teamSize} people
                  </span>
                )}
                {company.stage && <Badge>{STAGE_LABEL[company.stage]}</Badge>}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1000px] px-6 py-14 lg:px-10">
        <div className="mb-10 max-w-2xl">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
            What you&rsquo;d actually do
          </p>
          <h2 className="font-serif-display text-3xl text-ink">
            No job description. The real work.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
            Companies here describe what genuinely needs doing instead of a list of
            responsibilities — so you can judge the job before you ever speak to anyone.
          </p>
        </div>

        {roles.length === 0 ? (
          <p className="border border-dashed border-ink/20 p-10 text-center text-sm text-ink-soft">
            Nothing open here right now.
          </p>
        ) : (
          <div className="space-y-12">
            {roles.map((role) => (
              <RoleBlock key={role.id} role={role} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function RoleBlock({ role }: { role: Role }) {
  return (
    <section className="border border-ink/10 p-7 lg:p-9">
      <h3 className="font-serif-display text-2xl text-ink">{role.title}</h3>
      {role.whyThisRole && (
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
          {role.whyThisRole}
        </p>
      )}

      <div className="mt-8 space-y-6">
        {role.workExamples.map((work, i) => (
          <div key={work.id} className="border-l-2 border-accent/40 pl-5">
            <p className="text-[11px] uppercase tracking-[0.12em] text-ink-faint">
              {work.timeframe || `Work ${i + 1}`}
            </p>
            <h4 className="mt-1.5 font-serif-display text-lg text-ink">{work.title}</h4>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{work.description}</p>

            {work.whatYoudDo.length > 0 && (
              <ul className="mt-4 space-y-1.5">
                {work.whatYoudDo.map((step) => (
                  <li key={step} className="flex gap-2.5 text-sm text-ink-soft">
                    <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-ink-faint" />
                    {step}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {work.capabilities.map((tag) => (
                <span
                  key={tag}
                  className="border border-ink/15 px-2.5 py-1 text-xs text-ink-soft"
                >
                  {capabilityLabel(tag)}
                </span>
              ))}
              {work.attachments.map((a) => (
                <span
                  key={a.id}
                  className="flex items-center gap-1.5 text-xs text-ink-faint"
                  title={a.name}
                >
                  <Paperclip className="h-3 w-3" />
                  {a.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 border-t border-ink/10 pt-6">
        <h4 className="text-sm font-medium text-ink">What they&rsquo;re offering</h4>
        <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {role.terms.compRange && <TermRow label="Pay">{role.terms.compRange}</TermRow>}
          {role.terms.workArrangements.length > 0 && (
            <TermRow label="Arrangement">
              <span className="capitalize">{role.terms.workArrangements.join(" / ")}</span>
            </TermRow>
          )}
          {role.terms.location && <TermRow label="Location">{role.terms.location}</TermRow>}
          {role.terms.startWindow && <TermRow label="Start">{role.terms.startWindow}</TermRow>}
          {role.terms.constraints.length > 0 && (
            <TermRow label="Can't flex on">{role.terms.constraints.join(" · ")}</TermRow>
          )}
        </dl>

        <p className="mt-6 text-sm text-ink-soft">
          Nothing to apply for.{" "}
          <Link href="/talent/onboarding" className="text-ink underline-grow">
            Put your work on Disruptajob
          </Link>{" "}
          and they&rsquo;ll find you if the evidence lines up.
        </p>
      </div>
    </section>
  );
}

function TermRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.12em] text-ink-faint">{label}</dt>
      <dd className="mt-1 text-sm text-ink-soft">{children}</dd>
    </div>
  );
}
