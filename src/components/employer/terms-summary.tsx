import { Check, Lock, TriangleAlert } from "lucide-react";
import type { EmployerSafeTerms } from "@/lib/terms";
import type { TermsFit } from "@/types";
import { cn } from "@/lib/utils";

/**
 * Shows what a candidate needs from a role, and how the employer's stated terms line up.
 *
 * Takes `EmployerSafeTerms`, never `NonNegotiables` — the comp floor is structurally absent, so
 * this component could not display it even if asked to.
 */

export function TermsVerdictLine({ fit }: { fit: TermsFit }) {
  if (fit.notes.length === 0) return null;
  const conflicting = fit.compensation === "conflicts" || fit.workArrangement === "conflicts";

  return (
    <div
      className={cn(
        "flex items-start gap-2 border px-3 py-2 text-xs",
        conflicting
          ? "border-ink/20 bg-ink/[0.03] text-ink-soft"
          : "border-evidence/25 bg-evidence-soft text-evidence"
      )}
    >
      {conflicting ? (
        <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      ) : (
        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      )}
      <span>{fit.notes.join(" ")}</span>
    </div>
  );
}

export function TermsSummary({
  terms,
  fit,
}: {
  terms: EmployerSafeTerms;
  fit?: TermsFit;
}) {
  const hasAnything =
    terms.roleTypes.length > 0 ||
    terms.workArrangements.length > 0 ||
    terms.locationConstraint ||
    terms.dealbreakers.length > 0;

  if (!hasAnything) return null;

  return (
    <div className="border border-ink/10 p-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium text-ink">What they need from a role</h3>
        <span className="flex items-center gap-1.5 text-[11px] text-ink-faint">
          <Lock className="h-3 w-3" />
          Set by them
        </span>
      </div>
      <p className="mt-1.5 text-xs text-ink-faint">
        Stated terms, not evidence, this doesn&rsquo;t affect their capability score.
      </p>

      <dl className="mt-5 space-y-4">
        {terms.roleTypes.length > 0 && (
          <Row label="Open to">{terms.roleTypes.join(" · ")}</Row>
        )}
        {terms.workArrangements.length > 0 && (
          <Row label="Arrangement">
            <span className="capitalize">{terms.workArrangements.join(" / ")}</span>
          </Row>
        )}
        {terms.locationConstraint && <Row label="Location">{terms.locationConstraint}</Row>}
        {terms.dealbreakers.length > 0 && (
          <Row label="Deal-breakers">{terms.dealbreakers.join(" · ")}</Row>
        )}
        <Row label="Minimum">
          <span className="text-ink-faint">
            Private, we only tell you whether your budget clears it.
          </span>
        </Row>
      </dl>

      {fit && fit.notes.length > 0 && (
        <div className="mt-5">
          <TermsVerdictLine fit={fit} />
        </div>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-4">
      <dt className="text-xs uppercase tracking-[0.12em] text-ink-faint">{label}</dt>
      <dd className="text-sm text-ink-soft">{children}</dd>
    </div>
  );
}
