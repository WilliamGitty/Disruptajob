# CTO

## What this role is for

Making sure the product does what it claims, and can keep being changed without breaking the
claims.

The specific job here is unusual: **several of this product's promises are enforced in code rather
than in policy.** "Hidden until you say otherwise" is a WHERE clause. "Demonstrated, never
declared" is the absence of a database column. The CTO owns the integrity of those, which makes
this partly a trust role rather than purely a technical one.

## Owns

- Architecture and the constraints that keep it simple
- Security, data protection in practice, and the privacy guarantees
- What "done" means, and the checks that enforce it ([CLAUDE.md](../CLAUDE.md))
- Build and deploy
- Technical hiring and review

## Decides alone

- How something is built
- What to refactor and when
- Tooling, dependencies, infrastructure
- Whether a change is safe to ship

## Must not decide alone

- What to build
- Whether a privacy promise can be relaxed "just for this feature" — that's a CEO call and the
  answer is almost always no
- Anything that changes what a user is told

## Constraints worth defending

- **Zero runtime dependencies** beyond React, Next and Radix. No ORM, no database service, no API
  keys. `npm ci && npm run dev` on any machine. This is why the project can be handed to anyone.
- **Privacy enforced in SQL**, not in page code a call site can forget.
- **Trust boundaries enforced by type** — an import physically cannot write a capability.
- **Nothing self-declared may ever reach a score.**

## This month

1. Email: password reset, verification, and the two notifications that make the loop close
2. Keep CI green and add branch protection
3. Watch the funnel for where onboarding loses people, and fix one thing at a time
4. Cross-device onboarding drafts

## How you'd know it's going badly

- A check is failing and everyone has learned to ignore it *(this happened — lint exited non-zero
  for weeks while its output was read and its exit code wasn't)*
- "It works on my machine" is load-bearing *(this happened too — the repo had never typechecked
  from a clean checkout)*
- A privacy rule lives in a component rather than in the database
- You can't deploy on a Friday

## The thing most likely to break

**A privacy regression.** Everything else is recoverable. If a candidate who blocked their employer
shows up in that employer's search, someone could lose their job, and no apology repairs it. That
is why those paths are tested, mutation-tested, and enforced in the query rather than the caller.
