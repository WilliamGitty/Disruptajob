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
  {
    slug: "the-gap-is-not-the-problem",
    title: "The gap on your CV is not the problem",
    standfirst:
      "A year out reads as a defect on one page and as a life on any other evidence. The format is doing the judging, not the employer.",
    date: "2026-10-18",
    topic: "The people hiring misses",
    minutes: 4,
    body: [
      "Take a person who spent fourteen months caring for a parent, and in the margins of that year taught themselves spreadsheet automation well enough to run a small charity's bookkeeping for free. On a CV this is a white space between two dates, and white space on a CV has exactly one reading: something went wrong here.",
      "The person did not go wrong. The format did. A reverse-chronological employment list is a timeline, and a timeline has no way to hold anything that happened outside an employer's payroll. Care, illness, redundancy in a bad market, a failed business that taught more than the successful employer before it: the format files all of it under absence.",
      "## Explaining is losing",
      "The standard advice is to address the gap in a cover letter, which means opening your application with a defence. Hiring managers skim. A defence skimmed is a flag noticed, and the explanation you crafted becomes the reason the file reads as complicated. People learn this after a few dozen silences, and start shrinking the true parts of their lives to fit the page. The page wins, the person loses, and the employer never finds out about the bookkeeping.",
      "## Evidence has no gaps",
      "A published piece of work does not carry a date range that needs defending. It carries what you did, how, and what happened because of it. The charity's books balancing every month for a year is evidence of real capability, and it happened during exactly the period the CV renders as damage.",
      "That is the trade this platform makes. A profile here is a set of projects, each one described, tagged and published by you, not a timeline with holes to account for. The work you did during the hardest year of your life counts the same as work done on a payroll, because the question a company searches with is what can this person do, and that question has no field for the dates you were busy surviving.",
      "Opinion, held plainly: the gap was never information about you. It was a limitation of a one-page format designed before anyone's life was expected to fit it.",
    ],
  },
  {
    slug: "changing-careers-without-permission",
    title: "Changing careers without asking permission",
    standfirst:
      "The advice for career changers assumes a gatekeeper who must be convinced. There is another route: do the work first, in public, and skip the convincing.",
    date: "2026-10-18",
    topic: "The people hiring misses",
    minutes: 4,
    body: [
      "Every career-change guide contains the same quiet humiliation: you must explain yourself. Reframe your transferable skills. Craft your narrative. Convince a sceptical reader that a decade in hospitality somehow qualifies you for operations. The premise underneath is that your past belongs to your old field and your future requires a stranger's sign-off.",
      "The premise is wrong in a specific way. Capability does not care which industry it was built in. Running a restaurant's Saturday service is scheduling under pressure, supplier management, and real-time problem solving with money on the line. The person who did that for ten years holds operational capability most junior operations hires do not. What they lack is not ability. It is proof legible to someone scanning for industry keywords.",
      "## The permission trap",
      "Keyword screening makes the trap mechanical. A search for operations experience finds people whose job titles contained the word, which excludes the career changer by construction, however capable. So the changer writes ever more strenuous cover letters to a reader who sees none of them, and concludes the door is locked. It is. The lock is the format.",
      "## Do the work first",
      "The route that works is older than the CV: demonstrate, then discuss. Build the rota tool you wished you had. Document the stock-ordering system you actually ran. Take one real process from the job you want and do it, visibly, at whatever scale you can reach without anyone's permission. Small and real beats large and claimed.",
      "A profile here is built for exactly this move. You publish the work, you tag what it demonstrates, and a company searching for those capabilities finds you alongside people whose titles matched all along, because the search reads evidence, not industry history. Your decade in the old field stops being a story to explain away and becomes what it always was: the place you built the capabilities you are now pointing somewhere new.",
    ],
  },
  {
    slug: "six-jobs-in-six-years",
    title: "Six jobs in six years is a dataset, not a defect",
    standfirst:
      "Hiring treats frequent moves as disloyalty. Often they are a person repeatedly discovering that the job was not what the posting said it was.",
    date: "2026-10-18",
    topic: "The people hiring misses",
    minutes: 4,
    body: [
      "There is a kind of candidate every screening process quietly bins: six roles, six years, never anywhere long enough to be promoted. The timeline reads as a warning. Ask the person, though, and a different pattern appears. Each move had a reason. The role was missold. The project was cancelled. The manager who hired them left in month two. They kept choosing to leave situations that were not working, which is also a description of judgement.",
      "Some frequent movers are genuinely restless, and restlessness has costs. But the CV cannot distinguish the restless from the repeatedly missold, so it convicts both. A timeline shows that you moved. It cannot show what you walked into, what you shipped before you left, or what you learned about your own conditions for doing good work. Six jobs produce more information about a person than one job does. The format throws that information away and keeps only the count.",
      "## What six roles actually produce",
      "A person who has onboarded six times is an onboarding expert. They have seen six codebases, six team cultures, six ways a company does the same thing, five of them badly. The pattern-matching this builds is precisely what small companies say they want when they ask for people who hit the ground running. The irony is structural: the experience that builds the capability is the experience the screen rejects.",
      "## Count the work, not the moves",
      "On an evidence-first profile, six short roles become what they produced: the migration finished in month three, the process documented before leaving, the tool still in use after its builder moved on. Published work from each stop, tagged with what it proves. A company searching capabilities sees the accumulation. The move count is visible, in the background section, in your own words, where it reads as what it is: a history, not a verdict.",
      "We think the market for people like this is mispriced, which for a hiring company is another word for opportunity.",
    ],
  },
  {
    slug: "returning-after-years-away",
    title: "Returning to work after years away",
    standfirst:
      "The returner's problem is not rust. It is that the CV format treats time as the only unit of worth, and their most recent years were spent in work it refuses to count.",
    date: "2026-10-18",
    topic: "The people hiring misses",
    minutes: 4,
    body: [
      "A person who ran a household for six years ran logistics, budgeting, scheduling and negotiation, unpaid and unsupervised, with stakes that were never theoretical. Nobody disputes this in conversation. The CV disputes it on their behalf: the years are formatted as absence, and the first question of every interview reaches for the hole rather than the person.",
      "Returner programmes exist, and good ones help. But they are scarce, competitive, and concentrated in large corporations. The structural problem remains for everyone else: recency weighting. Screening by recency makes the last job title the headline, and when there is no recent title, there is no headline, and when there is no headline the file is set down.",
      "## Rust is the wrong model",
      "The rust assumption deserves scrutiny. Capabilities are not milk. The analyst who left in 2020 did not forget how to think; tools changed, and tools are the fast part to relearn. What actually decays in years away is confidence and network, and the hiring process, with its hole-first questioning, is engineered to finish off whatever confidence survived.",
      "## Start from now",
      "The strongest move a returner can make is to produce one piece of current work. Not a course certificate: a thing. Rebuild a local charity's membership spreadsheet into something that works. Analyse a public dataset about something you care about and publish what you found. One real, recent, finished piece of work answers the rust question before it is asked, and answers it with evidence rather than reassurance.",
      "That piece of work is a first project here. Published and tagged, it makes you findable for what you can do now, next to candidates who never left, in a search that does not weight recency of payroll because it does not read payroll at all. Your profile starts hidden, you choose when you are ready to be found, and the six years are in your background section, in your words, as life rather than as absence.",
    ],
  },
  {
    slug: "self-taught-and-unverifiable",
    title: "Self-taught, and tired of the word 'unverifiable'",
    standfirst:
      "A degree is a proxy for work someone else assessed. Published work is the thing itself. Hiring keeps choosing the proxy, and the self-taught pay for it.",
    date: "2026-10-18",
    topic: "Titles and credentials",
    minutes: 3,
    body: [
      "The self-taught person's position is strange: they possess the capability and lack the receipt. Hiring systems, built to process receipts, conclude the capability is absent or, in the curious hedge of the rejection email, unverifiable. Yet the thing they actually built is sitting right there, running, which is more verification than any certificate carries.",
      "A degree certifies that an institution assessed some work you did years ago, under its conditions, on its syllabus. That is not nothing. But notice what it is: second-hand evidence. An employer trusting a degree is trusting a university's old assessment because checking directly feels expensive. Published work inverts this. The automation that runs a real business's invoicing is first-hand evidence, checkable by anyone, today.",
      "## Degree-free is growing and screening has not noticed",
      "Large employers keep announcing that roles no longer require degrees, and the announcements keep outrunning the practice, because the screening layer still sorts by the old receipt. The announcement changes the policy. The CV parser keeps the habit. The self-taught applicant experiences the policy; the rejection comes from the habit.",
      "## The receipt that checks itself",
      "Here, capability has exactly one source: published, tagged work. Nobody's profile says where they learned anything unless they choose to tell that story. A company searching finds the person whose evidence covers the role, and whether the evidence was built at a university, at a kitchen table, or inside someone else's job at two in the morning has no field in the schema, because it was never the question. What can you do, shown rather than certified: for the self-taught, that is not an accommodation. It is the home ground.",
    ],
  },
  {
    slug: "why-you-never-hear-back",
    title: "Why you never hear back",
    standfirst:
      "The silence after an application is not about you. It is the arithmetic of a flooded channel, and knowing the arithmetic is oddly freeing.",
    date: "2026-10-18",
    topic: "The application machine",
    minutes: 4,
    body: [
      "You applied. You were qualified, you tailored the CV, you wrote the letter. Silence. Weeks of it, then either nothing forever or a rejection generated the moment the role closed. The question that eats at people is what did I do wrong, and the honest answer, most of the time, is nothing. You posted a letter into a box that no longer gets emptied.",
      "Work the arithmetic from the other side. A single posting on a major board can draw hundreds of applications within days, many of them one-click, a growing share machine-written. The recruiter on the receiving end has this role and a dozen others. Hundreds of files per role, minutes per file at best. Software triages first, which means keyword matching decides which files a human ever opens, and a qualified candidate phrased differently from the posting is filed with the spam. No one chose to ignore you. The channel is doing it.",
      "## Silence is cheaper than honesty",
      "Companies could say no. Most do not, because a reply invites a conversation and a conversation costs money, and at hundreds of files the costs multiply. So the modern application ends in a shrug by default. We think this is corrosive far beyond rudeness: every unanswered application teaches a capable person that effort and outcome have decoupled, and people who learn that lesson stop trying in exactly the ways the economy needs them not to.",
      "## Opting out of the flood",
      "The reason there are no applications on this platform is this arithmetic. Where anyone can apply with a click, everyone does, and then nobody is read. Here, a company searches published evidence and reaches out to specific people, which means a message received is a message meant. Fewer, heavier signals in both directions.",
      "None of this pays your rent while you wait, and we will not pretend a structural diagnosis is a job offer. But if the silence has been reading to you as a verdict on your worth: it is not. It is a queue nobody is serving. You are allowed to stop standing in it.",
    ],
  },
  {
    slug: "work-that-disappears",
    title: "The best operations work is invisible, which is the problem",
    standfirst:
      "Great ops looks like nothing going wrong. Nothing going wrong looks like nothing on a CV. The people who keep companies running are hired on the weakest evidence of all.",
    date: "2026-10-18",
    topic: "The people hiring misses",
    minutes: 4,
    body: [
      "A developer's work accumulates in public: repositories, commits, shipped features with their name attached. An operations person's best work is a negative space. The payroll that never failed. The supplier crisis that never reached the CEO. The onboarding that stopped losing new hires in week one. Done perfectly, it produces no artefact at all, and artefact-free work is invisible to every evidence-shaped process, including, until recently, ours.",
      "So ops people write CVs full of responsibility verbs. Managed, oversaw, coordinated, streamlined. The words are true and weightless, indistinguishable from the same words written by someone who did it badly. Hiring for operations becomes an interview-charisma contest precisely because the paper signal carries nothing, and the quiet person who actually kept the machine running loses to the confident narrator who stood near it.",
      "## The work has a shape, even when it has no artefact",
      "Invisible work becomes visible the moment someone describes its mechanism. Not managed supplier relationships, but: four suppliers, one of them failing every quarter, and here is the scoring system I built to catch the failures early, and here is what stopped happening after. The before, the mechanism, the after. Anyone who really did the work can describe its mechanism in concrete detail, and almost no one who did not can fake that detail under their own name in public.",
      "## Describing is publishing",
      "That description is a project here. Our onboarding does not ask for your repositories first; its opening question is what would break if you went away for a month, which is the operations question. Write what would break, how you kept it from breaking, what it looked like when you arrived and when you finished. Tag it. Publish it. The negative space becomes a page, and the page is searchable by companies who have learned, usually expensively, what good operations is worth.",
    ],
  },
  {
    slug: "experienced-and-invisible",
    title: "Thirty years of evidence should beat a birth year",
    standfirst:
      "Age screening is mostly proxy screening: dates on a CV doing silent arithmetic. Evidence-first profiles give experienced people their material advantage back.",
    date: "2026-10-18",
    topic: "The people hiring misses",
    minutes: 4,
    body: [
      "Nobody rejects a candidate for being fifty-five. They reject an overqualified candidate, a bad culture fit, someone with more relevant recent experience in the pipeline. The polite vocabulary changes; the pattern it produces does not. Interview rates fall with visible age markers, and experienced applicants know it, which is why the advice industry tells them to amputate: cut the early career, drop the graduation year, shorten thirty years to one page that will not frighten anyone.",
      "Pause on how strange that is. The one resource that only accumulates with age is evidence of work, and the standard survival tactic is to hide most of it.",
      "## The proxy does the discriminating",
      "The CV makes age arithmetic trivial: two dates and the reader has a number before they have read a sentence. The number triggers assumptions that research keeps failing to support: about salary expectations, about adaptability, about energy. The assumptions do the screening while everyone involved honestly believes no age screening is happening. Formats carry biases the way pipes carry water.",
      "## The advantage, returned",
      "Strip the timeline out and look at what an experienced person actually holds: a depth of done things no younger candidate can match, because capability built over decades is the one thing that cannot be cribbed in a bootcamp. A profile here leads with that work, described and tagged, searched by capability rather than scanned by date. The years are not hidden, and should not have to be; they are in the background, as context, while the evidence stands in front.",
      "Our position: a market that lets a birth year outbid three decades of demonstrated work is not being hard-headed. It is being innumerate, and a better format calls the bluff.",
    ],
  },
  {
    slug: "cover-letter-theatre",
    title: "The cover letter is enthusiasm theatre",
    standfirst:
      "An essay about how much you want the job measures writing stamina and desperation tolerance. Neither is the capability anyone is hiring for.",
    date: "2026-10-18",
    topic: "The application machine",
    minutes: 3,
    body: [
      "The cover letter asks a person to perform a very specific fiction: that this role, of the forty they applied to this month because rent exists, is the one they have dreamed of since childhood. Both sides know it is a performance. The applicant knows, the recruiter who skims it in eight seconds knows, and still the ritual persists, a loyalty oath sworn to a company that will not reply.",
      "What does the letter actually measure? The ability to produce earnest prose on demand, the free time to produce it forty times, and the willingness to keep performing enthusiasm into silence. Notice what that filter selects against: the employed person with twenty spare minutes, the carer applying at midnight, the person whose talents are in doing rather than narrating. Frequently the exact people worth hiring.",
      "## Generated enthusiasm, skimmed by machines",
      "AI finished the argument. Enthusiasm prose now costs nothing to generate, so letters are machine-written, machine-skimmed, and read closely by no one. A signal that is free to produce is not a signal. The cover letter survives purely as friction, a small hazing that proves the applicant will tolerate hazing.",
      "## What replaces it",
      "Interest, demonstrated rather than declared. On this platform the costly signal runs the other way: a company reads your published work and writes to you about it, specifically. And when you register interest in a role here, no essay is attached, because the register is not an audition. Your work already said the substantive thing. The only thing a letter could add is the performance, and we are fine without it.",
    ],
  },
  {
    slug: "small-companies-hiring-like-big-ones",
    title: "Small companies cannot afford to hire like big ones",
    standfirst:
      "A bad hire is a rounding error at a corporation and a near-death experience at a ten-person company. Copying corporate hiring at small scale is importing risk dressed as rigour.",
    date: "2026-10-18",
    topic: "How hiring decides",
    minutes: 4,
    body: [
      "When a five-thousand-person company mis-hires, a manager runs a slow process and the org absorbs the cost. When a ten-person company mis-hires, ten percent of the payroll is now subtracting value, the founder is doing two jobs while managing the problem, and the runway is shorter at the end of it. Proportionally, nobody on earth has more riding on a single hiring decision than a small company. And yet small companies mostly hire with a cargo-culted miniature of the corporate process: post the role, collect CVs, screen by keyword, interview by vibe.",
      "That process was designed for a problem small companies do not have: volume. A corporation screens thousands, so it optimises for cheap rejection at scale and tolerates the false negatives. A small company might interview six people. Its binding constraint is not throughput. It is the accuracy of a handful of judgements, made by people who are not professional recruiters, from the weakest evidence format in business.",
      "## Keyword screening has corporate costs without corporate volume",
      "The CV pile rewards exactly what a small company least needs: confident generalising prose and title inflation. The capable operator whose last title undersold them is invisible in the pile; the fluent narrator rises. Big companies absorb this error rate. Small ones eat it whole.",
      "## Read work, not applications",
      "The small-company advantage is that at six candidates, you can actually look at evidence. Read the published projects. Check the thing that shipped. Twenty minutes with someone's real work tells you more than three rounds of structured vibes. This platform is built for that motion: define the role by the work it contains, search people whose published evidence covers it, read before you reach out. No pile, no parsing, and the first conversation starts from what is demonstrably true.",
      "Companies are free during beta, not because the product is unfinished but because the candidates came first on purpose. If you are small and hiring, the pile was never built for you. Stop renting it.",
    ],
  },
  {
    slug: "references-check-the-past",
    title: "References are the last unexamined ritual in hiring",
    standfirst:
      "Two phone calls with people the candidate chose, made after the decision is already taken. As due diligence goes, it is a horoscope with admin.",
    date: "2026-10-18",
    topic: "How hiring decides",
    minutes: 3,
    body: [
      "Consider what a reference actually is. The candidate names two people guaranteed to speak well of them. The calls happen at the end, when the hiring manager has decided and wants confirmation, not information. Many companies, fearing defamation, now confirm dates of employment and nothing else. The ritual survives because removing it feels reckless, not because anyone can say what it detects.",
      "The deeper problem is not the choreography. It is that a reference is testimony, and testimony is the weakest class of evidence about work. It is second-hand, unverifiable, filtered through a relationship, and aimed at the past: how this person performed in that job, under that manager, in that context. The question a hiring decision actually turns on is about the future in a different context, and no phone call reaches it.",
      "## Evidence ages better than testimony",
      "A published piece of work is a reference that cannot inflate. The automation either runs or it does not. The write-up either explains the mechanism in the detail only its author could, or it reads hollow. Work on this platform is tagged by its owner and carries the one kind of credibility testimony never has: anyone can check it, including the referee-less candidate's future boss, before a single call is made.",
      "We are not against humans vouching for humans; context from someone who was there is worth having, late in the process, eyes open about its limits. But as the load-bearing verification step of modern hiring, the reference check is a comfort blanket. Verification is what the work is for.",
    ],
  },
  {
    slug: "a-calm-job-search",
    title: "A job search that does not eat the person conducting it",
    standfirst:
      "The tools of the modern search are engagement products, built to be checked. Checking is not searching, and a calmer loop is not a slower one.",
    date: "2026-10-18",
    topic: "The application machine",
    minutes: 4,
    body: [
      "People delete career apps for the same reason they delete social ones: the product is engineered to be returned to. Streaks, prompts, who-viewed-you notifications, the slot-machine refresh of the feed. For someone mid-search, every one of those mechanics lands on an open wound, because each check that produces nothing reads as another small no. The exhaustion people feel is not weakness. It is the designed outcome of engagement software pointed at anxious users.",
      "Here is the uncomfortable mechanism underneath: job boards and career networks are paid for attention and activity, not for ending your search. A search that concludes is a user lost. The incentive is a search that continues, visibly, hopefully, indefinitely, and the interface optimises for exactly that.",
      "## Checking is not searching",
      "Strip the mechanics away and an actual search has few moving parts: a clear account of what you can do, visible to the right parties, and a channel for serious approaches. None of that requires daily attendance. The daily attendance is the product, not the search.",
      "## What calm looks like, concretely",
      "This platform has no feed, no streaks, no completion percentage, no engagement prompts, and it will not notify you to come back. You publish your evidence, set your visibility, and close the tab. If a company reaches out, one email arrives. That is the entire loop. We measure whether people find work worth having, not how often they visit, because those two numbers are enemies.",
      "If you are deep in a search and tired in a way sleep does not fix: the tiredness is real, it has a cause, and the cause is not you. Publish your work somewhere that does not need you to keep checking it, and spend the reclaimed attention on anything that is not a refresh button.",
    ],
  },
];

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}
