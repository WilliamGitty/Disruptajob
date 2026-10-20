import type { Metadata } from "next";
import Link from "next/link";
import { EVENTS, track } from "@/server/analytics";

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
export const dynamic = "force-dynamic";

export default async function WhyPage() {
  await track(EVENTS.whyView, { path: "/why" });
  const reasons = [
    {
      title: "A page that shows your work",
      body: "You describe real work you have done: a project, an event, a system, a process you ran. We call this published work, which means work you chose to put on your page, in your own words. Your page holds only this work. There is no skills list to fill with claims, and no AI rates you or rewrites you.",
    },
    {
      title: "A link you can send anywhere",
      body: "Your page lives at one web address. Put the link in a job application, an email signature, or a message. It is useful on its own, even if you never hear from any company on this site.",
    },
    {
      title: "Roles matched against your work",
      body: "Open roles are compared with the work on your page, and every match percentage shows its reasons. There are no job applications here. If you like a role, you press one button, and that lets the company see your profile. That is all the button does. It sends no message and no documents.",
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
        This page is for people looking for work. If you are hiring,{" "}
        <Link href="/employer" className="text-ink underline-grow">
          this one is yours
        </Link>
        . An account takes about ten minutes and is free, always. You can answer a few short
        questions about real work, or start from a CV or GitHub and edit what AI drafts for you.
        Either way, you approve every word. Here is what you get.
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
