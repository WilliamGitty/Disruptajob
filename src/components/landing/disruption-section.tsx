const PRECEDENTS = [
  { n: "01", text: "Indeed improved the job board." },
  { n: "02", text: "LinkedIn digitised the professional profile." },
];

export function DisruptionSection() {
  return (
    <section className="border-b border-ink/10 bg-paper-dim/60">
      <div className="mx-auto max-w-[1000px] px-6 py-20 lg:px-10 lg:py-28">
        <p className="mb-10 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
          The shift
        </p>
        <div className="space-y-7">
          {PRECEDENTS.map((step) => (
            <div key={step.n} className="flex items-baseline gap-6 border-b border-ink/10 pb-7">
              <span className="font-serif-display text-sm text-ink-faint">{step.n}</span>
              <p className="text-xl leading-snug text-ink-soft sm:text-2xl">{step.text}</p>
            </div>
          ))}
          <div className="flex items-baseline gap-6 border-l-2 border-accent pl-6">
            <span className="font-serif-display text-sm text-accent">03</span>
            <p className="font-serif-display text-2xl leading-[1.15] text-ink sm:text-3xl lg:text-[2.5rem]">
              We don&rsquo;t think you should have to write another application to be taken
              seriously.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
