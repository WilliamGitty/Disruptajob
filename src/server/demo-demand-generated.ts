import type { DatabaseSync } from "node:sqlite";

/**
 * The generated demand population: ~200 open roles across ~120 invented companies.
 *
 * Founder decision (17 Oct 2026), overruling the a-dozen-is-enough position: for weekend demo
 * testing, demand should feel like a market, not a sample — and he tells testers plainly that
 * every company is invented. The honesty survives at volume because it is structural: every row
 * carries demo = 1, every company page wears the Example badge and a noindex, and none of them
 * reach the sitemap. Testers see a market; search engines see only what is real.
 *
 * Generation is deterministic (no randomness), so every machine and every migration run builds
 * the identical population, and ids are stable for the id-guarded seeder.
 */

interface Archetype {
  title: string;
  seniorityBand: [number, number]; // comp in £k
  capabilities: string[];
  why: string; // {thing} slot filled per sector
  workTitle: string;
  workDesc: string;
  steps: [string, string];
}

interface Sector {
  nouns: string[]; // the {thing}s this sector worries about
  blurbs: string[];
  nameCores: string[];
  nameSuffixes: string[];
  stages: string[];
  teamSizes: string[];
}

const CITIES = [
  "London, UK", "Manchester, UK", "Bristol, UK", "Leeds, UK", "Birmingham, UK",
  "Glasgow, UK", "Edinburgh, UK", "Newcastle, UK", "Sheffield, UK", "Nottingham, UK",
  "Cardiff, UK", "Liverpool, UK", "Brighton, UK", "Remote (UK)",
];

const NAME_PREFIXES = [
  "Alder", "Birch", "Carden", "Dunmore", "Elmsworth", "Farrow", "Garnett", "Haleford",
  "Ilex", "Kestrel", "Lanyon", "Marlow", "Norbury", "Oakhurst", "Peverel", "Quarry",
  "Rowan", "Selwood", "Thackeray", "Underhill", "Vexford", "Welburn", "Yarrow", "Ashgrove",
  "Brindle", "Coppice", "Danby", "Eastfield", "Foxley", "Grayling",
];

const SECTORS: Sector[] = [
  {
    nouns: ["order flow", "the fulfilment pipeline", "returns handling", "stock reconciliation"],
    blurbs: [
      "An online retailer whose growth outran its back office.",
      "A product brand selling direct and drowning in its own admin.",
    ],
    nameCores: ["Goods", "Supply", "Trading", "Retail"],
    nameSuffixes: ["Co", "& Sons", "Collective", "Supply Co"],
    stages: ["seed", "growth", "established"],
    teamSizes: ["8", "15", "30", "45"],
  },
  {
    nouns: ["client onboarding", "project delivery", "the reporting cycle", "resourcing"],
    blurbs: [
      "A consultancy scaling past the founders' calendars.",
      "An agency where every project is run brilliantly and differently.",
    ],
    nameCores: ["Advisory", "Partners", "Consulting", "Studio"],
    nameSuffixes: ["Group", "Partners", "Associates", ""],
    stages: ["growth", "established"],
    teamSizes: ["12", "20", "35", "60"],
  },
  {
    nouns: ["trial activation", "the onboarding funnel", "churn", "usage reporting"],
    blurbs: [
      "A B2B SaaS shipping product faster than process.",
      "A software company whose customers outgrew its spreadsheets.",
    ],
    nameCores: ["Software", "Systems", "Labs", "Digital"],
    nameSuffixes: ["Labs", "HQ", "Systems", "Technologies"],
    stages: ["pre-seed", "seed", "series-a"],
    teamSizes: ["5", "9", "16", "28"],
  },
  {
    nouns: ["patient scheduling", "clinic utilisation", "referral tracking", "compliance admin"],
    blurbs: [
      "A clinic group trying to run on systems instead of goodwill.",
      "A healthcare provider expanding sites faster than processes.",
    ],
    nameCores: ["Health", "Clinics", "Care", "Wellness"],
    nameSuffixes: ["Health", "Clinics", "Care Group", "Practice Group"],
    stages: ["growth", "established"],
    teamSizes: ["20", "35", "60", "90"],
  },
  {
    nouns: ["site reporting", "subcontractor coordination", "materials tracking", "job costing"],
    blurbs: [
      "A construction firm whose paperwork never left the portacabin.",
      "A trades business winning work faster than it can account for it.",
    ],
    nameCores: ["Build", "Construction", "Contracts", "Property"],
    nameSuffixes: ["Construction", "Contractors", "Build Group", "Developments"],
    stages: ["established", "growth"],
    teamSizes: ["15", "30", "55", "80"],
  },
  {
    nouns: ["donor administration", "grant reporting", "volunteer coordination", "impact measurement"],
    blurbs: [
      "A charity whose mission scaled and whose systems didn't.",
      "A non-profit spending donated money on avoidable admin.",
    ],
    nameCores: ["Trust", "Foundation", "Aid", "Giving"],
    nameSuffixes: ["Trust", "Foundation", "UK", ""],
    stages: ["growth", "established"],
    teamSizes: ["10", "18", "30", "50"],
  },
  {
    nouns: ["course completion", "learner onboarding", "cohort scheduling", "tutor utilisation"],
    blurbs: [
      "A training business whose courses outsell its systems.",
      "An education provider scaling cohorts past its spreadsheets.",
    ],
    nameCores: ["Learning", "Academy", "Skills", "Training"],
    nameSuffixes: ["Learning", "Academy", "Education", ""],
    stages: ["seed", "growth"],
    teamSizes: ["8", "14", "25", "40"],
  },
  {
    nouns: ["venue reporting", "rota planning", "supplier ordering", "events coordination"],
    blurbs: [
      "A hospitality group run on heroics and group chats.",
      "A venues business where Friday always breaks something.",
    ],
    nameCores: ["Hospitality", "Venues", "Kitchens", "Events"],
    nameSuffixes: ["Group", "Hospitality", "& Co", "Collective"],
    stages: ["established", "growth"],
    teamSizes: ["40", "70", "110", "160"],
  },
];

const ARCHETYPES: Archetype[] = [
  {
    title: "Operations generalist",
    seniorityBand: [36, 48],
    capabilities: ["operations", "automation", "problem-solving"],
    why: "The founder is still the person who notices when {thing} breaks. We need someone who builds the systems that notice instead.",
    workTitle: "Take {thing} off the founder's plate",
    workDesc: "Map how {thing} actually works today, including the undocumented parts, then build the process and tooling that runs it without heroics.",
    steps: ["Shadow the current process until its real shape is clear", "Ship the replacement and retire the workaround"],
  },
  {
    title: "Automation specialist",
    seniorityBand: [40, 52],
    capabilities: ["automation", "workflow-design", "ai-enablement"],
    why: "Hours of every week go into manual steps around {thing} that software should be doing. Nobody here has had the time to make that true.",
    workTitle: "Automate {thing} end to end",
    workDesc: "Replace the manual steps in {thing} with automations that fail loudly and recover gracefully, using whatever tools earn their keep.",
    steps: ["Document the current manual loop and its failure points", "Build, run in parallel, then cut over"],
  },
  {
    title: "Data and reporting lead",
    seniorityBand: [38, 50],
    capabilities: ["data-analysis", "systems-thinking", "executive-communication"],
    why: "Decisions about {thing} run weeks late because the numbers arrive by hand and nobody fully trusts them.",
    workTitle: "Make the {thing} numbers arrive themselves",
    workDesc: "Standardise what gets counted in {thing}, automate the collection, and make the weekly view something leadership actually checks.",
    steps: ["Agree definitions people will accept", "Automate the pulls and kill the manual compile"],
  },
  {
    title: "Process and systems manager",
    seniorityBand: [42, 54],
    capabilities: ["workflow-design", "systems-thinking", "operations"],
    why: "Every team runs its own version of {thing}, and the inconsistency is starting to cost real money and real patience.",
    workTitle: "One way of doing {thing}",
    workDesc: "Consolidate the divergent versions of {thing} into one process that respects the edge cases that created the divergence.",
    steps: ["Learn why each variant exists before replacing any", "Design the common flow and run the migration"],
  },
  {
    title: "Growth and lifecycle builder",
    seniorityBand: [40, 54],
    capabilities: ["growth", "data-analysis", "product-thinking"],
    why: "People arrive, most quietly disappear, and nobody owns the path from first contact to habit. {thing} is where it shows worst.",
    workTitle: "Rebuild {thing} around the first useful moment",
    workDesc: "Instrument {thing} honestly, find where people stall, and rebuild the path so the valuable moment arrives sooner.",
    steps: ["Measure the funnel before changing it", "Ship weekly experiments and keep the losers' lessons"],
  },
  {
    title: "Founder's right hand",
    seniorityBand: [38, 52],
    capabilities: ["startup-experience", "problem-solving", "executive-communication"],
    why: "Too much of the business still routes through one person's head, and {thing} is the queue where that hurts most.",
    workTitle: "Own {thing} outright",
    workDesc: "Take {thing} from founder-dependent to owned: the decisions, the process, and the number that says it's working.",
    steps: ["Earn the context fast by doing the work alongside them", "Take the handover and publish how it runs now"],
  },
  {
    title: "Rapid prototyper",
    seniorityBand: [42, 56],
    capabilities: ["rapid-prototyping", "ai-enablement", "product-thinking"],
    why: "We win when we can show a working thing days after the first conversation about {thing}. One person can do that today; that's the bottleneck.",
    workTitle: "From conversation to working demo in a week",
    workDesc: "Turn rough requirements around {thing} into clickable, working prototypes fast enough to test against reality.",
    steps: ["Build three prototypes in the first month, misses documented", "Turn what repeats into a starter kit"],
  },
];

function pick<T>(arr: T[], n: number): T {
  return arr[n % arr.length];
}

interface GeneratedCompany {
  id: string;
  slug: string;
  name: string;
  blurb: string;
  stage: string;
  teamSize: string;
  location: string;
  initials: string;
  accent: number;
  roles: { id: string; archetype: Archetype; noun: string; comp: string; location: string }[];
}

/** Deterministically build the population. Exported for tests. */
export function generatedCompanies(): GeneratedCompany[] {
  const companies: GeneratedCompany[] = [];
  const usedSlugs = new Set<string>();
  const TARGET_ROLES = 200;
  let roleCount = 0;
  let i = 0;

  while (roleCount < TARGET_ROLES) {
    // The index DECOMPOSES into the name parts (sector, then prefix, then core/suffix) instead
    // of cycling them in parallel: parallel cycling repeats after lcm(lengths) ≈ 120 names,
    // which is fewer than 200 roles need — the first version of this loop never terminated.
    if (i > 5000) throw new Error("demand generator exhausted its name space");
    const sector = pick(SECTORS, i);
    const j = Math.floor(i / SECTORS.length);
    const prefix = pick(NAME_PREFIXES, j);
    const k = Math.floor(j / NAME_PREFIXES.length);
    const core = pick(sector.nameCores, k);
    let suffix = pick(sector.nameSuffixes, Math.floor(k / sector.nameCores.length));
    if (suffix === core) suffix = ""; // "Health Health" is nobody's company name
    const name = suffix ? `${prefix} ${core} ${suffix}` : `${prefix} ${core}`;
    // Uniqueness is checked on the SLUG: distinct names can collapse to the same slug
    // ("Alder & Goods" and "Alder Goods" both become alder-goods), and company.slug is UNIQUE.
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    if (usedSlugs.has(slug)) { i += 1; continue; }
    usedSlugs.add(slug);
    const location = pick(CITIES, i * 11 + 5);
    const rolesHere = i % 3 === 0 ? 2 : 1; // a third of companies hire for two roles
    const roles = [];
    for (let r = 0; r < rolesHere && roleCount < TARGET_ROLES; r++) {
      const archetype = pick(ARCHETYPES, i * 2 + r * 3 + 1);
      const noun = pick(sector.nouns, i + r * 2);
      const [lo, hi] = archetype.seniorityBand;
      const bump = (i + r) % 4; // £0-3k of deterministic variation
      roles.push({
        id: `gen-role-${i}-${r}`,
        archetype,
        noun,
        comp: `£${lo + bump},000–£${hi + bump},000`,
        location,
      });
      roleCount += 1;
    }

    companies.push({
      id: `gen-co-${i}`,
      slug,
      name,
      blurb: pick(sector.blurbs, i),
      stage: pick(sector.stages, i),
      teamSize: pick(sector.teamSizes, i * 3),
      location,
      initials: (prefix[0] + core[0]).toUpperCase(),
      accent: i % 6,
      roles,
    });
    i += 1;
  }
  return companies;
}

/** Insert the generated population. Id-guarded per company, so re-running is a no-op. */
export function seedGeneratedDemand(db: DatabaseSync): void {
  const now = new Date().toISOString();
  const run = (sql: string, ...params: unknown[]) => db.prepare(sql).run(...(params as never[]));
  const exists = (id: string) => Boolean(db.prepare("SELECT 1 FROM company WHERE id = ?").get(id));

  for (const c of generatedCompanies()) {
    if (exists(c.id)) continue;

    run(
      `INSERT INTO company (id, slug, name, blurb, website, stage, team_size, location,
                            avatar_initials, accent_index, published, demo, created_at)
       VALUES (?,?,?,?,NULL,?,?,?,?,?,1,1,?)`,
      c.id, c.slug, c.name, c.blurb, c.stage, c.teamSize, c.location, c.initials, c.accent, now
    );

    for (const role of c.roles) {
      const a = role.archetype;
      const fill = (t: string) => t.replace(/\{thing\}/g, role.noun);
      run(
        `INSERT INTO role (id, company_id, title, why_this_role, status, comp_range, location,
                           start_window, created_at)
         VALUES (?,?,?,?,'open',?,?,?,?)`,
        role.id, c.id, a.title, fill(a.why), role.comp, role.location, "Within three months", now
      );
      run("INSERT OR IGNORE INTO role_arrangement (role_id, arrangement) VALUES (?,?)", role.id,
        role.location === "Remote (UK)" ? "remote" : "hybrid");
      const weId = `gen-we-${role.id}`;
      run(
        `INSERT INTO work_example (id, role_id, title, description, timeframe, sort_order)
         VALUES (?,?,?,?,?,0)`,
        weId, role.id, fill(a.workTitle), fill(a.workDesc), "First 90 days"
      );
      for (const tag of a.capabilities) {
        run("INSERT OR IGNORE INTO work_example_capability (work_example_id, tag) VALUES (?,?)", weId, tag);
      }
      a.steps.forEach((step, si) =>
        run(
          "INSERT INTO work_example_step (id, work_example_id, step, sort_order) VALUES (?,?,?,?)",
          `step-${weId}-${si}`, weId, fill(step), si
        )
      );
    }
  }
}
