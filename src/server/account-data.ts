import { all, get, run, transaction } from "./db";

/**
 * Reading out and erasing everything tied to one account.
 *
 * Kept free of Next imports so it is a plain function of the database: the server actions in
 * actions/account-data.ts handle the session, the redirect and the download, and this handles the
 * data. That split is what makes "we really did delete it" something a test can assert rather than
 * something the code merely claims.
 */

export interface AccountRef {
  id: string;
  email: string;
  displayName: string;
  role: "talent" | "employer";
  candidateId?: string;
  companyId?: string;
}

export type AccountExport = Record<string, unknown> & { exportedAt: string };

/**
 * Everything held about an account, as plain data.
 *
 * Assembled from the tables rather than through the repository layer on purpose: a repository
 * applies presentation rules and would silently omit anything it doesn't render, which is exactly
 * the wrong instinct for a subject access request.
 */
export function collectAccountData(account: AccountRef): AccountExport {
  const data: AccountExport = {
    exportedAt: new Date().toISOString(),
    account: {
      email: account.email,
      displayName: account.displayName,
      role: account.role,
      createdAt: get<{ created_at: string }>(
        "SELECT created_at FROM account WHERE id = ?",
        account.id
      )?.created_at,
    },
    // Listed without tokens: a session token is a live credential, and writing one into a file
    // someone will email to themselves is a worse idea than the transparency is worth.
    signInSessions: all("SELECT created_at FROM session WHERE account_id = ?", account.id),
    profile: null,
  };

  if (account.candidateId) {
    const id = account.candidateId;
    data.profile = get("SELECT * FROM candidate WHERE id = ?", id) ?? null;
    data.blockedCompanies = all("SELECT company_name FROM blocked_company WHERE candidate_id = ?", id);
    data.roleTypes = all("SELECT role_type FROM candidate_role_type WHERE candidate_id = ?", id);
    data.workArrangements = all("SELECT arrangement FROM candidate_arrangement WHERE candidate_id = ?", id);
    data.dealbreakers = all("SELECT dealbreaker FROM candidate_dealbreaker WHERE candidate_id = ?", id);
    data.experience = all("SELECT * FROM experience WHERE candidate_id = ?", id);
    data.education = all("SELECT * FROM education WHERE candidate_id = ?", id);

    const projects = all<{ id: string }>("SELECT * FROM project WHERE owner_id = ?", id);
    data.projects = projects.map((p) => ({
      ...p,
      capabilities: all("SELECT tag FROM project_capability WHERE project_id = ?", p.id),
      tools: all("SELECT tool FROM project_tool WHERE project_id = ?", p.id),
      evidence: all("SELECT * FROM evidence WHERE project_id = ?", p.id),
      process: all("SELECT * FROM project_process_step WHERE project_id = ?", p.id),
    }));

    const invites = all<{ id: string }>("SELECT * FROM invite WHERE candidate_id = ?", id);
    data.conversations = invites.map((i) => ({
      ...i,
      messages: all("SELECT * FROM invite_message WHERE invite_id = ? ORDER BY created_at", i.id),
    }));

    // Other people's records that happen to be about you. Included because a subject access
    // request covers data about the person regardless of who created it.
    data.companiesWhoSavedYou = all(
      `SELECT c.name AS company, s.saved_at
         FROM saved_candidate s JOIN company c ON c.id = s.company_id
        WHERE s.candidate_id = ?`,
      id
    );
    data.hiringPipelinesYouAppearIn = all(
      `SELECT c.name AS company, p.stage, p.updated_at
         FROM pipeline_entry p JOIN company c ON c.id = p.company_id
        WHERE p.candidate_id = ?`,
      id
    );
  }

  if (account.companyId) {
    const id = account.companyId;
    data.profile = get("SELECT * FROM company WHERE id = ?", id) ?? null;

    const roles = all<{ id: string }>("SELECT * FROM role WHERE company_id = ?", id);
    data.roles = roles.map((r) => {
      const examples = all<{ id: string }>("SELECT * FROM work_example WHERE role_id = ?", r.id);
      return {
        ...r,
        arrangements: all("SELECT arrangement FROM role_arrangement WHERE role_id = ?", r.id),
        constraints: all("SELECT constraint_text FROM role_constraint WHERE role_id = ?", r.id),
        workExamples: examples.map((w) => ({
          ...w,
          capabilities: all("SELECT tag FROM work_example_capability WHERE work_example_id = ?", w.id),
          steps: all("SELECT * FROM work_example_step WHERE work_example_id = ?", w.id),
          attachments: all("SELECT * FROM work_example_attachment WHERE work_example_id = ?", w.id),
        })),
      };
    });

    data.savedSearches = all("SELECT * FROM saved_search WHERE company_id = ?", id);
    data.savedCandidates = all("SELECT candidate_id, saved_at FROM saved_candidate WHERE company_id = ?", id);
    data.pipeline = all("SELECT * FROM pipeline_entry WHERE company_id = ?", id);

    const invites = all<{ id: string }>("SELECT * FROM invite WHERE company_id = ?", id);
    data.conversations = invites.map((i) => ({
      ...i,
      messages: all("SELECT * FROM invite_message WHERE invite_id = ? ORDER BY created_at", i.id),
    }));
  }

  return data;
}

/**
 * Erase the account and everything behind it. Permanently.
 *
 * Real deletion: no `deleted_at`, no soft delete, no tombstone. Rows that reference the person but
 * hang off the *other* party's record are removed explicitly, because those don't cascade — left
 * behind they'd be a company's pipeline card pointing at somebody who no longer exists.
 */
export function purgeAccount(account: AccountRef): void {
  transaction(() => {
    if (account.candidateId) {
      run("DELETE FROM saved_candidate WHERE candidate_id = ?", account.candidateId);
      run("DELETE FROM pipeline_entry WHERE candidate_id = ?", account.candidateId);
      run("DELETE FROM invite WHERE candidate_id = ?", account.candidateId);
      run("DELETE FROM candidate WHERE id = ?", account.candidateId);
    }
    if (account.companyId) {
      run("DELETE FROM saved_candidate WHERE company_id = ?", account.companyId);
      run("DELETE FROM pipeline_entry WHERE company_id = ?", account.companyId);
      run("DELETE FROM invite WHERE company_id = ?", account.companyId);
      run("DELETE FROM company WHERE id = ?", account.companyId);
    }

    run("DELETE FROM session WHERE account_id = ?", account.id);
    run("DELETE FROM account WHERE id = ?", account.id);

    // Keyed by email rather than account id, so it is not covered by any cascade.
    run("DELETE FROM interest WHERE email = ?", account.email.toLowerCase());
  });
}
