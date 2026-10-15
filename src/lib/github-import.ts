/**
 * Owner id for work captured during onboarding, before an account exists.
 *
 * Lives here rather than in the onboarding components so that server code can use it too — a
 * "use server" module cannot import from a "use client" one.
 */
export const DRAFT_OWNER_ID = "onboarding-draft";
