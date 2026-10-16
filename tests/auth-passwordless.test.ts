import test from "node:test";
import assert from "node:assert/strict";
import { credentialsAccepted } from "@/server/credentials";
import { hashPassword } from "@/server/password";

/**
 * The production guard on passwordless accounts (audit S4).
 *
 * Whether demo accounts were open doors in production used to be decided by env-var timing at the
 * database's first-ever seed — a deploy-order trap. The rule is now a pure function applied at
 * sign-in, so deploy order can't touch it and this file can test every branch directly.
 */

const HASH = hashPassword("correct-horse-battery");

test("production refuses an account with no password, with or without one typed", () => {
  assert.equal(credentialsAccepted(null, undefined, true).ok, false);
  assert.equal(credentialsAccepted(null, "anything", true).ok, false);
  const refusal = credentialsAccepted(null, undefined, true);
  assert.equal(refusal.ok === false && refusal.reason, "passwordless-in-production");
});

test("development keeps the local demo convenience", () => {
  assert.equal(credentialsAccepted(null, undefined, false).ok, true);
});

test("a passworded account is unaffected by the guard in either environment", () => {
  for (const prod of [true, false]) {
    assert.equal(credentialsAccepted(HASH, "correct-horse-battery", prod).ok, true);
    assert.equal(credentialsAccepted(HASH, "wrong", prod).ok, false);
    assert.equal(credentialsAccepted(HASH, undefined, prod).ok, false);
  }
});

test("an empty stored hash counts as passwordless, not as matching an empty password", () => {
  assert.equal(credentialsAccepted("", "", true).ok, false);
  const refusal = credentialsAccepted("", "", true);
  assert.equal(refusal.ok === false && refusal.reason, "passwordless-in-production");
});
