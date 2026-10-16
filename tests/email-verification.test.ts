import test, { before } from "node:test";
import assert from "node:assert/strict";

/**
 * Email verification tokens. Mirrors the password-reset suite: stored hashed, single-use,
 * expiring — the properties that make a leaked database useless for forging confirmations.
 */

process.env.DISRUPTAJOB_DB = ":memory:";

let createEmailVerification: typeof import("@/server/email-verification").createEmailVerification;
let completeEmailVerification: typeof import("@/server/email-verification").completeEmailVerification;
let isEmailVerified: typeof import("@/server/email-verification").isEmailVerified;
let run: typeof import("@/server/db").run;
let get: typeof import("@/server/db").get;

let seq = 0;
function makeAccount(): string {
  const id = `acc-verify-${++seq}`;
  run(
    "INSERT INTO account (id, email, display_name, role, created_at) VALUES (?,?,?,?,?)",
    id,
    `${id}@example.com`,
    "Test Person",
    "talent",
    new Date().toISOString()
  );
  return id;
}

before(async () => {
  ({ createEmailVerification, completeEmailVerification, isEmailVerified } = await import(
    "@/server/email-verification"
  ));
  ({ run, get } = await import("@/server/db"));
});

test("a token verifies its account, once", () => {
  const id = makeAccount();
  assert.equal(isEmailVerified(id), false);

  const token = createEmailVerification(id);
  assert.equal(completeEmailVerification(token), true);
  assert.equal(isEmailVerified(id), true);

  assert.equal(completeEmailVerification(token), false, "tokens are single-use");
});

test("the plain token is never stored", () => {
  const id = makeAccount();
  const token = createEmailVerification(id);
  const row = get<{ token_hash: string }>(
    "SELECT token_hash FROM email_verification WHERE account_id = ?",
    id
  );
  assert.ok(row);
  assert.notEqual(row.token_hash, token);
  assert.ok(!row.token_hash.includes(token));
});

test("an expired token verifies nothing", () => {
  const id = makeAccount();
  const token = createEmailVerification(id);
  run(
    "UPDATE email_verification SET expires_at = ? WHERE account_id = ?",
    new Date(Date.now() - 1000).toISOString(),
    id
  );
  assert.equal(completeEmailVerification(token), false);
  assert.equal(isEmailVerified(id), false);
});

test("re-sending invalidates the earlier link", () => {
  const id = makeAccount();
  const first = createEmailVerification(id);
  const second = createEmailVerification(id);
  assert.equal(completeEmailVerification(first), false, "old link must die when a new one is minted");
  assert.equal(completeEmailVerification(second), true);
});

test("a garbage token is rejected", () => {
  assert.equal(completeEmailVerification("not-a-real-token"), false);
});
