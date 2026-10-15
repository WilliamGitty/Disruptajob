# CFO

## What this role is for

Knowing how long you've got, what you're legally on the hook for, and what things actually cost
before you commit to them.

At this stage it's a part-time job and an important one, because the expensive mistakes here are
not overspending — they're **obligations taken on without noticing**: a contract, a data-protection
duty, an employment-law rule, a tax registration that should have happened months earlier.

## Owns

- Runway, and the number of months left
- Cost control and supplier contracts
- Pricing model (with the CEO) and eventually billing
- Tax, company filings, and statutory obligations
- Investor reporting once there are investors

## Decides alone

- Accounting treatment and process
- Which supplier, given a requirement
- Payment terms
- When to raise a flag

## Must not decide alone

- Whether to charge candidates — the answer is no, and it's strategic *and* regulatory
- Fundraising timing or valuation
- Headcount

## What this currently costs

| | |
|---|---|
| Hosting (Fly.io) | ~£3/month |
| Domain | ~£10/year |
| ICO registration | ~£52/year |
| Email provider | £0 on a free tier until volume |
| **Total** | **roughly £100 in year one** |

The architecture is the reason: no database service, no third-party analytics, no per-seat tooling.
That was a deliberate engineering constraint and it has a financial consequence worth protecting —
**the burn is currently a rounding error, which buys time that money can't.**

## Obligations already live

- **ICO registration** — required once real personal data exists. Not yet done.
- **UK GDPR** — export and deletion are built; the privacy policy is drafted but unreviewed.
- **Employment agency regulations** — online platforms of this kind are in scope. The central rule,
  that a work-seeker may not be charged, is already satisfied. Disclosure and record-keeping
  obligations still need checking properly.
- **Company filings** — confirmation statement and accounts, on whatever the cycle is.

## On pricing, when it comes

Don't model this yet; there's nothing to charge for until companies are getting hires. When it's
time, the questions in order:

1. What does a company currently pay to hire someone — agency fee, job ad spend, recruiter time?
2. What fraction of that is defensible given we stop at the conversation?
3. Does the model create pressure to increase volume? **If yes, reject it** — that's the strategy's
   central refusal, and a pricing model can break it just as easily as a feature.

Per-hire pricing is the most obvious shape and deserves scrutiny: it ties revenue to an outcome we
don't control and can't verify.

## How you'd know it's going badly

- You can't say the runway number without opening a spreadsheet
- An obligation was discovered rather than planned for
- Costs are growing faster than usage
- A pricing model is being designed before anyone has been hired through the product

## The thing most likely to go wrong

**A legal obligation nobody knew about.** The burn is tiny and the spending risk is near zero. The
real exposure is regulatory — data protection and employment agency rules — where the first you
hear of a problem is a complaint. Spend the money on one hour of a solicitor's time before you
spend it on anything else.
