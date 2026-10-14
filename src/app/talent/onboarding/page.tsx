import type { Metadata } from "next";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { getCurrentAccount } from "@/server/auth";

export const metadata: Metadata = {
  title: "Build your profile — Disruptajob",
  description: "Turn the work you actually do into an evidence-backed capability profile.",
};

// Whether there's a session decides whether onboarding asks for a password, so this can't be
// prerendered.
export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const account = await getCurrentAccount();
  // Someone already signed in is topping up an existing profile, not creating one — so we skip
  // the password and keep their real name rather than asking for it again.
  const session =
    account?.role === "talent"
      ? { name: account.displayName, email: account.email }
      : undefined;

  return (
    <main>
      <OnboardingFlow session={session} />
    </main>
  );
}
