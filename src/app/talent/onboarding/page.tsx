import type { Metadata } from "next";
import { ConversationFlow } from "@/components/onboarding/conversation-flow";
import { getCurrentAccount } from "@/server/auth";
import { getCandidateById } from "@/server/repositories/candidates";
import { EVENTS, track } from "@/server/analytics";

export const metadata: Metadata = {
  title: "Build your profile · Disruptajob",
  description: "Turn the work you actually do into an evidence-backed capability profile.",
};

// Whether there's a session decides whether onboarding asks for a password, so this can't be
// prerendered.
export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  await track(EVENTS.onboardingStart, { path: "/talent/onboarding" });

  const account = await getCurrentAccount();
  // Someone already signed in is topping up an existing profile, not creating one — so we skip
  // the password and keep their real name rather than asking for it again.
  const session =
    account?.role === "talent"
      ? {
          name: account.displayName,
          email: account.email,
          // Where the import desk lives, for the fork's second door.
          profileSlug: account.candidateId ? getCandidateById(account.candidateId)?.slug : undefined,
        }
      : undefined;

  return (
    <main>
      <ConversationFlow session={session} />
    </main>
  );
}
