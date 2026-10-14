import type {
  CandidateProfile,
  Capability,
  CompanyProfile,
  Employer,
  Evidence,
  Project,
  Role,
} from "@/types";

function cap(
  tag: string,
  label: string,
  evidenceCount: number,
  projectIds: string[]
): Capability {
  return {
    tag,
    label,
    evidenceCount,
    score: Math.min(97, 36 + evidenceCount * 8),
    projectIds,
  };
}

function ev(
  id: string,
  type: Evidence["type"],
  label: string,
  description?: string,
  url?: string
): Evidence {
  return { id, type, label, description, url };
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export const PROJECTS: Project[] = [
  // William Sandford -----------------------------------------------------
  {
    id: "ai-daily-signal",
    slug: "ai-daily-signal",
    ownerId: "william-sandford",
    title: "AI Daily Signal",
    description:
      "Built an internal intelligence product that identifies and summarises important AI developments for senior decision-makers.",
    thumbnailSeed: "ai-daily-signal",
    capabilities: ["ai-enablement", "automation", "product-thinking", "executive-communication"],
    tools: ["Python", "GPT-4", "Notion API", "Slack API"],
    evidence: [
      ev("e1", "demo-link", "Live digest sample", "A real delivered digest from the pipeline", "https://disruptajob.example/demo/ai-daily-signal"),
      ev("e2", "screenshot", "Slack delivery screenshot", "The daily brief as it lands in the leadership channel"),
      ev("e3", "write-up", "Build write-up", "How the scoring and summarisation pipeline works"),
      ev("e4", "metric", "Time saved", "Cut weekly AI research time from ~4 hours to 20 minutes"),
    ],
    outcome:
      "Adopted by the leadership team as their primary way of tracking AI developments; cut weekly research time from roughly 4 hours to 20 minutes.",
    problem:
      "Senior leadership needed to stay on top of fast-moving AI developments relevant to the business, but had no reliable, low-effort way to do it beyond scattered newsletters and conference talks.",
    whatIBuilt:
      "A daily digest pipeline that scrapes, filters, scores, and summarises AI news and research into a ranked brief delivered straight to Slack every morning.",
    myContribution:
      "Designed and built the entire pipeline solo — source selection, relevance scoring, summarisation prompts, and the Slack delivery format — then iterated weekly based on direct leadership feedback.",
    process: [
      { title: "Mapped the real behaviour", description: "Shadowed how leadership actually tried (and failed) to keep up with AI news today." },
      { title: "Built a scoring model", description: "Weighted sources and topics so the signal-to-noise ratio stayed high as volume scaled." },
      { title: "Tuned summarisation to the reader", description: "Prompt-engineered a summarisation layer calibrated to an executive reading level, not a researcher's." },
      { title: "Shipped and iterated weekly", description: "Launched a daily Slack digest and adjusted format and tone based on direct reactions." },
    ],
    mediaGallery: ["ai-daily-signal", "ai-daily-signal-2", "ai-daily-signal-3"],
    demoUrl: "https://disruptajob.example/demo/ai-daily-signal",
  },
  {
    id: "automated-outreach-workflow",
    slug: "automated-outreach-workflow",
    ownerId: "william-sandford",
    title: "Automated Outreach Workflow",
    description:
      "Designed a workflow to automate business communications and remove repetitive manual work.",
    thumbnailSeed: "automated-outreach",
    capabilities: ["automation", "workflow-design", "systems-thinking", "operations"],
    tools: ["Zapier", "HubSpot", "OpenAI API", "Google Sheets"],
    evidence: [
      ev("e5", "write-up", "Workflow design doc", "Full map of triggers, approval steps, and logging"),
      ev("e6", "screenshot", "Workflow screenshot", "The live automation graph"),
      ev("e7", "metric", "Hours saved", "Reduced manual outreach admin by roughly 11 hours a week"),
    ],
    outcome: "Reduced manual outreach admin by roughly 11 hours a week across the team.",
    problem:
      "The operations team was spending many hours a week manually drafting, sending, and logging outbound business communications.",
    whatIBuilt:
      "An end-to-end workflow connecting CRM triggers to AI-drafted messages with a lightweight human approval step before anything was sent.",
    myContribution:
      "Mapped the existing manual process, designed the automated replacement, and built it end to end across the CRM, email, and logging layer.",
    process: [
      { title: "Audited the manual process", description: "Logged every manual step across a two-week period to find the real bottlenecks." },
      { title: "Designed the automation graph", description: "Mapped triggers, drafting logic, and a human checkpoint before anything external went out." },
      { title: "Built and connected the stack", description: "Wired CRM events to AI drafting and a lightweight approval and logging layer." },
      { title: "Measured and refined", description: "Tracked time saved weekly and tightened the approval step based on edge cases." },
    ],
    mediaGallery: ["automated-outreach", "automated-outreach-2"],
  },
  {
    id: "ai-prototype-portfolio",
    slug: "ai-prototype-portfolio",
    ownerId: "william-sandford",
    title: "AI Prototype Portfolio",
    description:
      "Built experimental AI tools and interfaces to test new business workflows.",
    thumbnailSeed: "ai-prototype-portfolio",
    capabilities: ["rapid-prototyping", "ai-enablement", "product-thinking", "problem-solving"],
    tools: ["Next.js", "OpenAI API", "Vercel", "Figma"],
    evidence: [
      ev("e8", "demo-link", "Prototype 1 demo", "An internal knowledge assistant prototype", "https://disruptajob.example/demo/prototype-1"),
      ev("e9", "demo-link", "Prototype 2 demo", "A meeting-notes-to-action-items tool", "https://disruptajob.example/demo/prototype-2"),
      ev("e10", "screenshot", "Prototype gallery", "Screens from all three prototypes"),
      ev("e11", "write-up", "Sprint retrospective", "What worked, what didn't, and what shipped forward"),
    ],
    outcome: "Three prototypes tested with real users inside two weeks; one became the basis for AI Daily Signal.",
    problem:
      "The business had several hunches about where AI could help internally, but no fast way to test them before committing engineering time.",
    whatIBuilt:
      "Three scoped prototypes — each buildable and testable within a few days — covering different internal workflow bets.",
    myContribution:
      "Scoped, built, and user-tested all three prototypes solo, then wrote up findings to decide which bet deserved real investment.",
    process: [
      { title: "Generated and scoped bets", description: "Turned vague internal complaints into three testable, narrowly-scoped prototype ideas." },
      { title: "Built fast, then faster", description: "Used AI-assisted development to get each prototype in front of a real user within days." },
      { title: "Tested with real users", description: "Ran short sessions with the people who'd actually use each tool, not hypothetical users." },
      { title: "Wrote up the verdict", description: "Recommended which prototype deserved further investment, and why." },
    ],
    mediaGallery: ["ai-prototype-portfolio", "ai-prototype-portfolio-2", "ai-prototype-portfolio-3"],
    demoUrl: "https://disruptajob.example/demo/prototype-1",
  },

  // Priya Nair -------------------------------------------------------------
  {
    id: "lifecycle-revenue-engine",
    slug: "lifecycle-revenue-engine",
    ownerId: "priya-nair",
    title: "Lifecycle Revenue Engine",
    description: "Rebuilt lifecycle email and CRM automation that lifted trial-to-paid conversion by 18%.",
    thumbnailSeed: "lifecycle-revenue-engine",
    capabilities: ["growth", "automation", "data-analysis"],
    tools: ["Braze", "Salesforce", "SQL", "Looker"],
    evidence: [
      ev("e12", "metric", "Conversion lift", "Trial-to-paid conversion up 18% over two quarters"),
      ev("e13", "write-up", "Lifecycle map", "Full lifecycle stage and trigger documentation"),
      ev("e14", "screenshot", "Dashboard screenshot", "Live conversion tracking dashboard"),
    ],
    outcome: "Trial-to-paid conversion increased 18% over two quarters, with no added headcount.",
    problem: "Lifecycle messaging was manual, generic, and disconnected from actual product usage signals.",
    whatIBuilt: "A behaviour-triggered lifecycle system that personalises messaging based on real product usage.",
    myContribution: "Owned the project end to end: data model, trigger logic, messaging strategy, and rollout.",
    process: [
      { title: "Diagnosed the funnel", description: "Found where trial users were actually dropping off using cohort analysis." },
      { title: "Redesigned triggers", description: "Replaced static campaigns with usage-based triggers." },
      { title: "Rolled out in stages", description: "Tested against a holdout group before full rollout." },
    ],
    mediaGallery: ["lifecycle-revenue-engine", "lifecycle-revenue-engine-2"],
  },
  {
    id: "pricing-experiment-framework",
    slug: "pricing-experiment-framework",
    ownerId: "priya-nair",
    title: "Pricing Experiment Framework",
    description: "Built a repeatable A/B testing framework for pricing and packaging decisions.",
    thumbnailSeed: "pricing-experiment-framework",
    capabilities: ["growth", "data-analysis", "systems-thinking"],
    tools: ["SQL", "Python", "Stripe", "Amplitude"],
    evidence: [
      ev("e15", "write-up", "Framework doc", "Experiment design and statistical guardrails"),
      ev("e16", "metric", "Experiments run", "11 pricing experiments run in 6 months"),
    ],
    outcome: "Gave the leadership team a repeatable, low-risk way to test pricing changes instead of guessing.",
    problem: "Pricing changes were being made on instinct with no structured way to test impact safely.",
    whatIBuilt: "A standardised experiment framework covering design, sample size, and rollback rules.",
    myContribution: "Designed the statistical approach and built the tooling that made experiments self-serve.",
    process: [
      { title: "Set guardrails", description: "Defined minimum sample sizes and automatic rollback triggers." },
      { title: "Built tooling", description: "Made it possible for others to launch a compliant experiment without a data scientist." },
    ],
    mediaGallery: ["pricing-experiment-framework"],
  },
  {
    id: "revops-dashboard-suite",
    slug: "revops-dashboard-suite",
    ownerId: "priya-nair",
    title: "RevOps Dashboard Suite",
    description: "Consolidated fragmented reporting into a single source of truth for leadership.",
    thumbnailSeed: "revops-dashboard-suite",
    capabilities: ["operations", "data-analysis", "executive-communication"],
    tools: ["Looker", "SQL", "Salesforce"],
    evidence: [
      ev("e17", "screenshot", "Dashboard suite screenshot", "The consolidated leadership view"),
      ev("e18", "write-up", "Rollout notes", "How the team moved off five spreadsheets onto one source of truth"),
    ],
    outcome: "Leadership moved off five conflicting spreadsheets onto one trusted weekly view.",
    problem: "Every function had its own version of the numbers, and leadership meetings lost time to reconciling them.",
    whatIBuilt: "A single dashboard suite pulling from one governed data model.",
    myContribution: "Defined the data model, built the dashboards, and ran the migration off legacy spreadsheets.",
    process: [
      { title: "Audited existing reports", description: "Catalogued every spreadsheet and its owner." },
      { title: "Built one data model", description: "Consolidated definitions so every number had one source." },
    ],
    mediaGallery: ["revops-dashboard-suite"],
  },

  // Marcus Webb --------------------------------------------------------------
  {
    id: "board-reporting-overhaul",
    slug: "board-reporting-overhaul",
    ownerId: "marcus-webb",
    title: "Board Reporting Overhaul",
    description: "Redesigned the board reporting package, cutting prep time in half.",
    thumbnailSeed: "board-reporting-overhaul",
    capabilities: ["executive-communication", "operations"],
    tools: ["PowerPoint", "Google Slides", "Looker"],
    evidence: [
      ev("e19", "write-up", "Redesign rationale", "Why the old deck failed and what replaced it"),
      ev("e20", "metric", "Prep time", "Cut quarterly prep time from 3 weeks to 1.5"),
    ],
    outcome: "Board meetings shifted from status updates to actual strategic discussion.",
    problem: "The board deck took three weeks to prepare and still buried the decisions that mattered.",
    whatIBuilt: "A new reporting structure organised around decisions needed, not department updates.",
    myContribution: "Redesigned the structure, trained department heads on the new format, and ran the first two cycles.",
    process: [
      { title: "Interviewed the board", description: "Found out what they actually needed to decide, not just see." },
      { title: "Rebuilt the structure", description: "Reorganised the deck around decisions rather than departments." },
    ],
    mediaGallery: ["board-reporting-overhaul"],
  },
  {
    id: "org-design-sprint",
    slug: "org-design-sprint",
    ownerId: "marcus-webb",
    title: "Org Design Sprint",
    description: "Ran a cross-functional restructuring project during a scale-up phase.",
    thumbnailSeed: "org-design-sprint",
    capabilities: ["systems-thinking", "operations", "problem-solving"],
    tools: ["Miro", "Notion"],
    evidence: [
      ev("e21", "write-up", "Restructure plan", "The full org design and transition plan"),
      ev("e22", "testimonial", "CEO testimonial", "\"Marcus ran the hardest quarter of our org design without drama.\""),
    ],
    outcome: "Restructured three teams in six weeks with no regrettable attrition.",
    problem: "Rapid headcount growth had outpaced the org structure, creating duplicated ownership and stalled decisions.",
    whatIBuilt: "A new org design with clear ownership boundaries and a staged transition plan.",
    myContribution: "Led the design process, ran 1:1s across the org, and managed the rollout communication.",
    process: [
      { title: "Mapped real ownership", description: "Found out who actually owned what versus the org chart's claim." },
      { title: "Designed and staged rollout", description: "Sequenced the transition to avoid disrupting active projects." },
    ],
    mediaGallery: ["org-design-sprint"],
  },
  {
    id: "founder-decision-os",
    slug: "founder-decision-os",
    ownerId: "marcus-webb",
    title: "Founder Decision OS",
    description: "Built a lightweight decision-tracking system for a CEO managing 30+ concurrent initiatives.",
    thumbnailSeed: "founder-decision-os",
    capabilities: ["executive-communication", "product-thinking", "systems-thinking"],
    tools: ["Notion", "Linear"],
    evidence: [
      ev("e23", "screenshot", "System screenshot", "The decision log and initiative tracker"),
      ev("e24", "write-up", "Design notes", "Why most ops tooling failed for this CEO and what worked instead"),
    ],
    outcome: "CEO decision turnaround time dropped from an average of 9 days to 2.",
    problem: "The CEO was the bottleneck across 30+ initiatives with no single view of what was waiting on a decision.",
    whatIBuilt: "A minimal system surfacing only the decisions that needed the CEO, with context attached.",
    myContribution: "Designed the system from scratch after two failed off-the-shelf attempts, and ran it for six months.",
    process: [
      { title: "Diagnosed the real bottleneck", description: "Found decisions were lost in Slack threads, not on a tracker." },
      { title: "Built the minimal system", description: "Surfaced only what needed a decision, with full context attached." },
    ],
    mediaGallery: ["founder-decision-os"],
  },

  // Elena Kovač --------------------------------------------------------------
  {
    id: "internal-copilot-support",
    slug: "internal-copilot-support",
    ownerId: "elena-kovac",
    title: "Internal Copilot for Support",
    description: "Built an AI assistant embedded in the support team's helpdesk, cutting response time by a third.",
    thumbnailSeed: "internal-copilot-support",
    capabilities: ["ai-enablement", "automation", "product-thinking"],
    tools: ["OpenAI API", "Zendesk", "Pinecone", "TypeScript"],
    evidence: [
      ev("e25", "demo-link", "Copilot demo", "Recorded walkthrough of the assistant in the helpdesk", "https://disruptajob.example/demo/support-copilot"),
      ev("e26", "metric", "Response time", "First response time down 33%"),
      ev("e27", "write-up", "Build write-up", "Retrieval architecture and rollout plan"),
    ],
    outcome: "First response time dropped 33%; support team now handles 40% more volume without added headcount.",
    problem: "Support agents were spending too long searching internal docs to answer routine, repetitive questions.",
    whatIBuilt: "A retrieval-augmented assistant embedded directly inside the helpdesk tool agents already used.",
    myContribution: "Built the retrieval pipeline, fine-tuned response quality with agents, and managed the rollout.",
    process: [
      { title: "Shadowed agents", description: "Found the actual repeated questions costing the most time." },
      { title: "Built retrieval pipeline", description: "Indexed internal docs and tuned relevance against real tickets." },
      { title: "Embedded in existing tool", description: "Shipped inside the helpdesk instead of a separate app agents would ignore." },
    ],
    mediaGallery: ["internal-copilot-support", "internal-copilot-support-2"],
    demoUrl: "https://disruptajob.example/demo/support-copilot",
  },
  {
    id: "prototype-sprint-five-concepts",
    slug: "prototype-sprint-five-concepts",
    ownerId: "elena-kovac",
    title: "Prototype Sprint: 5 AI Concepts in 10 Days",
    description: "Rapid prototyping sprint testing five AI-driven workflow concepts with real users.",
    thumbnailSeed: "prototype-sprint-five-concepts",
    capabilities: ["rapid-prototyping", "ai-enablement", "problem-solving"],
    tools: ["Next.js", "OpenAI API", "Figma"],
    evidence: [
      ev("e28", "write-up", "Sprint retrospective", "What was tested, what worked, what was killed"),
      ev("e29", "screenshot", "Concept screenshots", "Screens from all five tested concepts"),
    ],
    outcome: "Two of five concepts were greenlit for further investment; three were killed with evidence, saving months of wasted build time.",
    problem: "The team had many AI ideas and no fast way to separate promising ones from distractions.",
    whatIBuilt: "Five narrowly-scoped prototypes, each testable with real users within two days.",
    myContribution: "Ran the entire sprint solo, from scoping through user testing to the final recommendation.",
    process: [
      { title: "Scoped five bets", description: "Narrowed vague ideas into concretely testable prototypes." },
      { title: "Built and tested in parallel", description: "Ran daily user tests rather than batching feedback at the end." },
    ],
    mediaGallery: ["prototype-sprint-five-concepts"],
  },
  {
    id: "document-intelligence-pipeline",
    slug: "document-intelligence-pipeline",
    ownerId: "elena-kovac",
    title: "Document Intelligence Pipeline",
    description: "Automated extraction and classification pipeline for inbound contracts.",
    thumbnailSeed: "document-intelligence-pipeline",
    capabilities: ["ai-enablement", "automation"],
    tools: ["Python", "OpenAI API", "AWS Textract"],
    evidence: [
      ev("e30", "metric", "Processing time", "Contract turnaround time down from 2 days to 20 minutes"),
      ev("e31", "write-up", "Pipeline architecture", "Extraction, classification, and human review loop"),
    ],
    outcome: "Contract turnaround time dropped from two days to roughly 20 minutes.",
    problem: "Legal and ops teams manually extracted key terms from every inbound contract.",
    whatIBuilt: "A classification and extraction pipeline with a human review loop for edge cases.",
    myContribution: "Built the full pipeline and designed the review loop that kept it trustworthy.",
    process: [
      { title: "Built extraction pipeline", description: "Combined OCR and structured extraction for key contract terms." },
      { title: "Added a human review loop", description: "Routed low-confidence extractions to a human instead of failing silently." },
    ],
    mediaGallery: ["document-intelligence-pipeline"],
  },

  // Tariq Osei -----------------------------------------------------------
  {
    id: "european-market-entry-playbook",
    slug: "european-market-entry-playbook",
    ownerId: "tariq-osei",
    title: "European Market Entry Playbook",
    description: "Operational playbook for entering three new markets in nine months.",
    thumbnailSeed: "european-market-entry-playbook",
    capabilities: ["operations", "systems-thinking", "executive-communication"],
    tools: ["Notion", "Airtable"],
    evidence: [
      ev("e32", "write-up", "Playbook document", "The repeatable market entry process"),
      ev("e33", "metric", "Markets launched", "3 markets launched in 9 months, ahead of plan"),
    ],
    outcome: "Three market launches completed ahead of schedule using a single repeatable playbook.",
    problem: "Each new market launch was being run as a one-off project with no shared process.",
    whatIBuilt: "A reusable playbook covering legal, hiring, and operational setup for market entry.",
    myContribution: "Authored the playbook from the first market's lessons and ran the next two launches directly.",
    process: [
      { title: "Ran the first market manually", description: "Learned the real requirements by doing it the hard way once." },
      { title: "Codified the playbook", description: "Turned lessons into a repeatable, checklist-driven process." },
    ],
    mediaGallery: ["european-market-entry-playbook"],
  },
  {
    id: "ops-process-redesign",
    slug: "ops-process-redesign",
    ownerId: "tariq-osei",
    title: "Ops Process Redesign",
    description: "Redesigned the fulfilment operations process, cutting order errors by 40%.",
    thumbnailSeed: "ops-process-redesign",
    capabilities: ["workflow-design", "operations"],
    tools: ["Airtable", "Zapier"],
    evidence: [
      ev("e34", "metric", "Error reduction", "Order errors down 40% within one quarter"),
      ev("e35", "write-up", "Process map", "Before and after process maps"),
    ],
    outcome: "Order errors dropped 40% within a single quarter.",
    problem: "Fulfilment errors were rising as order volume scaled past the original manual process.",
    whatIBuilt: "A redesigned process with clear checkpoints and automated validation.",
    myContribution: "Mapped the failure points and redesigned the process with the warehouse team.",
    process: [
      { title: "Mapped failure points", description: "Traced every recent error back to its root step." },
      { title: "Redesigned with checkpoints", description: "Added validation at the two steps causing most errors." },
    ],
    mediaGallery: ["ops-process-redesign"],
  },
  {
    id: "vendor-consolidation-project",
    slug: "vendor-consolidation-project",
    ownerId: "tariq-osei",
    title: "Vendor Consolidation Project",
    description: "Consolidated 14 vendors into 4 strategic partners, cutting cost and complexity.",
    thumbnailSeed: "vendor-consolidation-project",
    capabilities: ["operations", "systems-thinking"],
    tools: ["Excel", "DocuSign"],
    evidence: [
      ev("e36", "metric", "Cost reduction", "19% reduction in vendor spend"),
      ev("e37", "write-up", "Consolidation rationale", "Vendor scoring criteria and transition plan"),
    ],
    outcome: "Vendor spend reduced 19% with fewer, stronger relationships.",
    problem: "14 overlapping vendor contracts created cost and operational complexity with no clear ownership.",
    whatIBuilt: "A scoring framework to evaluate vendors and a staged consolidation plan.",
    myContribution: "Built the scoring model, negotiated transitions, and managed the rollout.",
    process: [
      { title: "Scored existing vendors", description: "Built objective criteria instead of relying on tenure or relationships." },
      { title: "Staged the consolidation", description: "Sequenced transitions to avoid service disruption." },
    ],
    mediaGallery: ["vendor-consolidation-project"],
  },

  // Sofia Almeida -------------------------------------------------------
  {
    id: "product-launch-operating-system",
    slug: "product-launch-operating-system",
    ownerId: "sofia-almeida",
    title: "Product Launch Operating System",
    description: "Built the repeatable process used across 12 product launches.",
    thumbnailSeed: "product-launch-operating-system",
    capabilities: ["product-thinking", "workflow-design", "systems-thinking"],
    tools: ["Notion", "Linear", "Slack"],
    evidence: [
      ev("e38", "write-up", "Operating system doc", "The full launch checklist and ownership model"),
      ev("e39", "metric", "Launches run", "Used across 12 product launches over 18 months"),
    ],
    outcome: "Launch prep time fell by roughly a third after the second iteration of the system.",
    problem: "Every product launch reinvented its own process, with inconsistent quality and missed steps.",
    whatIBuilt: "A standard launch operating system with clear ownership at each stage.",
    myContribution: "Designed the system after auditing five previous launches for what consistently went wrong.",
    process: [
      { title: "Audited past launches", description: "Found the same three failure points recurring across launches." },
      { title: "Built the standard system", description: "Created a checklist and ownership model teams could reuse." },
    ],
    mediaGallery: ["product-launch-operating-system"],
  },
  {
    id: "cross-team-roadmap-sync",
    slug: "cross-team-roadmap-sync",
    ownerId: "sofia-almeida",
    title: "Cross-team Roadmap Sync",
    description: "Designed the planning ritual that aligned engineering, design, and ops roadmaps.",
    thumbnailSeed: "cross-team-roadmap-sync",
    capabilities: ["systems-thinking", "operations"],
    tools: ["Notion", "Figma"],
    evidence: [
      ev("e40", "write-up", "Ritual design doc", "Meeting cadence, inputs, and outputs"),
      ev("e41", "testimonial", "Eng lead testimonial", "\"First time our roadmaps actually agreed with each other.\""),
    ],
    outcome: "Cross-team roadmap conflicts, previously discovered mid-quarter, now surface before planning starts.",
    problem: "Engineering, design, and ops planned independently, with conflicts surfacing mid-quarter.",
    whatIBuilt: "A lightweight recurring sync ritual with shared inputs and a single aligned output.",
    myContribution: "Designed the ritual format and facilitated the first two quarters directly.",
    process: [
      { title: "Diagnosed misalignment", description: "Traced recurring mid-quarter conflicts to a missing shared planning input." },
      { title: "Designed the ritual", description: "Built a lightweight recurring sync with a single shared output." },
    ],
    mediaGallery: ["cross-team-roadmap-sync"],
  },
  {
    id: "feature-adoption-dashboard",
    slug: "feature-adoption-dashboard",
    ownerId: "sofia-almeida",
    title: "Feature Adoption Dashboard",
    description: "Built a dashboard tracking feature adoption, used by product leadership weekly.",
    thumbnailSeed: "feature-adoption-dashboard",
    capabilities: ["data-analysis", "product-thinking"],
    tools: ["Amplitude", "SQL"],
    evidence: [
      ev("e42", "screenshot", "Dashboard screenshot", "The weekly leadership view"),
    ],
    outcome: "Became the standard reference for go/no-go decisions on feature investment.",
    problem: "Feature adoption was tracked inconsistently across teams, making prioritisation decisions subjective.",
    whatIBuilt: "A standard adoption dashboard with consistent definitions across every team.",
    myContribution: "Defined the adoption metrics and built the dashboard leadership now checks weekly.",
    process: [
      { title: "Standardised definitions", description: "Agreed one definition of 'adopted' across every team." },
      { title: "Built the dashboard", description: "Shipped a single weekly view leadership could trust." },
    ],
    mediaGallery: ["feature-adoption-dashboard"],
  },

  // Daniel Cho -------------------------------------------------------------
  {
    id: "zero-to-one-ops-stack",
    slug: "zero-to-one-ops-stack",
    ownerId: "daniel-cho",
    title: "Zero-to-One Ops Stack",
    description: "Built the entire operational stack — CRM, support, finance automations — for a 6-person startup.",
    thumbnailSeed: "zero-to-one-ops-stack",
    capabilities: ["automation", "startup-experience", "systems-thinking"],
    tools: ["Airtable", "Zapier", "Stripe", "QuickBooks"],
    evidence: [
      ev("e43", "write-up", "Stack overview", "Every tool and automation wired together at launch"),
      ev("e44", "metric", "Time to operational", "Fully operational finance, CRM, and support stack within 3 weeks of founding"),
    ],
    outcome: "Company ran its first six months of operations without hiring a single ops hire.",
    problem: "A brand-new startup had no operational infrastructure at all — no CRM, no finance process, no support system.",
    whatIBuilt: "A lean, fully-automated operational stack covering CRM, finance, and customer support.",
    myContribution: "Designed and built the entire stack solo within the company's first month.",
    process: [
      { title: "Prioritised ruthlessly", description: "Built only what was needed to not break at the next milestone." },
      { title: "Automated from day one", description: "Wired automations in from the start rather than bolting them on later." },
    ],
    mediaGallery: ["zero-to-one-ops-stack"],
  },
  {
    id: "ai-support-triage-bot",
    slug: "ai-support-triage-bot",
    ownerId: "daniel-cho",
    title: "AI Support Triage Bot",
    description: "Built an AI triage system that reduced first-response time by 70%.",
    thumbnailSeed: "ai-support-triage-bot",
    capabilities: ["ai-enablement", "automation", "rapid-prototyping"],
    tools: ["OpenAI API", "Intercom", "Python"],
    evidence: [
      ev("e45", "metric", "Response time", "First response time down 70%"),
      ev("e46", "demo-link", "Triage bot demo", "Live triage flow recording", "https://disruptajob.example/demo/triage-bot"),
    ],
    outcome: "First response time down 70%, freeing the founder from most first-line support.",
    problem: "The founder was personally handling all first-line support, with no time to triage efficiently.",
    whatIBuilt: "An AI system that classifies, prioritises, and drafts first responses for incoming support requests.",
    myContribution: "Built the full triage system in under a week, from classification logic to draft response generation.",
    process: [
      { title: "Classified ticket patterns", description: "Found the handful of categories that covered 80% of volume." },
      { title: "Built triage and drafting", description: "Automated classification and first-draft responses for review." },
    ],
    mediaGallery: ["ai-support-triage-bot"],
    demoUrl: "https://disruptajob.example/demo/triage-bot",
  },
  {
    id: "internal-tools-sprint",
    slug: "internal-tools-sprint",
    ownerId: "daniel-cho",
    title: "Internal Tools Sprint",
    description: "Built four internal tools in three weeks to solve urgent operational bottlenecks.",
    thumbnailSeed: "internal-tools-sprint",
    capabilities: ["rapid-prototyping", "problem-solving", "ai-enablement"],
    tools: ["Next.js", "Supabase", "OpenAI API"],
    evidence: [
      ev("e47", "write-up", "Sprint log", "What was built, why, and what it replaced"),
      ev("e48", "screenshot", "Tools screenshot", "Screens from the four shipped tools"),
    ],
    outcome: "Each tool replaced a manual process that was actively blocking the team that week.",
    problem: "Four separate operational bottlenecks were each costing the small team real time every week.",
    whatIBuilt: "Four narrowly-scoped internal tools, each built and shipped within three to five days.",
    myContribution: "Identified the bottlenecks, scoped each tool tightly, and shipped all four solo.",
    process: [
      { title: "Triaged the bottlenecks", description: "Picked the four causing the most weekly pain, not the most interesting." },
      { title: "Shipped narrow and fast", description: "Built each tool to solve exactly one problem, nothing more." },
    ],
    mediaGallery: ["internal-tools-sprint"],
  },

  // Grace Odunsi -------------------------------------------------------
  {
    id: "revenue-funnel-diagnostic",
    slug: "revenue-funnel-diagnostic",
    ownerId: "grace-odunsi",
    title: "Revenue Funnel Diagnostic",
    description: "Identified and fixed the biggest leak in the sales funnel, lifting conversion by 22%.",
    thumbnailSeed: "revenue-funnel-diagnostic",
    capabilities: ["data-analysis", "growth"],
    tools: ["SQL", "Salesforce", "Tableau"],
    evidence: [
      ev("e49", "metric", "Conversion lift", "Funnel conversion up 22% after the fix shipped"),
      ev("e50", "write-up", "Diagnostic write-up", "How the leak was found and validated"),
    ],
    outcome: "Funnel conversion increased 22% after fixing a single mis-routed lead stage.",
    problem: "Conversion had been quietly declining for two quarters with no clear owner or diagnosis.",
    whatIBuilt: "A full funnel diagnostic isolating exactly where leads were being lost.",
    myContribution: "Ran the full diagnostic solo and proposed and implemented the fix.",
    process: [
      { title: "Rebuilt the funnel model", description: "Modelled every stage transition to find where numbers didn't add up." },
      { title: "Isolated the leak", description: "Found a mis-routed lead stage silently dropping qualified leads." },
    ],
    mediaGallery: ["revenue-funnel-diagnostic"],
  },
  {
    id: "crm-automation-overhaul",
    slug: "crm-automation-overhaul",
    ownerId: "grace-odunsi",
    title: "CRM Automation Overhaul",
    description: "Automated lead routing and reporting across the CRM.",
    thumbnailSeed: "crm-automation-overhaul",
    capabilities: ["automation", "operations", "data-analysis"],
    tools: ["Salesforce", "Zapier"],
    evidence: [
      ev("e51", "write-up", "Automation overview", "Routing logic and reporting automation"),
      ev("e52", "metric", "Manual hours saved", "Removed roughly 6 hours a week of manual routing"),
    ],
    outcome: "Removed roughly 6 hours a week of manual lead routing and reporting work.",
    problem: "Leads were manually routed and reported on, causing delays and inconsistent follow-up.",
    whatIBuilt: "Automated routing rules and a reporting layer that updates without manual intervention.",
    myContribution: "Designed the routing logic and built the automation end to end.",
    process: [
      { title: "Mapped routing rules", description: "Codified the informal rules reps were applying inconsistently." },
      { title: "Automated and monitored", description: "Shipped the automation with a monitoring layer to catch misroutes." },
    ],
    mediaGallery: ["crm-automation-overhaul"],
  },
  {
    id: "weekly-leadership-metrics-pack",
    slug: "weekly-leadership-metrics-pack",
    ownerId: "grace-odunsi",
    title: "Weekly Leadership Metrics Pack",
    description: "Built the automated reporting pack leadership now uses every Monday.",
    thumbnailSeed: "weekly-leadership-metrics-pack",
    capabilities: ["data-analysis", "executive-communication", "automation"],
    tools: ["Tableau", "SQL"],
    evidence: [
      ev("e53", "screenshot", "Metrics pack screenshot", "The Monday leadership view"),
    ],
    outcome: "Replaced a 3-hour manual reporting ritual with an automated pack ready every Monday morning.",
    problem: "A junior analyst spent three hours every Monday manually assembling the leadership metrics pack.",
    whatIBuilt: "A fully automated metrics pack that refreshes overnight and is ready before the Monday meeting.",
    myContribution: "Defined the metrics, automated the data pull, and designed the leadership-facing layout.",
    process: [
      { title: "Defined the real metrics", description: "Cut the pack down to the handful of numbers leadership actually used." },
      { title: "Automated the pull", description: "Removed the manual assembly step entirely." },
    ],
    mediaGallery: ["weekly-leadership-metrics-pack"],
  },
];

function projectsFor(ids: string[]) {
  return ids;
}

// ---------------------------------------------------------------------------
// Candidates
// ---------------------------------------------------------------------------

export const CANDIDATES: CandidateProfile[] = [
  {
    id: "william-sandford",
    slug: "william-sandford",
    userId: "u-william",
    name: "William Sandford",
    headline: "Business Operations · AI Enablement · Automation · Product",
    shortDescription: "I build systems that help businesses operate better with AI.",
    location: "London, UK",
    availability: "open",
    avatarInitials: "WS",
    accentIndex: 0,
    capabilities: [
      cap("ai-enablement", "AI Enablement", 7, ["ai-daily-signal", "ai-prototype-portfolio"]),
      cap("automation", "Automation", 5, ["ai-daily-signal", "automated-outreach-workflow"]),
      cap("operations", "Operations", 8, ["automated-outreach-workflow"]),
      cap("product-thinking", "Product Thinking", 6, ["ai-daily-signal", "ai-prototype-portfolio"]),
      cap("executive-communication", "Executive Communication", 4, ["ai-daily-signal"]),
      cap("rapid-prototyping", "Rapid Prototyping", 3, ["ai-prototype-portfolio"]),
    ],
    projectIds: projectsFor(["ai-daily-signal", "automated-outreach-workflow", "ai-prototype-portfolio"]),
    experience: [
      { company: "Fenwick Robotics", role: "Business Operations Lead", startDate: "2023", endDate: "Present" },
      { company: "Harrow & Co.", role: "Operations Associate", startDate: "2021", endDate: "2023" },
    ],
    education: [{ institution: "University of Bristol", qualification: "BSc Economics", endYear: "2021" }],
    discoverability: "open",
    // Blocks his own current employer — the reason he was willing to publish evidence at all.
    blockedCompanies: ["Fenwick Robotics"],
    nonNegotiables: {
      roleTypes: ["Head of Operations", "AI Enablement Lead"],
      compFloor: "£70,000",
      workArrangements: ["hybrid", "remote"],
      locationConstraint: "London or UK remote",
      dealbreakers: ["No 5-day return-to-office"],
    },
  },
  {
    id: "priya-nair",
    slug: "priya-nair",
    userId: "u-priya",
    name: "Priya Nair",
    headline: "Growth · RevOps · Lifecycle Marketing",
    shortDescription: "I turn messy funnels into predictable growth systems.",
    location: "Berlin, Germany",
    availability: "selectively-open",
    avatarInitials: "PN",
    accentIndex: 1,
    capabilities: [
      cap("growth", "Growth", 8, ["lifecycle-revenue-engine", "pricing-experiment-framework"]),
      cap("data-analysis", "Data Analysis", 7, ["lifecycle-revenue-engine", "revops-dashboard-suite"]),
      cap("automation", "Automation", 4, ["lifecycle-revenue-engine"]),
      cap("operations", "Operations", 5, ["revops-dashboard-suite"]),
      cap("systems-thinking", "Systems Thinking", 3, ["pricing-experiment-framework"]),
    ],
    projectIds: projectsFor(["lifecycle-revenue-engine", "pricing-experiment-framework", "revops-dashboard-suite"]),
    experience: [
      { company: "Nordlicht SaaS", role: "Growth Lead", startDate: "2022", endDate: "Present" },
      { company: "Elbe Strategy Group", role: "Growth Analyst", startDate: "2020", endDate: "2022" },
    ],
    education: [{ institution: "WHU – Otto Beisheim School of Management", qualification: "BSc Management", endYear: "2020" }],
    discoverability: "selectively-open",
    blockedCompanies: [],
    nonNegotiables: {
      roleTypes: ["Head of Growth", "RevOps Lead"],
      compFloor: "€85,000",
      workArrangements: ["hybrid"],
      locationConstraint: "Berlin",
      dealbreakers: ["No pure-reporting roles"],
    },
  },
  {
    id: "marcus-webb",
    slug: "marcus-webb",
    userId: "u-marcus",
    name: "Marcus Webb",
    headline: "Chief of Staff · Executive Operations · Strategy",
    shortDescription: "I give founders leverage by turning strategy into execution.",
    location: "New York, USA",
    availability: "selectively-open",
    avatarInitials: "MW",
    accentIndex: 2,
    capabilities: [
      cap("executive-communication", "Executive Communication", 9, ["board-reporting-overhaul", "founder-decision-os"]),
      cap("operations", "Operations", 7, ["board-reporting-overhaul", "org-design-sprint"]),
      cap("problem-solving", "Problem Solving", 6, ["org-design-sprint"]),
      cap("systems-thinking", "Systems Thinking", 5, ["org-design-sprint", "founder-decision-os"]),
      cap("product-thinking", "Product Thinking", 3, ["founder-decision-os"]),
    ],
    projectIds: projectsFor(["board-reporting-overhaul", "org-design-sprint", "founder-decision-os"]),
    experience: [
      { company: "Hallmark Logistics", role: "Chief of Staff to the CEO", startDate: "2022", endDate: "Present" },
      { company: "Bain & Company", role: "Strategy Consultant", startDate: "2018", endDate: "2022" },
    ],
    education: [
      { institution: "Columbia Business School", qualification: "MBA", endYear: "2018" },
      { institution: "Williams College", qualification: "BA Economics", endYear: "2014" },
    ],
    // Fully hidden: complete profile, deliberately not discoverable. Can still be invited directly.
    discoverability: "hidden",
    blockedCompanies: [],
    nonNegotiables: {
      roleTypes: ["Chief of Staff", "VP Operations"],
      compFloor: "$180,000",
      workArrangements: ["hybrid", "onsite"],
      locationConstraint: "New York",
      dealbreakers: ["No relocation"],
    },
  },
  {
    id: "elena-kovac",
    slug: "elena-kovac",
    userId: "u-elena",
    name: "Elena Kovač",
    headline: "AI Product · Automation · Applied ML",
    shortDescription: "I ship AI products that survive contact with real users.",
    location: "Lisbon, Portugal (Remote)",
    availability: "open",
    avatarInitials: "EK",
    accentIndex: 3,
    capabilities: [
      cap("ai-enablement", "AI Enablement", 9, ["internal-copilot-support", "document-intelligence-pipeline"]),
      cap("rapid-prototyping", "Rapid Prototyping", 8, ["prototype-sprint-five-concepts"]),
      cap("product-thinking", "Product Thinking", 6, ["internal-copilot-support"]),
      cap("automation", "Automation", 4, ["document-intelligence-pipeline"]),
      cap("problem-solving", "Problem Solving", 4, ["prototype-sprint-five-concepts"]),
    ],
    projectIds: projectsFor(["internal-copilot-support", "prototype-sprint-five-concepts", "document-intelligence-pipeline"]),
    experience: [
      { company: "Loop AI", role: "Applied AI Engineer", startDate: "2023", endDate: "Present" },
      { company: "Nimbus Analytics", role: "Product Analyst", startDate: "2021", endDate: "2023" },
    ],
    education: [{ institution: "TU Delft", qualification: "MSc Computer Science", endYear: "2021" }],
    discoverability: "open",
    blockedCompanies: [],
    nonNegotiables: {
      roleTypes: ["AI Product Lead", "Founding Engineer"],
      compFloor: "€75,000",
      workArrangements: ["remote"],
      locationConstraint: "Remote (EU timezones)",
      dealbreakers: ["No onsite requirement", "No on-call rota"],
    },
  },
  {
    id: "tariq-osei",
    slug: "tariq-osei",
    userId: "u-tariq",
    name: "Tariq Osei",
    headline: "Strategy & Operations · Market Entry · Process Design",
    shortDescription: "I build the operational backbone for teams scaling fast.",
    location: "London, UK",
    availability: "open",
    avatarInitials: "TO",
    accentIndex: 4,
    capabilities: [
      cap("operations", "Operations", 8, ["european-market-entry-playbook", "ops-process-redesign", "vendor-consolidation-project"]),
      cap("systems-thinking", "Systems Thinking", 6, ["european-market-entry-playbook", "vendor-consolidation-project"]),
      cap("workflow-design", "Workflow Design", 6, ["ops-process-redesign"]),
      cap("executive-communication", "Executive Communication", 4, ["european-market-entry-playbook"]),
      cap("startup-experience", "Startup Experience", 5, ["european-market-entry-playbook"]),
    ],
    projectIds: projectsFor(["european-market-entry-playbook", "ops-process-redesign", "vendor-consolidation-project"]),
    experience: [
      { company: "Crate & Oak", role: "Operations Lead", startDate: "2021", endDate: "Present" },
      { company: "Monitor Deloitte", role: "Strategy Analyst", startDate: "2019", endDate: "2021" },
    ],
    education: [{ institution: "London School of Economics", qualification: "BSc Management", endYear: "2019" }],
    discoverability: "open",
    // Blocks the demo employer — proves the blocklist actually removes him from their results.
    blockedCompanies: ["Meridian Robotics"],
    nonNegotiables: {
      roleTypes: ["Operations Manager", "Programme Lead"],
      compFloor: "£65,000",
      workArrangements: ["hybrid", "onsite"],
      locationConstraint: "London",
      dealbreakers: ["No unpaid overtime culture"],
    },
  },
  {
    id: "sofia-almeida",
    slug: "sofia-almeida",
    userId: "u-sofia",
    name: "Sofia Almeida",
    headline: "Product Operations · Systems Thinking · Process",
    shortDescription: "I make sure product teams ship without breaking everything around them.",
    location: "Manchester, UK",
    availability: "selectively-open",
    avatarInitials: "SA",
    accentIndex: 5,
    capabilities: [
      cap("product-thinking", "Product Thinking", 7, ["product-launch-operating-system", "feature-adoption-dashboard"]),
      cap("systems-thinking", "Systems Thinking", 6, ["product-launch-operating-system", "cross-team-roadmap-sync"]),
      cap("operations", "Operations", 5, ["cross-team-roadmap-sync"]),
      cap("workflow-design", "Workflow Design", 5, ["product-launch-operating-system"]),
      cap("data-analysis", "Data Analysis", 3, ["feature-adoption-dashboard"]),
    ],
    projectIds: projectsFor(["product-launch-operating-system", "cross-team-roadmap-sync", "feature-adoption-dashboard"]),
    experience: [
      { company: "Fernbank Financial", role: "Senior Product Operations Manager", startDate: "2022", endDate: "Present" },
      { company: "Hollis & Pike", role: "Product Manager", startDate: "2019", endDate: "2022" },
    ],
    education: [{ institution: "University of Manchester", qualification: "BA Management", endYear: "2019" }],
    discoverability: "selectively-open",
    blockedCompanies: [],
    nonNegotiables: {
      roleTypes: ["Service Design Lead", "Operations Manager"],
      compFloor: "£58,000",
      workArrangements: ["remote", "hybrid"],
      locationConstraint: "Manchester or UK remote",
      dealbreakers: ["No weekend on-call"],
    },
  },
  {
    id: "daniel-cho",
    slug: "daniel-cho",
    userId: "u-daniel",
    name: "Daniel Cho",
    headline: "AI Operations · Automation · Startup Builder",
    shortDescription: "I wire AI into the day-to-day mechanics of an early-stage company.",
    location: "San Francisco, USA",
    availability: "open",
    avatarInitials: "DC",
    accentIndex: 6,
    capabilities: [
      cap("automation", "Automation", 9, ["zero-to-one-ops-stack", "ai-support-triage-bot"]),
      cap("ai-enablement", "AI Enablement", 7, ["ai-support-triage-bot", "internal-tools-sprint"]),
      cap("startup-experience", "Startup Experience", 8, ["zero-to-one-ops-stack"]),
      cap("rapid-prototyping", "Rapid Prototyping", 6, ["internal-tools-sprint"]),
      cap("problem-solving", "Problem Solving", 5, ["internal-tools-sprint"]),
    ],
    projectIds: projectsFor(["zero-to-one-ops-stack", "ai-support-triage-bot", "internal-tools-sprint"]),
    experience: [
      { company: "Fathom (YC S23)", role: "Founding Operations Engineer", startDate: "2023", endDate: "Present" },
    ],
    education: [{ institution: "UC Berkeley", qualification: "BS Industrial Engineering & Operations Research", endYear: "2022" }],
    discoverability: "open",
    blockedCompanies: [],
    nonNegotiables: {
      roleTypes: ["Data / Analytics Lead", "Operations Analyst"],
      compFloor: "$140,000",
      workArrangements: ["hybrid", "remote"],
      locationConstraint: "San Francisco Bay Area",
      dealbreakers: [],
    },
  },
  {
    id: "grace-odunsi",
    slug: "grace-odunsi",
    userId: "u-grace",
    name: "Grace Odunsi",
    headline: "RevOps · Growth · Data-Informed Operations",
    shortDescription: "I connect the dots between data, process, and revenue.",
    location: "London, UK",
    availability: "open",
    avatarInitials: "GO",
    accentIndex: 7,
    capabilities: [
      cap("data-analysis", "Data Analysis", 8, ["revenue-funnel-diagnostic", "weekly-leadership-metrics-pack"]),
      cap("growth", "Growth", 6, ["revenue-funnel-diagnostic"]),
      cap("automation", "Automation", 5, ["crm-automation-overhaul"]),
      cap("operations", "Operations", 5, ["crm-automation-overhaul"]),
      cap("executive-communication", "Executive Communication", 3, ["weekly-leadership-metrics-pack"]),
    ],
    projectIds: projectsFor(["revenue-funnel-diagnostic", "crm-automation-overhaul", "weekly-leadership-metrics-pack"]),
    experience: [
      { company: "Alder Finch", role: "RevOps Manager", startDate: "2022", endDate: "Present" },
      { company: "Datasphere Consulting", role: "Data Analyst", startDate: "2020", endDate: "2022" },
    ],
    education: [{ institution: "University of Warwick", qualification: "BSc Mathematics & Economics", endYear: "2020" }],
    discoverability: "open",
    blockedCompanies: [],
    nonNegotiables: {
      roleTypes: ["Product Operations Lead", "Technical Programme Manager"],
      compFloor: "£72,000",
      workArrangements: ["hybrid", "remote"],
      locationConstraint: "London or UK remote",
      dealbreakers: ["No 5-day return-to-office"],
    },
  },
];

export const EMPLOYERS: Employer[] = [
  {
    id: "employer-1",
    userId: "u-employer-1",
    companyName: "Meridian Robotics",
    companyBlurb: "Series B hardware-software company building automated logistics infrastructure.",
  },
  {
    id: "employer-2",
    userId: "u-employer-2",
    companyName: "Halcyon Systems",
    companyBlurb: "Seed-stage team building AI-native back-office tooling for mid-market operators.",
  },
  {
    id: "employer-3",
    userId: "u-employer-3",
    companyName: "Nordstar Analytics",
    companyBlurb: "Series A data platform helping ops teams turn messy internal data into decisions.",
  },
];

// --- Companies and their real work ----------------------------------------
//
// Seeded the same way candidates are. Every role is defined by work examples rather than a job
// description, so a candidate reading this sees what they'd actually be doing, and matching can
// compare required capabilities against proven ones.

export const COMPANIES: CompanyProfile[] = [
  {
    id: "employer-1",
    slug: "meridian-robotics",
    name: "Meridian Robotics",
    blurb:
      "We build the software that runs automated warehouses — routing, dispatch and the systems that keep physical goods moving.",
    website: "meridianrobotics.com",
    stage: "series-b",
    teamSize: "120–180",
    location: "London, UK",
    avatarInitials: "MR",
    accentIndex: 0,
    published: true,
  },
  {
    id: "employer-2",
    slug: "halcyon-systems",
    name: "Halcyon Systems",
    blurb:
      "A small team replacing the spreadsheets and manual admin that mid-market operations teams still run on.",
    website: "halcyonsystems.io",
    stage: "seed",
    teamSize: "12–20",
    location: "Remote (UK/EU)",
    avatarInitials: "HS",
    accentIndex: 2,
    published: true,
  },
  {
    id: "employer-3",
    slug: "nordstar-analytics",
    name: "Nordstar Analytics",
    blurb:
      "We help operations teams turn messy internal data into decisions they can actually act on.",
    website: "nordstar.co",
    stage: "series-a",
    teamSize: "40–60",
    location: "Manchester, UK",
    avatarInitials: "NA",
    accentIndex: 3,
    published: true,
  },
];

export const ROLES: Role[] = [
  {
    id: "role-meridian-1",
    companyId: "employer-1",
    title: "AI Operations Lead",
    whyThisRole:
      "Our dispatch team still runs the hardest decisions of the day out of a spreadsheet one person maintains. We need someone to own replacing that properly.",
    status: "open",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString(),
    workExamples: [
      {
        id: "we-meridian-1",
        title: "Replace the manual dispatch spreadsheet",
        description:
          "Every morning a coordinator rebuilds the day's routing by hand in Excel. It takes two hours, it breaks when they're on holiday, and nobody else fully understands it.",
        whatYoudDo: [
          "Shadow the coordinator for a week and document what the spreadsheet actually decides",
          "Design a replacement that keeps a human approving the final plan",
          "Ship it incrementally so dispatch never stops working",
        ],
        capabilities: ["operations", "automation", "workflow-design"],
        timeframe: "First 90 days",
        attachments: [
          { id: "att-m1", name: "Current dispatch process (notes)", kind: "file" },
        ],
      },
      {
        id: "we-meridian-2",
        title: "Give the exec team a daily operations signal",
        description:
          "Leadership currently learns about problems in the Monday meeting, which is three days too late. They need a short, trustworthy daily read on what's going wrong.",
        whatYoudDo: [
          "Work out which handful of numbers actually predict a bad week",
          "Build a daily digest that an exec reads in 30 seconds",
          "Tune it based on what they ignore, not what they say they want",
        ],
        capabilities: ["ai-enablement", "data-analysis", "executive-communication"],
        timeframe: "Months 3–6",
        attachments: [],
      },
    ],
    terms: {
      compRange: "£65,000 – £80,000",
      workArrangements: ["hybrid"],
      location: "London — 2 days a week onsite",
      startWindow: "Within 2 months",
      constraints: ["Some warehouse site visits", "UK work authorisation required"],
    },
  },
  {
    id: "role-halcyon-1",
    companyId: "employer-2",
    title: "Automation & AI Enablement Manager",
    whyThisRole:
      "We sell automation to other people's ops teams and still onboard our own clients by hand. It doesn't scale and it's embarrassing.",
    status: "open",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    workExamples: [
      {
        id: "we-halcyon-1",
        title: "Automate client onboarding end to end",
        description:
          "Onboarding a new client takes 11 manual steps across four tools and roughly a week of someone's attention. We want it down to a day.",
        whatYoudDo: [
          "Map every step and find where the week actually goes",
          "Automate the handoffs, keeping a human checkpoint before anything client-facing",
          "Measure it honestly and publish the before/after internally",
        ],
        capabilities: ["automation", "workflow-design", "operations"],
        timeframe: "First 60 days",
        attachments: [{ id: "att-h1", name: "Onboarding runbook", kind: "link", url: "https://example.com/runbook" }],
      },
    ],
    terms: {
      compRange: "£60,000 – £75,000",
      workArrangements: ["remote", "hybrid"],
      location: "Remote (UK/EU timezones)",
      startWindow: "Flexible",
      constraints: ["Occasional travel for quarterly onsites"],
    },
  },
  {
    id: "role-nordstar-1",
    companyId: "employer-3",
    title: "Head of Internal Tools",
    whyThisRole:
      "We're a data company whose own team can't self-serve its data. We need someone to own internal tooling as a product, not a side project.",
    status: "open",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    workExamples: [
      {
        id: "we-nordstar-1",
        title: "Make internal data self-serve",
        description:
          "Every internal question becomes a ticket for the data team. We want the rest of the company able to answer most of them without asking.",
        whatYoudDo: [
          "Find the ten questions that generate most of the tickets",
          "Build the smallest thing that answers them without a data engineer",
          "Get adoption — the hard part is people, not pipelines",
        ],
        capabilities: ["data-analysis", "product-thinking", "systems-thinking"],
        timeframe: "First 6 months",
        attachments: [],
      },
      {
        id: "we-nordstar-2",
        title: "Prototype three internal tools in a quarter",
        description:
          "We don't yet know what internal tooling should exist. We'd rather find out by building rough versions fast than by writing a strategy document.",
        whatYoudDo: [
          "Ship three rough prototypes to real internal users",
          "Kill the two that don't get used, without ceremony",
          "Turn the survivor into something maintained",
        ],
        capabilities: ["rapid-prototyping", "product-thinking", "problem-solving"],
        timeframe: "Quarter one",
        attachments: [],
      },
    ],
    terms: {
      compRange: "£75,000 – £95,000",
      workArrangements: ["hybrid", "remote"],
      location: "Manchester or UK remote",
      startWindow: "Q1",
      constraints: ["One week a month in Manchester"],
    },
  },
];

export function getCompanyBySlug(slug: string): CompanyProfile | undefined {
  return COMPANIES.find((c) => c.slug === slug);
}

export function getCompanyById(id: string): CompanyProfile | undefined {
  return COMPANIES.find((c) => c.id === id);
}

/** Resolve a company by display name — invites carry the name a human typed, not an id. */
export function getCompanyByName(name: string): CompanyProfile | undefined {
  const target = name.trim().toLowerCase();
  return COMPANIES.find((c) => c.name.toLowerCase() === target);
}

export function getRolesForCompany(companyId: string): Role[] {
  return ROLES.filter((r) => r.companyId === companyId);
}

/** Every capability any of a role's work examples demands, de-duplicated. */
export function capabilitiesForRole(role: Role): string[] {
  return [...new Set(role.workExamples.flatMap((w) => w.capabilities))];
}

export function getCandidateBySlug(slug: string): CandidateProfile | undefined {
  return CANDIDATES.find((c) => c.slug === slug);
}

export function getProjectsForCandidate(candidate: CandidateProfile): Project[] {
  return candidate.projectIds
    .map((id) => PROJECTS.find((p) => p.id === id))
    .filter((p): p is Project => Boolean(p));
}

export function getProjectBySlug(candidateSlug: string, projectSlug: string): Project | undefined {
  return PROJECTS.find((p) => p.ownerId === candidateSlug && p.slug === projectSlug);
}

export function getProjectsForCapability(candidate: CandidateProfile, tag: string): Project[] {
  const capability = candidate.capabilities.find((c) => c.tag === tag);
  if (!capability) return [];
  return capability.projectIds
    .map((id) => PROJECTS.find((p) => p.id === id))
    .filter((p): p is Project => Boolean(p));
}
