# Disruptajob — Full Codebase, Product & Architecture Audit

**Date:** 16 October 2026 · **Auditor:** Claude (Fable 5), operating as Principal Engineer / Christensen / Jobs / DD reviewer · **Mode:** read-only; no code changed during this audit.

**Disclosure of bias:** most of this codebase was written by the same AI performing the audit, over the preceding three days. The brief says not to protect earlier decisions because an AI made them. Several findings below are defects in work I produced and previously reported as verified. They are labelled the same way as everything else.

**Evidence basis:** full repository inspection; `npm test` (116/116 pass), `tsc` clean, `lint` exit 0 re-run fresh today; live database inspected; key journeys traced through code. Browser-based UX claims are limited — the preview pane was hidden during the audit, and **the product has never been opened on a phone** (VERIFIED: the founder's planned phone walkthrough has not happened).

---

## 1. Executive Summary

Disruptajob is a ~18,000-line Next.js 16 / React 19 / `node:sqlite` application, 22 commits old, with a genuinely unusual property for its stage: its central product promises are mostly enforced *structurally* (schema defaults, SQL gates, TypeScript types) rather than by convention. The test suite (116 tests, mutation-tested) is real. The documentation culture (CLAUDE.md, docs/strategy.md, honest README) is exceptional for a solo project.

**But this audit found that the two sentences the product leads with are currently false in deployed form:**

1. *"Blocked companies cannot open your profile by its link"* (stated verbatim on `/privacy`) — **false**. `src/app/profile/[slug]/page.tsx:40-52` applies no visibility gate for non-owners. Every profile, including `hidden` ones, is fully readable by anyone, signed in or not, at a guessable name-based slug. (VERIFIED)
2. *Blocked companies can't find you in search* — **defeatable by signing out**. `/employer/search` has no auth gate; an anonymous viewer searches with `viewingCompany = ""`, which bypasses the blocklist by documented design intended for the landing page (`src/app/employer/search/page.tsx:39-45`, contract pinned in `tests/discovery.test.ts`). (VERIFIED)

Both are page-layer gaps around a correctly built SQL gate — hours to fix, not a redesign. But they must be fixed **before Saturday's deployment**, because the privacy promise is the product.

The second theme: **the demo population has leaked into surfaces that present it as real.** Role-page evidence lookups, the employer landing stats, and the company-setup "here's who matches" payoff all read from `src/lib/mock-data.ts` — meaning real candidates show no supporting evidence where it matters most, and real companies are shown fabricated people at their moment of decision. (VERIFIED, details §5/§8)

The third theme is the one Christensen and the DD reviewer agree on: **validation is at zero.** 5 accounts, 10 candidates, 138 analytics events — all created by the founder and the AI. `interest` table: 0 rows. Nothing here is evidence that anyone wants an evidence-based profile. The codebase is ready to learn; no learning has occurred.

**Verdict in one line:** right product thesis, unusually sound foundations, two critical page-level privacy defects, a demo-data integrity problem, and a validation count of zero — stop building features, fix the four integrity items, deploy, and put it in front of ten real people.

### Executive Scorecard

| Area | /10 | Reasoning |
|---|---|---|
| Technical architecture | **8** | Right-sized for stage; zero runtime deps beyond framework; privacy in SQL; migrations disciplined. Docked for dual matching engines and demo-data entanglement. |
| Code quality & tests | **7.5** | 116 tests, mutation-tested, CI green on clean machines. Docked: the flagship privacy-matching tests pin the *mock* engine, not the production one (§5). |
| Security & privacy implementation | **5** | Core design excellent (scrypt, httpOnly, rate limits, token-hashed resets, SQL gates). Two critical page-layer holes contradict the shipped privacy policy. |
| Observability & operations | **2** | Zero logging anywhere in server code (VERIFIED: 0 statements). First production error will be invisible. No deploy pipeline beyond manual `fly deploy`. |
| Product clarity (desktop) | **7** | Proposition legible in five seconds; copy is a genuine asset. Mock payoffs undermine trust exactly where trust is earned. |
| Mobile & accessibility | **unscored** | Never opened on a phone; a11y only statically inspected (40 aria/htmlFor refs, SVGs labelled). Requires visual testing. |
| Strategy & disruption potential | **7** | Real nonconsumption thesis, strategy doc names its refusals. Docked: no concrete beachhead; current employer features court incumbents' customers (§6). |
| Market validation | **1** | Zero external users, zero interest signups, not deployed. The 1 is for the funnel being ready to measure. |
| Scalability vs stated goals | **8** | 1k profiles trivial; 10k fine (batch loading verified at 2k); 100k needs search/matching work but not a rewrite. Single-writer SQLite is a known, documented ceiling. |
| Commercial defensibility | **4** | The moat (two-sided evidence graph + business-model asymmetry) exists only after liquidity. Today it is a well-written argument. |

---

## 2. Overall Product Assessment

**What the product is today (implemented and traced):** a working two-sided prototype. A candidate can sign up mid-onboarding, publish tagged evidence, control visibility, receive an invite, converse, accept, and surrender contact details only on acceptance (`src/server/repositories/handoff.ts`, release condition in SQL, 8 tests). An employer can publish a role from a parsed job description, search a DB-backed population, run a pipeline, and get an email/ATS handoff. GDPR export/delete work and are tested. This is more end-to-end truth than most pre-seed decks.

**What the product is not:** used. Every row in the database was created by its builders. The strongest page on the site — the portfolio coach's "is this any good?" — has never coached anyone.

**The gap between the two** is not a feature gap. Tracing the loops shows one systemic hole: **no outbound channel exists** (no email: verified, zero senders in `src/`; `src/server/password-reset.ts` is complete but has **zero consumers** — VERIFIED dead code). Consequences: a forgotten password is permanent lockout; an invited candidate is never told; an accepting candidate's employer is never told. Every marketplace loop currently requires both parties to spontaneously log back in. At N=10 users the founder can hand-carry messages; at N=11 the product silently fails its core loop.

---

## 3. Technical Architecture Assessment

**Stack:** Next.js 16.4 App Router, React 19.3, Tailwind v4, `node:sqlite` (Node 22), 14 runtime deps (React/Next/Radix/utility only). No ORM, no service dependencies, no API keys. `npm ci && npm run dev` is the entire setup (VERIFIED on CI's clean machines).

### Answers to the ten architecture questions

1. **Over- or under-engineered?** Neither, unusually. The zero-dependency constraint produced *less* infrastructure than typical (no Redis, no queue, no ORM) while the promise-critical paths got real engineering (SQL gates, type boundaries, migrations). The over-engineering lives in *product surface*, not architecture: ~1,666 lines (9% of src) are demo scaffolding — `mock-data.ts` (1,173) + the dead halves of `client-store.ts` (four store hooks with zero consumers, VERIFIED).
2. **Premature abstractions?** One: dual matching engines. `src/lib/role-matching.ts` (mock-fed) and `src/server/matching.ts` (DB-fed) duplicate the scoring formula with a comment promising they're identical — the classic drift setup. INFERRED risk, VERIFIED duplication.
3. **Will the schema support likely development?** Yes. 29 tables, FK-cascaded, read-time-computed scores (no score column — the promise is schema-shaped), versioned migrations with idempotency tests (`tests/migrations.test.ts`, added after a real dual-definition bug). Evidence, projects, capabilities, work examples are coherent mirrors across both market sides.
4. **Titles/skills/evidence coherent?** Yes, and deliberately asymmetric: titles are display-only context; capabilities exist solely as tags on work; `NonNegotiables` (self-declared) is a separate type from `Capability` (derived) with the comp floor excluded at type level (`EmployerSafeTerms`).
5. **Debt trajectory?** Main compounding debts: (a) demo/real data entanglement — every new surface must choose a source and three chose wrong (§5); (b) dual matchers; (c) `client-store.ts` dead weight. All are deletions, not rewrites.
6. **Security vulnerabilities?** §4. Two critical (page-layer privacy), several mediums.
7. **Data ownership/consent/deletion?** Strong: export assembled from tables not repositories (so nothing presentation-filtered is omitted), deletion is real with a sweep-every-table test, retention constants are imported into the privacy page so prose and `DELETE`s can't drift (`src/server/retention.ts`). Gap: ICO registration and legal-entity placeholders are founder-blocked, bracketed, and cannot ship silently.
8. **1k / 10k / 100k profiles?** 1k: trivial. 10k: fine — the N+1 was already fixed to 9 fixed queries, and a 2,009-candidate load test previously went 15s→0.23s. 100k: `listDiscoverableCandidates` hydrates the full visible population per search (`discovery.ts` → `candidates.ts`), and search scores all of them in JS — needs pagination-at-query and probably FTS5 (available in `node:sqlite`) before then. Single always-on Fly machine, `auto_stop=false`, is the honest SQLite posture. INFERRED: 100k is a quarter's notice, not a rewrite.
9. **Expensive to change later?** (a) The anonymous-viewer semantics — every page frozen around "anonymous sees open profiles" becomes a migration of *promises*, not code; decide now (§14-D4). (b) sync `node:sqlite` → any async DB touches every repository; correctly deferred, documented in DEPLOY.md. (c) The capability vocabulary (12 fixed tags) — fine to defer, but migrations of tagged evidence get harder with volume.
10. **Decide now vs postpone?** Now: profile-link semantics, demo-data policy, email exception to the no-keys rule, beachhead. Postpone: payments, async DB, verification/trust systems, AI-assisted anything.

**Bleeding-edge risk (INFERRED, medium):** Next 16.4 + React 19.3 + Tailwind 4 + experimental `node:sqlite` is a young stack; one already-bitten example is `@theme inline` silently baking tokens (caught during the scroll-animation work). CI on clean machines is the right mitigation and exists.

---

## 4. Security & Privacy Review

### Critical (fix before any deployment)

**S1 — Hidden and blocking profiles are fully readable by anyone with the URL.** VERIFIED.
`src/app/profile/[slug]/page.tsx:40-52`: the page loads any candidate by slug and renders header, work, capabilities and background with no visibility check for non-owners. Slugs are name-derived (`priya-raman`) — guessable, enumerable from the landing grid, and shared in invites. The shipped privacy policy states the opposite in two places (`src/app/privacy/page.tsx`, "Who can see you": *"cannot open your profile by its link"*). The employer-side route `/employer/candidate/[slug]` **is** gated (`:47 isCandidateVisibleTo`) — so the protection exists and one route simply bypasses it. *Consequence:* the single scenario the product exists to prevent — current employer reads the profile of a hidden employee — is possible today. *Mitigation:* non-owner access to `/profile/[slug]` must pass `isCandidateVisibleTo(candidate.id, viewerCompany)`; hidden profiles 404 to everyone but the owner until a deliberate share-token feature exists. Effort: ~1–2h incl. tests.

**S2 — Signing out defeats the blocklist in search.** VERIFIED.
`/employer/search` has no auth requirement (VERIFIED: no `requireEmployer`/redirect in the page). Anonymous viewer ⇒ `viewingCompany=""` ⇒ blocklist skipped by the documented public-page contract (`src/app/employer/search/page.tsx:41-45`; contract test `tests/discovery.test.ts` "empty viewing company skips the blocklist"). The contract is right for the landing grid; applying it to the full search tool means any blocked recruiter can sign out and search. *Mitigation:* employer search, role pages and candidate-detail behind `requireEmployer()` (anonymous visitors keep the landing-page preview grid). Effort: ~1h. *Note:* no identity verification means a blocked employer can also just register a second account under another name — the blocklist is honest-actor protection; say so in the privacy copy rather than overpromising (copy currently does overpromise).

### High

**S3 — Zero observability.** VERIFIED: no logging statements in server code, no error reporter, `track()` and `maybePrune()` swallow exceptions by design. A production 500 after Saturday leaves no trace beyond Fly's stdout of Next defaults. *Mitigation:* one `logError(context, err)` helper to stderr + Next `instrumentation.ts` onRequestError; 2–3h. (No third-party service needed; Fly captures stdout.)

**S4 — Demo accounts' passwordlessness is decided at seed time.** VERIFIED `src/server/seed.ts:213-218`. If the first boot on Fly happens before `DEMO_ACCOUNT_PASSWORD` is set, demo accounts are permanently open doors (sign-in page lists their addresses) with no re-seed path. *Mitigation:* enforce at sign-in time instead (reject passwordless accounts in production unless env set), or document secret-before-first-deploy in DEPLOY.md checklist. 1h.

### Medium

- **S5 — Anonymous-viewer semantics are inconsistent by route** (landing grid: open-only, blocklist N/A • search: same but full tool • `/profile`: everything). One decided rule, applied everywhere, tested once. (Fixing S1/S2 forces this.)
- **S6 — `CURRENT_EMPLOYER_COMPANY` default arguments survive** (`src/lib/current-user.ts`, used as defaults in `lib/search.ts:199`, `lib/role-matching.ts`) — flagged in a previous session, never fixed; today its only live consumer is the mock ReviewStep, but a default that silently evaluates someone's blocklist against "Meridian Robotics" is a loaded gun. Make the parameter required; delete the file.
- **S7 — Session fixation hygiene:** sessions are opaque, httpOnly, expiry enforced in SQL (good; fixed during this build), cleared on password reset — but not rotated on sign-in. Low practical risk at this scale; note for later.
- **S8 — GitHub import shares 60 unauth requests/hr across ALL users of one Fly IP** (`src/server/actions/github-import.ts`). Two simultaneous users can exhaust it; error handling is graceful (VERIFIED), but the feature degrades exactly when demoed to a group. Mitigation: optional `GITHUB_TOKEN` (5k/hr) when the email decision already breaks the no-keys seal; cache responses (10-min revalidate exists).
- **S9 — No CSRF beyond Next's server-action origin checks; no Content-Security-Policy headers; `SITE_PASSWORD` basic-auth is the only front gate.** Acceptable for preview; CSP is a cheap later win. INFERRED low.

### What is genuinely strong (verified, keep)

scrypt with per-hash params and timing-safe compare (`password.ts`); reset tokens stored only as SHA-256 hashes, single-use, 60-min TTL, enumeration-safe (`password-reset.ts` — the *module* is excellent; it's just unwired); rate limiting anchored to oldest attempt with identical lockout wording either way (`rate-limit.ts`, mutation-tested); contact details released only on invite acceptance via a one-file SQL join (`handoff.ts`, 8 tests incl. withdrawal); IP addresses never stored, only salted hashes; first-party-only analytics with no UA/IP; retention enforced by the running app and imported into the policy page.

---

## 5. Code Quality & Technical Debt

**Numbers:** 18,151 lines src · 1,826 lines tests (116, all passing, mutation-tested in 3 areas) · 22 commits · lint/tsc/build clean on CI's clean machines (the first two CI runs failed and both failures were real — typecheck had never passed from a fresh checkout; lint had been failing for weeks while its output, not exit code, was read; both are recorded in CLAUDE.md).

**Debt register, ranked:**

| # | Debt | Evidence | Cost of keeping | Fix effort |
|---|---|---|---|---|
| D1 | **Demo data presented as real on production surfaces.** Role-page "Backed by" resolves supporting projects against mock `PROJECTS` — a real candidate's evidence silently vanishes on the page where an employer decides to contact them (`src/app/employer/roles/[id]/page.tsx:111-114`, same at `employer/candidate/[slug]/page.tsx:128`). Employer landing shows "N documented projects / evidence" computed from mocks (`employer/page.tsx:14,39`). Setup's payoff step shows four *fabricated* matches to a real company deciding whether to publish (`setup-steps.tsx:361-362` → mock matcher). | VERIFIED | Real users look worse than fake ones; trust destroyed at decision moments | ~3–4h: point all three at `server/` repositories; delete or truthfully label the preview |
| D2 | **Dual matching engines; privacy tests pin the wrong one.** `tests/matching-privacy.test.ts` imports `lib/role-matching` + mock `CANDIDATES` — the suite that "asserts the join between matching and privacy" exercises an engine production doesn't use. Production `server/matching.ts` inherits privacy from `discovery` (tested) but its ranking is untested. | VERIFIED | Confidence theatre; formula drift | 2h: retarget tests, delete `lib/role-matching.ts` + `lib/search.ts` mock half |
| D3 | **~560 lines of verified-dead code:** 4 localStorage store hooks + their demo seeds (`client-store.ts:25-122` + hooks, 0 consumers each) and unwired `password-reset.ts` (dead until UI exists). | VERIFIED | Misleads every future reader; the invites seed shadows a real DB system | deletion, 1h |
| D4 | `mock-data.ts` (1,173 lines) is both seed source and live import — the root enabler of D1. | VERIFIED | every new page can re-create D1 | move under `server/seed-data.ts`, import nowhere else; 1–2h |
| D5 | Duplicated company-name normalisation (visibility.ts vs discovery.ts) — known, pinned by cross-tests, still two implementations. | VERIFIED | drift caught only if tests stay honest | acceptable; consolidate opportunistically |
| D6 | Scoring formula shared correctly (`scoreFromEvidenceCount` imported by SQL repo — VERIFIED `candidates.ts:172`) but *fit-score* formula duplicated across the two matchers. | VERIFIED | see D2 | dies with D2 |

**Error handling:** server actions return typed `{ok,error}` consistently (good); repositories throw raw (fine at this scale); nothing is logged anywhere (S3).

---

## 6. Product Strategy & Disruption Potential (Christensen)

**The theory, tested against the build.** `docs/strategy.md` makes the right disruption argument on paper: new-market disruption anchored in nonconsumption (people whom title-based hiring never surfaces; small companies that can't afford recruiters), with a business-model asymmetry incumbents can't follow (Indeed sells application volume, LinkedIn sells recruiter seats; this sells access to proven capability) and a written list of refusals — no postings, no candidate fees, no one-click apply, no self-declared ranking, no default discoverability. The job-board question was asked and answered correctly in §5a (show demand, delete the application). That document is a genuine asset; most seed companies never write it.

**Where the build contradicts the theory:**

1. **The employer surface is shaped for the incumbent's customer.** Search-with-filters, pipeline board, saved lists, ATS handoff — these are the workflows of a company that already hires through recruiters and job boards, i.e. the customer LinkedIn serves well and will defend. The nonconsumer employer (8-person company, founder-hires, no ATS, no sourcing habit) needs almost none of this; they need "describe the work → meet three people." The pipeline board is the most sustaining-innovation feature in the product. (INFERRED from feature inventory vs strategy doc.)
2. **No beachhead is actually selected.** The strategy names the *persona* (title undersells them) but no *place* — no named community, geography, or capability niche where the first 100 candidates congregate. "AI-adjacent operators" appears in the capability vocabulary (12 tags skew ops/AI/automation — a de facto niche chosen by vocabulary, never examined as a decision). Disruption theory is specific about this: foothold first. UNVALIDATED.
3. **Cold-start is masked, not solved.** The seeded population makes every surface look liquid, which demos well and *prevents learning* — you cannot observe whether real employers tolerate a thin real marketplace while the marketplace pretends to be thick. See D1 and §14-D2.

### The assumption table (per brief §4)

| Assumption | Why it may hold | Why it may not | Evidence in repo | Missing evidence | Risk if false | Cheapest experiment |
|---|---|---|---|---|---|---|
| A1. Candidates want an alternative to CVs | Pain is real and worsening (AI-flattened applications); copy resonates with a known persona | Wanting *outcomes* ≠ wanting another profile to maintain; LinkedIn fatigue may transfer | None. `interest`=0, zero external profiles | 10 strangers' behaviour | FATAL | Deploy; 20 hand-picked DMs; count completed profiles within 72h. Cost: ~£3 + a day |
| A2. Candidates will invest ~30–60 min writing evidence | First ask is one project (~10 min); prompts + dictation + GitHub import lower the floor; portfolio coach gives feedback | It's homework, upfront, before any payoff; funnel has 8 steps incl. terms *before* first value | Funnel instrumentation exists (unused); step drop-off measurable per step label | Actual drop-off curve | FATAL | Same 20 users; read `/funnel` step table; fix the single worst step; repeat |
| A3. Employers will read evidence over credentials | 400 identical AI-polished CVs is a real screening crisis; explainable matches reduce effort | Evidence reading is *slower* per candidate; risk-averse HR defaults to proxies; unverified evidence may be discounted to zero | None (0 real employers) | 5 employers running one real search each | FATAL | Concierge: take 3 real open roles from founder's network, hand-match, watch them read profiles; no code needed |
| A4. Employers can evaluate evidence consistently | Capability tags + per-match reasoning standardise the read | 12-tag vocabulary is crude; same tag spans junior/senior; no calibration | Tag vocabulary `lib/capabilities.ts`; no seniority axis | Inter-rater data | HIGH — mispriced matches erode trust | In the concierge test, ask two people to rate the same 5 profiles; measure divergence |
| A5. AI/ops-adjacent is the right first niche | Highest title↔work divergence; founder's own network; vocabulary already fits | Chosen implicitly, never stress-tested; these people may have the *least* trouble getting interviews in 2026 | Vocabulary skew only | Any niche comparison | MEDIUM — wrong foothold wastes the only scarce resource (founder attention) | Write 3 candidate one-pagers for 3 niches; DM 10 of each; compare completion |
| A6. Incumbents are structurally blocked | Fee-per-application / per-seat revenue genuinely conflicts with evidence-first; LinkedIn's skills data is self-declared at its core | LinkedIn ships "skill evidence" as a *feature* without changing pricing; distribution beats purity | strategy.md argument only | None possible pre-traction | MEDIUM — compresses window | None cheap; mitigate via speed in a niche incumbents ignore |
| A7. Candidate-first sequencing works | Supply is the scarce, moral centre; demand panel converts demand signal into candidate motivation | Two-sided chicken-and-egg: 100 candidates with zero inbound approaches churn silently | Demand panel exists; 4 roles, all founder-made | Retention after 2 weeks of silence | HIGH | Founder manually generates ≥1 genuine approach per early candidate (concierge demand) |
| A8. Evidence can be made trustworthy | Links to real artefacts; "demonstrated not declared" enforced in schema | Nothing verifies authorship; forked/fabricated work scores identically; trust may require verification this architecture defers | addProject validates URLs only | Employer trust interviews | HIGH later, LOW at N<100 (founder can eyeball) | Ask the 5 concierge employers: "what here would you need verified before interviewing?" |
| A9. Pain is sufficient to change behaviour on both sides | Candidate pain is acute and documented culturally | Employer pain is chronic, not acute — they *have* a process | None | A3/A7 experiments | FATAL if both sides merely "like" it | Same experiments; behaviour, not opinions |

**Christensen's single sharpest challenge:** *you have built the theory of a disruption and the product of a feature.* The disruptive wedge is "one person, one page of proof, one employer who hired them without a CV." Everything else — pipelines, briefs, saved searches, bands on the landing page — is sustaining polish that incumbents do better. Prove the wedge with ten humans before another feature ships.

---

## 7. Assumptions That Could Invalidate the Business

Condensed from §6: the three *fatal-class* assumptions are **A2 (candidates do the work), A3 (employers read evidence), A9 (pain → behaviour change)**. None has any supporting evidence in the repository beyond well-instrumented readiness to test them. Everything in §9's plan is sequenced to attack these three within a fortnight at near-zero cost. A business-invalidating result is a *good* outcome at this stage — it would cost £3 and two weeks instead of a year.

One **additional founder-level assumption** nobody has challenged: *"I won't be on my laptop to add API keys, so the product must run with none."* This constraint produced excellent architecture, and it now blocks the single most load-bearing capability (email: reset, verification, invite notifications — §2). The constraint was right for week one and is wrong for week three. (VERIFIED consequence; the decision is §14-D1.)

---

## 8. Feature Audit — Keep / Improve / Defer / Remove

**KEEP (proves the core value proposition):**
- Evidence-tagged projects with read-time scoring (schema-enforced) — the product.
- Visibility controls + blocklist in SQL (`discovery.ts`) — the promise. (Fix its two page-layer bypasses, S1/S2.)
- Candidate onboarding w/ prompts deck, dictation, GitHub import (now honest, untagged drafts) — the adoption engine.
- Portfolio coach + demand panel (owner-only, no apply button) — the retention answer that isn't gamification; `portfolio-strength.ts` is the best product thinking in the repo.
- JD drag-and-drop parser (deterministic, suggestion-only trust boundary) — the employer adoption bridge; also *demonstrates* the thesis by discarding the wish-list.
- Invite → conversation → acceptance-gated contact handoff — the transaction.
- GDPR export/delete, retention-as-code, privacy policy wired to constants.
- First-party funnel + `/funnel` page — the learning instrument.
- Tests + CI + CLAUDE.md.

**IMPROVE:**
- Role page & employer candidate page: evidence from DB not mocks (D1). *Blocking-level improve.*
- Setup ReviewStep: real matcher + truthful empty state ("You'd be among the first — here's the real pool"). Honesty here is a *feature*: the employer who publishes anyway is a validated believer.
- Onboarding sequencing: "Your terms" (step 3) asks for commitment before any value; move terms/visibility post-first-publish. (UNVALIDATED — let funnel data decide which step bleeds.)
- Search ranking: keyword→capability mapping is serviceable; cap results scoring at query time before 10k.
- Sign-in: passwordless demo accounts listed on the page — fine locally, gate in prod (S4).

**DEFER (premature, keep the stubs honest):**
- Email/CV/LinkedIn *imports* (currently honest "we don't read it" — correct posture).
- Paid tiers, billing, employer seats — nothing to price until a hire happens.
- Verification/trust system (A8) — concierge it first.
- Share-tokens for hidden profiles; custom domain; FTS5 search; GITHUB_TOKEN.
- Scroll reveals polish — shipped, harmless (reduced-motion + no-JS safe), **not yet eyeballed by a human**; verify on the phone walk, then leave alone.

**REMOVE (this fortnight, all verified dead or harmful):**
- `lib/role-matching.ts`, mock half of `lib/search.ts`, `lib/current-user.ts` (after D2 retarget).
- Dead localStorage stores + demo seeds in `client-store.ts` (D3).
- Mock imports of `PROJECTS`/`CANDIDATES` in app pages (D1) and the fake landing stats.
- `/employer/brief`, `/employer/searches`, saved-candidates surface — three navigation destinations for an employer base of zero; every extra door dilutes the one path that matters (search → invite). (INFERRED; cheap to re-add with demand.)

**The brief's own challenge — "are we building a recruitment platform before proving people want an evidence-based identity?"** Partly, yes: the employer suite outgrew the validation of the candidate side. The corrective isn't deletion of the employer side (the two-sided demo is the pitch); it's a freeze — no new employer features until ten real profiles exist.

---

## 9. UX & Design Assessment

*Method caveat: desktop code-trace plus prior in-session browser verification; the preview pane was hidden for parts of this audit and **no phone test has ever occurred**. Items marked (visual) need eyes.*

- **Five-second proposition:** passes. "Your *job title* doesn't do you justice" + proof-block directly beneath the hero showing a real capability with its receipts. The page states, then immediately demonstrates.
- **Differentiation:** explicit (comparison section, "what we don't do"), and the audience switch is now marked ("From here down — for companies" band).
- **Onboarding friction:** 8 steps; password mid-flow (correctly never persisted with the draft, with a recovery path back to the field); the known risk is step 3 (terms) and the evidence step's blank-box moment — mitigated by prompts + dictation. Real answer lives in `/funnel` drop-off, which exists and has no data.
- **Coherence/trust:** one palette, one accent rule, empty states designed first-class, copy passes its own "hard year" test. The mock payoffs (D1) are the trust breaker — a real user meeting fake people is the single worst UX event possible in this product.
- **Animations:** reveals are progressive-enhancement-safe (verified: cannot strand content invisible; reduced-motion honoured) but *feel* unverified (visual).
- **Mobile:** unknown. 9-then-8-step wizard on 390px is the likeliest credibility risk in the entire product. (visual, URGENT)
- **Reason to return:** demand panel + portfolio coach are genuinely better answers than badges; they are invisible until sign-in, and *nothing notifies* (no email), so returning currently depends on memory.

**Five changes most likely to move conversion/engagement:**
1. Fix D1 so real users see real evidence everywhere (trust = conversion here).
2. Phone pass on onboarding; fix the three worst hesitations found. (visual)
3. Move "Your terms" after first publish — shorten the path to first value to: hook → basics → one project → visible score. *(validate via funnel first)*
4. Truthful ReviewStep payoff for employers (real pool + count), making publish-anyway a commitment signal.
5. The first-session email ask: after first project publishes, one line — "want one email when a company searches for Automation?" — doubles as the A7 retention wedge once email exists.

## 10. Scalability Assessment

| Milestone | Verdict | Evidence / limiting factor |
|---|---|---|
| 1,000 profiles | Comfortable | 9-query batch hydration (`candidates.ts`), prior 2k-candidate load test at 0.23s; landing is `force-dynamic` + 1 insert/view — trivial at this traffic |
| 10,000 | Fine with small work | Full-population hydrate+score per search (~tens of ms at 2k, linear); add LIMIT-at-query + cache landing stats; SQLite file in low GB — fine |
| 100,000 | Planned work, no rewrite | FTS5 for text search; score at query; demand panel full-scan; single-writer ceiling → move to libSQL/Postgres behind the existing repository seam (sync→async touches every repo — the one honest migration cost, documented) |
| Ops | Single Fly machine, no autoscale (correct for SQLite), manual deploys, **no logs** (S3), no backups configured for the volume (INFERRED from fly.toml/DEPLOY.md — add `fly volumes snapshot` schedule note) |

Scale is the *least* of this product's risks. Nothing here justifies infra work before 10k real profiles.

## 11. Ranked Risk Register

| # | Risk | Sev | Likelihood | Evidence | Consequence | Mitigation | Effort |
|---|---|---|---|---|---|---|---|
| R1 | Nobody completes a real profile (A2/A9) | **Critical** | Unknown — untested | `interest`=0; all 10 candidates internal | No business | Deploy + 20 DMs + funnel loop (§13) | days |
| R2 | Privacy promise breached at launch (S1/S2) | **Critical** | Certain if deployed as-is | VERIFIED code refs | Harm to a real person; thesis-level trust loss; ICO exposure | Gate `/profile` + employer auth on search before deploy | ~3h |
| R3 | Real users see fabricated matches/evidence (D1) | **High** | Certain on current surfaces | VERIFIED refs | Employers mistrust at the decision moment; candidates' work invisible | Repoint 3 surfaces to DB; truthful stats | ~4h |
| R4 | Marketplace loop dies silently (no email) | **High** | Certain beyond hand-carried N≈10 | 0 senders; dead reset module | Invites unseen; lockouts permanent; churn invisible | Decide D1(§14); Resend + reset UI + 2 notifications | ~1 day |
| R5 | Production blindness (S3) | High | Certain on first error | 0 log statements | Debugging real users impossible | logError + instrumentation hook | 2–3h |
| R6 | Mobile onboarding broken/awful | High | Likely (never opened) | No test ever run | Majority of candidate traffic bounces | Phone walk + top-3 fixes | ½ day |
| R7 | Employer side unvalidated (A3) | High | Unknown | 0 real employers | Candidate side starves (A7) | Concierge 3 real roles | days, no code |
| R8 | Test-confidence theatre (D2) | Med-High | Present | privacy-matching tests target mock engine | False security on the core promise | Retarget tests; delete mock engine | 2h |
| R9 | Founder capacity / bus factor | Medium | Structural | 18k LOC, 22 commits, 3 days, one person + AI | Velocity hides comprehension debt | CLAUDE.md/docs mitigate; coder review of CLAUDE.md first; keep freeze discipline | ongoing |
| R10 | Beachhead never chosen (A5) | Medium | High | vocabulary-implied only | Diffuse effort, slow liquidity | §14-D3 decision + A5 experiment | decision |
| R11 | Demo-population integrity at launch | Medium | Certain unless decided | Seeded people on "People already here" | "Fake users" perception contaminates honesty brand | Label seeds "Example profile" badge or founder-circle real profiles | 2h |
| R12 | Bleeding-edge stack regression | Medium | Occasional | Next16/React19/TW4/node:sqlite; @theme bite already | Random breakage eats founder days | CI (exists) + pin minors | done |
| R13 | GitHub import rate ceiling (S8) | Medium | On group demo | 60/hr/IP shared | Feature fails during NY demos | token or demo-day caching | 1–2h |
| R14 | Legal placeholders ship | Low-Med | Blocked visibly | bracketed CAPS + audit note | Unenforceable terms | Saturday checklist item (founder) | founder |
| R15 | Volume backup absent | Low | — | no snapshot config found | DB loss on volume failure | schedule snapshots; nightly `sqlite .backup` | 1h |

## 12. What Is Already Working Well (preserve these)

1. **Promises as structure, not prose:** no score column; `hidden` as schema default; comp-floor stripped at type level; contact release as a SQL join condition; import types that *cannot* carry capabilities. This is the company's actual moat-seed: an architecture an incumbent's incentives won't copy.
2. **The test culture is real:** mutation testing caught two of its own weak tests and a deploy-breaking migration; migration idempotency tests exist because of a real incident; CI failed twice on day one and both were genuine.
3. **Zero-dependency discipline:** 14 deps, no services, `npm ci` is onboarding. Burn ≈ £3/mo. For a solo founder this converts directly into runway and transferability (BC→personal laptop portability already proven).
4. **The documentation stack** (CLAUDE.md with bugs-behind-rules, strategy with refusals, DEPLOY with rejected alternatives, docs/context for account portability) — this is what makes the AI-velocity model auditable at all.
5. **Copy and empty states** — the "hard year" test applied consistently; decline button says "You never owe anyone a reason." Ship the tone unchanged.
6. **The learning instrumentation** — funnel, demand, portfolio signals — built *before* launch, which is the correct order even though it makes today's zeros embarrassing.
7. **Honest recent corrections** — lying import buttons removed, capability pre-ticking removed by deleting its step, cost figures corrected. The instinct to make the product tell the truth is the right instinct; this audit mostly extends it to three more surfaces.

---

## 13. Prioritised Action Plan

*(Effort assumes the current AI-assisted workflow. "Opus-implementable" = no human design decision required beyond approval.)*

### IMMEDIATE — next 48 hours (pre-deploy gate)

| Action | Why | Evidence | Effort | Impact | Opus? |
|---|---|---|---|---|---|
| 1. Gate `/profile/[slug]` for non-owners via `isCandidateVisibleTo`; hidden ⇒ 404 | S1 — policy currently false | profile page :40-52 vs privacy §visibility | 1–2h incl tests | Critical | Yes |
| 2. `requireEmployer()` on `/employer/search`, `/employer/roles/[id]`, `/employer/candidate/[slug]`; align privacy copy with honest blocklist limits | S2 | search page, discovery contract test | 1h | Critical | Yes |
| 3. Repoint role-page/candidate-page evidence + landing stats + ReviewStep to DB; truthful empty payoff | D1/R3 | refs in §5 | 3–4h | High — first real employer sees truth | Yes |
| 4. Retarget privacy-matching tests to `server/matching.ts`; delete mock engine, `lib/current-user.ts`, dead client-store halves | D2/D3/S6 | §5 | 2–3h | High — honest safety net | Yes |
| 5. Prod guard for passwordless demo accounts (S4) + logError helper + instrumentation (S5/S3-lite) | first-night safety | seed.ts:213-218; 0 logs | 2–3h | High | Yes |
| 6. **Phone walkthrough** (founder) then top-3 fixes | R6; twice-deferred | — | ½ day | High | Founder+Opus |
| 7. Saturday runbook unchanged (Fly, secrets incl. `DEMO_ACCOUNT_PASSWORD` *before first boot*, ICO, placeholders, DEMO_MODE off) | launch | DEPLOY.md | founder 2h | — | Founder |

### SHORT TERM — next 2 weeks (validation sprint; feature freeze otherwise)

1. **Decide §14-D1, then email:** Resend (or similar) + wire the existing `password-reset.ts` + verification + exactly two notifications (invite received / invite accepted). ~1 day. Unblocks R4 and experiment A7.
2. **Run A2:** 20 personally-targeted candidates → funnel readout → fix single worst step → second cohort. (Founder-led; Opus fixes.)
3. **Run A3 concierge:** 3 real roles from network, founder hand-matches, observe evidence-reading. No code.
4. Demo-population policy (§14-D2): "Example profile" badges or replacement by founder-circle real profiles. 2h.
5. Volume snapshot/backup schedule; `GITHUB_TOKEN` once the key-seal is broken anyway. 2h.
6. Mobile + reduced-motion visual pass on reveals. (visual)

### MEDIUM TERM — 30–90 days (gated on signals)

- Beachhead doubling-down per A5 result; capability vocabulary v2 *with* migration plan.
- Share-token links for hidden profiles (restores the "share my link" story S1 removes).
- Search: query-time scoring + FTS5 when >2k profiles. Employer notifications digest.
- Verification experiments only if A3-employers demand it. Pricing design only after first organic hire signal.
- Revisit sync-SQLite seam only on multi-instance need.

### DO NOT BUILD YET
ATS/API integrations · LLM matching/“deep research” on JDs · messaging beyond invite threads · mobile app · employer seats/billing infra · gamification layers · more landing-page polish · microservices/queues/Redis (no evidence will justify these before 10k profiles).

## 14. Top 10 Decisions the Founder Needs to Make

1. **D1 — Break the no-API-keys seal for email, yes or no.** Everything in R4 hangs on it. (Recommended: yes, one provider, this fortnight.)
2. **D2 — Demo-population policy at launch:** labelled examples, or real-people-only with visible thinness. (Recommended: label; honesty is the brand.)
3. **D3 — Pick the beachhead by name** — one community/segment for the first 100 candidates, chosen via A5, written into strategy.md.
4. **D4 — Profile-link semantics:** after S1, hidden = owner-only; decide whether shareable private links (tokens) are a launch-quarter feature or later.
5. **D5 — First-100 admission:** open signup Saturday vs invite-code cohorts (cohorts give cleaner A2 reads; recommended).
6. **D6 — What New York is for** (intros / design-partner employers / money) — determines demo script and which side's polish matters.
7. **D7 — Time split:** cap building at ~30% of the next two weeks; recruitment of real users is the constraint now.
8. **D8 — Human-coder engagement:** have them review CLAUDE.md + this audit §4 first; decide their standing role (reviewer vs builder).
9. **D9 — Blocklist honesty level in copy:** state plainly it protects against *named, honest* actors, not determined adversaries with fresh accounts.
10. **D10 — Kill-or-keep date for the thesis:** write down now what A2/A3 numbers by, say, 15 Nov would mean "pivot the wedge" — before the data arrives and motivated reasoning begins.

## 15. Final Verdict

**1. Three things I'd change immediately as CTO:** (a) the two privacy bypasses — S1/S2 — the same day, before any deploy; (b) evict mock data from real surfaces (D1) and delete the dead engine so tests guard production (D2); (c) stand up the minimum outbound channel — email — because every loop I traced dies without it.

**2. The assumption Christensen would challenge:** *that building a better marketplace is the same as finding the nonconsumers.* He'd point at the pipeline board and the saved-search pages and say: these serve people who already hire fine. The foothold — ten named humans whose titles bury them, one employer who hires one of them without a CV — appears nowhere in the data. The theory document is his; the usage table isn't.

**3. What Jobs would remove, simplify, rethink:** remove every fabricated moment (fake matches, fake stats, fake "people already here") — *"real artists ship, but they don't ship lies"*; simplify onboarding to hook → basics → one project → the score reveal, everything else after first value; rethink the employer entry as a single act — drop a JD, see real humans — and delete the three secondary employer pages until someone asks for them. He'd keep the drawings, the tone, and the coach, and he'd ship the phone experience before the animation.

**4. What would stop me investing today:** nothing about the code — the two defects are days of work and the foundation is above seed-stage bar. I would not write a cheque because there is **zero behavioural evidence** on any fatal assumption, the founder's distribution plan is one paragraph, and the moat is conditional on liquidity that hasn't started. I'd say: come back with 25 real completed profiles, 3 employer concierge sessions, and the funnel chart — that's two weeks and ~£5 away, which is itself the pitch.

**5. Single highest-leverage next build:** nothing new — the 48-hour integrity block (S1/S2/D1), because every future user interaction is downstream of the promises being true. First *new* capability after that: email.

**6. Time currently spent that won't contribute to PMF:** polishing the landing page (reveals, bands, colour) past "credible", expanding the employer suite, and — honestly — commissioning broad audits instead of putting the product in front of ten strangers. The marginal hour goes to recruitment of real users now.

**7. Is the foundation worth continuing with?** Unambiguously yes. The architecture is right-sized, the promises are structural, the tests are honest after D2, and the portability/burn profile is ideal for a solo founder. A redesign would be procrastination with better aesthetics.

**8. What must be proven before adding significant functionality:** A2 and A3 — twenty strangers where ≥8 finish a real profile, and three employers who read evidence and ask for a conversation. Until those numbers exist, every feature is decoration on an untested hypothesis.

---
*Labels: findings marked VERIFIED were confirmed in code/tests/DB during this audit; INFERRED are reasoned from verified evidence; UNVALIDATED require market testing. No metrics, users, or capabilities in this report are invented; where inspection was impossible (mobile rendering, animation feel, any real-user behaviour) that limitation is stated inline.*
