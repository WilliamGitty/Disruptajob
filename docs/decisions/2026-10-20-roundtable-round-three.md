# Round-three tester feedback: the roundtable's rulings

**Date:** 20 October 2026 · **Convened:** Christensen, Galloway, Jobs, Blank, Dorf, plus the
officer personas and the Copywriter. **Trigger:** three testers (structured review, stream of
notes with screenshots, and a set of academic-style questions) converging on the same findings.

## The headline finding

A friendly, smart tester described the product as "uses AI to analyse candidates' CVs and
identify their key strengths": the exact mechanism the one rule forbids, and the villain of our
own positioning. Desire landed ("hopefully I'll never submit another CV in my life") while the
mechanism inverted. Ruled a copy-architecture failure, not a product one.

## Shipped on the founder's go (this commit and its siblings)

- Signed-out header overlap at 430 to 560px: fixed (bug, shipped before the roundtable ended).
- A flat denial where the suspicion forms: hero bullet "No AI rates you. Companies read the
  work itself." The denial deliberately does NOT lead the page (Hopkins: never open with a
  negative); it sits under the button.
- Plain-pass rewrite of every tester-highlighted passage: hero body, /why top to bottom, the
  About mechanism paragraphs, the guides intro. "Published work" is now defined in plain words
  at first use on each page that leans on it.
- "Create an account" is a solid accent button. A ghost button on the one action that matters
  was false modesty (Jobs, Galloway, unanimous).
- Five FAQ entries from the academic's questions, answered without flinching, including the
  honest concession on work without artefacts (the mechanism description IS the evidence).
- The Copywriter's banned list gains a mechanical rule: any sentence a reader must reread is
  rewritten; colon-list openers are out.
- Every mention of AI drafting now carries its contract in the same breath: drafts for you to
  edit and own, never to score you.

## Pass condition (Dorf)

The rewrite is an experiment, not a fix. Of the next five cold testers asked "what do you think
this site is for, in your own words": three or more describe the model correctly (you publish
real work; companies read it; no AI rating) and the copy passes. Two or fewer, and the problem
is page architecture, not sentences; stop sanding and restructure.

## Parked, with triggers

- **Rename.** One tester wants shorter; another likes it; renaming pre-traction burns the
  domain, the LinkedIn page and the banner on a coin flip. Revisit at 1,000 real users, or
  earlier if real users audibly stumble saying it.
- **Persona-split navigation** (separate sites for companies/candidates): declined as
  furniture. The complaint underneath (whose page is this?) was adopted: /why now opens by
  saying who it is for, with the employer door linked.

## Escalated to the founder, outranking all of the above

1. **Five founder interviews** (Blank, seconded by Christensen): the demand-side hypothesis,
   that companies will search evidence and reach out, remains untested after three rounds of
   supply-side polish. Formally noted as the company's biggest risk.
2. **ICO registration**: team/README's own trigger ("required once real personal data exists")
   has fired; real testers' personal data is now in the database. Roughly £40 to £60 a year,
   registered online by the data controller, who is the founder.
3. Check the funnel's assistant log: three testers hit confusion the Ask widget exists to
   catch; whether they used it tells us if it is discoverable at the moment of confusion.
