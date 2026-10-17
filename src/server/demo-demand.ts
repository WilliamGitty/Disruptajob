import type { DatabaseSync } from "node:sqlite";

/**
 * Three more invented companies with open roles — the demand side of the demo population.
 *
 * Why these exist (17 Oct 2026, founder request before a weekend of testers): a candidate
 * walking through the product should see what demand looks like here, and two seeded companies
 * were too thin to carry that. What we deliberately did NOT do is scrape real companies' job
 * ads: presenting a real company's role on a platform it never joined misrepresents both of us,
 * sending testers to apply elsewhere would make this the job board strategy §5a forbids, and a
 * tester's trust is the one thing a demo must not spend. Invented and badged beats real and
 * borrowed.
 *
 * Every company carries demo = 1, so the Example-company badge renders and no cleanup query can
 * miss them. Applied by migration 007 (existing databases, production included) and harmless on
 * fresh installs where the ids already guard against duplication.
 */

interface DemoWorkExample {
  id: string;
  title: string;
  description: string;
  timeframe: string;
  capabilities: string[];
  whatYoudDo: string[];
}

interface DemoRole {
  id: string;
  title: string;
  whyThisRole: string;
  compRange: string;
  location: string;
  startWindow: string;
  arrangements: string[];
  constraints: string[];
  workExamples: DemoWorkExample[];
}

interface DemoCompany {
  id: string;
  slug: string;
  name: string;
  blurb: string;
  stage: string;
  teamSize: string;
  location: string;
  initials: string;
  accent: number;
  role: DemoRole;
}

const DEMO_COMPANIES: DemoCompany[] = [
  {
    id: "co-bramble-field",
    slug: "bramble-and-field",
    name: "Bramble & Field",
    blurb: "A direct-to-consumer food brand that outgrew its spreadsheets about a year ago.",
    stage: "seed",
    teamSize: "12",
    location: "Bristol, UK",
    initials: "BF",
    accent: 2,
    role: {
      id: "role-bf-ops",
      title: "Operations generalist",
      whyThisRole:
        "Orders tripled in a year and the founder is still the one who notices when fulfilment breaks. We need the person who builds the systems that notice instead.",
      compRange: "£38,000–£48,000",
      location: "Bristol or remote (UK)",
      startWindow: "Within two months",
      arrangements: ["hybrid", "remote"],
      constraints: ["Occasional travel to the Bristol warehouse", "UK right to work"],
      workExamples: [
        {
          id: "we-bf-1",
          title: "Replace the order-exceptions spreadsheet",
          description:
            "Failed deliveries, refunds and courier disputes live in one heroic spreadsheet. The work is building the workflow that routes each exception to the right fix without a human triaging it every morning.",
          timeframe: "First 90 days",
          capabilities: ["automation", "workflow-design", "operations"],
          whatYoudDo: [
            "Map how exceptions actually flow today, including the undocumented parts",
            "Build the routing automation with whatever tools earn their keep",
            "Kill the spreadsheet and publish what replaced it",
          ],
        },
        {
          id: "we-bf-2",
          title: "Make weekly numbers appear without anyone compiling them",
          description:
            "The Monday metrics email takes someone three hours every week. It should take nobody any time at all.",
          timeframe: "First 6 months",
          capabilities: ["data-analysis", "automation"],
          whatYoudDo: [
            "Decide which numbers actually change decisions, and cut the rest",
            "Automate the pull from the shop platform and the 3PL",
          ],
        },
      ],
    },
  },
  {
    id: "co-ashworth",
    slug: "ashworth-clinics",
    name: "Ashworth Clinics",
    blurb: "Four physiotherapy clinics trying to run on systems instead of goodwill.",
    stage: "established",
    teamSize: "35",
    location: "Manchester, UK",
    initials: "AC",
    accent: 4,
    role: {
      id: "role-ac-systems",
      title: "Practice systems lead",
      whyThisRole:
        "Every clinic runs its own version of every process. Booking works differently in each one, and nobody can see utilisation across the four. This role exists to make the group run as one business.",
      compRange: "£45,000–£55,000",
      location: "Manchester, on site most of the week",
      startWindow: "Flexible for the right person",
      arrangements: ["onsite", "hybrid"],
      constraints: ["Weekly presence across the four clinics"],
      workExamples: [
        {
          id: "we-ac-1",
          title: "One booking flow for four clinics",
          description:
            "Consolidate four divergent booking processes into one, without breaking the habits of the receptionists who keep the clinics alive.",
          timeframe: "First 90 days",
          capabilities: ["workflow-design", "operations", "systems-thinking"],
          whatYoudDo: [
            "Sit in each clinic long enough to learn why its version exists",
            "Design the common flow and the migration that respects the edge cases",
          ],
        },
        {
          id: "we-ac-2",
          title: "A utilisation view the owners trust",
          description:
            "Build the reporting that shows room and practitioner utilisation across the group, from systems that were never meant to talk to each other.",
          timeframe: "First 6 months",
          capabilities: ["data-analysis", "systems-thinking"],
          whatYoudDo: [
            "Get the data out of the practice management system without a vendor consulting bill",
            "Make the weekly view a habit the owners actually check",
          ],
        },
      ],
    },
  },
  {
    id: "co-pendle",
    slug: "pendle-analytics",
    name: "Pendle Analytics",
    blurb: "A six-person SaaS taking a product to market faster than its processes deserve.",
    stage: "pre-seed",
    teamSize: "6",
    location: "Remote (UK)",
    initials: "PA",
    accent: 1,
    role: {
      id: "role-pa-growth",
      title: "Growth and onboarding builder",
      whyThisRole:
        "Trials come in, most quietly die, and nobody owns the path from signup to habit. We need someone who treats activation as a system to build, not a dashboard to watch.",
      compRange: "£40,000–£52,000 + options",
      location: "Remote (UK)",
      startWindow: "As soon as possible",
      arrangements: ["remote"],
      constraints: ["Overlap with UK working hours"],
      workExamples: [
        {
          id: "we-pa-1",
          title: "Rebuild onboarding around the first useful moment",
          description:
            "Find the action that predicts a trial converting, and rebuild the first-day experience to get everyone there.",
          timeframe: "First 90 days",
          capabilities: ["growth", "product-thinking", "data-analysis"],
          whatYoudDo: [
            "Instrument the funnel honestly before changing anything",
            "Ship onboarding experiments weekly and keep the losers' lessons",
          ],
        },
        {
          id: "we-pa-2",
          title: "Lifecycle emails that respect the reader",
          description:
            "Build the activation and win-back flows, written like a person, measured like an experiment.",
          timeframe: "First 6 months",
          capabilities: ["growth", "automation", "executive-communication"],
          whatYoudDo: [
            "Write the sequences and own their numbers",
            "Kill any email that does not earn its open rate",
          ],
        },
      ],
    },
  },
];

/** Insert the demo demand into an existing database. Id-guarded, so re-running is a no-op. */
export function seedDemoDemand(db: DatabaseSync): void {
  const now = new Date().toISOString();
  const run = (sql: string, ...params: unknown[]) => db.prepare(sql).run(...(params as never[]));
  const exists = (sql: string, id: string) => Boolean(db.prepare(sql).get(id));

  for (const c of DEMO_COMPANIES) {
    if (exists("SELECT 1 FROM company WHERE id = ?", c.id)) continue;

    run(
      `INSERT INTO company (id, slug, name, blurb, website, stage, team_size, location,
                            avatar_initials, accent_index, published, demo, created_at)
       VALUES (?,?,?,?,NULL,?,?,?,?,?,1,1,?)`,
      c.id, c.slug, c.name, c.blurb, c.stage, c.teamSize, c.location, c.initials, c.accent, now
    );

    const r = c.role;
    run(
      `INSERT INTO role (id, company_id, title, why_this_role, status, comp_range, location,
                         start_window, created_at)
       VALUES (?,?,?,?,'open',?,?,?,?)`,
      r.id, c.id, r.title, r.whyThisRole, r.compRange, r.location, r.startWindow, now
    );
    for (const a of r.arrangements) {
      run("INSERT OR IGNORE INTO role_arrangement (role_id, arrangement) VALUES (?,?)", r.id, a);
    }
    for (const con of r.constraints) {
      run("INSERT OR IGNORE INTO role_constraint (role_id, constraint_text) VALUES (?,?)", r.id, con);
    }
    r.workExamples.forEach((w, i) => {
      run(
        `INSERT INTO work_example (id, role_id, title, description, timeframe, sort_order)
         VALUES (?,?,?,?,?,?)`,
        w.id, r.id, w.title, w.description, w.timeframe, i
      );
      for (const tag of w.capabilities) {
        run("INSERT OR IGNORE INTO work_example_capability (work_example_id, tag) VALUES (?,?)", w.id, tag);
      }
      w.whatYoudDo.forEach((step, si) =>
        run(
          "INSERT INTO work_example_step (id, work_example_id, step, sort_order) VALUES (?,?,?,?)",
          `step-${w.id}-${si}`, w.id, step, si
        )
      );
    });
  }
}
