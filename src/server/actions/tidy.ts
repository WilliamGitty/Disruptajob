"use server";

import { AI_ENABLED, tidyProfileWording, type TidyProposal } from "../ai";
import { rateLimit, retryMessage } from "../rate-limit";
import { callerKey } from "../request-identity";

/**
 * The optional tidy-up pass at the end of onboarding. The contract matches the import desk:
 * AI proposes, the human approves or rejects every field, and nothing here can ever touch a
 * capability. It exists because a tester wrote shorthand, met it verbatim on her public page,
 * and reasonably expected the machine to have offered a hand.
 */

export type TidyResult =
  | { ok: true; proposal: TidyProposal }
  | { ok: false; error: string };

export async function tidyOnboardingWording(fields: {
  titleGap: string;
  description: string;
  outcome: string;
}): Promise<TidyResult> {
  if (!AI_ENABLED) {
    return { ok: false, error: "The tidy-up assistant isn't available right now. Your own words work fine." };
  }

  const limited = rateLimit("tidyByIp", await callerKey());
  if (!limited.allowed) {
    return { ok: false, error: `That's a lot of tidying. ${retryMessage(limited.retryAfterSeconds)}` };
  }

  const hasText = [fields.titleGap, fields.description, fields.outcome].some((f) => f.trim().length > 0);
  if (!hasText) return { ok: false, error: "Nothing to tidy yet. Write first, polish after." };

  const proposal = await tidyProfileWording({
    titleGap: fields.titleGap.slice(0, 1000),
    description: fields.description.slice(0, 1000),
    outcome: fields.outcome.slice(0, 500),
  });
  if (!proposal) {
    return { ok: false, error: "The tidy-up didn't come back. Your words stand as written; try again if you like." };
  }
  return { ok: true, proposal };
}
