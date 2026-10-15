"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { get, run, transaction } from "../db";
import { getCurrentAccount, signUp } from "../auth";
import { isSafeHttpUrl } from "@/lib/project-input";
import { rateLimit, retryMessage } from "../rate-limit";
import { callerKey } from "../request-identity";
import type { CompanyStage, EmployerTerms, WorkArrangement, WorkExample } from "@/types";

/**
 * Turning a finished company setup draft into a real, published role.
 *
 * The employer mirror of `completeCandidateOnboarding`, and it had the same hole: publishing
 * wrote a role into localStorage under a hardcoded employer id, via a hook nothing read. A
 * company could complete setup, see "your role is live", and no candidate could ever match it.
 *
 * Matching is a set overlap between proven capability and required capability, so the work
 * examples and their tags are the entire point — a role with none is a job ad, which is the thing
 * this product exists not to be.
 */

const ARRANGEMENTS: WorkArrangement[] = ["remote", "hybrid", "onsite"];
const STAGES: CompanyStage[] = ["pre-seed", "seed", "series-a", "series-b", "growth", "established"];

const MAX_WORK_EXAMPLES = 12;
const MAX_TITLE = 120;
const MAX_SHORT = 400;
const MAX_LONG = 2000;

function clean(value: string | undefined, max: number): string {
  return (value ?? "").trim().slice(0, max);
}

export interface CompleteCompanySetupInput {
  name: string;
  /** Only read when there's no session — an existing company keeps the account it has. */
  contactEmail?: string;
  password?: string;
  website: string;
  blurb: string;
  stage?: CompanyStage;
  teamSize: string;
  location: string;
  roleTitle: string;
  whyThisRole: string;
  workExamples: WorkExample[];
  terms: EmployerTerms;
}

export type CompleteCompanySetupResult =
  | { ok: true; companySlug: string; roleId: string }
  | { ok: false; error: string };

export async function completeCompanySetup(
  input: CompleteCompanySetupInput
): Promise<CompleteCompanySetupResult> {
  const name = clean(input.name, 120);
  if (!name) return { ok: false, error: "Your company needs a name." };

  const roleTitle = clean(input.roleTitle, MAX_TITLE);
  if (!roleTitle) return { ok: false, error: "Give the role a title." };

  // A work example with no capability tags can never match anyone, so it isn't evidence of
  // anything — it's a bullet point. Drop those rather than publish a role that matches nobody.
  const workExamples = input.workExamples.filter(
    (w) => w.title.trim() && w.capabilities.length > 0
  );
  if (workExamples.length === 0) {
    return {
      ok: false,
      error: "Add at least one example of the work, tagged with what it demands.",
    };
  }
  if (workExamples.length > MAX_WORK_EXAMPLES) {
    return { ok: false, error: `That's more than ${MAX_WORK_EXAMPLES} examples — trim it to the work that matters most.` };
  }

  const website = input.website.trim();
  // Stored and rendered as a link on the company page, so it has to be checked like any other.
  const normalisedWebsite = website
    ? website.startsWith("http")
      ? website
      : `https://${website}`
    : "";
  if (normalisedWebsite && !isSafeHttpUrl(normalisedWebsite)) {
    return { ok: false, error: "That website address doesn't look like a valid URL." };
  }

  for (const w of workExamples) {
    for (const a of w.attachments ?? []) {
      if (a.kind === "link" && a.url && !isSafeHttpUrl(a.url)) {
        return { ok: false, error: `“${w.title}” has an attachment link that isn't a valid http(s) URL.` };
      }
    }
  }

  // Either adopt the signed-in company or create the account now. Signing up also signs in.
  const existing = await getCurrentAccount();
  let companyId: string;

  if (existing?.role === "employer" && existing.companyId) {
    companyId = existing.companyId;
  } else if (existing) {
    return { ok: false, error: "You're signed in as a candidate. Sign out first to set up hiring." };
  } else {
    const email = clean(input.contactEmail, 160).toLowerCase();
    if (!email.includes("@")) return { ok: false, error: "We need a work email to set the account up." };

    // Same reasoning as the candidate flow: this creates an account, so it carries the limit.
    const limited = rateLimit("signUpByIp", await callerKey());
    if (!limited.allowed) {
      return { ok: false, error: `That's a lot of accounts from one place. ${retryMessage(limited.retryAfterSeconds)}` };
    }

    const created = await signUp({ email, password: input.password ?? "", name, role: "employer" });
    if (!created.ok) return { ok: false, error: created.error };

    const account = await getCurrentAccount();
    if (!account?.companyId) return { ok: false, error: "Account created but the company didn't attach. Try signing in." };
    companyId = account.companyId;
  }

  const row = get<{ slug: string }>("SELECT slug FROM company WHERE id = ?", companyId);
  if (!row) return { ok: false, error: "That company no longer exists." };

  const roleId = `role-${randomUUID()}`;
  const terms = input.terms;
  const now = new Date().toISOString();

  transaction(() => {
    run(
      `UPDATE company
          SET name = ?, blurb = ?, website = ?, stage = ?, team_size = ?, location = ?, published = 1
        WHERE id = ?`,
      name,
      clean(input.blurb, MAX_SHORT),
      normalisedWebsite || null,
      input.stage && STAGES.includes(input.stage) ? input.stage : null,
      clean(input.teamSize, 40),
      clean(input.location, 120),
      companyId
    );

    // 'open' rather than 'draft': the company just pressed publish, and a role that silently
    // stays invisible is the bug this replaced.
    run(
      `INSERT INTO role (id, company_id, title, why_this_role, status, comp_range, location,
                         start_window, created_at)
       VALUES (?,?,?,?,'open',?,?,?,?)`,
      roleId,
      companyId,
      roleTitle,
      clean(input.whyThisRole, MAX_LONG),
      clean(terms.compRange, 60) || null,
      clean(terms.location, 120) || null,
      clean(terms.startWindow, 60) || null,
      now
    );

    for (const a of ARRANGEMENTS.filter((a) => terms.workArrangements.includes(a))) {
      run("INSERT OR IGNORE INTO role_arrangement (role_id, arrangement) VALUES (?,?)", roleId, a);
    }
    for (const c of new Set((terms.constraints ?? []).map((c) => clean(c, 160)).filter(Boolean))) {
      run("INSERT OR IGNORE INTO role_constraint (role_id, constraint_text) VALUES (?,?)", roleId, c);
    }

    workExamples.forEach((w, i) => {
      const workId = `we-${randomUUID()}`;
      run(
        `INSERT INTO work_example (id, role_id, title, description, timeframe, sort_order)
         VALUES (?,?,?,?,?,?)`,
        workId,
        roleId,
        clean(w.title, MAX_TITLE),
        clean(w.description, MAX_SHORT),
        clean(w.timeframe, 60) || null,
        i
      );

      for (const tag of new Set(w.capabilities)) {
        run("INSERT OR IGNORE INTO work_example_capability (work_example_id, tag) VALUES (?,?)", workId, tag);
      }

      (w.whatYoudDo ?? []).forEach((stepText, n) => {
        const text = clean(stepText, MAX_SHORT);
        if (!text) return;
        run(
          "INSERT INTO work_example_step (id, work_example_id, step, sort_order) VALUES (?,?,?,?)",
          `wes-${randomUUID()}`,
          workId,
          text,
          n
        );
      });

      for (const a of w.attachments ?? []) {
        const label = clean(a.name, 120);
        if (!label) continue;
        run(
          "INSERT INTO work_example_attachment (id, work_example_id, name, url, kind) VALUES (?,?,?,?,?)",
          `wea-${randomUUID()}`,
          workId,
          label,
          a.url || null,
          a.kind === "link" ? "link" : "file"
        );
      }
    });
  });

  revalidatePath("/employer");
  revalidatePath("/companies/[slug]", "page");
  return { ok: true, companySlug: row.slug, roleId };
}
