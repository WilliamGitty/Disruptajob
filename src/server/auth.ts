import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { all, get, run, transaction } from "./db";
import { hashPassword, passwordProblem } from "./password";
import { credentialsAccepted } from "./credentials";
import { logWarn } from "./log";

/**
 * Sessions.
 *
 * Deliberately email-only with no password: sending a verification email needs a mail provider,
 * and the whole point of this stage is that the app runs with no third-party accounts or keys.
 * The session itself is real — an opaque token in an httpOnly cookie, looked up server-side — so
 * swapping in a password or magic link later changes `signIn` and nothing else.
 *
 * NOT production auth. Before this is public it needs a real credential and email verification;
 * right now anyone who knows an address can assume that identity.
 */

const COOKIE = "disruptajob_session";
const ONE_MONTH = 60 * 60 * 24 * 30;

export interface Account {
  id: string;
  email: string;
  displayName: string;
  role: "talent" | "employer";
  candidateId?: string;
  companyId?: string;
}

interface AccountRow {
  id: string;
  email: string;
  display_name: string;
  role: string;
  candidate_id: string | null;
  company_id: string | null;
}

function hydrate(row: AccountRow): Account {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    role: row.role as "talent" | "employer",
    candidateId: row.candidate_id ?? undefined,
    companyId: row.company_id ?? undefined,
  };
}

/**
 * Accounts for the sign-in page's demo list — ONLY the invented population, enforced in the
 * query. This once returned every account, which was harmless while all accounts were seeded
 * fiction and became a public email leak the day sign-up opened. A real person's address must
 * never render on a page anyone can load.
 */
export function listDemoAccounts(): Account[] {
  return all<AccountRow>(
    `SELECT a.id, a.email, a.display_name, a.role, a.candidate_id, a.company_id
       FROM account a
       LEFT JOIN candidate c ON c.id = a.candidate_id
       LEFT JOIN company  co ON co.id = a.company_id
      WHERE c.demo = 1 OR co.demo = 1
      ORDER BY a.role, a.display_name`
  ).map(hydrate);
}

export function findAccountByEmail(email: string): Account | undefined {
  const row = get<AccountRow>(
    "SELECT id, email, display_name, role, candidate_id, company_id FROM account WHERE LOWER(email) = LOWER(?)",
    email.trim()
  );
  return row ? hydrate(row) : undefined;
}

/**
 * Start a session. Requires the password unless the account predates passwords (the seeded demo
 * accounts), so the existing demo keeps working while real sign-ups are protected.
 */
export async function signIn(email: string, password?: string): Promise<boolean> {
  const account = findAccountByEmail(email);
  if (!account) return false;

  const row = get<{ password_hash: string | null }>(
    "SELECT password_hash FROM account WHERE id = ?",
    account.id
  );
  // The credential rule itself is pure and lives in credentials.ts so it can be tested without a
  // request context — see that file for why passwordless accounts are refused in production.
  const decision = credentialsAccepted(
    row?.password_hash,
    password,
    process.env.NODE_ENV === "production"
  );
  if (!decision.ok) {
    if (decision.reason === "passwordless-in-production") {
      logWarn("auth", "refused passwordless sign-in in production", { email });
    }
    return false;
  }

  const token = randomUUID();
  run("INSERT INTO session (token, account_id, created_at) VALUES (?,?,?)", token, account.id, new Date().toISOString());

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: ONE_MONTH,
    // Secure would break plain-http local use, which is how this currently runs.
    secure: process.env.NODE_ENV === "production",
  });
  return true;
}

/** Turn a display name into a URL slug, keeping it unique against a table. */
function uniqueSlug(base: string, table: "candidate" | "company"): string {
  const root =
    base
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "profile";

  let slug = root;
  let n = 2;
  while (get<{ id: string }>(`SELECT id FROM ${table} WHERE slug = ?`, slug)) {
    slug = `${root}-${n++}`;
  }
  return slug;
}

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

export type SignUpResult = { ok: true } | { ok: false; error: string };

/**
 * Create an account and the profile behind it.
 *
 * A candidate gets a profile that starts `hidden` — the schema default, and the whole point:
 * signing up must never expose you to anyone until you decide it should. An employer gets an
 * unpublished company, so a half-finished company page is never visible to candidates.
 */
export async function signUp(input: {
  email: string;
  password: string;
  name: string;
  role: "talent" | "employer";
}): Promise<SignUpResult> {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();

  if (!email.includes("@") || email.length < 5) return { ok: false, error: "That doesn't look like an email address." };
  if (!name) return { ok: false, error: "We need a name to put on your profile." };

  const pwProblem = passwordProblem(input.password);
  if (pwProblem) return { ok: false, error: pwProblem };

  if (findAccountByEmail(email)) {
    return { ok: false, error: "There's already an account with that email." };
  }

  const now = new Date().toISOString();
  const accountId = `acc-${randomUUID()}`;

  transaction(() => {
    let candidateId: string | null = null;
    let companyId: string | null = null;

    if (input.role === "talent") {
      const slug = uniqueSlug(name, "candidate");
      candidateId = `cand-${randomUUID()}`;
      run(
        `INSERT INTO candidate (id, slug, name, headline, short_description, location,
                                availability, avatar_initials, accent_index, discoverability, created_at)
         VALUES (?,?,?,'','','','open',?,?,'hidden',?)`,
        candidateId,
        slug,
        name,
        initialsFrom(name),
        Math.floor(Math.random() * 6),
        now
      );
    } else {
      const slug = uniqueSlug(name, "company");
      companyId = `co-${randomUUID()}`;
      run(
        `INSERT INTO company (id, slug, name, blurb, avatar_initials, accent_index, published, created_at)
         VALUES (?,?,?,'',?,?,0,?)`,
        companyId,
        slug,
        name,
        initialsFrom(name),
        Math.floor(Math.random() * 6),
        now
      );
    }

    run(
      `INSERT INTO account (id, email, display_name, role, candidate_id, company_id, password_hash, created_at)
       VALUES (?,?,?,?,?,?,?,?)`,
      accountId,
      email,
      name,
      input.role,
      candidateId,
      companyId,
      hashPassword(input.password),
      now
    );
  });

  await signIn(email, input.password);
  return { ok: true };
}

export async function signOut(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) run("DELETE FROM session WHERE token = ?", token);
  jar.delete(COOKIE);
}

/** The signed-in account, or undefined. Never throws — callers decide what unauthenticated means. */
export async function getCurrentAccount(): Promise<Account | undefined> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return undefined;

  // Expiry is enforced here, in the query, rather than left to the cookie's maxAge. A cookie
  // lifetime is a request to the browser; a token copied out of one would otherwise work forever.
  const row = get<AccountRow>(
    `SELECT a.id, a.email, a.display_name, a.role, a.candidate_id, a.company_id
       FROM session s JOIN account a ON a.id = s.account_id
      WHERE s.token = ? AND s.created_at >= ?`,
    token,
    new Date(Date.now() - ONE_MONTH * 1000).toISOString()
  );
  return row ? hydrate(row) : undefined;
}

export async function requireAccount(): Promise<Account> {
  const account = await getCurrentAccount();
  if (!account) throw new Error("Not signed in.");
  return account;
}

/** An employer account with a company attached — the guard for anything touching hiring data. */
export async function requireEmployer(): Promise<Account & { companyId: string }> {
  const account = await requireAccount();
  if (account.role !== "employer" || !account.companyId) {
    throw new Error("This action is only available to employer accounts.");
  }
  return account as Account & { companyId: string };
}

/** A candidate account with a profile attached. */
export async function requireCandidate(): Promise<Account & { candidateId: string }> {
  const account = await requireAccount();
  if (account.role !== "talent" || !account.candidateId) {
    throw new Error("This action is only available to candidate accounts.");
  }
  return account as Account & { candidateId: string };
}
