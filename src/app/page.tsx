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

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <Hero />
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
