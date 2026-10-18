/**
 * Answer guides: pages built to answer one real question so well that a person, a search
 * engine, or an AI assistant would cite them.
 *
 * These are not opinion (that's content/articles.ts) and not marketing. The editorial bar,
 * from the 18 Oct decision file: the guide must be genuinely useful to someone who never
 * signs up here, or it won't earn a citation from anyone. Disruptajob appears where it
 * honestly belongs in the answer and nowhere else. Copywriter rules apply in full: no em
 * dashes, no invented statistics, specifics over generalities, UK English.
 */

export interface GuideSection {
  heading: string;
  paragraphs: string[];
}

export interface GuideFaq {
  q: string;
  a: string;
}

export interface Guide {
  slug: string;
  question: string;
  /** The direct answer, two or three sentences, stated before anything else. */
  answer: string;
  updated: string;
  minutes: number;
  sections: GuideSection[];
  faqs: GuideFaq[];
}

export const GUIDES: Guide[] = [
  {
    slug: "portfolio-instead-of-cv",
    question: "Can you use a portfolio instead of a CV?",
    answer:
      "Increasingly, yes, and especially with startups and smaller companies: a portfolio of real work now does the persuading while the CV does the admin. For large companies running applicant tracking systems you will usually still need a CV on file, but a one-line link to your evidence inside it changes how the CV reads. The practical move is not either-or: build the evidence page once, then let every CV, application and profile point at it.",
    updated: "2026-10-18",
    minutes: 6,
    sections: [
      {
        heading: "The short answer, expanded",
        paragraphs: [
          "A CV is a claims document: job titles, dates, and sentences about yourself that nobody can check. A portfolio is an evidence document: the work itself, inspectable. For most of a century the claims document won because verifying evidence was expensive. That has flipped. Anyone can now publish real work in an afternoon, and any employer can check it in five minutes, which is why skills-first hiring keeps growing and why AI-written CVs have quietly devalued the claims format for everyone.",
          "Whether a portfolio can fully replace your CV depends on who is hiring. Smaller companies and startups routinely accept a strong evidence link in place of the formal document, because the founder doing the hiring wants to know one thing: can this person actually do the work. Large employers mostly cannot accept a bare link, not because humans object but because their applicant tracking systems need a document to parse. So the honest answer has two halves: replace where you can, embed where you cannot.",
        ],
      },
      {
        heading: "When a portfolio beats a CV outright",
        paragraphs: [
          "The portfolio wins hardest for exactly the people the CV format serves worst. If you have one year of experience and the filter demands two, evidence of what you built in that year argues back in a way a dates column cannot. If you have changed roles every six or twelve months, a CV reads as risk while a body of work reads as range. If you are finishing a master's, your dissertation and research projects are real work that a CV compresses into a single education line. If you do three jobs under one title, the title hides it and the work shows it.",
          "It also wins wherever the hirer is close to the work: startups, agencies, small firms, and any role where the first interview question would be show me. In those rooms a portfolio does not supplement the conversation; it is the conversation.",
        ],
      },
      {
        heading: "When you still need the CV",
        paragraphs: [
          "Keep a CV for large-company pipelines, public-sector and regulated roles, and anywhere an applicant tracking system stands between you and a human: those systems ingest documents, not links. Recruiters working a brief will also ask for one, because their client systems do.",
          "But a CV that carries your evidence link in the header is a different document from one that does not. One line, under your name: a link to the work. The CV gets you through the parser; the link does the persuading once a human arrives. People who hire describe clicking such links precisely because everything else in the stack sounds identical.",
        ],
      },
      {
        heading: "What counts as portfolio evidence if you don't write code or design",
        paragraphs: [
          "The word portfolio misleads people into thinking it belongs to designers and developers. Evidence is broader than artefacts. A process you redesigned, described concretely with what changed because of it. An automation you set up and what it replaced. A reporting pack you rebuilt. An event you ran and what it took. A research project with its method and findings. A spreadsheet system a team still depends on. If it happened, you can describe it specifically, and someone could ask you questions about it for five minutes, it is evidence.",
          "The test for each piece: what would have broken, or quietly stopped happening, if you had not been there? Write that down plainly, with the outcome attached, and you have a portfolio entry, no screenshots required.",
        ],
      },
      {
        heading: "How to build one this afternoon",
        paragraphs: [
          "Any surface works to start: a public Notion page, a Google Doc set to viewable, a simple site, a GitHub profile if your work is code. Write up three pieces of real work, each with what it was, what you actually did, and what changed. Plain words beat polish; specifics beat adjectives everywhere.",
          "Purpose-built platforms add the parts a document cannot do. Disruptajob, which publishes this guide, exists for exactly this: you describe real work, tag what it demonstrates, and get a page where every capability is backed by the work behind it, hidden from everyone until you choose otherwise, free for candidates. Companies there search by what work demonstrates rather than by job titles. It is one option among several, and the guide above works whichever surface you choose.",
        ],
      },
      {
        heading: "How to use it everywhere",
        paragraphs: [
          "The link goes in the CV header, in the LinkedIn Featured section and contact field, in your email signature, and in the covering message of any application that allows one. When a form asks for a portfolio or additional links, it goes there. When a recruiter asks for more detail, it is the reply.",
          "The quiet advantage is that the page works while you are not applying. A CV only exists inside an application; a standing evidence page can be found, forwarded and read at any hour, which is how work finds people who were not even looking.",
        ],
      },
    ],
    faqs: [
      {
        q: "Will applicant tracking systems read a portfolio link?",
        a: "No. An ATS parses the document's text and will store the URL as text, nothing more. The link is for the humans who read the CV after the parser, which is why it belongs visibly in the header rather than buried at the end.",
      },
      {
        q: "Do recruiters and hiring managers actually click portfolio links?",
        a: "The ones close to the hiring decision do, particularly at smaller companies, because everything else they receive sounds identical. The further a reader sits from the actual work, the less they click, which is one more reason to target companies where the hirer is near the work.",
      },
      {
        q: "I'm a student or a recent graduate. Do I have enough for a portfolio?",
        a: "Almost certainly. A dissertation, a research project, coursework that produced something real, a society or event you ran, a part-time job's process you improved: each is evidence when described specifically with its outcome. Thin-but-real beats padded every time.",
      },
      {
        q: "Should the portfolio repeat my CV?",
        a: "No. The CV lists where you have been; the portfolio shows what you can do. Duplicating the career history on the portfolio wastes its one advantage. Three well-described pieces of work beat a decorated timeline.",
      },
      {
        q: "Is it safe to have a public portfolio while employed?",
        a: "It depends on the surface. A public page can be seen by your employer. Some platforms, Disruptajob included, start every profile hidden and let you block named companies from ever finding you, which exists precisely for job-searching while employed.",
      },
    ],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
