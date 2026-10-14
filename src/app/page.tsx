import { Hero } from "@/components/landing/hero";
import { NotYourFault } from "@/components/landing/not-your-fault";
import { DisruptionSection } from "@/components/landing/disruption-section";
import { Comparison } from "@/components/landing/comparison";
import { ClaimsSection } from "@/components/landing/claims-section";
import { CandidatePreviewGrid } from "@/components/landing/candidate-preview-grid";
import { TalentPitch } from "@/components/landing/talent-pitch";

// The preview grid reads live candidates, so the landing page renders per request.
export const dynamic = "force-dynamic";

/**
 * Ordered as an emotional arc for the candidate — name the pain, remove the blame, show the small
 * first step, then prove other people are already here — with the employer door placed after
 * they've seen how it works, not competing with the opening.
 */
export default function Home() {
  return (
    <main>
      <Hero />
      <NotYourFault />
      <TalentPitch />
      <CandidatePreviewGrid />
      <ClaimsSection />
      <Comparison />
      <DisruptionSection />
    </main>
  );
}
