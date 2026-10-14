import { ChevronDown } from "lucide-react";
import type { CandidateProfile } from "@/types";

export function BackgroundSection({ candidate }: { candidate: CandidateProfile }) {
  return (
    <section className="border-b border-ink/10 bg-paper-dim/40">
      <div className="mx-auto max-w-[1100px] px-6 py-10 lg:px-10">
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center gap-3 text-sm font-medium text-ink-faint">
            <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
            Background
          </summary>
          <div className="ml-6 mt-6 grid grid-cols-1 gap-10 sm:grid-cols-2">
            <div>
              <h4 className="mb-3 text-xs font-medium uppercase tracking-wide text-ink-faint">Experience</h4>
              <ul className="space-y-3">
                {candidate.experience.map((exp, i) => (
                  <li key={i} className="text-sm text-ink-soft">
                    <span className="font-medium text-ink">{exp.role}</span> · {exp.company}
                    <div className="text-xs text-ink-faint">
                      {exp.startDate} – {exp.endDate}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-xs font-medium uppercase tracking-wide text-ink-faint">Education</h4>
              <ul className="space-y-3">
                {candidate.education.map((edu, i) => (
                  <li key={i} className="text-sm text-ink-soft">
                    <span className="font-medium text-ink">{edu.institution}</span>
                    <div className="text-xs text-ink-faint">
                      {edu.qualification} · {edu.endYear}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </details>
      </div>
    </section>
  );
}
