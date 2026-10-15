/**
 * How a company wants to carry on once a candidate says yes.
 *
 * The constraint that shapes this whole feature: an employer never gets someone's contact details
 * before that person accepts. Not as a paywall — as the thing that makes "block your current
 * employer" worth believing. A platform that hands over an email on first contact has a privacy
 * page, not a privacy promise.
 *
 * So the choice is captured at reach-out and the handoff only unlocks on acceptance. The company
 * gets what it needs the moment it's allowed, rather than being asked a form question at the point
 * everyone has lost momentum.
 */

export type FollowupChannel = "here" | "email" | "ats";

export interface FollowupOption {
  value: FollowupChannel;
  label: string;
  body: string;
}

export const FOLLOWUP_OPTIONS: FollowupOption[] = [
  {
    value: "here",
    label: "Keep it here",
    body: "Carry on in this conversation. Nothing to set up, and they keep control of their details.",
  },
  {
    value: "email",
    label: "Move to email",
    body: "If they accept, we'll show you their address so you can continue in your own inbox.",
  },
  {
    value: "ats",
    label: "Into our ATS",
    body: "If they accept, we'll give you their details to paste into your system.",
  },
];

export function isFollowupChannel(value: unknown): value is FollowupChannel {
  return value === "here" || value === "email" || value === "ats";
}

/** What the employer is told at reach-out — deliberately a promise about *after*, not a capability. */
export function followupPromise(channel: FollowupChannel): string {
  switch (channel) {
    case "here":
      return "You'll carry on in this conversation.";
    case "email":
      return "Their email address will appear here as soon as they accept.";
    case "ats":
      return "Their details will be ready to copy as soon as they accept.";
  }
}
