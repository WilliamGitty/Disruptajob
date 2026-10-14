import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/**
 * Password hashing with scrypt from Node's standard library.
 *
 * scrypt is deliberately memory-hard, so it resists the GPU attacks that make a plain hash
 * useless. Using the built-in keeps the dependency count at zero, which is the constraint this
 * project runs under — bcrypt/argon2 would both mean a native module to compile.
 *
 * Stored as `scrypt$<salt-hex>$<hash-hex>` so the parameters travel with the hash and can be
 * changed later without invalidating everyone's password.
 */

const KEYLEN = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, KEYLEN);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

/**
 * Compare in constant time, so an attacker can't learn the hash byte-by-byte from how long the
 * comparison takes.
 */
export function verifyPassword(password: string, stored: string | null | undefined): boolean {
  if (!stored) return false;

  const [scheme, saltHex, hashHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;

  const expected = Buffer.from(hashHex, "hex");
  let actual: Buffer;
  try {
    actual = scryptSync(password, Buffer.from(saltHex, "hex"), expected.length);
  } catch {
    return false;
  }

  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

/** Minimum viable password rules. Length does more work than character classes. */
export function passwordProblem(password: string): string | null {
  if (password.length < 10) return "Use at least 10 characters.";
  if (password.length > 200) return "That's longer than we can store.";
  return null;
}
