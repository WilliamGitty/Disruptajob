/**
 * The last remnant of the pre-auth prototype.
 *
 * The candidate and employer id constants that used to live here are gone: both onboarding flows
 * now derive the actor from the session, so a hardcoded id can no longer send someone else's work
 * to a seeded demo profile.
 *
 * This one survives only as a default argument in `search.ts` and `role-matching.ts`, which is a
 * poor default — a caller that forgets to pass the viewing company evaluates a candidate's
 * blocklist against the wrong one. Those signatures should require it.
 */
export const CURRENT_EMPLOYER_COMPANY = "Meridian Robotics";
