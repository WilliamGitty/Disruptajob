import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About · Disruptajob",
  description:
    "Why this exists: a CV flattens three jobs into one line, two hundred applications get four replies, and the fix is evidence, not better formatting.",
  alternates: { canonical: "/about" },
};

/**
 * The founding story, told as the pain points that caused it. No mission-statement language:
 * the reader has seen a thousand About pages that say "we believe talent is everywhere" and
 * trusts none of them. Specifics or nothing.
 */
export default function AboutPage() {
  return (
    <main className="mx-auto max-w-[680px] px-6 py-14 lg:py-20">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">About</p>
      <h1 className="font-serif-display text-3xl leading-tight text-ink sm:text-4xl">
        Why we built this
      </h1>

      <div className="mt-10 space-y-6 text-[16px] leading-[1.75] text-ink">
        <p>
          Disruptajob started with a job title that was lying by omission. The person behind it ran
          business operations, built the automations, owned half of product, and had taught himself
          to ship software with AI. His CV had room for one line of that, and the line it kept was
          the least interesting one.
        </p>
        <p>
          That is not an unusual story. It is the standard experience of anyone whose work outgrew
          their job description, which is most capable people a few years into doing anything. The
          CV compresses. The title flattens. The application portal counts keywords. And somewhere
          on the other side, a company that genuinely needs what you genuinely do scrolls straight
          past, because nothing in the format could carry the information.
        </p>
        <p>
          Then there is the arithmetic nobody says out loud. Two hundred applications. Four
          replies. Not four offers, four replies. If a channel loses ninety-eight percent of
          everything sent through it, the problem is not the senders. The problem is the channel,
          and the fix is not a better CV template.
        </p>

        <h2 className="pt-4 font-serif-display text-xl text-ink">What we did about it</h2>
        <p>
          We removed the claims and kept the proof. On Disruptajob you do not describe yourself
          with adjectives; you publish work. Real projects, tagged with what they demonstrate,
          with links and outcomes where they exist. A capability on a profile here can only come
          from published evidence. There is nowhere in our database to type a skill into
          existence: not for you, not for an importer, not for an AI. We built it that way on
          purpose, and we keep it that way on principle.
        </p>
        <p>
          Companies work the same way in reverse. There are no job postings to spray applications
          at, because there are no applications. A company defines a role by the work it actually
          contains, searches for people whose evidence matches, and reaches out, as itself, with a
          message a human wrote. The first contact on this platform is always a real company that
          read your actual work.
        </p>
        <p>
          And because the people with the best evidence usually have jobs, every profile starts
          hidden. You become findable when you choose, you can block specific companies from ever
          seeing you, and both promises are enforced in the database itself, not in a policy
          document. The policy document exists too.{" "}
          <Link href="/privacy" className="text-ink underline-grow">
            It matches the code.
          </Link>
        </p>

        <h2 className="pt-4 font-serif-display text-xl text-ink">Who&rsquo;s behind it</h2>
        <div className="flex items-start gap-5">
          {/* Swap for /founder.jpg the day the photo lands; the layout already fits it. */}
          <span className="flex h-20 w-20 shrink-0 items-center justify-center border border-ink/15 bg-paper-dim font-serif-display text-2xl text-ink">
            WS
          </span>
          <div>
            <p className="font-medium text-ink">William Sandford</p>
            <p className="mt-1 text-[15px] leading-relaxed text-ink-soft">
              I run operations and build automations at a venture builder by day, and I taught
              myself to ship software with AI because waiting for permission stopped making
              sense. My own CV kept one line of all that. This site is what I wished existed,
              built in the open, mistakes included. If something here annoys you, tell me:
              hello@disruptajob.com reaches me, not a team.
            </p>
          </div>
        </div>

        <h2 className="pt-4 font-serif-display text-xl text-ink">Where it stands</h2>
        <p>
          Disruptajob is new and built small: one founder, an AI pair, and a few weeks of
          ferocious building. We would rather tell you that than perform being bigger than we are.
          The platform is free for candidates and always will be, free for companies while we are
          in beta, and honest about what it cannot yet promise, which is volume. What it can
          promise is that everything you see here is backed by evidence, including this page.
        </p>
        <p>
          Questions we hear a lot are answered on the{" "}
          <Link href="/faq" className="text-ink underline-grow">
            FAQ
          </Link>
          , and the opinions behind the design are argued in{" "}
          <Link href="/articles" className="text-ink underline-grow">
            the articles
          </Link>
          . If you have had a hard year of applying, start with one project:{" "}
          <Link href="/talent/onboarding" className="text-ink underline-grow">
            it takes about ten minutes
          </Link>
          , and nobody sees it until you say so.
        </p>
      </div>
    </main>
  );
}
