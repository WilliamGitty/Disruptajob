---
name: disruptajob-verification-habits
description: "How William expects work on Disruptajob to be verified and recorded — tests, mutation testing, browser proof, CI, and decisions written down"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 522e9daa-11e4-47f6-a31b-f1378a359124
  modified: 2026-10-15T11:41:38.147Z
---

William expects work on Disruptajob to be *proved*, not asserted. Typecheck and tests passing are
not evidence a feature works — several bugs in that repo passed all checks while being broken end
to end, so drive the change in a browser before claiming it.

For anything touching privacy or data correctness, mutation-test it: break the rule deliberately
and confirm the suite goes red. Two tests there passed against deliberately broken code until this
was done.

**Why:** he is pre-launch, showing the product to real people, and a privacy bug could cost a user
their job. He also repeatedly asks "how do we make sure it's all recorded" — he wants durable
artefacts, not conversation.

**How to apply:** run `npm test`, `npx tsc --noEmit`, `npm run lint`, then exercise the flow in the
browser pane and report what was observed. Record *why* in the commit message, strategic decisions
(including declined ones) in `docs/strategy.md`, honest gaps in the README, and rules in
`CLAUDE.md`. CI runs on every push. See [[disruptajob-repo-and-push]].
