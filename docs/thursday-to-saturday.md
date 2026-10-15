# Thursday → Saturday

Saturday is for the live things — Fly, ICO, the legal entity, flipping sign-up on. Everything
before it is work that costs nothing and needs no keys. This is the ordered list.

## Where it stands at the end of Thursday

Shipped today, all tested and verified in a browser:

| | |
|---|---|
| **Portfolio feedback** | A candidate now gets a band and two specific, ordered actions. Bands can't be reached by writing more words — "strong" requires results a stranger can believe and proof they can open. |
| **"What your CV never mentioned"** | Fourteen questions, biased toward work the person hasn't evidenced. Choosing one tags nothing: it hands the question to the project form so the answer arrives as evidence. |
| **Drag-and-drop job description** | A company drops the JD it already has. Duties become draft work examples, the wish-list is left on the floor, salary and location are pulled out. Nothing is tagged without a human. |
| **Reach out, with a follow-up choice** | Here, email, or ATS. Contact details are released only on acceptance — that's what makes the privacy promise real rather than decorative. |
| **Demand without a job board** | "4 companies described work you can evidence. 3 of them can't see you." No apply button. See [strategy §5a](strategy.md). |
| **Measurement, capture, proof** | First-party funnel in SQLite, an email field for the not-ready visitor, and a real profile above the fold. |
| **Legal + security** | Privacy policy, terms, rate limiting, GDPR export and deletion, retention that the code actually enforces. |

116 tests. Two bugs found by writing them: session tokens that never expired, and a migration that
would have broken every fresh install — including Saturday's deploy.

---

## Friday — the day before going live

Ordered so that if you only get through three, they're the right three.

### 1. Walk both journeys on your phone (60–90 min)
Not a code task, and the most valuable thing on this list. Candidate onboarding is nine steps and
has never been used on a 390px screen by someone standing up. Do it as if you were the person it's
for: title that undersells you, no CV to hand, slightly sceptical.

Write down every place you hesitate. Those notes are Friday's actual backlog.

### 2. Fix the three worst things you found (2–3 hrs)
Three, not thirty. The ones where you hesitated, not the ones that are ugly.

### 3. Seed one genuinely good company example (45 min)
Half the people you show this to will be hiring, not job-hunting. They need to see their own side
working: a real-sounding role, real work examples, real matches. Use the JD drop to build it — it
demonstrates the feature and populates the demo in one go.

### 4. Write the 90-second path and rehearse it (45 min)
Land → one real profile → the capability → the project behind it → "and companies search this, not
keywords" → the JD drop. Out loud, from a cold phone, until it needs no apology.

### 5. If time remains: the staleness nudge
Evidence has no age on it yet. "Your last project was eight months ago" is the one piece of
feedback the portfolio coach can't currently give.

---

## Saturday — the live things

Yours, in this order. Roughly two hours, most of it waiting.

1. **`fly deploy`** — app, volume, secrets. ~£3/month.
2. **Set the secrets**: `ADMIN_EMAILS` (so `/funnel` opens for you), `RATE_LIMIT_SALT`, and
   `DEMO_MODE=true` for now.
3. **ICO registration** — the online form, ~£52/year.
4. **Fill the placeholders** in `/privacy` and `/terms`: legal entity, company number, registered
   address, contact email, liability cap. They're bracketed and capitalised so they can't ship by
   accident.
5. **Turn `DEMO_MODE` off.** Sign-up opens. This is the moment it becomes a product.
6. **Ten people, personally.** Not a launch. Ten individual messages to people whose title
   undersells them. Watch at least three of them use it and say nothing while they do.

## What deliberately isn't here

- **An article system.** No readers, no distribution, nothing to say that isn't theory. Revisit
  when there are forty real profiles and a piece only you can write.
- **A brand book.** [docs/design-principles.md](design-principles.md) already is one.
- **Email sending.** Needs a provider and a domain reputation. The interest list can wait.
- **Paid tiers.** Nothing to charge for until companies are getting hires. Free for everyone until
  then is a decision, not a delay.
