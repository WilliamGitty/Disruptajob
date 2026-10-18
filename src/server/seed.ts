import type { DatabaseSync } from "node:sqlite";
import { CANDIDATES, COMPANIES, PROJECTS, ROLES } from "@/lib/mock-data";
import { hashPassword } from "./password";

/**
 * Populate an empty database from the demo population.
 *
 * Takes the handle as an argument rather than calling `getDb()`, so `db.ts` can invoke this
 * during open without an import cycle. Runs only when the database is empty, so restarting the
 * server never clobbers real data someone has entered.
 */
export function seedIfEmpty(db: DatabaseSync): boolean {
  const existing = db.prepare("SELECT COUNT(*) AS n FROM candidate").get() as { n: number };
  if (existing.n > 0) return false;

  const now = new Date().toISOString();
  const insert = (sql: string, ...params: unknown[]) =>
    db.prepare(sql).run(...(params as never[]));

  db.exec("BEGIN");
  try {
    for (const c of CANDIDATES) {
      insertCandidateGraph(db, c, now);
    }

    for (const p of PROJECTS) {
      insertProjectGraph(db, p, now);
    }

    for (const co of COMPANIES) {
      insert(
        `INSERT INTO company (id, slug, name, blurb, website, stage, team_size, location,
                              avatar_initials, accent_index, published, demo, created_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,1,?)`,
        co.id,
        co.slug,
        co.name,
        co.blurb,
        co.website ?? null,
        co.stage ?? null,
        co.teamSize ?? null,
        co.location ?? null,
        co.avatarInitials,
        co.accentIndex,
        co.published ? 1 : 0,
        now
      );
    }

    for (const r of ROLES) {
      insert(
        `INSERT INTO role (id, company_id, title, why_this_role, status, comp_range, location,
                           start_window, created_at)
         VALUES (?,?,?,?,?,?,?,?,?)`,
        r.id,
        r.companyId,
        r.title,
        r.whyThisRole,
        r.status,
        r.terms.compRange ?? null,
        r.terms.location ?? null,
        r.terms.startWindow ?? null,
        r.createdAt
      );
      for (const a of r.terms.workArrangements) {
        insert("INSERT INTO role_arrangement (role_id, arrangement) VALUES (?,?)", r.id, a);
      }
      for (const c of r.terms.constraints) {
        insert("INSERT OR IGNORE INTO role_constraint (role_id, constraint_text) VALUES (?,?)", r.id, c);
      }
      r.workExamples.forEach((w, i) => {
        insert(
          `INSERT INTO work_example (id, role_id, title, description, timeframe, sort_order)
           VALUES (?,?,?,?,?,?)`,
          w.id,
          r.id,
          w.title,
          w.description,
          w.timeframe ?? null,
          i
        );
        for (const tag of w.capabilities) {
          insert("INSERT INTO work_example_capability (work_example_id, tag) VALUES (?,?)", w.id, tag);
        }
        w.whatYoudDo.forEach((step, si) =>
          insert(
            "INSERT INTO work_example_step (id, work_example_id, step, sort_order) VALUES (?,?,?,?)",
            `step-${w.id}-${si}`,
            w.id,
            step,
            si
          )
        );
        for (const a of w.attachments) {
          insert(
            "INSERT INTO work_example_attachment (id, work_example_id, name, url, kind) VALUES (?,?,?,?,?)",
            a.id,
            w.id,
            a.name,
            a.url ?? null,
            a.kind
          );
        }
      });
    }

    // Demo accounts so both sides of the marketplace can be signed into immediately.
    //
    // Passwordless locally, which is convenient and harmless on your own machine. Set
    // DEMO_ACCOUNT_PASSWORD on any deployed environment so these aren't open doors — the sign-in
    // page lists these addresses, so without a password anyone who reaches the site is one click
    // from reading someone else's conversations.
    const demoPassword = process.env.DEMO_ACCOUNT_PASSWORD;
    const demoHash = demoPassword ? hashPassword(demoPassword) : null;

    insert(
      `INSERT INTO account (id, email, display_name, role, candidate_id, company_id, password_hash, created_at)
       VALUES (?,?,?,?,?,?,?,?)`,
      "acc-will",
      "will@example.com",
      "Jordan Blake",
      "talent",
      "william-sandford",
      null,
      demoHash,
      now
    );
    insert(
      `INSERT INTO account (id, email, display_name, role, candidate_id, company_id, password_hash, created_at)
       VALUES (?,?,?,?,?,?,?,?)`,
      "acc-meridian",
      "hiring@meridianrobotics.com",
      "Meridian Robotics",
      "employer",
      null,
      "employer-1",
      demoHash,
      now
    );

    // A demo conversation in each state, so both sides of the loop have something to show on a
    // fresh install rather than two empty inboxes.
    const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();

    const demoInvites = [
      {
        id: "inv-1",
        company: "employer-1",
        role: "role-meridian-1",
        title: "AI Operations Lead",
        msg: "We came across your AI Daily Signal build, the scoring and summarisation approach is exactly the kind of internal tooling we need someone to own. Open to a conversation?",
        comp: "£65,000 – £80,000",
        status: "sent",
        at: hoursAgo(26),
      },
      {
        id: "inv-2",
        company: "employer-2",
        role: "role-halcyon-1",
        title: "Automation & AI Enablement Manager",
        msg: "Your Automated Outreach Workflow write-up is close to a problem we're actively trying to solve for our ops team. Would love to talk through what you'd build here.",
        comp: null,
        status: "viewed",
        at: hoursAgo(72),
      },
      {
        id: "inv-3",
        company: "employer-3",
        role: "role-nordstar-1",
        title: "Head of Internal Tools",
        msg: "We're a small team drowning in manual ops work and liked how fast you shipped the AI Prototype Portfolio. Keen to find 20 minutes to discuss a role.",
        comp: "£75,000 – £95,000",
        status: "accepted",
        at: hoursAgo(120),
      },
    ];

    for (const i of demoInvites) {
      insert(
        `INSERT INTO invite (id, candidate_id, company_id, role_id, role_title, message,
                             compensation_range, status, responded_at, created_at)
         VALUES (?,?,?,?,?,?,?,?,?,?)`,
        i.id,
        "william-sandford",
        i.company,
        i.role,
        i.title,
        i.msg,
        i.comp,
        i.status,
        i.status === "accepted" ? hoursAgo(96) : null,
        i.at
      );
    }

    insert(
      "INSERT INTO invite_message (id, invite_id, sender, body, created_at) VALUES (?,?,?,?,?)",
      "msg-1",
      "inv-3",
      "candidate",
      "Thanks for reaching out, the internal tooling problem is exactly what I like building for. Happy to find 20 minutes this week.",
      hoursAgo(96)
    );
    insert(
      "INSERT INTO invite_message (id, invite_id, sender, body, created_at) VALUES (?,?,?,?,?)",
      "msg-2",
      "inv-3",
      "employer",
      "Brilliant. Does Thursday at 2pm work? I'll send a short outline of where we're stuck beforehand.",
      hoursAgo(72)
    );

    // Meridian's board, so the pipeline isn't empty on first load.
    const board: [string, string, number][] = [
      ["william-sandford", "reached-out", 0],
      ["grace-odunsi", "shortlisted", 0],
      ["elena-kovac", "shortlisted", 1],
      ["priya-nair", "reviewing", 0],
      ["daniel-cho", "reviewing", 1],
      ["sofia-almeida", "talking", 0],
    ];
    for (const [candidateId, stage, position] of board) {
      insert(
        `INSERT INTO pipeline_entry (company_id, candidate_id, role_id, stage, position, updated_at)
         VALUES (?,?,?,?,?,?)`,
        "employer-1",
        candidateId,
        "role-meridian-1",
        stage,
        position,
        now
      );
    }

    db.exec("COMMIT");
    return true;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

/** One demo candidate's full row set. Shared by the fresh seed and the backfill migrations. */
function insertCandidateGraph(db: DatabaseSync, c: (typeof CANDIDATES)[number], now: string): void {
  const insert = (sql: string, ...params: unknown[]) => db.prepare(sql).run(...(params as never[]));
  insert(
    `INSERT INTO candidate (id, slug, name, headline, short_description, location,
                            availability, avatar_initials, accent_index, discoverability,
                            comp_floor, location_constraint, demo, created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,1,?)`,
    c.id,
    c.slug,
    c.name,
    c.headline,
    c.shortDescription,
    c.location,
    c.availability,
    c.avatarInitials,
    c.accentIndex,
    c.discoverability ?? "hidden",
    c.nonNegotiables?.compFloor ?? null,
    c.nonNegotiables?.locationConstraint ?? null,
    now
  );
  for (const name of c.blockedCompanies ?? []) {
    insert("INSERT INTO blocked_company (candidate_id, company_name) VALUES (?,?)", c.id, name);
  }
  for (const rt of c.nonNegotiables?.roleTypes ?? []) {
    insert("INSERT INTO candidate_role_type (candidate_id, role_type) VALUES (?,?)", c.id, rt);
  }
  for (const a of c.nonNegotiables?.workArrangements ?? []) {
    insert("INSERT INTO candidate_arrangement (candidate_id, arrangement) VALUES (?,?)", c.id, a);
  }
  for (const d of c.nonNegotiables?.dealbreakers ?? []) {
    insert("INSERT INTO candidate_dealbreaker (candidate_id, dealbreaker) VALUES (?,?)", c.id, d);
  }
  c.experience.forEach((e, i) =>
    insert(
      `INSERT INTO experience (id, candidate_id, company, role, start_date, end_date, sort_order)
       VALUES (?,?,?,?,?,?,?)`,
      `exp-${c.id}-${i}`,
      c.id,
      e.company,
      e.role,
      e.startDate,
      e.endDate,
      i
    )
  );
  c.education.forEach((e, i) =>
    insert(
      `INSERT INTO education (id, candidate_id, institution, qualification, end_year, sort_order)
       VALUES (?,?,?,?,?,?)`,
      `edu-${c.id}-${i}`,
      c.id,
      e.institution,
      e.qualification,
      e.endYear,
      i
    )
  );
}

/** One demo project's full row set. Shared by the fresh seed and the backfill migrations. */
function insertProjectGraph(db: DatabaseSync, p: (typeof PROJECTS)[number], now: string): void {
  const insert = (sql: string, ...params: unknown[]) => db.prepare(sql).run(...(params as never[]));

      insert(
        `INSERT INTO project (id, owner_id, slug, title, description, thumbnail_seed, outcome,
                              problem, what_i_built, my_contribution, demo_url, status, source, created_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        p.id,
        p.ownerId,
        p.slug,
        p.title,
        p.description,
        p.thumbnailSeed,
        p.outcome,
        p.problem,
        p.whatIBuilt,
        p.myContribution,
        p.demoUrl ?? null,
        p.status ?? "published",
        p.source ?? "manual",
        now
      );
      for (const tag of p.capabilities) {
        insert("INSERT INTO project_capability (project_id, tag) VALUES (?,?)", p.id, tag);
      }
      for (const tool of p.tools) {
        insert("INSERT OR IGNORE INTO project_tool (project_id, tool) VALUES (?,?)", p.id, tool);
      }
      p.evidence.forEach((e, i) =>
        insert(
          `INSERT INTO evidence (id, project_id, type, label, description, url, sort_order)
           VALUES (?,?,?,?,?,?,?)`,
          e.id,
          p.id,
          e.type,
          e.label,
          e.description ?? null,
          e.url ?? null,
          i
        )
      );
      p.process.forEach((s, i) =>
        insert(
          `INSERT INTO project_process_step (id, project_id, title, description, sort_order)
           VALUES (?,?,?,?,?)`,
          `step-${p.id}-${i}`,
          p.id,
          s.title,
          s.description,
          i
        )
      );
}

/**
 * Backfill one mock candidate (and their projects) into a database seeded before they existed.
 * No-op when the candidate is already there. The caller decides transaction boundaries: the
 * migration runner already wraps each migration, so no BEGIN here.
 */
export function seedMockCandidate(db: DatabaseSync, candidateId: string): void {
  const c = CANDIDATES.find((x) => x.id === candidateId);
  if (!c) throw new Error(`No mock candidate with id ${candidateId}`);
  if (db.prepare("SELECT 1 FROM candidate WHERE id = ?").get(candidateId)) return;
  const now = new Date().toISOString();
  insertCandidateGraph(db, c, now);
  for (const p of PROJECTS.filter((x) => x.ownerId === candidateId)) insertProjectGraph(db, p, now);
}
