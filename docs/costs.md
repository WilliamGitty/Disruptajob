# Costs

The complete money map, kept current in the same commit as the change that alters it — the same
rule the privacy page follows. If a new service is added anywhere in this codebase, its line
appears here or the PR is wrong.

## Fixed (as of 17 Oct 2026)

| What | Provider | Amount | Billed | Card | Renewal risk |
|---|---|---|---|---|---|
| Hosting (1 machine, 1GB volume, lhr) | Fly.io | ~£3/mo | Monthly, in USD | Chase | None — usage-billed |
| Domain disruptajob.com | Cloudflare | $10.46/yr | Annual, auto-renew | Chase | **If this card dies, the domain dies.** Renewal ~Oct 2027 |
| ICO data protection fee | ICO | £0 now | — | — | Becomes ~£52/yr when trading starts; retake self-assessment then |

Total fixed burn: **~£4/month**.

## Variable (the incremental ones)

| What | Free until | Then | What drives it | Cap |
|---|---|---|---|---|
| Email (Resend) | 3,000/mo, 100/day | $20/mo tier | Sign-ups, resets, invite notifications | Free tier hard-stops; nothing bills without an upgrade |
| AI drafting (Anthropic) | Prepaid credit only | ~£0.10 per GitHub import (≤6 repos enriched per run, bounded in code) | Candidates importing repos | **Set a monthly spend limit in the Anthropic console — do this before promoting the feature** |
| Fly bandwidth/compute | Generous included | Pennies per GB | Traffic | Single machine is itself the cap |
| GitHub Actions (CI, deploys, nightly backups) | Free | Free | Public repository: unlimited minutes | — |
| Cloudflare DNS, email routing, WHOIS privacy | Free | Free | — | — |

## Controls

1. **Caps live at the provider, not in our heads.** Anthropic console monthly limit (founder
   action, pending). Resend's free tier stops rather than bills. Fly is a fixed-size machine.
2. **One inbox.** All billing emails go to the personal Outlook (Fly currently still on the BC
   address — move it). Invoices get a mail folder, not a shrug.
3. **Monthly review, scheduled.** First of the month: read the Fly invoice, glance at Resend and
   Anthropic usage dashboards, update this file if anything moved. Fifteen minutes.
4. **No new service without a line here** and an argument in strategy §5b. The zero-dependency
   rule is also a cost-control rule: every external service this project doesn't use is a bill
   that cannot surprise anyone.

## Unit economics, for when they matter

A candidate costs ~£0 to serve (static-ish pages, one shared machine) plus ~£0.10 if they import
from GitHub with AI drafting. The paying side is companies; until they pay, total burn is a
coffee a month. The first invoice to a company changes this file's whole character — that's the
trigger for incorporation, the ICO fee, and real bookkeeping.
