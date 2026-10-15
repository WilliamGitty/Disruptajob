import test, { before, beforeEach } from "node:test";
import assert from "node:assert/strict";

/**
 * Rate limiting.
 *
 * Modest by design — a fixed window counted in SQLite — so these tests pin the properties that
 * actually matter: the window is anchored to the oldest attempt rather than the newest (otherwise
 * hammering the endpoint extends your own lockout forever and legitimate users never recover),
 * subjects don't bleed into each other, and a success clears the slate.
 */

process.env.DISRUPTAJOB_DB = ":memory:";

let rateLimit: typeof import("@/server/rate-limit").rateLimit;
let clearRateLimit: typeof import("@/server/rate-limit").clearRateLimit;
let peekRateLimit: typeof import("@/server/rate-limit").peekRateLimit;
let retryMessage: typeof import("@/server/rate-limit").retryMessage;
let LIMITS: typeof import("@/server/rate-limit").LIMITS;
let run: typeof import("@/server/db").run;

before(async () => {
  const mod = await import("@/server/rate-limit");
  const db = await import("@/server/db");
  rateLimit = mod.rateLimit;
  clearRateLimit = mod.clearRateLimit;
  peekRateLimit = mod.peekRateLimit;
  retryMessage = mod.retryMessage;
  LIMITS = mod.LIMITS;
  run = db.run;
});

beforeEach(() => {
  run("DELETE FROM rate_attempt");
});

test("attempts are allowed up to the limit and refused after it", () => {
  const max = LIMITS.signInByEmail.max;

  for (let i = 0; i < max; i++) {
    assert.equal(rateLimit("signInByEmail", "a@example.com").allowed, true, `attempt ${i + 1} should pass`);
  }

  const blocked = rateLimit("signInByEmail", "a@example.com");
  assert.equal(blocked.allowed, false);
  assert.ok(blocked.retryAfterSeconds > 0, "a refusal must say when to come back");
});

test("one subject's attempts never count against another's", () => {
  for (let i = 0; i < LIMITS.signInByEmail.max; i++) {
    rateLimit("signInByEmail", "noisy@example.com");
  }

  assert.equal(rateLimit("signInByEmail", "noisy@example.com").allowed, false);
  assert.equal(rateLimit("signInByEmail", "quiet@example.com").allowed, true);
});

test("buckets are independent — being locked out of sign-in doesn't block signing up", () => {
  for (let i = 0; i < LIMITS.signInByEmail.max + 2; i++) {
    rateLimit("signInByEmail", "someone@example.com");
  }

  assert.equal(rateLimit("signUpByIp", "someone@example.com").allowed, true);
});

test("subjects are compared case-insensitively, so capitalising the email is not a bypass", () => {
  for (let i = 0; i < LIMITS.signInByEmail.max; i++) {
    rateLimit("signInByEmail", "person@example.com");
  }

  assert.equal(rateLimit("signInByEmail", "PERSON@EXAMPLE.COM").allowed, false);
  assert.equal(rateLimit("signInByEmail", "  Person@Example.com  ").allowed, false);
});

test("the window is anchored to the oldest attempt, not the newest", () => {
  // Timestamps are written directly, because in a fast loop every attempt lands in the same
  // millisecond and a time-blind test cannot tell these two implementations apart. This is the
  // property that matters: if a refused attempt were recorded, or the window measured from the
  // newest, a bot retrying every second would keep a real person locked out forever.
  const { max, windowMs } = LIMITS.signInByEmail;
  const tenMinutesAgo = Date.now() - 10 * 60 * 1000;

  for (let i = 0; i < max; i++) {
    run(
      "INSERT INTO rate_attempt (id, bucket, subject, created_at) VALUES (?,?,?,?)",
      `seed-${i}`,
      "signInByEmail",
      "victim@example.com",
      new Date(tenMinutesAgo).toISOString()
    );
  }

  const first = rateLimit("signInByEmail", "victim@example.com");
  assert.equal(first.allowed, false);

  // Roughly the five minutes left of a fifteen-minute window, not a fresh fifteen.
  const remaining = (windowMs - 10 * 60 * 1000) / 1000;
  assert.ok(
    Math.abs(first.retryAfterSeconds - remaining) < 5,
    `expected about ${remaining}s left, got ${first.retryAfterSeconds}s`
  );

  for (let i = 0; i < 20; i++) rateLimit("signInByEmail", "victim@example.com");
  const later = rateLimit("signInByEmail", "victim@example.com");

  assert.ok(
    later.retryAfterSeconds <= first.retryAfterSeconds,
    `retry time grew from ${first.retryAfterSeconds}s to ${later.retryAfterSeconds}s while being hammered`
  );
});

test("attempts older than the window stop counting", () => {
  const { max, windowMs } = LIMITS.signInByEmail;
  const expired = Date.now() - windowMs - 60_000;

  for (let i = 0; i < max + 5; i++) {
    run(
      "INSERT INTO rate_attempt (id, bucket, subject, created_at) VALUES (?,?,?,?)",
      `old-${i}`,
      "signInByEmail",
      "returning@example.com",
      new Date(expired).toISOString()
    );
  }

  assert.equal(rateLimit("signInByEmail", "returning@example.com").allowed, true);
});

test("a success clears the slate", () => {
  for (let i = 0; i < LIMITS.signInByEmail.max; i++) {
    rateLimit("signInByEmail", "forgetful@example.com");
  }
  assert.equal(peekRateLimit("signInByEmail", "forgetful@example.com"), false);

  clearRateLimit("signInByEmail", "forgetful@example.com");

  assert.equal(peekRateLimit("signInByEmail", "forgetful@example.com"), true);
  assert.equal(rateLimit("signInByEmail", "forgetful@example.com").allowed, true);
});

test("peeking does not consume an attempt", () => {
  const max = LIMITS.signInByEmail.max;
  for (let i = 0; i < 50; i++) peekRateLimit("signInByEmail", "watcher@example.com");

  for (let i = 0; i < max; i++) {
    assert.equal(rateLimit("signInByEmail", "watcher@example.com").allowed, true);
  }
});

test("an empty subject is bucketed rather than being an unlimited free pass", () => {
  const max = LIMITS.signInByEmail.max;
  for (let i = 0; i < max; i++) rateLimit("signInByEmail", "");
  assert.equal(rateLimit("signInByEmail", "   ").allowed, false);
});

test("retry wording stays human", () => {
  assert.match(retryMessage(30), /minute/);
  assert.match(retryMessage(600), /10 minutes/);
  assert.match(retryMessage(5000), /hour/);
});
