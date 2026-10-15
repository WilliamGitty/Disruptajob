import { Hero } from "@/components/landing/hero";
import { NotYourFault } from "@/components/landing/not-your-fault";
import { DisruptionSection } from "@/components/landing/disruption-section";
import { Comparison } from "@/components/landing/comparison";
import { ClaimsSection } from "@/components/landing/claims-section";
import { CandidatePreviewGrid } from "@/components/landing/candidate-preview-grid";
import { TalentPitch } from "@/components/landing/talent-pitch";
import { ProofAboveFold } from "@/components/landing/proof-above-fold";
import { InterestCapture } from "@/components/landing/interest-capture";
import { EVENTS, track } from "@/server/analytics";

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
      <Hero />
      <ProofAboveFold />
      <NotYourFault />
      <TalentPitch />
      <CandidatePreviewGrid />
      <ClaimsSection />
      <InterestCapture />
      <Comparison />
      <DisruptionSection />
    </main>
  );
}
