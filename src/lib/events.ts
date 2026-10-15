/**
 * The event vocabulary, kept here rather than in server/analytics.ts so client components can
 * import a name without dragging `node:sqlite` into the browser bundle.
 *
 * A fixed list on purpose: the server action that records events rejects anything not in it, so
 * nothing on the page can invent its own rows.
 */
export const EVENTS = {
  landingView: "landing_view",
  onboardingStart: "onboarding_start",
  onboardingStep: "onboarding_step",
  onboardingProject: "onboarding_project_added",
  onboardingComplete: "onboarding_complete",
  employerSetupStart: "employer_setup_start",
  employerSetupStep: "employer_setup_step",
  employerSetupComplete: "employer_setup_complete",
  interestCaptured: "interest_captured",
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];
