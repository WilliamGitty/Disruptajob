import test, { before } from "node:test";
import assert from "node:assert/strict";

/**
 * Email and password changes: the credentials that ARE the account. The rules pinned here are
 * the ones whose absence is an account-takeover button: password-gated changes, verification
 * reset on a new email, in-flight confirmation links dying with the old inbox.
 */

process.env.DISRUPTAJOB_DB = ":memory:";

let changeAccountEmail: typeof import("@/server/account-management").changeAccountEmail;
let changeAccountPassword: typeof import("@/server/account-management").changeAccountPassword;
let endOtherSessions: typeof import("@/server/account-management").endOtherSessions;
let hashPassword: typeof import("@/server/password").hashPassword;
let run: typeof import("@/server/db").run;
let get: typeof import("@/server/db").get;

before(async () => {
  ({ changeAccountEmail, changeAccountPassword, endOtherSessions } = await import(
    "@/server/account-management"
  ));
  ({ hashPassword } = await import("@/server/password"));
  ({ run, get } = await import("@/server/db"));
});

let seq = 0;
function makeAccount(password?: string): string {
  const id = `acc-am-${++seq}`;
  run(
    `INSERT INTO account (id, email, display_name, role, password_hash, email_verified_at, created_at)
     VALUES (?,?,?,?,?,?,?)`,
    id, `${id}@example.com`, "Test", "talent",
    password ? hashPassword(password) : null,
    new Date().toISOString(),
    new Date().toISOString()
  );
  return id;
}

test("changing email requires the current password", () => {
  const id = makeAccount("correct-horse-battery");
  const wrong = changeAccountEmail(id, "new@example.com", "wrong-password");
  assert.equal(wrong.ok, false);

  const right = changeAccountEmail(id, "new@example.com", "correct-horse-battery");
  assert.equal(right.ok, true);
  assert.equal(get<{ email: string }>("SELECT email FROM account WHERE id = ?", id)?.email, "new@example.com");
});

test("a changed email is an unverified email, and old confirmation links die", () => {
  const id = makeAccount("correct-horse-battery");
  run(
    "INSERT INTO email_verification (token_hash, account_id, created_at, expires_at) VALUES ('h', ?, ?, ?)",
    id, new Date().toISOString(), new Date(Date.now() + 3600_000).toISOString()
  );

  changeAccountEmail(id, "fresh@example.com", "correct-horse-battery");
  const row = get<{ v: string | null; n: number }>(
    `SELECT email_verified_at AS v,
            (SELECT COUNT(*) FROM email_verification WHERE account_id = ?) AS n
       FROM account WHERE id = ?`, id, id
  );
  assert.equal(row?.v, null, "the old proof proved the old inbox");
  assert.equal(row?.n, 0, "in-flight links must not verify the new address");
});

test("an email already in use is refused", () => {
  const a = makeAccount("correct-horse-battery");
  const b = makeAccount("correct-horse-battery");
  const taken = get<{ email: string }>("SELECT email FROM account WHERE id = ?", b)?.email ?? "";
  const result = changeAccountEmail(a, taken, "correct-horse-battery");
  assert.equal(result.ok, false);
});

test("changing password checks the old one and can end other sessions", () => {
  const id = makeAccount("correct-horse-battery");
  run("INSERT INTO session (token, account_id, created_at) VALUES ('keep', ?, ?)", id, new Date().toISOString());
  run("INSERT INTO session (token, account_id, created_at) VALUES ('other', ?, ?)", id, new Date().toISOString());

  assert.equal(changeAccountPassword(id, "wrong", "a-new-long-password").ok, false);
  assert.equal(changeAccountPassword(id, "correct-horse-battery", "a-new-long-password").ok, true);

  endOtherSessions(id, "keep");
  const left = get<{ n: number }>("SELECT COUNT(*) AS n FROM session WHERE account_id = ?", id);
  assert.equal(left?.n, 1, "only the session that made the change survives");
});

test("a too-short new password is refused before anything changes", () => {
  const id = makeAccount("correct-horse-battery");
  assert.equal(changeAccountPassword(id, "correct-horse-battery", "short").ok, false);
});
