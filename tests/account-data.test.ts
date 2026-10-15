import test, { before, beforeEach } from "node:test";
import assert from "node:assert/strict";

/**
 * Export and erasure.
 *
 * Two obligations with opposite failure modes. An export that quietly omits a table is a
 * misleading answer to a subject access request; a deletion that leaves rows behind is a lie told
 * to someone who asked to be forgotten. Both are easy to get wrong in ways no page would ever
 * show, which is precisely why they are tested here and not left to a manual click-through.
 */

process.env.DISRUPTAJOB_DB = ":memory:";

let collectAccountData: typeof import("@/server/account-data").collectAccountData;
let purgeAccount: typeof import("@/server/account-data").purgeAccount;
let run: typeof import("@/server/db").run;
let all: typeof import("@/server/db").all;

/**
 * What the export must contain, named rather than reached into via `any`.
 *
 * Writing it down makes the test double as a specification: if a future change drops `evidence`
 * from a project or stops listing the pipelines someone appears in, this stops compiling.
 */
interface ExportView {
  account: { email: string };
  profile: { id: string } | null;
  signInSessions: unknown[];
  projects: { capabilities: unknown[]; evidence: unknown[] }[];
  conversations: { messages: unknown[] }[];
  experience: unknown[];
  blockedCompanies: unknown[];
  dealbreakers: unknown[];
  companiesWhoSavedYou: { company: string }[];
  hiringPipelinesYouAppearIn: { stage: string }[];
  roles: { workExamples: { capabilities: unknown[] }[] }[];
}

const CANDIDATE = {
  id: "acc-cand",
  email: "person@example.com",
  displayName: "Test Person",
  role: "talent" as const,
  candidateId: "cand-1",
};

const EMPLOYER = {
  id: "acc-emp",
  email: "hiring@example.com",
  displayName: "Test Company",
  role: "employer" as const,
  companyId: "co-1",
};

before(async () => {
  const mod = await import("@/server/account-data");
  const db = await import("@/server/db");
  collectAccountData = mod.collectAccountData;
  purgeAccount = mod.purgeAccount;
  run = db.run;
  all = db.all;
});

test("deleting a parent row really does take its children with it", () => {
  // Cascades do most of the erasing, so if foreign key enforcement were ever off — a constructor
  // option, a stray pragma — a deleted account would quietly leave its projects, evidence and
  // conversations behind with nothing visibly broken.
  //
  // Asserted as behaviour rather than by reading PRAGMA foreign_keys, because that value turned
  // out to depend on how the connection was opened and could report enforcement that wasn't
  // actually happening. Deleting a row and looking for its children cannot be fooled.
  run("DELETE FROM candidate WHERE id = ?", "cand-1");

  assert.equal(all("SELECT 1 FROM project WHERE owner_id = ?", "cand-1").length, 0, "projects survived");
  assert.equal(all("SELECT 1 FROM evidence WHERE project_id = ?", "proj-1").length, 0, "evidence survived");
  assert.equal(all("SELECT 1 FROM experience WHERE candidate_id = ?", "cand-1").length, 0, "experience survived");
  assert.equal(all("SELECT 1 FROM blocked_company WHERE candidate_id = ?", "cand-1").length, 0, "blocklist survived");
});

/** A candidate and a company with a conversation and a pipeline entry linking them. */
function seedTwoSidedWorld() {
  const now = new Date().toISOString();

  run(
    `INSERT INTO candidate (id, slug, name, avatar_initials, accent_index, discoverability, created_at)
     VALUES (?,?,?,?,0,'open',?)`,
    "cand-1", "cand-1", "Test Person", "TP", now
  );
  run(
    `INSERT INTO company (id, slug, name, avatar_initials, accent_index, published, created_at)
     VALUES (?,?,?,?,0,1,?)`,
    "co-1", "co-1", "Test Company", "TC", now
  );
  run(
    `INSERT INTO account (id, email, display_name, role, candidate_id, created_at)
     VALUES (?,?,?,'talent',?,?)`,
    CANDIDATE.id, CANDIDATE.email, CANDIDATE.displayName, "cand-1", now
  );
  run(
    `INSERT INTO account (id, email, display_name, role, company_id, created_at)
     VALUES (?,?,?,'employer',?,?)`,
    EMPLOYER.id, EMPLOYER.email, EMPLOYER.displayName, "co-1", now
  );
  run("INSERT INTO session (token, account_id, created_at) VALUES (?,?,?)", "tok-1", CANDIDATE.id, now);

  run("INSERT INTO blocked_company (candidate_id, company_name) VALUES (?,?)", "cand-1", "Someone Ltd");
  run("INSERT INTO candidate_dealbreaker (candidate_id, dealbreaker) VALUES (?,?)", "cand-1", "no on-call");
  run(
    `INSERT INTO experience (id, candidate_id, company, role, start_date, end_date)
     VALUES (?,?,?,?,?,?)`,
    "exp-1", "cand-1", "Old Job Ltd", "Ops Associate", "2021", "2024"
  );

  run(
    `INSERT INTO project (id, owner_id, slug, title, description, thumbnail_seed, outcome,
                          problem, what_i_built, my_contribution, status, source, created_at)
     VALUES (?,?,?,?,?,?,'','','','','published','manual',?)`,
    "proj-1", "cand-1", "a-project", "A project", "Did a thing", "a-project", now
  );
  run("INSERT INTO project_capability (project_id, tag) VALUES (?,?)", "proj-1", "automation");
  run(
    "INSERT INTO evidence (id, project_id, type, label, url, sort_order) VALUES (?,?,?,?,?,0)",
    "ev-1", "proj-1", "demo-link", "Repo", "https://example.com"
  );

  run(
    `INSERT INTO invite (id, candidate_id, company_id, role_title, message, status, created_at)
     VALUES (?,?,?,?,?,'sent',?)`,
    "inv-1", "cand-1", "co-1", "Ops Lead", "Come and talk to us", now
  );
  run(
    "INSERT INTO invite_message (id, invite_id, sender, body, created_at) VALUES (?,?,?,?,?)",
    "msg-1", "inv-1", "candidate", "Happy to chat", now
  );
  run(
    `INSERT INTO pipeline_entry (company_id, candidate_id, stage, position, updated_at)
     VALUES (?,?,'talking',0,?)`,
    "co-1", "cand-1", now
  );
  run("INSERT INTO saved_candidate (company_id, candidate_id, saved_at) VALUES (?,?,?)", "co-1", "cand-1", now);
  run("INSERT INTO interest (id, email, side, created_at) VALUES (?,?,'talent',?)", "int-1", CANDIDATE.email, now);
}

beforeEach(() => {
  for (const t of ["interest", "saved_candidate", "pipeline_entry", "invite", "project", "candidate", "company", "account", "session"]) {
    run(`DELETE FROM ${t}`);
  }
  seedTwoSidedWorld();
});

test("a candidate's export contains their profile, work, evidence and conversations", () => {
  const data = collectAccountData(CANDIDATE) as unknown as ExportView;

  assert.equal(data.account.email, CANDIDATE.email);
  assert.equal(data.profile?.id, "cand-1");
  assert.equal(data.projects.length, 1);
  assert.equal(data.projects[0].capabilities.length, 1);
  assert.equal(data.projects[0].evidence.length, 1, "evidence must travel with the project");
  assert.equal(data.conversations.length, 1);
  assert.equal(data.conversations[0].messages.length, 1, "messages must travel with the conversation");
  assert.equal(data.experience.length, 1);
  assert.equal(data.blockedCompanies.length, 1);
  assert.equal(data.dealbreakers.length, 1);
});

test("the export includes records other people hold about you", () => {
  // The part that is easy to forget, and the part a subject access request most clearly covers.
  const data = collectAccountData(CANDIDATE) as unknown as ExportView;

  assert.equal(data.companiesWhoSavedYou.length, 1);
  assert.equal(data.companiesWhoSavedYou[0].company, "Test Company");
  assert.equal(data.hiringPipelinesYouAppearIn.length, 1);
  assert.equal(data.hiringPipelinesYouAppearIn[0].stage, "talking");
});

test("the export never contains a live session token", () => {
  // Sessions are disclosed as timestamps. A token is a credential, not a record.
  const data = collectAccountData(CANDIDATE);

  assert.equal(JSON.stringify(data).includes("tok-1"), false);
  assert.ok(Array.isArray((data as unknown as ExportView).signInSessions));
});

test("an employer's export contains their roles and the work examples under them", () => {
  const now = new Date().toISOString();
  run(
    `INSERT INTO role (id, company_id, title, why_this_role, status, created_at)
     VALUES (?,?,?,?,'open',?)`,
    "role-1", "co-1", "Ops Lead", "Because", now
  );
  run(
    "INSERT INTO work_example (id, role_id, title, description, sort_order) VALUES (?,?,?,?,0)",
    "we-1", "role-1", "Fix dispatch", "A real job"
  );
  run("INSERT INTO work_example_capability (work_example_id, tag) VALUES (?,?)", "we-1", "operations");

  const data = collectAccountData(EMPLOYER) as unknown as ExportView;

  assert.equal(data.profile?.id, "co-1");
  assert.equal(data.roles.length, 1);
  assert.equal(data.roles[0].workExamples.length, 1);
  assert.equal(data.roles[0].workExamples[0].capabilities.length, 1);
});

test("deleting a candidate removes the account, the profile, and everything under it", () => {
  purgeAccount(CANDIDATE);

  for (const [table, where, params] of [
    ["account", "id = ?", [CANDIDATE.id]],
    ["session", "account_id = ?", [CANDIDATE.id]],
    ["candidate", "id = ?", ["cand-1"]],
    ["project", "owner_id = ?", ["cand-1"]],
    ["blocked_company", "candidate_id = ?", ["cand-1"]],
    ["experience", "candidate_id = ?", ["cand-1"]],
  ] as const) {
    assert.equal(
      all(`SELECT 1 FROM ${table} WHERE ${where}`, ...params).length,
      0,
      `${table} still had rows after deletion`
    );
  }
});

test("deletion cascades to rows that hang off a project, not just the project", () => {
  purgeAccount(CANDIDATE);

  assert.equal(all("SELECT 1 FROM project_capability WHERE project_id = ?", "proj-1").length, 0);
  assert.equal(all("SELECT 1 FROM evidence WHERE project_id = ?", "proj-1").length, 0);
});

test("deletion removes the person from other companies' records too", () => {
  // The failure this guards against is a pipeline card or a saved list pointing at a ghost.
  purgeAccount(CANDIDATE);

  assert.equal(all("SELECT 1 FROM pipeline_entry WHERE candidate_id = ?", "cand-1").length, 0);
  assert.equal(all("SELECT 1 FROM saved_candidate WHERE candidate_id = ?", "cand-1").length, 0);
  assert.equal(all("SELECT 1 FROM invite WHERE candidate_id = ?", "cand-1").length, 0);
  assert.equal(all("SELECT 1 FROM invite_message WHERE invite_id = ?", "inv-1").length, 0);
});

test("deletion also clears the interest list, which is keyed by email not account", () => {
  purgeAccount(CANDIDATE);
  assert.equal(all("SELECT 1 FROM interest WHERE email = ?", CANDIDATE.email).length, 0);
});

test("deleting one account leaves the other party intact", () => {
  purgeAccount(CANDIDATE);

  assert.equal(all("SELECT 1 FROM company WHERE id = ?", "co-1").length, 1);
  assert.equal(all("SELECT 1 FROM account WHERE id = ?", EMPLOYER.id).length, 1);
});

test("nothing anywhere in the database still mentions the deleted person", () => {
  // The catch-all: walks every table and fails if the id survives somewhere not thought of.
  purgeAccount(CANDIDATE);

  const tables = all<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'"
  );

  for (const { name } of tables) {
    const columns = all<{ name: string }>(`PRAGMA table_info(${name})`);
    for (const col of columns) {
      const hits = all(`SELECT 1 FROM ${name} WHERE ${col.name} = ? LIMIT 1`, "cand-1");
      assert.equal(hits.length, 0, `${name}.${col.name} still references the deleted candidate`);
    }
  }
});
