import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ · Disruptajob",
  description:
    "Straight answers: what it costs, who can see you, how capabilities are scored, where AI is used, and what happens to your data.",
  alternates: { canonical: "/faq" },
};

interface QA {
  q: string;
  a: React.ReactNode;
}

const CANDIDATE_QAS: QA[] = [
  {
    q: "What does it cost me?",
    a: "Nothing, ever. Candidates are free for good: companies are the paying side. That is not generosity, it is structural. The platform only works if people with real evidence show up, so charging you would be sawing at our own branch.",
  },
  {
    q: "Who can see my profile?",
    a: (
      <>
        Nobody, until you say otherwise. Every new profile starts hidden: it appears in no search
        and its link opens only for you. When you choose to be findable, you can also name
        companies that must never see you, your current employer being the obvious first entry.
        That blocklist is enforced inside the database query itself.{" "}
        <Link href="/privacy" className="text-ink underline-grow">
          The privacy policy
        </Link>{" "}
        describes exactly what the code does.
      </>
    ),
  },
  {
    q: "How are capabilities scored?",
    a: "Only from published work. You describe a real project, tag what it genuinely involved, and the tags on published projects are the only thing that can move a capability. There is no field anywhere for typing a skill in directly, so a score here cannot be inflated by better prose.",
  },
  {
    q: "Do I need a CV?",
    a: "No. If you have one, you can drop it on the import desk and AI will draft projects from it for you to edit, tag and publish, or throw away. The file itself is read once and never stored, and nothing in it ever becomes a capability until you have published the work it describes and tagged it yourself. The product exists because CVs compress people badly; we are not going to turn around and score the compression.",
  },
  {
    q: "What if I don't have GitHub or side projects?",
    a: "Most good evidence is not code. The process you redesigned, the automation you set up, the reporting pack you rebuilt, the event you ran: anything real, described concretely, with the outcome attached. If you did it and can explain it, it counts.",
  },
  {
    q: "What does 'published work' actually mean?",
    a: "Real work you did, described in your own words, and put on your page. A project, a system, an event, a dissertation, a process you ran. It is different from a skills list in one way that matters: a skill is a claim about yourself, and published work is the thing itself, which a reader can judge. You add links and outcomes when they exist, but a clear description of what you did and what changed is enough.",
  },
  {
    q: "My work doesn't leave documents or links behind. Does it still count?",
    a: "Yes, and this question is why our onboarding starts with 'what would break if you went away for a month'. Care work, operations, support, teaching: the best of it leaves no artefact, but anyone who really did it can describe how it worked. What you found, what you did, what changed. That description, in concrete detail, is the evidence. Someone who didn't do the work can't fake the detail under their own name in public.",
  },
  {
    q: "I'm early in my career with little experience. Is this for me?",
    a: "Yes, and arguably more than for anyone else. You are not asked for years of history here; you are asked for one real piece of work. A dissertation, a volunteer project, the system you built in a part-time job. One well-described piece puts you in search results next to people with long CVs, because the search reads work, not years.",
  },
  {
    q: "Does this work outside tech?",
    a: "Yes. Capabilities here cover four kinds of work: building and improving, running things, working with people (training, speaking, care and support, community), and insight and reach (research, writing, events, fundraising). Companies search by capability, not by industry, so a workshop programme and a software project sit in the same index.",
  },
  {
    q: "Isn't this quite a rigid way to present a person?",
    a: "It is narrower than a CV on purpose. The page only holds work that can be described and checked, because that is the part hiring keeps getting wrong. The rest of you still has room: your one-sentence description, your about text and your background are written in your own words and never scored. What the format refuses to hold is claims nobody can check, and that refusal is the product.",
  },
  {
    q: "Can I use my profile outside Disruptajob?",
    a: "Yes, and you should. Once you open your profile up, its link works anywhere: job applications, LinkedIn, an email signature. Evidence beats attachments.",
  },
  {
    q: "What exactly does a company see when it finds me?",
    a: (
      <>
        Your page as you published it: your name, your projects, the capabilities your work
        demonstrates, and your preferred arrangements and location if you set them. Two things it
        never sees: your private minimum salary, which is compared against a role&rsquo;s band but
        never displayed, and your contact details, which are released only after you accept an
        approach. Until then, a company that wants to reach you goes through{" "}
        <Link href="/talent/opportunities" className="text-ink underline-grow">
          Who&rsquo;s interested
        </Link>
        , and you decide.
      </>
    ),
  },
  {
    q: "If I register interest in a role, what did I just share?",
    a: "Visibility, nothing else. Registering interest lets that one company see your profile while the interest stands, even if you are otherwise hidden. No message is sent, no document attached, nothing lands in an inbox. Withdraw it any time from Registered interest in your menu, and the wall is back up immediately.",
  },
  {
    q: "How do I delete everything?",
    a: "From account management, in one action, and it is real deletion, not deactivation. Your profile, projects, interests and account are removed from the live database immediately. One honest footnote: encrypted nightly backups exist for disaster recovery and cycle out after 30 days, so a deleted account is fully gone from those within a month. You can export your data first, and you never owe us a reason.",
  },
];

const EMPLOYER_QAS: QA[] = [
  {
    q: "What does it cost a company?",
    a: "Free during beta, with no card required. When we charge, companies will pay, likely per filled role or a flat subscription, and we will say so plainly before anything changes. Nothing is charged retroactively.",
  },
  {
    q: "Why do I need an account to search?",
    a: (
      <>
        Because search here is accountable. Candidates can block named companies from seeing them,
        and that check needs to know who is asking. Browsing is open:{" "}
        <Link href="/people" className="text-ink underline-grow">
          the people page
        </Link>{" "}
        shows everyone who has chosen to be visible, no sign-in needed.
      </>
    ),
  },
  {
    q: "What am I actually searching?",
    a: "Evidence. You define a role by the work it contains and the capabilities that work demands, and results are people whose published projects demonstrate them. Every match is explainable: click through and the supporting work is right there.",
  },
  {
    q: "Why is there no job posting?",
    a: "Postings attract floods, floods stop being read, and a meaningful share of postings on the open web are not even real roles. Here the costly, honest signal is you reaching out to a specific person about their specific work.",
  },
];

const PLATFORM_QAS: QA[] = [
  {
    q: "Where do you use AI, honestly?",
    a: "Two places, both visible. The site itself was largely built by a founder working with AI, and we think that is the new normal rather than a confession. Inside the product, AI drafts: it can turn a GitHub repository's README into a write-up you edit and own, and suggest tags you must tick yourself. It never assigns a capability, never ranks people, and never screens anyone. Matching is deterministic and explainable on purpose.",
  },
  {
    q: "Who is behind this?",
    a: (
      <>
        A solo founder in the UK, operating as a sole trader, with the company structure to follow
        when the first revenue does. The longer story is on{" "}
        <Link href="/about" className="text-ink underline-grow">
          the about page
        </Link>
        . Contact: hello@disruptajob.com, and a human reads it.
      </>
    ),
  },
  {
    q: "What happens to my data?",
    a: (
      <>
        It stays here. No third-party trackers, no ad networks, no selling of anything to anyone.
        First-party analytics only, retention periods that are actually enforced in code, export
        and deletion on demand.{" "}
        <Link href="/privacy" className="text-ink underline-grow">
          The privacy policy
        </Link>{" "}
        is written against what the code does, not against what a template said.
      </>
    ),
  },
  {
    q: "What don't you promise?",
    a: "A job. We promise that what a company sees of you is backed by evidence, that you are invisible until you choose otherwise, and that nothing you merely claim will ever move a score. Whether the right company shows up is the part we are building toward, not the part we pretend is done.",
  },
];

const DATA_QAS: QA[] = [
  {
    q: "Where is my data actually stored?",
    a: "In one database on a server in London. Email leaves through one provider in an EU region, and that is the complete list of third parties: no analytics companies, no trackers, no ad networks ever see anything.",
  },
  {
    q: "How long do you keep things?",
    a: (
      <>
        Your profile and projects: until you delete them, because they are yours. Everything else
        has an enforced clock: sign-in sessions expire after 30 days, usage analytics after a
        year, help-assistant questions after 90 days. Enforced means a routine in the code
        deletes them on schedule;{" "}
        <Link href="/privacy" className="text-ink underline-grow">
          the privacy policy
        </Link>{" "}
        quotes the same numbers because it is generated from the same constants.
      </>
    ),
  },
  {
    q: "What if you get hacked?",
    a: "The honest answer is that no website can promise it will never happen, so we built for the day it might. We hold little worth stealing: no card details, no government IDs, no documents kept after an import. Passwords are stored with scrypt, a deliberately slow hash built to resist cracking rigs. Backups are encrypted before they leave the server. And if a breach ever touches your data, you will hear it from us first, plainly, not from a journalist.",
  },
  {
    q: "Who reads my questions to the help assistant?",
    a: "The founder, to find out where people get stuck. Questions are saved with your name when you are signed in, which the widget itself tells you before you type, and they are deleted after 90 days. They are never used for anything else.",
  },
  {
    q: "What happens to my data if Disruptajob shuts down?",
    a: "You would get notice and a window to export everything, then deletion. Your data is not an asset to be sold with the furniture, in a shutdown or in any other circumstance.",
  },
  {
    q: "Can I see everything you hold on me?",
    a: "Yes. Data export lives in account management, next to deletion. One action, and you get your account, profile, projects and settings in a readable file. No request form, no thirty-day wait.",
  },
];

function Section({ title, qas }: { title: string; qas: QA[] }) {
  return (
    <section className="mt-12">
      <h2 className="font-serif-display text-xl text-ink">{title}</h2>
      <div className="mt-4 space-y-6">
        {qas.map((qa) => (
          <div key={qa.q} className="border-t border-ink/10 pt-5">
            <h3 className="text-[16px] font-medium text-ink">{qa.q}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{qa.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function FaqPage() {
  return (
    <main className="mx-auto max-w-[680px] px-6 py-14 lg:py-20">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">FAQ</p>
      <h1 className="font-serif-display text-3xl leading-tight text-ink sm:text-4xl">
        Straight answers
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
        If a question isn&rsquo;t here, write to hello@disruptajob.com and a human will answer it.
      </p>

      <Section title="If you're looking for work" qas={CANDIDATE_QAS} />
      <Section title="If you're hiring" qas={EMPLOYER_QAS} />
      <Section title="About the platform" qas={PLATFORM_QAS} />
      <Section title="Your data, in detail" qas={DATA_QAS} />
    </main>
  );
}
