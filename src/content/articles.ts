/**
 * The articles: opinion, written in-house.
 *
 * Editorial rules, which outrank any individual piece:
 *  - brand/voice.md applies in full: specific, on the reader's side, understated, honest about
 *    limits. The reader may be eleven months into a search; nothing here lectures them.
 *  - No em-dashes, by founder instruction. Commas, colons and full stops do the work.
 *  - Opinion is ours and labelled as opinion. Facts stay general and attributable; we never
 *    invent a statistic, a study, or a quote. Where a piece leans on reporting, it names the
 *    phenomenon rather than faking a citation.
 *  - Every piece earns its place by answering one question: does this help someone understand
 *    why hiring feels broken, and what evidence-first changes?
 */

export interface Article {
  slug: string;
  title: string;
  standfirst: string;
  /** ISO date, newest first in the listing. */
  date: string;
  topic: string;
  minutes: number;
  /** Paragraphs. Strings starting with "## " render as section headings. */
  body: string[];
}

export const ARTICLES: Article[] = [
  {
    slug: "two-hundred-applications",
    title: "Two hundred applications, four replies",
    standfirst:
      "The numbers behind modern job applications are not a motivation problem. They are a market failure, and pretending otherwise is cruel.",
    date: "2026-10-16",
    topic: "The application machine",
    minutes: 4,
    body: [
      "Here is a ratio nobody puts on a careers page: a person in an active search can now send hundreds of applications and hear back from a handful. Not rejections. Replies. The rest is silence, and the silence is the point of this piece.",
      "The standard advice treats this as a personal failing. Tailor your CV. Follow up. Build your personal brand. All of it assumes the channel works and the applicant is using it badly. But when one click submits an application, every posting receives a flood, and no human reads a flood. The channel is saturated by design, because the platforms that own it are paid for activity, not outcomes.",
      "## Volume is the product",
      "Job boards sell postings and promote one-click applying because both numbers go up together. More applications per posting looks like liquidity. It is actually noise, and the cost of the noise lands on the two parties the market exists to serve: the person applying, who learns that effort and outcome have decoupled, and the hiring manager, who stops reading.",
      "A market where neither side believes the signal is not a market. It is a lottery with admin.",
      "## What we took from this",
      "We built Disruptajob on the opposite trade. Nobody applies here. There is no apply button to one-click, so there is no flood, so reading is possible again. A company arrives at a person because published, tagged evidence matched the work the role actually contains, and the first message is the company's to write.",
      "That choice costs us the growth chart a job board gets from application counts. We think the chart was lying anyway. Two hundred applications and four replies is not engagement. It is two hundred small erosions of a person who was fine when they started.",
    ],
  },
  {
    slug: "cv-arms-race",
    title: "When both sides use AI, the CV is dead",
    standfirst:
      "Applicants now generate CVs with AI. Companies screen them with AI. Two models talking to each other is not a hiring process, and everyone involved knows it.",
    date: "2026-10-14",
    topic: "AI and hiring",
    minutes: 4,
    body: [
      "The CV survived for one reason: it was expensive enough to be a weak signal of effort. Writing one took an afternoon. That afternoon is now thirty seconds, and the moment production became free, screening automated in response. The result is an arms race in which an applicant's model writes keyword-optimised prose for an employer's model to score.",
      "Neither model knows whether the person can do the work. Both are fluent about it.",
      "## Fluency is not evidence",
      "Large language models are competence engines for text. Feed one a job description and a thin work history and it returns a confident, well-structured account of a person who may not exist. This is not a misuse of the technology. It is the technology, doing exactly what it is for. The mistake is a hiring process that still treats polished text as a proxy for anything.",
      "The legal system is already catching up with the other side of the race: automated screening is attracting discrimination claims, because a model trained on yesterday's hiring decisions inherits yesterday's biases at scale. A company that cannot explain why its system rejected someone is carrying a risk it has not priced.",
      "## The signal that survives",
      "When text is free, what is scarce? Work that verifiably happened. A shipped project with a repository behind it. An automation a business actually ran. An outcome someone else can check. Evidence is expensive to fake in the exact way prose used to be, which makes it the natural successor.",
      "Our position, plainly: we use AI here too, and we say where. It drafts write-ups from real repositories, and a human edits, owns and tags every word before anything publishes. AI drafts. Humans claim. Evidence scores. A capability on this platform cannot be typed into existence by anyone's model, including ours.",
    ],
  },
  {
    slug: "job-titles-compress-people",
    title: "Your job title is a compression error",
    standfirst:
      "Three jobs, one line. The title system was built for org charts, not for describing humans, and hiring still runs on it.",
    date: "2026-10-12",
    topic: "Titles and credentials",
    minutes: 3,
    body: [
      "Operations Manager. What does the person do? Depending on the company: logistics, or finance admin, or the entire commercial function of a forty-person business, including the automations nobody asked them to build and the product decisions nobody else would make. One string, wildly different humans.",
      "Titles were invented to describe positions, not people. They tell you where a box sits on a chart and roughly what it costs. Then recruitment adopted them as a search key, and an entire market started matching humans to work using a field designed for payroll.",
      "## The undersold majority",
      "Compression hurts the most capable people worst. A narrow specialist survives it: the title and the work roughly agree. A generalist who quietly runs three functions is flattened to whichever one made it onto the business card, and every search engine in hiring will file them under it forever.",
      "That is who we built for first. Not because generalists are fashionable, but because they are systematically mispriced, and mispricing is where a new market gets its first honest customers.",
      "## Search by the work instead",
      "On Disruptajob a company does not search titles. It defines a role by the work it contains and searches for people whose published projects prove those capabilities. The title is on the profile as context, one line of it, where it belongs. The evidence does the talking, which is the only way the person who runs three functions ever gets found for the two that were never in their title.",
    ],
  },
  {
    slug: "keyword-theatre",
    title: "The ATS is keyword theatre",
    standfirst:
      "Applicant tracking systems do not read. They match strings. The people who do the work and the people who pass the filter are different populations.",
    date: "2026-10-10",
    topic: "The application machine",
    minutes: 4,
    body: [
      "Somewhere right now, a person who has run payroll migrations for a decade is being filtered out of a payroll role because their CV says 'compensation systems' and the posting says 'payroll operations'. No human decided this. A string comparison did.",
      "The applicant tracking system was sold as a way to handle volume, and volume is real. But matching keywords is not reading, and everyone on both sides has adapted to the pretence. Applicants paste the job description into their CV in white text, or more respectably, let a model rewrite their history in the posting's vocabulary. The companies respond by adding more keywords. The theatre expands; the information content does not.",
      "## What the filter optimises for",
      "A keyword filter selects for people who are good at describing work in the language the filter expects. That is a real skill. It is a writing skill. If the role is writing, fine. For every other role, the filter is measuring the wrong thing with perfect efficiency, at scale, with no appeals process.",
      "The quiet scandal is that everyone senior enough to fix this got their own jobs through networks, not filters. The ATS is for other people's careers.",
      "## A different first pass",
      "The first pass should look at work, not vocabulary. A tagged, published project either demonstrates workflow design or it does not, and a capability search over evidence returns people because of what they built, not because of which synonyms they guessed. That is slower to populate than a keyword index and we accept that, because a small amount of true signal beats any quantity of matched strings.",
    ],
  },
  {
    slug: "ghost-jobs",
    title: "Ghost jobs are a tax on hope",
    standfirst:
      "A meaningful share of job postings are not jobs. They are pipeline building, budget theatre, or simply never taken down. The cost lands on people who can least afford it.",
    date: "2026-10-08",
    topic: "The application machine",
    minutes: 3,
    body: [
      "Surveys of hiring managers over the past few years keep turning up the same admission: a significant fraction of posted roles have no live intent to hire behind them. Some were posted to collect a talent pipeline for later. Some exist so a team looks like it is growing. Some were filled months ago and nobody closed the listing.",
      "For the poster, a ghost job costs nothing. For the applicant, it costs an afternoon of tailoring, a cover letter, and a small quantity of hope, multiplied across every ghost in the stack. The asymmetry is the problem: a market where one side can list fake inventory for free will fill with fake inventory.",
      "## Why we do not have postings",
      "We made a structural choice instead of a policy one: Disruptajob has no job board. A company here defines a role by the actual work it contains, and that definition exists to search with, not to advertise. The company spends its own attention reaching out to specific people. Reaching out is costly in exactly the way posting is not, and costly signals are honest ones.",
      "A candidate on this platform cannot apply to a ghost, because there is nothing to apply to. The first contact is always a real person at a real company who read your actual work and wrote to you about it. If that happens less often than job boards promise, it is because most of what job boards promise was never real.",
    ],
  },
  {
    slug: "degrees-and-proof",
    title: "The degree premium is a rounding error on proof",
    standfirst:
      "Companies keep announcing skills-based hiring and keep filtering on universities. The gap between the press release and the filter is where careers go to die.",
    date: "2026-10-06",
    topic: "Titles and credentials",
    minutes: 4,
    body: [
      "Every large employer now has a statement about valuing skills over credentials. Most of their funnels still do the opposite, because when a thousand CVs arrive and nothing in them is verifiable, a university name is the one field that feels safe to sort by. The degree is not evidence of the work. It is evidence that verification is too expensive, so a proxy will have to do.",
      "Proxies are not free. Filtering on credentials prices out career changers, people who could not afford the credential, and everyone whose capability arrived through doing rather than enrolment. It also overprices confident credential holders who have never shipped anything. Both errors are invisible inside the company, which is why the press release and the funnel can disagree for years.",
      "## Verification got cheap",
      "Here is what changed: showing work is no longer hard. A repository, a shipped automation, a write-up with the outcome attached, all of it publishable in an afternoon, all of it checkable by anyone. When verification is cheap, the economic case for the proxy collapses. What remains is habit.",
      "## Breaking the habit",
      "We removed the sort key. There is no university field in a Disruptajob search, and education sits quietly at the bottom of a profile as background, never as a capability. A capability here can only come from tagged, published work. If a company wants to filter on credentials they are welcome to a market that already does: all of them. This one sorts by proof.",
    ],
  },
  {
    slug: "interview-performance",
    title: "Interviews measure rehearsal",
    standfirst:
      "The job interview rewards a specific talent: being interviewed. The correlation with doing the job is weaker than anyone making offers wants to believe.",
    date: "2026-10-04",
    topic: "How hiring decides",
    minutes: 3,
    body: [
      "Tell me about a time you showed leadership. The candidate who answers best is the one who prepared that story, rehearsed its arc, and delivered it with eye contact. The candidate who actually led, quietly, for years, and finds self-promotion faintly embarrassing, stumbles. The interview has measured something real. It is just not the job.",
      "Decades of organisational research have been politely clear that unstructured interviews are poor predictors of performance, and that interviewers are confident about them anyway. Confidence is the product. An interview mostly manufactures a feeling of certainty about a decision that remains a guess.",
      "## Evidence moves the interview",
      "We are not against conversation. We are against conversation as the primary evidence. The sequence matters: when a company reaches out because of published work, the eventual conversation starts from something true. Walk me through this project. Why did you build it that way. What broke. Those questions have real answers that rehearsal cannot fake, because the work is sitting there, open in another tab.",
      "An interview that begins from evidence is an interrogation of something real. An interview that begins from a CV is an audition for a play nobody will ever stage. We built for the first kind, and the difference shows up in the first five minutes of every conversation that starts here.",
    ],
  },
  {
    slug: "culture-fit",
    title: "Culture fit is taste wearing a lanyard",
    standfirst:
      "The least examined phrase in hiring does a lot of quiet damage. Fit usually means familiar, and familiar is how teams clone their blind spots.",
    date: "2026-10-02",
    topic: "How hiring decides",
    minutes: 3,
    body: [
      "Culture fit entered hiring as a sensible idea: values alignment matters, and a team that cannot work together cannot work. Then it became a verdict that requires no evidence. Not a fit. The phrase ends conversations precisely because it means nothing specific, and in most rooms it decodes to 'reminded me of us'.",
      "Hiring for familiarity feels safe and compounds into fragility. A team selected for sameness agrees quickly, ships confidently, and walks into the same wall together. The person who would have seen the wall was screened out at the fit stage for being unlike the people about to hit it.",
      "## Add, not fit",
      "The better question is what a person adds, and add is only answerable with specifics. Which capabilities does the team lack? What work needs doing that nobody currently does well? Those have evidence-shaped answers, which is why weak processes avoid asking them: vibes cannot be audited, and that is their appeal.",
      "Our structural nudge is small but deliberate. A role on Disruptajob is defined by work and required capabilities, so the comparison a company makes is between evidence and need, not between a stranger and the team's self-image. Taste will always exist in hiring. It should at least arrive after the proof, not instead of it.",
    ],
  },
  {
    slug: "generalists-mispriced",
    title: "Generalists are the last mispriced asset in hiring",
    standfirst:
      "Markets reward what they can measure. Hiring measures titles, so the person who does three jobs is priced as one. That inefficiency is somebody's opportunity.",
    date: "2026-09-30",
    topic: "Titles and credentials",
    minutes: 4,
    body: [
      "In any functioning market, systematic mispricing attracts capital until it closes. Hiring has carried the same mispricing for decades without correction: the multi-capability operator, the person who runs ops and builds the automations and covers half of product, is valued at whichever single function their title names. The other capabilities are economically invisible.",
      "They are invisible because the market's instruments cannot see them. Titles compress. CVs flatten. Keyword filters match one vocabulary at a time. Every tool in the chain was built for single-function humans, so the market behaves as if that is what humans are.",
      "## Why the gap persists",
      "Specialists have guilds: certifications, communities, salary surveys, a shared language for proving depth. Generalists have an apology. 'Jack of all trades' arrives with its insult pre-installed, and the long version of the saying, master of none, though oftentimes better than master of one, got cut for being inconvenient. There is no certificate for seeing how parts of a business interact. There is only the work.",
      "## Making the invisible searchable",
      "So the fix is to make the work legible. A Disruptajob profile holds capabilities in parallel, each one backed by its own published evidence, none of them fighting for the single line a CV allows. A company searching for an unusual combination, operations plus data analysis plus stakeholder management, finds the person who genuinely has all three, because all three are proven separately.",
      "Early markets get built by the people the old market priced wrong. Ask anyone who was undervalued right up until the instrument changed.",
    ],
  },
  {
    slug: "what-ai-actually-changes",
    title: "What AI actually changes about hiring",
    standfirst:
      "Not the interview, not the CV polish, not the chatbot recruiter. AI collapses the cost of claims, which makes proof the only scarce signal left.",
    date: "2026-09-28",
    topic: "AI and hiring",
    minutes: 4,
    body: [
      "Most AI-in-hiring coverage is about tools: a model that writes your CV, a model that screens it, a chatbot that schedules the interview the other two models arranged. Tool stories miss the economic event underneath, which is simple: the cost of producing a plausible claim has gone to zero.",
      "Every hiring signal that is cheap to produce is now worthless, all at once. The polished CV, the keyword-perfect profile, the articulate cover letter, the confident written answer. None of these distinguish anyone anymore, because the marginal cost of all of them is a prompt.",
      "## Scarcity moved",
      "When claims are free, verification is the product. The signals that still carry information are the ones a model cannot conjure: work that happened, in public or with witnesses, with outcomes someone else can check. A repository with four years of commits. An automation a business ran. A colleague who will say yes, they built that, it worked.",
      "This is why we are unbothered about being an AI-era company that refuses to let AI assign a single capability. It is not technophobia. It is pricing. Letting a model write capabilities into profiles would mean manufacturing the exact asset whose value just collapsed, inside the one place trying to sell its opposite.",
      "## Where we spend the technology",
      "We spend AI where drafting is the job: turning a real repository's README into a write-up its owner edits and claims, suggesting tags its owner must tick by hand. The model does the typing. The human does the claiming. The evidence does the scoring. Everything else about this platform is arranged so that sentence stays true, because in a world of free claims, the companies and candidates who can prove things are the only ones with anything to trade.",
    ],
  },
  {
    slug: "hidden-by-default",
    title: "Hidden by default is a feature, not a bug",
    standfirst:
      "Every talent marketplace wants you visible immediately. We make you invisible until you choose otherwise, and we think that choice is why employed people can use us at all.",
    date: "2026-09-26",
    topic: "How we built this",
    minutes: 3,
    body: [
      "The people with the best evidence are mostly employed. They are also mostly unable to signal openness, because the first person to discover a public job-search profile is statistically their own manager. So the conventional talent platform faces a quiet selection problem: it is fullest of the people who can afford to be seen, which is not the same population as the people worth seeing.",
      "Our answer is structural. A new Disruptajob profile is hidden. Not hidden-ish, not visible to premium subscribers, hidden: it does not appear in any search, and its link opens for nobody but its owner. Going visible is an explicit choice, and even then you can name companies that must never see you, your employer first on the list, and that blocklist is enforced in the database query itself, not in a setting somebody's code has to remember to check.",
      "## Trust is the supply side",
      "This costs us. Hidden profiles make the marketplace look smaller than it is, and growth people hate it. But the privacy promise is why someone with a good job and better evidence dares to publish at all. Break it once and that population leaves forever, and they are the whole point of the platform.",
      "We wrote the policy to match the code, had the code audited against the policy, and put both where anyone can read them. If that sounds like overkill for a small platform, consider what the large ones chose instead, and how that is going.",
    ],
  },
];

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}
