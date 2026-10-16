import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, NotYetReviewed, Rows, Section } from "@/components/legal/legal-page";
import { RETENTION } from "@/server/retention";

export const metadata: Metadata = {
  title: "Privacy — Disruptajob",
  description: "What this site collects, why, how long it keeps it, and how to get rid of it.",
};

/**
 * The privacy policy.
 *
 * Written from the schema outwards rather than from a template inwards, so every claim here is
 * one the code actually honours — the retention periods are imported from the same constants the
 * pruning job uses, so the page cannot quietly go out of date.
 */
export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy"
      updated="15 October 2026"
      summary={
        <>
          You are hidden until you choose otherwise. We don&rsquo;t sell anything about you, we
          don&rsquo;t load anyone else&rsquo;s tracking scripts, and we don&rsquo;t keep a record
          of your IP address. You can download everything we hold, or delete all of it, from your
          settings page — immediately and without asking us.
        </>
      }
    >
      <Section id="who" heading="Who is responsible">
        <p>
          Disruptajob is operated by <strong>[FULL LEGAL NAME]</strong>, a sole trader based in the
          United Kingdom, who is the data controller for the information described here. Under the
          ICO&rsquo;s own self-assessment this service is not yet required to pay the data
          protection fee; that will be revisited the moment trading begins. UK GDPR applies to us
          either way, and this policy is written against what the code actually does.
        </p>
        <p>
          For anything in this policy, write to <strong>[CONTACT EMAIL]</strong>.
        </p>
      </Section>

      <Section id="what" heading="What we collect, and why">
        <p>
          Almost everything here is something you typed on purpose. There is no profile built about
          you in the background.
        </p>
        <Rows
          rows={[
            [
              "Your account",
              "Email address, display name, and a password stored only as a scrypt hash — we cannot read it, and neither can anyone who obtains the database.",
            ],
            [
              "Your profile",
              "Name, location, current job title, availability, and the description you write of what your title doesn't capture.",
            ],
            [
              "Your work",
              "The projects you add: titles, descriptions, what you built, outcomes, tools, links you choose to attach, and the capability tags you apply. These tags are the only thing that produces a capability score.",
            ],
            [
              "Your terms",
              "What you're open to, your dealbreakers, and a minimum salary if you give one. The minimum is never shown to a company — it only ever produces a yes-or-no verdict against what they've offered.",
            ],
            [
              "Your privacy choices",
              "Whether you're discoverable, and the names of any companies you've blocked. Blocked companies are never told.",
            ],
            [
              "Conversations",
              "Messages between you and a company that has approached you.",
            ],
            [
              "Usage events",
              "Which pages were viewed and which steps of sign-up were reached, tied to a random identifier in a cookie. No IP address, no device fingerprint, no third party involved.",
            ],
            [
              "Security records",
              "Failed sign-in attempts, counted against your email address and against a one-way hash of your IP address. The address itself is never written down.",
            ],
          ]}
        />
        <p>
          Please don&rsquo;t put health information, political or religious views, or anything else
          that counts as a{" "}
          <em>special category</em> of personal data into a free-text field. We don&rsquo;t ask for
          any of it and have no use for it.
        </p>
      </Section>

      <Section id="legal-basis" heading="Our lawful bases">
        <Rows
          rows={[
            [
              "Performing a contract",
              "Your account, profile, projects and conversations. We cannot provide the service without them.",
            ],
            [
              "Consent",
              "Making your profile discoverable to employers, and joining the email list for people who aren't ready to build a profile yet. Both are off by default and both can be withdrawn at any time.",
            ],
            [
              "Legitimate interests",
              "Keeping the service secure (rate limiting) and understanding whether it works (first-party usage events). We've kept both as minimal as we can — no IP addresses, no third-party analytics.",
            ],
          ]}
        />
      </Section>

      <Section id="visibility" heading="Who can see you">
        <p>
          A new profile is <strong>hidden</strong>. Nothing you add is visible to any company until
          you change that setting yourself.
        </p>
        <p>
          When you do open up, you can block companies by name — including the one you currently
          work for. Blocked companies cannot find you in search, cannot open your profile by its
          link, and are never informed that you exist or that you blocked them. Candidate search
          and profile pages require a signed-in company account precisely so this check always
          knows who is asking.
        </p>
        <p>
          Honestly stated: the blocklist protects you from a named company acting as itself. A
          determined bad actor could register under a different name — no blocklist can prevent
          that, and we won&rsquo;t pretend otherwise. If that is your threat model, stay hidden:
          hidden is absolute.
        </p>
        <p>
          If you later hide again, you disappear from searches and from any list a company had
          saved you to. A saved list never outlives your consent.
        </p>
      </Section>

      <Section id="cookies" heading="Cookies">
        <p>
          Three cookies, all first-party, none used for advertising. There is no consent banner
          because there is nothing here to consent to beyond what the site needs to function.
        </p>
        <Rows
          rows={[
            ["disruptajob_session", "Keeps you signed in. Expires after 30 days."],
            [
              "dj_v",
              "A random identifier used to count how many people reach each step of sign-up. It is not linked to your account and contains nothing about you or your device. Expires after 180 days.",
            ],
          ]}
        />
      </Section>

      <Section id="sharing" heading="Who we share it with">
        <p>
          <strong>We do not sell personal data, and we never will.</strong> Candidates are free and
          companies pay, specifically so that you are not the product.
        </p>
        <p>
          A company you have allowed to see you will see your profile, your projects and your
          stated terms — never your minimum salary and never your blocklist.
        </p>
        <p>
          The only third party involved in running this service is our hosting provider,{" "}
          <strong>Fly.io</strong>, whose servers hold the database. The application is deployed in
          London and no data is transferred outside the UK or EEA in the normal course of running
          it. We use no advertising networks, no analytics companies and no tracking pixels.
        </p>
      </Section>

      <Section id="retention" heading="How long we keep it">
        <Rows
          rows={[
            [
              "Your account and everything in it",
              "Until you delete it. Deletion is immediate and permanent — there is no recycle bin and no grace period during which we could restore it.",
            ],
            [
              "Sign-in sessions",
              `Deleted ${RETENTION.sessionDays} days after they were created.`,
            ],
            [
              "Usage events",
              `Deleted after ${Math.round(RETENTION.eventDays / 365)} year.`,
            ],
            [
              "Failed sign-in records",
              `Deleted within ${RETENTION.rateAttemptDays} day.`,
            ],
            [
              "Email list",
              "Until you ask to come off it, or until you create an account — at which point deleting your account removes it too.",
            ],
          ]}
        />
      </Section>

      <Section id="rights" heading="Your rights">
        <p>
          Under UK GDPR you can ask for a copy of your data, correct it, delete it, restrict or
          object to how it&rsquo;s used, and take it elsewhere. Two of those you can do yourself,
          right now, without asking anyone:
        </p>
        <ul className="ml-5 list-disc space-y-2">
          <li>
            <Link href="/talent/settings" className="text-ink underline-grow">
              Download everything we hold
            </Link>{" "}
            as a JSON file, from your settings page.
          </li>
          <li>
            <Link href="/talent/settings" className="text-ink underline-grow">
              Delete your account
            </Link>{" "}
            permanently, from the same page.
          </li>
        </ul>
        <p>
          For anything else, write to <strong>[CONTACT EMAIL]</strong> and we&rsquo;ll respond
          within one month. If you think we&rsquo;ve handled your data badly you can complain to
          the{" "}
          <a
            href="https://ico.org.uk/make-a-complaint/"
            className="text-ink underline-grow"
            rel="noopener noreferrer"
            target="_blank"
          >
            Information Commissioner&rsquo;s Office
          </a>
          , though we&rsquo;d rather you told us first so we can put it right.
        </p>
      </Section>

      <Section id="security" heading="Security, honestly">
        <p>
          Passwords are hashed with scrypt. Sessions are opaque tokens in cookies that JavaScript
          cannot read. Privacy rules are enforced in the database layer rather than in individual
          pages. Sign-in is rate limited.
        </p>
        <p>
          What we won&rsquo;t claim: this is a young service, not a bank. There is no two-factor
          authentication yet and no email verification, which means we cannot currently prove that
          the person signing up owns the address they typed. Both are planned. Until they exist,
          please use a password you don&rsquo;t use anywhere else.
        </p>
      </Section>

      <Section id="children" heading="Age">
        <p>This service is for people in work or seeking it, and is not intended for under-16s.</p>
      </Section>

      <Section id="changes" heading="Changes">
        <p>
          If this policy changes in a way that affects how your data is used, we&rsquo;ll say so on
          this page and tell account holders directly rather than quietly updating the date.
        </p>
      </Section>

      <NotYetReviewed />
    </LegalPage>
  );
}
