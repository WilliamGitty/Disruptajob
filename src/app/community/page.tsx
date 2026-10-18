import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Community · Disruptajob",
  description:
    "A place for job seekers and the people who get it: groups, honest debate, and company. Being built now; the people are already arriving.",
  alternates: { canonical: "/community" },
};

/**
 * The community, announced before it exists, honestly.
 *
 * Founder direction (18 Oct 2026): this grows into a forum with member-made groups. The field
 * evidence behind it: a tester whose whole search runs on group chats, events and
 * "like-minded spaces". The constraint it inherits: strategy §5c. Whatever gets built here is
 * belonging, not a feed; no engagement bait, no streaks, nobody's promotion announcement.
 */
export default function CommunityPage() {
  return (
    <main className="mx-auto max-w-[680px] px-6 py-14 lg:py-20">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
        Community · being built
      </p>
      <h1 className="font-serif-display text-3xl leading-tight text-ink sm:text-4xl">
        Job searching is lonely. It doesn&rsquo;t have to be done alone.
      </h1>

      <div className="mt-8 space-y-5 text-[16px] leading-[1.75] text-ink">
        <p>
          This page is a promise under construction, and we&rsquo;d rather say so than pretend.
          What&rsquo;s coming: a place where the people here can actually talk. Groups you can
          start around whatever matters, a sector, a city, a situation, career changers, first
          jobs, the six-month-stint club. Honest debate about how hiring actually works, with
          the people living it.
        </p>
        <p>
          What it will never be: a feed. No streaks, no engagement bait, nobody&rsquo;s
          promotion announcement at 11pm. The same rule the rest of this site keeps, because
          half of you came here to get away from exactly that.
        </p>
        <p>
          While it&rsquo;s being built, the people are already arriving:{" "}
          <Link href="/people" className="text-ink underline-grow">
            browse who&rsquo;s here
          </Link>{" "}
          by the work they&rsquo;ve published, or{" "}
          <Link href="/talent/onboarding" className="text-ink underline-grow">
            put your own work up
          </Link>{" "}
          so you&rsquo;re in it from the start.
        </p>
        <p className="text-[15px] text-ink-soft">
          Got opinions on what this should be? Genuinely wanted:{" "}
          <a href="mailto:hello@disruptajob.com" className="text-ink underline-grow">
            hello@disruptajob.com
          </a>{" "}
          reaches the founder, not a team.
        </p>
      </div>
    </main>
  );
}
