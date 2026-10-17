import { getCurrentAccount } from "@/server/auth";
import { getCandidateById } from "@/server/repositories/candidates";
import { listInvitesForCandidate, listInvitesForCompany } from "@/server/repositories/invites";
import { countAwaitingCandidate, countAwaitingEmployer } from "@/lib/invites";
import { Header } from "@/components/nav/header";

/**
 * Resolves who's signed in and how much is waiting on them, then hands plain values to the
 * client header.
 *
 * Counting used to happen in the browser against localStorage, which meant the badge reflected
 * whatever that one browser had done rather than what's actually true. Now it's a server read
 * scoped to the signed-in account.
 */
export async function HeaderShell() {
  const account = await getCurrentAccount();

  let awaiting = 0;
  if (account?.candidateId) {
    awaiting = countAwaitingCandidate(listInvitesForCandidate(account.candidateId), account.candidateId);
  } else if (account?.companyId) {
    awaiting = countAwaitingEmployer(listInvitesForCompany(account.companyId));
  }

  return (
    <Header
      awaiting={awaiting}
      signedInAs={account ? { name: account.displayName, role: account.role } : undefined}
      // The profile URL takes the SLUG, not the candidate id. The seeded demo people have
      // id === slug, which hid this for weeks: every real sign-up got a 404 on "My profile".
      talentHome={
        account?.candidateId
          ? `/profile/${getCandidateById(account.candidateId)?.slug ?? ""}`
          : "/talent/onboarding"
      }
    />
  );
}
