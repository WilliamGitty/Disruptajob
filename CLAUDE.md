# Working on Disruptajob

Rules for anyone — human or AI — changing this codebase. They exist because each one was learned
the expensive way, and the reason is given so they can be argued with rather than obeyed blindly.

## The one rule everything else serves

**Nothing a person can type about themselves may ever move a capability score.**

Scores are computed at read time from tagged project evidence. There is no score column in the
database, so this is a property of the schema rather than a convention someone has to remember.
Any feature that could award a capability from a questionnaire, an import, a course, a job title or
a parsed document is a breach of it — and turns this product into a CV with extra steps, which is
the thing it exists to replace.

The onboarding prompts ("what would break if you went away for a month?") are the pattern to copy:
they lead to *described work the person tags themselves*, never to a claim.

## Before you say something works

1. `npm test` — 116 tests and counting.
2. `npx tsc --noEmit` and `npm run lint`. Two pre-existing lint errors live in
   `src/lib/client-store.ts`; anything beyond those is yours.
3. **Drive it in a browser.** Typechecking proves it compiles, not that it works. Several bugs in
   this repo passed all three checks above and were still broken end to end.
4. For anything touching privacy or data, **mutation-test it**: break the rule on purpose and
   confirm the suite goes red. Two tests here passed against deliberately broken code until this
   was done — one was time-blind, one asserted a pragma that could not actually be switched off.

## Things that have actually gone wrong here

Each of these looked fine locally and would have failed in front of a user.

| What broke | Why it was invisible |
|---|---|
| Onboarding wrote nothing to the database | The success screen said "your profile is live" regardless. |
| Hardcoded owner id | Everyone's work was filed under one seeded demo person. |
| A migration adding columns `schema.sql` already had | Dev runs on an *existing* database. Only a fresh install broke — i.e. the deploy. |
| Session tokens never expired | The cookie had a 30-day lifetime; the lookup matched on token alone. |
| Nothing was ever deleted | Retention periods on the privacy page would have been false the day they published. |

The pattern: **the local machine is the least representative environment there is.** Think about
the fresh install, the new account, the empty state, the phone.

## Architecture rules

- **Zero runtime dependencies** beyond React, Next and Radix. No ORM, no database service, no API
  keys. `npm ci && npm run dev` must work on any machine with Node 22. This constraint is why the
  thing can be handed to anyone — protect it.
- **Privacy is enforced in SQL**, not in page code a call site could forget. See
  `repositories/discovery.ts`. If you add a read path for candidates, it goes through there.
- **Trust boundaries are enforced by type.** CV and LinkedIn imports return `BackgroundImport`,
  which has no field for capabilities. A parsed job description returns *suggested* capabilities
  and has no field for confirmed ones. Don't weaken a type to make a feature easier.
- **Writes re-derive the actor from the session.** Never trust an id in a payload.
- **The private comp floor is removed at the type level** (`Omit<NonNegotiables, "compFloor">`), so
  leaking it is a compile error rather than a code review.
- **Contact details are released only on acceptance** — `repositories/handoff.ts`, one short file,
  deliberately easy to audit.
- **Retention periods live in `server/retention.ts`** and are imported into the privacy page. Change
  one, change both, in the same commit.
- **Columns added after `schema.sql` existed live in migrations only.** Adding them to both breaks
  every fresh install.

## Writing for people

The reader is often someone eleven months into a job search who feels invisible. The test for any
string: **would you say this out loud to someone who's had a hard year?**

- Specifics over generalities. "Two hundred applications. Four replies." not "the job hunt is hard".
- Never pressure, never guilt, never a completion percentage. Free users owe us nothing.
- Empty states get more care than marketing pages.
- Full rules in [docs/design-principles.md](docs/design-principles.md).

## Recording decisions

- **Why goes in the commit message.** Not what changed — the diff says that — but what was broken,
  what was considered, and what was rejected.
- **Strategic decisions go in [docs/strategy.md](docs/strategy.md)**, including the ones that were
  declined and why (see §5, "what this strategy forbids", and §5a on the job board).
- **Honest gaps go in the README**, under "state of the build". If something doesn't work, say so
  there rather than letting the next person discover it.

## What to check before deploying

CI runs typecheck, lint, tests and a production build on every push. Beyond that:

- Does it work on a **fresh database**? (`DISRUPTAJOB_DB=":memory:" npm run build`)
- Does it work for a **signed-out visitor**, and a **brand-new account with nothing in it**?
- Does it work on a **phone**?
