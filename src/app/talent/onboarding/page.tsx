import type { Metadata } from "next";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";

export const metadata: Metadata = {
  title: "Build your profile — Disruptajob",
  description: "Turn the work you actually do into an evidence-backed capability profile.",
};

export default function OnboardingPage() {
  return (
    <main>
      <OnboardingFlow />
    </main>
  );
}
