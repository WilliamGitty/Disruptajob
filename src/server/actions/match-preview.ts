"use server";

import { listDiscoverableCandidates } from "../repositories/discovery";
import { countCandidates } from "../repositories/candidates";

/**
 * The truthful version of the setup payoff (audit D1/R3).
 *
 * Company setup used to end on four fabricated people from the demo dataset — shown at the exact
 * moment a real company decides whether to publish. Worse than lying, it hid the one honest
 * signal worth having: a company that publishes into a visibly thin marketplace is a believer,
 * and that is a measurement.
 *
 * Aggregate-only on purpose. Setup runs before an account exists, and the gates added for audit
 * S2 mean identities are only shown to a signed-in company — so this returns counts a stranger
 * may see, and the real people appear on the role page after publish, behind the gate.
 */

export interface MatchPreview {
  /** Discoverable candidates with evidence for at least one required capability. */
  matching: number;
  /** Discoverable candidates on the platform at all. */
  discoverable: number;
  /** Everyone, including the hidden — honest context for how early this is. */
  total: number;
}

export async function previewMatchCount(
  required: string[],
  companyName: string
): Promise<MatchPreview> {
  const wanted = new Set(required);
  // The company's own (unpublished) name still honours blocklists: a candidate who blocked
  // "Acme" shouldn't be counted for Acme while Acme signs up.
  const population = listDiscoverableCandidates(companyName.trim());

  const matching =
    wanted.size === 0
      ? 0
      : population.filter((c) =>
          c.capabilities.some((cap) => cap.evidenceCount > 0 && wanted.has(cap.tag))
        ).length;

  return { matching, discoverable: population.length, total: countCandidates() };
}
