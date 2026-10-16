import {
  IdenticalOnPaper,
  SentIntoSilence,
  TitleTooSmall,
} from "@/components/illustrations/reality-marks";

/**
 * The empathy beat.
 *
 * Someone deep into a long job search has usually concluded the problem is them. Before we ask
 * for any effort, we name what's actually happening and put the blame on the format. This earns
 * the right to ask for a project — nothing here sells, it just tells the truth about the system.
 */

const REALITIES = [
  {
    // A number rather than "months" — specificity is what makes someone feel recognised.
    heading: "Two hundred applications. Four replies.",
    body: "Not because you’re underqualified. Because an application is judged on a document that can’t show what you actually did.",
    Mark: SentIntoSilence,
  },
  {
    heading: "Your title picked one job.",
    body: "You might run operations, build the automations and own half of product. “Operations Associate” covers none of it — and that’s the word the filters search for.",
    Mark: TitleTooSmall,
  },
  {
    heading: "Everyone sounds perfect on paper now.",
    body: "AI writes a flawless cover letter in seconds, so polish stopped meaning anything. The work you’ve genuinely done is the one thing that’s still yours.",
    Mark: IdenticalOnPaper,
  },
];

export function NotYourFault() {
  return (
    <section className="border-b border-ink/10">
      <div className="mx-auto max-w-[1400px] px-6 py-20 lg:px-10 lg:py-28">
        <div className="mb-14 max-w-2xl">
          <p className="mb-5 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
            If the search has been long
          </p>
          <h2 className="font-serif-display text-3xl leading-tight text-ink sm:text-4xl lg:text-[2.75rem]">
            Applying the traditional way is the outdated part.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-ink-soft">
            Months of silence will make anyone think they&rsquo;re the problem. Usually the
            problem is that hiring reads a summary of you instead of the work itself.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-px border border-ink/10 bg-ink/10 sm:grid-cols-3">
          {REALITIES.map(({ heading, body, Mark }) => (
            <div key={heading} className="flex flex-col bg-paper p-8">
              <Mark className="mb-6 h-20 w-full" />
              <h3 className="font-serif-display text-xl leading-snug text-ink">{heading}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
