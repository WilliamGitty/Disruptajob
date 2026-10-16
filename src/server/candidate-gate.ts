import "server-only";
import { getCurrentAccount } from "./auth";
import { isCandidateVisibleTo } from "./repositories/discovery";
import { getCompanyById } from "./repositories/companies";

/**
 * Whether the CURRENT viewer may see this candidate at all — the one question every
 * candidate-rendering surface must ask, including generateMetadata: Next runs metadata even for
 * pages that end in notFound(), so an ungated metadata function leaks a hidden person's name
 * into the 404 response's meta tags. That exact leak happened; this helper exists so it can't
 * recur by omission.
 */
export async function viewerMaySeeCandidate(candidateId: string): Promise<boolean> {
  const viewer = await getCurrentAccount();
  if (viewer?.candidateId === candidateId) return true;
  const viewerCompany = viewer?.companyId ? getCompanyById(viewer.companyId)?.name ?? "" : "";
  return isCandidateVisibleTo(candidateId, viewerCompany);
}
