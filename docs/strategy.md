# Strategy

Written in the frame of *The Innovator's Dilemma*. The purpose of this document is to make the
thesis falsifiable — if the assumptions below are wrong, we should find out cheaply and change
course rather than discover it in year three.

---

## 1. The job to be done

People don't buy products; they hire them to make progress in a particular circumstance.

**The candidate's job is not "find a job."** Job listings are abundant, free and one search away.
Nobody is underserved on listings.

> **The job is: "Help me be judged on what I can actually do, not on how my work compresses into
> a CV."**

The circumstance that triggers it is specific and emotional: *I have done good work, I cannot get
anyone to look at it, and I'm starting to believe the problem is me.*

**The company's job is not "post a vacancy."** It's:

> **"Help me tell, before I've spent three weeks, whether this person can actually do the work."**

Both jobs are about **signal**. Neither is about volume. That matters, because every incumbent in
this market competes on volume.

### What they currently hire instead

| Job | Current solution | Why it's unsatisfying |
|---|---|---|
| Be judged accurately | CV + cover letter | Compresses three roles into one title. AI made polish free, so polish stopped signalling. |
| | LinkedIn profile | A CV with a photograph. Still title-led. |
| | Referrals | Works, but is rationed by who you already know — which is the privilege filter we claim to dislike. |
| Judge accurately | CV screening | Judges the document, not the work. |
| | Take-home tests | Real signal, but expensive, late in the process, and resented. |
| | Interviews | Measures interview performance. Correlates weakly with the job. |

**The non-consumption insight:** the most underserved candidate has *stopped hiring any of these*.
They've concluded applying is pointless. They are not a LinkedIn user we must win — they are
someone doing nothing, which is a far easier competitor to beat.

---

## 2. What kind of disruption this is

**New-market disruption**, not low-end.

Low-end disruption takes the least profitable customers with a cheaper, worse product. That isn't
us — we're not a cheaper job board.

New-market disruption competes against **non-consumption**: it makes something possible for people
who previously went without. The mistitled operations person who stopped applying is consuming
nothing today. We're not taking share from LinkedIn at the start; we're creating a transaction
that wasn't happening.

### The performance trajectory

Incumbents have been improving on an axis that stopped mattering:

```
            more applicants, faster, cheaper per application
Indeed      ──────────────────────────────────────────────▶  (over-served)
LinkedIn    ──────────────────────────────────────────────▶

            ability to tell who can actually do the work
Everyone    ──────────                                        (under-served)
```

AI accelerated this. When anyone can generate a flawless application in seconds, **more
applications makes the problem worse, not better**. Incumbents are now improving the thing their
customers most want less of. That is the classic precondition for disruption.

---

## 3. Why incumbents cannot follow

They could build it. They will not adopt it.

| Incumbent | Revenue mechanism | What adopting us would cost them |
|---|---|---|
| **Indeed** | Pay-per-application / pay-per-click on listings | "Don't apply" removes the billable event entirely. |
| **LinkedIn** | Recruiter seats priced on search and InMail volume | Our model reduces outreach volume and raises its quality. Lower volume, lower price. |
| **ATS vendors** (Greenhouse, Workday) | Per-seat software for managing application pipelines | We argue the application shouldn't exist. Their product *is* the application. |
| **Agencies** | % of placement, margin from information asymmetry | Public evidence destroys the asymmetry they're paid for. |

This is Christensen's **asymmetric motivation**: the disruptive move is rationally unattractive to
the incumbent precisely because their current business is healthy. A capable product manager at
LinkedIn will correctly kill this proposal. Our protection isn't that they can't see us — it's
that seeing us clearly makes it worse for them.

**Corollary: the moat is the business model, not the technology.** Any competent team can build
capability tagging. Almost none can afford to tell candidates to stop applying.

### The thing that would actually threaten us

Not LinkedIn shipping a feature. A **new entrant with no application revenue to protect** — a
GitHub-for-everyone-else, or a portfolio platform moving into hiring. We should watch for that,
not for incumbent feature announcements.

---

## 4. The foothold, and the march up-market

Disruption starts in a segment the incumbent is happy to lose.

**Foothold (now): the mistitled multi-capability operator.**
Officially "Operations Associate"; actually runs ops, builds the automations and owns part of
product. Structurally invisible to title and keyword search. Low value to LinkedIn's recruiter
product because they don't match the searches recruiters run. Perfect: badly served by incumbents,
and uninteresting to defend.

**Why this segment specifically**

1. They have evidence — they build things — so our product has something to show on day one.
2. Their pain is acute and self-attributed, which makes them willing to try something new.
3. They are *already* being failed, so our bar is "better than nothing", not "better than LinkedIn".

**The march up-market**, in order:

1. Mistitled operators and generalists *(now)*
2. Any role where proof exists but titles mislead — internal tools, growth, data, design engineering
3. Early-career people with projects but no track record — *this is where we beat referrals, and
   it's the biggest market*
4. Senior hires, where references currently do this job expensively and slowly

Each step reuses the same machinery and is only reachable once the evidence corpus is dense enough
to be worth searching.

---

## 5. What this strategy forbids

A strategy that forbids nothing isn't a strategy. We will not:

- **Sell job postings.** The moment listing revenue exists, we're incentivised toward volume and
  we become the thing we're disrupting.
- **Charge candidates.** Supply is the scarce asset and the moral centre of the product. Free
  isn't generosity, it's strategy.
- **Add one-click apply.** It is the single most requested feature we will ever refuse. It
  recreates the volume problem exactly.
- **Rank by anything a candidate can self-declare.** The moment a score can be gamed by typing,
  the signal is gone and we're a CV with extra steps.
- **Make candidates discoverable by default.** The privacy promise is what makes an employed
  person brave enough to publish work. Breaking it once breaks it permanently.

### 5a. The job board question, settled

Asked directly in October 2026: *should companies showcase their open jobs, and should candidates
get an AI-matched feed of roles they'd suit?*

**The first half is a no, and it's the same no as above.** A board makes the candidate browse and
apply. That returns them to being an applicant — the precise dynamic that has them eleven months
into a search feeling invisible — and it puts us back in the volume business we exist to leave.
It would also hand incumbents a fight on their own terms, which is the one fight a new entrant
cannot win.

**The second half is more interesting and nearly right.** "Roles you'd suit, matched from your
portfolio" is a feed with an apply button at the end of it, however it's dressed. But the demand
signal underneath it is real, useful, and ours alone — nobody else can compute it, because nobody
else holds evidence-tagged work on both sides.

So we show the demand and remove the application. A candidate sees how many companies have
described work they can evidence, which capabilities are being asked for, what's in demand that
they haven't evidenced — and, the number that matters, **how many of those companies currently
cannot see them**. That last one turns visibility from an abstract setting into a concrete,
reversible decision.

Two actions follow, neither of which is an application: add evidence, or open up. See
`server/repositories/demand.ts`.

This is also our answer on gamification. Streaks, badges and completion percentages are what a
product invents when it has no real feedback to give. We have real feedback.

---

### 5b. The zero-API-key seal, broken once, deliberately

From the first commit this codebase ran with no external services at all — no ORM, no database
host, no keys — so it could be handed to anyone and run anywhere. In October 2026 that seal was
broken exactly once, for email (Resend), because opening sign-up to real people without password
recovery and address verification would be irresponsible, and both require delivery. The terms of
the breach: no SDK (the API is one `fetch`), everything degrades to a logged no-op when the key is
absent so `npm ci && npm run dev` still works on a bare machine, and plain-text messages only — a
product whose pitch is "nobody is watching you" does not send HTML with tracking pixels. Any
further external service gets argued about here first.

The second break came later the same month, also argued here first: Claude, for drafting.
The founder asked for AI layers; the constraint that survived the argument is **AI drafts,
humans claim, evidence scores**. The model reads a GitHub README and proposes a write-up and
up to three capability tags from the fixed taxonomy; the person edits the words and the tags
render unchecked — a suggestion that is never ticked never existed, because a pre-ticked box
clicked past is a declared capability in disguise (the hypothesis step died for this). Matching
itself stays deterministic and explainable on purpose: an employer asking "why this person?"
gets pointed at actual work, and an opaque ranking model would trade that answer for a score
nobody can defend. Same degradation rule as email: no key, no behaviour change.

### 5c. Calm is a feature, discovered in the field

On 18 October 2026, a 24-year-old tester handed over her LinkedIn and mentioned she had
deleted the app because it stressed her out. Not switched away from: fled. The incumbent's
emotional price is the feed of other people's promotions, the comparison engine, the
always-on performance of professional self. She is the supply side this product wants most,
and she is a nonconsumer for emotional reasons, not functional ones.

What this names is a differentiator we built by principle and never sold: no feed, no
streaks, no completion percentages, hidden by default, "one message when it's worth your
time", "you never owe anyone a reason". The positioning sentence her behaviour wrote:
**the job tool that doesn't make you feel behind.**

What this binds: any future feature that borrows engagement mechanics from social
platforms (feeds, activity indicators, comparison surfaces, streaks) is not just off-brand,
it is off-strategy, because calm is part of what the supply side is choosing us FOR. The
design principles already forbade pressure out of decency; this section forbids it out of
positioning. Decency and strategy agreeing is worth writing down.

## 6. Objectives and key results

Deliberately leading indicators. Revenue is a lagging measure of whether the two below are true.

### O1 — Prove that evidence beats CVs for the underserved candidate

The whole thesis in one objective. If this fails, nothing else matters.

| KR | Target | Why this measure |
|---|---|---|
| KR1.1 | 60% of candidates who start onboarding publish ≥1 tagged project | Below this, the ask is too heavy and the product is a worse CV. |
| KR1.2 | 40% of profiles reach ≥3 pieces of evidence within 30 days | One project is an anecdote. Three is a signal. This is the real activation point. |
| KR1.3 | 25% of discoverable candidates receive ≥1 approach in 60 days | The promise is "get discovered". This measures whether we keep it. |
| KR1.4 | ≥50% of candidates report their profile represents them better than their CV | The job-to-be-done, measured directly. Survey, n≥30. |

### O2 — Prove that companies will pay for proof over volume

| KR | Target | Why this measure |
|---|---|---|
| KR2.1 | 70% of companies describe ≥1 real piece of work instead of a job description | If they won't, the premise that companies want signal is wrong. |
| KR2.2 | Median time from search to first conversation < 48 hours | Our speed claim against a 3-week screening cycle. |
| KR2.3 | ≥30% invite→accept rate | Below ~10% we're spam with better typography. |
| KR2.4 | 3 companies paying anything at all | Willingness to pay, not price optimisation. Price comes later. |

### O3 — Keep the promise that makes supply possible

Not a compliance checkbox. Break this and supply evaporates.

| KR | Target | Why this measure |
|---|---|---|
| KR3.1 | Zero incidents of a hidden or blocking candidate appearing to a company | The one unrecoverable failure. A candidate could lose their job. |
| KR3.2 | 100% of privacy rules covered by automated tests | Currently **0%**. The highest-leverage engineering work outstanding. |
| KR3.3 | Private comp floor never rendered to an employer | Enforced at the type level today; must stay that way. |
| KR3.4 | ≥20% of candidates actively use a blocklist or hidden mode | Proves the control is real and used, not decorative. |

### O4 — Don't die of the boring things

| KR | Target |
|---|---|
| KR4.1 | ICO registration complete before the first real user |
| KR4.2 | Legal opinion obtained on employment-agency regulations before taking money |
| KR4.3 | GDPR export and deletion shipped before public launch |
| KR4.4 | Fairness review of capability scoring before 1,000 profiles |

---

## 7. The assumptions most likely to be wrong

Listed in order of how much damage they do if false.

1. **That candidates will write up their work.** This is the whole supply side and it is real
   effort. If activation (KR1.1) comes in under 30%, the thesis needs rethinking, not more
   marketing. *Mitigation: make the first project as small as possible; one is enough.*

2. **That companies trust evidence more than interviews.** They may say they want signal and
   still behave conventionally. *Watch KR2.1 — it's the honest test.*

3. **That written-up work is a fair measure.** It may correlate with having spare time and
   confidence, which would rebuild the privilege filter we set out to remove — in a more
   defensible-looking form. *This is the most serious ethical risk in the product and KR4.4 exists
   for it.*

4. **That capability tags are a rich enough vocabulary.** Twelve tags may be too coarse to
   separate people once there are thousands of profiles.
