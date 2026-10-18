import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Why create an account · Disruptajob",
  description:
    "What an account gets you: a page of real work, a link that works anywhere, and open roles scored against your evidence. Free, and hidden until you say otherwise.",
};

/**
 * The page behind "Why create an account?" in the About menu. It answers the only question a
 * first-time visitor is actually asking, in the Copywriter's voice: service, specifics,
 * reason-why. It makes no promise the product doesn't keep.
 */
export default function WhyPage() {
  const reasons = [
    {
      title: "A page that shows your work",
      body: "You describe real projects and tag what each one proves. The page reads as evidence, because that is all it can contain: nothing you merely claim about yourself appears anywhere on it.",
    },
    {
      title: "A link that works from day one",
      body: "Your page lives at one address. Put it in an application, an email signature, a message to a hiring manager. It works before any company here has ever seen you.",
    },
    {
      title: "Roles scored against your evidence",
      body: "Open roles are compared with the work you have published, and every percentage explains itself. There are no applications on this site. When a role deserves it, you register interest, which lets that one company see you and sends nothing.",
    },
    {
      title: "Hidden until you say otherwise",
      body: "Every new profile starts invisible. You choose who can find you, and you can name companies that never can, your current employer included.",
    },
  ];

  return (
    <main className="mx-auto max-w-[700px] px-6 py-14 lg:py-20">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
        Before you decide
      </p>
      <h1 className="font-serif-display text-3xl leading-tight text-ink sm:text-4xl">
        What an account gets you.
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
        It takes about ten minutes, four questions about work you have actually done. It is free
        for candidates, always. Here is what exists at the end of it.
      </p>

      <div className="mt-10 space-y-8">
        {reasons.map((r) => (
          <section key={r.title} className="border-t border-ink/10 pt-6">
            <h2 className="font-serif-display text-lg text-ink">{r.title}</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{r.body}</p>
          </section>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap items-center gap-5 border-t border-ink/10 pt-8">
        <Link href="/talent/onboarding">
          <span className="inline-flex h-11 items-center border border-ink bg-ink px-6 text-sm font-medium text-paper transition-colors hover:bg-ink/85">
            Add my first project
          </span>
        </Link>
        <Link href="/about" className="text-sm text-ink-soft underline-grow">
          Read how this place works first
        </Link>
      </div>
    </main>
  );
}
