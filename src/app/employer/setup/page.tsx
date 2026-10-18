import type { Metadata } from "next";
import { SetupFlow } from "@/components/employer-setup/setup-flow";
import { getCurrentAccount } from "@/server/auth";
import { EVENTS, track } from "@/server/analytics";

export const metadata: Metadata = {
  title: "Set up hiring · Disruptajob",
  description:
    "Describe the real work a hire would own instead of writing a job description, and see who already has evidence for it.",
};

// Whether there's a session decides whether setup asks for credentials, so this can't be
// prerendered.
export const dynamic = "force-dynamic";

export default async function EmployerSetupPage() {
  await track(EVENTS.employerSetupStart, { path: "/employer/setup" });

  const account = await getCurrentAccount();
  // An employer already signed in is adding a role to a company that exists, not creating one.
  const session =
    account?.role === "employer" ? { companyName: account.displayName } : undefined;

  return (
    <main>
      <SetupFlow session={session} />
    </main>
  );
}
