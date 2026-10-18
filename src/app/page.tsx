import { Hero } from "@/components/landing/hero";
import { NotYourFault } from "@/components/landing/not-your-fault";
import { DisruptionSection } from "@/components/landing/disruption-section";
import { Comparison } from "@/components/landing/comparison";
import { ClaimsSection } from "@/components/landing/claims-section";
import { CandidatePreviewGrid } from "@/components/landing/candidate-preview-grid";
import { TalentPitch } from "@/components/landing/talent-pitch";
import { ProofAboveFold } from "@/components/landing/proof-above-fold";
import { InterestCapture } from "@/components/landing/interest-capture";
import { EmployerBand } from "@/components/landing/employer-band";
import { EVENTS, track } from "@/server/analytics";
import { getCurrentAccount } from "@/server/auth";
import { getCandidateById } from "@/server/repositories/candidates";
import { listPublishedProjects } from "@/server/repositories/projects";
import { demandFor } from "@/server/repositories/demand";
import { WelcomeBand } from "@/components/landing/welcome-band";
import type { Metadata } from "next";

export const metadata: Metadata = { alternates: { canonical: "/" } };

// Machine-readable identity for search engines. Kept to facts already on the page.
const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "Disruptajob",
      url: "https://disruptajob.com",
      email: "hello@disruptajob.com",
      description: "Evidence-based hiring. Candidates show real work instead of CVs; companies search proof, not titles.",
    },
    {
      "@type": "WebSite",
      name: "Disruptajob",
      url: "https://disruptajob.com",
    },
  ],
};

// The preview grid reads live candidates, so the landing page renders per request.
export const dynamic = "force-dynamic";

/**
 * Ordered as an emotional arc for the candidate — name the pain, remove the blame, show the small
 * first step, then prove other people are already here — with the employer door placed after
 * they've seen how it works, not competing with the opening.
 */
export default async function Home() {
  await track(EVENTS.landingView, { path: "/" });

  // A signed-in reader gets served, not re-sold: a band with their one number and two doors,
  // and a hero button that reflects where they actually are. The pitch below stays for the
  // friend they show it to.
  const account = await getCurrentAccount();
  let band: React.ReactNode = null;
  let ctaLabel: string | undefined;
  let ctaHref: string | undefined;

  if (account?.candidateId) {
    const me = getCandidateById(account.candidateId);
    if (me) {
      const published = listPublishedProjects(me.id).length;
      const demand = demandFor(me);
      const line =
        published === 0
          ? "Your page is claimed but empty. One piece of work makes it real."
          : demand.matchingRoles === 0
            ? "Your evidence is live. We'll show demand here as companies describe work you can prove."
            : `${demand.matchingRoles} open role${demand.matchingRoles === 1 ? "" : "s"} at ${demand.matchingCompanies} compan${demand.matchingCompanies === 1 ? "y" : "ies"} mostly match your evidence${demand.invisibleTo > 0 ? `, and ${demand.invisibleTo} of those roles can't see you` : ""}.`;
      band = (
        <WelcomeBand
          firstName={me.name.split(" ")[0] || account.displayName.split(" ")[0]}
          line={line}
          primary={
            published === 0
              ? { label: "Finish your page", href: "/talent/onboarding" }
              : { label: "Your page", href: `/profile/${me.slug}` }
          }
          secondary={{ label: "Who's interested", href: "/talent/opportunities" }}
        />
      );
      ctaLabel = published === 0 ? "Finish your page" : "Add another piece of work";
      ctaHref = "/talent/onboarding";
    }
  } else if (account?.companyId) {
    band = (
      <WelcomeBand
        firstName={account.displayName.split(" ")[0]}
        line="The people here publish evidence, not claims. Your search is where you left it."
        primary={{ label: "Find people", href: "/employer/search" }}
        secondary={{ label: "Conversations", href: "/employer/responses" }}
      />
    );
  }

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      {band}
      <Hero ctaLabel={ctaLabel} ctaHref={ctaHref} />
      <ProofAboveFold />
      <NotYourFault />
      <TalentPitch />
      <CandidatePreviewGrid />

      {/* Everything for companies, grouped and visually separated so a job-seeker doesn't read
          "every CV on your desk is now perfect" and think it's aimed at them. */}
      <EmployerBand>
        <ClaimsSection />
        <Comparison />
      </EmployerBand>

      {/* The candidate email capture sits after the employer block, so the page ends by speaking
          to the person it's built for. */}
      <InterestCapture />
      <DisruptionSection />
    </main>
  );
}
