import { isEmailVerified } from "@/server/email-verification";
import { resendVerificationAction } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";

/**
 * Shown on settings pages while the account's email is unverified.
 *
 * Exists because a verification email is the single most losable email there is — spam filters,
 * typos, a send that failed quietly — and without a retry button the only recovery was asking
 * the founder. Verification gates nothing (see email-verification.ts), so the tone is an offer,
 * not a nag.
 */
export function VerifyEmailNotice({
  accountId,
  email,
  sent,
}: {
  accountId: string;
  email: string;
  sent?: boolean;
}) {
  if (isEmailVerified(accountId)) return null;

  return (
    <div className="mb-8 border border-ink/15 bg-paper-dim px-5 py-4">
      <p className="text-sm text-ink">
        <span className="font-medium">One loose end:</span> {email} isn&rsquo;t confirmed yet.
      </p>
      <p className="mt-1 text-sm leading-relaxed text-ink-soft">
        Nothing is locked — this only matters if you ever forget your password, because recovery
        has to reach a confirmed inbox.
      </p>
      {sent ? (
        <p className="mt-3 text-sm text-ink-soft">
          Sent — check your inbox (and spam) for a message from hello@disruptajob.com.
        </p>
      ) : (
        <form action={resendVerificationAction} className="mt-3">
          <Button type="submit" variant="outline" size="sm">
            Email me the confirmation link
          </Button>
        </form>
      )}
    </div>
  );
}
