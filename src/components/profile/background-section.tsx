import type { CandidateProfile } from "@/types";

export function BackgroundSection({ candidate }: { candidate: CandidateProfile }) {
  return (
    <section className="border-b border-ink/10 bg-paper-dim/40">
      <div className="mx-auto max-w-[1100px] px-6 py-10 lg:px-10">
        <div>
          <h3 className="text-sm font-medium text-ink-faint">Background</h3>
          {candidate.linkedinUrl && (
            <p className="mt-3 text-sm">
              <a
                href={candidate.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink underline-grow"
              >
                LinkedIn ↗
              </a>
            </p>
          )}
          {/* Their own words, above the chronology. Context for someone already interested , 
              and explicitly marked as unscored, so it can't be mistaken for evidence. */}
          {candidate.about && (
            <div className="ml-6 mt-6 border-l-2 border-ink/10 pl-5">
              <h4 className="mb-3 text-xs font-medium uppercase tracking-wide text-ink-faint">
                In their own words
              </h4>
              <p className="max-w-2xl whitespace-pre-line text-[15px] leading-relaxed text-ink-soft">
                {candidate.about}
              </p>
            </div>
          )}

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
        </div>
      </div>
    </section>
  );
}
