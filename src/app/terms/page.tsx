import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, NotYetReviewed, Rows, Section } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Terms — Disruptajob",
  description: "The agreement between you and Disruptajob, in plain English.",
};

/**
 * Terms of use.
 *
 * Two audiences with genuinely different obligations — a candidate who owes us nothing, and a
 * company that will eventually pay and is handling other people's data. Rather than write one
 * document that hedges for both, the duties are separated and named.
 *
 * The employment-agency section is deliberate: UK guidance treats online platforms of this kind as
 * employment agencies, and the central rule — that a work-seeker may not be charged — is one this
 * business model already satisfies. Saying so plainly is worth more than omitting it.
 */
export default function TermsPage() {
  return (
    <LegalPage
      title="Terms"
      updated="15 October 2026"
      summary={
        <>
          Candidates use this for free, permanently. Companies pay. You own the work you describe
          here and can take it with you or delete it at any time. We don&rsquo;t promise you a job,
          and we don&rsquo;t promise a company a hire — what we promise is that what you see is
          backed by evidence rather than by assertion.
        </>
      }
    >
      <Section id="agreement" heading="The agreement">
        <p>
          These terms are between you and <strong>William Peter Sandford</strong>, a sole trader based
          in the United Kingdom. Using this site means accepting them. They&rsquo;re
          governed by the law of England and Wales.
        </p>
        <p>
          How we handle your information is set out separately in our{" "}
          <Link href="/privacy" className="text-ink underline-grow">
            privacy policy
          </Link>
          , which forms part of this agreement.
        </p>
      </Section>

      <Section id="free" heading="Free for candidates. Permanently.">
        <p>
          If you are looking for work, this service is free and we will not charge you — not for an
          account, not for visibility, not for being contacted, and not for any &ldquo;premium&rdquo;
          tier that moves you up a list.
        </p>
        <p>
          This is not only a pricing decision. Under the Conduct of Employment Agencies and
          Employment Businesses Regulations 2003, a work-seeker may not be charged a fee for finding
          or seeking to find them work, and that rule applies to online platforms like this one. Our
          business model is built so that the question never arises: companies pay, candidates
          don&rsquo;t.
        </p>
      </Section>

      <Section id="your-work" heading="Your work stays yours">
        <p>
          You keep ownership of everything you write and upload. You give us only the permission we
          need to run the service: to store your content, show it to the companies you have allowed
          to see it, and display it back to you.
        </p>
        <p>
          That permission ends when you delete the content or your account. We don&rsquo;t keep a
          copy to train anything, we don&rsquo;t license it onwards, and we don&rsquo;t use your
          work in marketing without asking you first.
        </p>
        <p>
          Describe only work you actually did, and don&rsquo;t publish anything you&rsquo;re not
          free to share — an employer&rsquo;s confidential information, material covered by an NDA,
          or someone else&rsquo;s work presented as yours. If you&rsquo;re unsure, describe the
          problem and your contribution rather than attaching the artefact.
        </p>
      </Section>

      <Section id="candidates" heading="If you're looking for work">
        <Rows
          rows={[
            [
              "Be accurate",
              "Capability scores come from the work you tag, so tagging work you didn't do produces a profile that misrepresents you. We may remove content or accounts where that happens.",
            ],
            [
              "You control visibility",
              "You start hidden and decide when to be discoverable. You can block companies by name, and they are never told.",
            ],
            [
              "You owe nobody a reply",
              "An approach is an approach. Declining one, or ignoring it, costs you nothing here.",
            ],
            [
              "One account",
              "Please keep to a single account. Multiple profiles for one person makes evidence meaningless.",
            ],
          ]}
        />
      </Section>

      <Section id="companies" heading="If you're hiring">
        <p>
          Companies carry heavier obligations here, because you are seeing information about real
          people who trusted us with it.
        </p>
        <Rows
          rows={[
            [
              "Use it for hiring, and nothing else",
              "Profiles may be used to consider and contact someone about work. Not for marketing, not for building a database, not for selling on, and not for any automated scraping or bulk extraction.",
            ],
            [
              "Respect the decision to be unseen",
              "Do not attempt to identify, contact or circumvent anyone who has made themselves hidden or has blocked you. Doing so ends your access immediately.",
            ],
            [
              "You become a controller of what you take",
              "Once you export or copy a candidate's details into your own systems, you are responsible for them under UK GDPR, including honouring that person's rights.",
            ],
            [
              "Describe the work honestly",
              "Role listings must describe work that genuinely exists. No fictitious openings to harvest profiles.",
            ],
            [
              "Hire lawfully",
              "You remain responsible for complying with the Equality Act 2010 and all other hiring law. Evidence-based matching is a tool; the decisions and their legality are yours.",
            ],
          ]}
        />
      </Section>

      <Section id="pricing" heading="Paying">
        <p>
          Charges for companies, if any apply to your account, will be set out before you are asked
          to pay. We will never introduce a charge to a candidate.
        </p>
        <p className="border border-ink/10 bg-paper-dim/60 px-4 py-3">
          <strong>[PRICING, BILLING TERMS, REFUND AND CANCELLATION POLICY TO BE COMPLETED BEFORE
          CHARGING BEGINS.]</strong>
        </p>
      </Section>

      <Section id="what-we-dont-promise" heading="What we don't promise">
        <p>
          We don&rsquo;t promise you a job, an approach, an interview, or a hire. We don&rsquo;t
          verify employment history, and a capability score describes the evidence someone has
          attached — not a guarantee about them. Companies should still do their own assessment, and
          candidates should still do their own diligence on a company.
        </p>
        <p>
          The service is provided as it is. We aim to keep it available and correct, and we&rsquo;ll
          tell you honestly when it isn&rsquo;t. This is an early-stage product and it may change,
          break, or be unavailable.
        </p>
      </Section>

      <Section id="liability" heading="Liability">
        <p>
          Nothing here limits liability for death or personal injury caused by negligence, for
          fraud, or for anything else that cannot lawfully be limited.
        </p>
        <p>
          Beyond that, we are not liable for indirect or consequential loss, or for lost
          opportunities, profits or data. Where liability cannot be excluded, it is limited to the
          greater of the amount you paid us in the twelve months before the claim, or{" "}
          <strong>£100</strong>. Candidates pay nothing, so for a candidate this is the stated
          amount.
        </p>
      </Section>

      <Section id="ending" heading="Ending it">
        <p>
          You can delete your account at any time from your settings page. It happens immediately
          and permanently.
        </p>
        <p>
          We may suspend or close an account that breaks these terms — most seriously, a company
          that contacts someone who blocked it, or an account misrepresenting whose work is whose.
          Where it&rsquo;s reasonable to do so, we&rsquo;ll tell you why and give you a chance to
          put it right first.
        </p>
      </Section>

      <Section id="changes" heading="Changes">
        <p>
          If these terms change materially, we&rsquo;ll tell account holders rather than silently
          updating this page. Continuing to use the service after that means accepting the change.
        </p>
      </Section>

      <Section id="contact" heading="Contact">
        <p>
          <strong>hello@disruptajob.com</strong>
        </p>
      </Section>

      <NotYetReviewed />
    </LegalPage>
  );
}
