/**
 * Runtime switches for deployed environments.
 *
 * Demo mode exists so the site can be publicly reachable — for a reviewer, an AI agent, or
 * someone you've sent the link to — without being an unlocked front door. It's safe to be open
 * precisely because sign-up is closed and every profile in the database is invented: there is no
 * real personal data to leak and no way for a visitor to add any.
 *
 * Turn it off only once there's a privacy policy, ICO registration and email verification.
 */
export const DEMO_MODE = process.env.DEMO_MODE === "true";

/** Whether strangers can create accounts. Closed in demo mode, for the reason above. */
export const SIGNUP_ENABLED = !DEMO_MODE;
