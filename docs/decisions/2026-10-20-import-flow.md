# The import desk learns to finish the job

**Date:** 20 October 2026 · **Decider:** the founder, after walking his own product and
getting lost in it. "It deploys it without adding any core competencies… even I'm getting
confused."

## What was actually wrong

Three separate defects had compounded into one bad experience:

1. **AI tag suggestions lived only in client memory.** They arrived in the server action's
   return value, were never stored, and died on the first reload. Every revisit showed bare
   drafts with 22 unchecked chips, so the AI's reading looked like it had never happened.
2. **Drafts rendered in the main work grid** alongside published work: cards with empty
   bursts, no tags, no Draft label at grid level. This read as "my imports were deployed with
   no competencies."
3. **Import gave no feedback while working.** The page sat still, then drafts appeared on top
   of it. No fetching state, no arrival moment.

## The decision that moves a boundary

Suggested tags are now **pre-selected** on draft cards, visibly marked as the AI's reading,
with "untick anything untrue" copy, and a **Publish all with their tags** button over the
desk. This overturns the unchecked-by-default rule of 18 October.

Why the overturn is safe where the original sin was not: the old suggester put the same two
generic tags on everything, so pre-ticking it WAS auto-declaration. Today's suggestions come
from the model reading each README or CV entry against a 22-tag taxonomy. The human-claim
moment moves from "tick each box" to "press publish with the tags in plain sight", which is
still a human, still explicit, still per-work.

What did NOT move, and is pinned by tests (tests/import-suggestions.test.ts):

- Suggestions live in their own table, `project_suggested_tag`. Scoring, matching and
  discovery never read it. A suggestion that exists produces zero capability.
- Nothing reaches `project_capability` except a human publish action.
- Publish still requires at least one tag standing; the batch action skips and reports
  drafts with none rather than force-publishing.
- Suggestions are deleted on publish; unticked ones die with them.

## Shipped alongside

- Staged loading screen for both imports ("Fetching your repositories… Reading the READMEs…
  Drafting your projects…"), drafts arriving together with a scroll to the desk.
- Drafts evicted from the work grid: they exist only at the import desk now.
- **JourneyGuide**: a numbered next-steps strip on the owner's page (add or import → review
  and publish N drafts → see your page as a company sees it → see matching roles), ticks
  derived from database state, no completion percentage anywhere.
- **?view=company**: the owner can render their own page exactly as a visitor sees it, with
  a banner and a way back. Presentation-only; the privacy gate still keys on true ownership.

## Parked

- The HubSpot-style inline page editor the founder sketched: real design work, not a patch.
  Revisit after the current journey survives contact with the Lovable testers.
- "Recommendations on how to approach a role" beyond the existing levers box on matches.
