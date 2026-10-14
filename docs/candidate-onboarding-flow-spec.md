# Candidate Onboarding & Evidence-Building Flow — Build Spec

## Context

Disruptajob's wedge user is someone whose job title undersells their real scope — a mistitled, multi-capability "do-er" (e.g. official title "Operations Associate" while actually doing ops + engineering + product). This population is structurally invisible to title/keyword-based tools like LinkedIn, Indeed, and most ATS, which is exactly the underserved segment the capability-graph model is built to surface.

Candidates are free forever; employers pay. That means this flow has no monetization pressure baked in — the only goal is maximum signal (real, evidence-backed capability data) for minimum friction. Current build priority is candidate-side only; employer-side search/matching is explicitly out of scope for this spec.

Today there is **no onboarding at all**. Profiles are seeded mock data. The only candidate-side creation mechanic is `AddProjectModal` (`src/components/profile/add-project-modal.tsx`), bolted onto an already-existing profile — and it has a real gap: it never assigns `capabilities` tags to new projects, so nothing a candidate adds through it can move their capability scores. Fix this as part of the build, not as a follow-up.

## Design principles (non-negotiable)

1. **Evidence-based, not self-declared.** Capability scores are only ever derived from tagged project evidence. Nothing a candidate types, uploads, or imports should move a score directly.
2. **CV and LinkedIn import may only populate background/context fields** (experience, education, title history) — never capabilities, scores, or evidence. If either shortcut became a path to a higher score, it undermines the platform's entire differentiation from a CV ("Claims are becoming cheap. Evidence matters more." — `src/components/landing/claims-section.tsx`).
3. **Private by default.** A profile is never discoverable to employer search just because it's complete. Discoverability is an explicit opt-in, and candidates can block specific companies (e.g. their current employer) by name/domain even after opting in.
4. **Everything past the hook and identity step is optional and skippable.** CV upload, GitHub connect, LinkedIn connect are accelerators, not requirements.
5. **Resumable, not a single-sitting wizard.** Candidates are free users with no urgency pressure — they should be able to bail mid-flow and pick up later without losing progress.
6. **Minimum viable profile is fast.** A candidate should be able to reach "one piece of tagged evidence + a visible capability bar" in well under the time it'd take to write a CV bullet point.

## Step-by-step flow

### 1. Hook
First screen is not name/email. It's a single open question:

> "What do you actually do that your job title doesn't capture?"

Paired with a trust line, since this is the moment someone decides whether to continue:

> "Private by default. Your current employer will never see this unless you choose to be found."

The answer becomes a draft headline/short-description later — editable, not final.

### 2. Minimal identity
Name, email, location, current job title, availability status. Nothing else. No CV requirement here.

### 3. Non-negotiables
Framed as the candidate setting terms, not filling out an application — reinforces the control/privacy tone from step 1.

- Role type / seniority open to
- Comp floor (private — used only for future match filtering, never shown to employers)
- Work arrangement (remote / hybrid / onsite + location constraints)
- 1-2 genuine deal-breakers, free text (e.g. "no on-call," "no 5-day RTO")

This is intent data, not proof data. It must live as its own section on `CandidateProfile`, separate from `capabilities[]`. Not matched against anything yet (no employer-side search exists) — just captured and stored for when it's needed.

### 4. Draft capability hypothesis
From the step-1 answer, show 3-5 proposed capability tags as empty/unscored bars. Framed as "here's what we think you're good at — now prove it," turning evidence-adding into completing a visible personal scoreboard rather than filling in a form.

### 5. Optional accelerators
All skippable. Each scoped narrowly per principle 2 above.

- **Upload CV (optional).** Drafts background fields only — experience, education, title history. Never touches capabilities or evidence.
- **Connect GitHub (optional).** Pulls repos in as *draft* project cards (title, description, README-derived summary). Nothing publishes until the candidate reviews, edits, and tags each one with capabilities. Reuse the trust language already established in `add-project-modal.tsx` ("we never fetch or run anything from the link") — extend it to "we only read metadata to help you draft; nothing is published until you confirm."
- **Connect LinkedIn (optional).** Same scope as CV — experience/education only. Do **not** pull the LinkedIn headline/title into the profile headline; that's the exact framing this product is trying to get away from.

### 6. First evidence
One project, manual entry or a reviewed/confirmed GitHub draft. Candidate must tag which of the step-4 capabilities this project demonstrates — this tagging is what should actually update `capabilities[].score`, closing the gap that exists in the current `AddProjectModal`.

### 7. Score reveal
Immediately after project #1, show the real capability bars attributed to that project. This is the core "aha" moment — proof the platform scores differently than a CV. Nudge (don't force) toward 2-3 total pieces of evidence, since a single data point isn't a credible score.

### 8. Background fill-in
Experience and education, pre-populated from CV/LinkedIn if connected in step 5, candidate reviews and edits. Official title stays visible but secondary to capability tags — visually reinforcing "your title undersells you" on the candidate's own profile.

### 9. Visibility gate
Last step before the profile can be found by employer search.

- Default state is **not discoverable**, even with a complete profile. Must be explicitly flipped to "open" or "selectively open."
- **Company blocklist**: free text / domain match field — "Hide my profile from these companies." Makes the privacy reassurance a mechanism, not just copy.
- Restate the trust line here, now specific: "Currently hidden from employer search. [N] companies blocked."

### 10. Ongoing loop
Onboarding is not one-time. Design a lightweight recurring nudge (e.g. on return visits: "shipped something new? add it") that re-enters step 6 directly. Retention depends on continual evidence, not a single wizard pass — this wedge user generates new evidence often.

## Data model changes implied

Current model is in `src/types/index.ts`. Notable implications for this flow:

- `CandidateProfile` needs a new, separate section for non-negotiables (step 3) — not part of `capabilities[]`.
- `CandidateProfile` needs a discoverability flag (distinct from `availability`) defaulting to hidden, plus a company blocklist field.
- `Project.capabilities: string[]` must actually get populated by the evidence-tagging step — today `AddProjectModal` always sets this to `[]` (see `src/components/profile/add-project-modal.tsx:91`), which is why capability scores can never move from candidate-added projects. This needs a real capability-tag picker in the project-add UI, and a score recalculation step wired to it.
- GitHub-imported draft projects need a "pending confirmation" state distinct from published projects, since nothing should go live before the candidate reviews it.
- CV/LinkedIn imports need a clear field-level boundary enforced in code (not just by convention) so they physically cannot write to `capabilities` or `Evidence`.

## Explicitly out of scope for this build

- Employer-side search, matching, or any use of the non-negotiables data against live opportunities — just capture and store it.
- Payment/credit/unlock logic for employers.
- Any OAuth/account infrastructure decisions beyond "GitHub connect" and "LinkedIn connect" as data-import sources — this spec does not prescribe auth architecture.
