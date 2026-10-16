/**
 * The first logging this application has had (audit S3: zero statements anywhere in server code,
 * meaning the first production error after launch would have left no trace at all).
 *
 * Deliberately primitive: one JSON line per event to stderr, which Fly captures as `fly logs`.
 * No levels beyond error/warn, no transport, no service — observability proportionate to one
 * machine and one founder. The shape is stable so grep and jq work on day one.
 */

function emit(level: "error" | "warn", context: string, detail: Record<string, unknown>) {
  const line = {
    ts: new Date().toISOString(),
    level,
    context,
    ...detail,
  };
  // stderr, not stdout — keeps Next's own request logging separable.
  console.error(JSON.stringify(line));
}

export function logError(context: string, error: unknown, extra?: Record<string, unknown>) {
  const err =
    error instanceof Error
      ? { message: error.message, stack: error.stack?.split("\n").slice(0, 6).join("\n") }
      : { message: String(error) };
  emit("error", context, { ...err, ...extra });
}

export function logWarn(context: string, message: string, extra?: Record<string, unknown>) {
  emit("warn", context, { message, ...extra });
}
