import { logError } from "./server/log";

/**
 * Next.js instrumentation hooks.
 *
 * onRequestError is the single place every unhandled server-side error passes through — pages,
 * server actions and route handlers alike. Without this, a 500 in production rendered a generic
 * page and recorded nothing (audit S3).
 */

export function register() {
  // Nothing to initialise — the hook below is the point.
}

export const onRequestError = (
  error: unknown,
  request: { path: string; method: string }
) => {
  logError("unhandled-request-error", error, {
    path: request.path,
    method: request.method,
  });
};
