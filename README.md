# Disruptajob

Hiring based on evidence of what someone has actually done, rather than on a CV.

## The problem

People increasingly do two or three jobs inside one role. A job title picks one of them, and a CV
flattens the rest into a line. The person most poorly served by this is someone whose title
undersells them — an "Operations Associate" who also builds the automations and owns half of
product. They're invisible to title and keyword search, and they're the people this is built for.

AI has made it worse: a polished application now takes seconds to generate, so polish no longer
distinguishes anyone. Proof is the only thing left that's hard to fake.

**Candidates are free. Companies pay.**

## How it works

**Candidates** describe real projects they've done and tag which capabilities each one
demonstrates. That tagging is the *only* thing that moves a capability score — there is no column
in the database to store a self-declared one.

**Companies** don't write job descriptions. They describe the actual work a hire would own, tagged
with the capabilities it demands. Matching is then a set overlap between proven capability and
required capability, and every score is explainable: *"evidence for 2 of 3 — Automation,
Operations."*

**Privacy is the product.** A profile is invisible until its owner opts in, and candidates can
block named companies so a job search never costs them the job they have. Both gates are enforced
in SQL, not in application code a call site could forget.

## Running it

Node 22 or later is required — the app uses `node:sqlite`, which ships with Node 22.

```bash
npm ci
npm run dev
```

Open http://localhost:3000. The database is created and seeded automatically on first run, so
there's no extra setup step. Sign in at `/signin` as `will@example.com` (candidate) or
`hiring@meridianrobotics.com` (employer) — no password locally.

To watch both sides of the marketplace at once, open a second browser signed in as the other
account: the two share one database, so an accepted invite appears on the employer's pipeline
immediately.

## Architecture

Next.js App Router, SQLite via `node:sqlite`, **zero runtime dependencies beyond React/Next and
Radix primitives**. No ORM, no database service, no API keys — `npm ci && npm run dev` is the
whole setup on any machine.

```
src/
  app/                  routes (App Router)
  components/           UI
  lib/                  pure domain logic — scoring, matching, capability vocabulary
  server/
    schema.sql          the database
    migrations.ts       versioned schema changes
    seed.ts             demo population, applied only to an empty database
    auth.ts             sessions (scrypt passwords, httpOnly cookie)
    repositories/       reads — batch-loaded, no N+1
    actions/            writes — every one re-derives the actor from the session
```

Deliberate choices worth knowing:

- **Capability scores are computed at read time** from tagged projects. There is no score column,
  so "demonstrated, never declared" is a property of the schema rather than a convention.
- **The private comp floor is removed at the type level.** Employer UI takes
  `EmployerSafeTerms = Omit<NonNegotiables, "compFloor">`, so leaking it is a compile error.
- **Visibility is re-applied on every read.** Someone who hides after being saved to a pipeline
  disappears from it — a saved list never outlives consent.

## Documents worth reading first

| | |
|---|---|
| [docs/strategy.md](docs/strategy.md) | The thesis in Innovator's Dilemma terms — job to be done, why incumbents can't follow, what the strategy forbids, and OKRs. Start here. |
| [docs/design-principles.md](docs/design-principles.md) | Why the interface looks and reads the way it does. |
| [docs/candidate-onboarding-flow-spec.md](docs/candidate-onboarding-flow-spec.md) | The original build spec for candidate onboarding. |
| [DEPLOY.md](DEPLOY.md) | Hosting, costs, and the checklist before this can be genuinely public. |

## Deployment

See [DEPLOY.md](DEPLOY.md). Roughly £3/month on Fly.io. Note that **Vercel won't work unchanged**:
the database is a file on disk, and Vercel's filesystem is ephemeral.

## State of the build

This is a working prototype, not a production service. Honest list of what's missing:

- **No tests.** The privacy and matching logic are the two places a bug is genuinely costly.
- **No email**, so no verification or notifications. Sign-up accepts any address.
- **No rate limiting** on sign-in or sign-up.
- **No GDPR export or account deletion**, both of which are legally required in the UK before real
  users exist.
- **Not registered with the ICO**, and there's no privacy policy or terms.
- **Onboarding drafts are still per-browser.** Both wizards keep progress in `localStorage` until
  the final step writes everything to the database, so a half-finished profile doesn't follow you
  to another device — and the password, deliberately never stored with the draft, has to be
  re-entered if you close the tab.
- `src/lib/client-store.ts` is largely superseded by the server layer and is where the two
  remaining lint warnings live.
