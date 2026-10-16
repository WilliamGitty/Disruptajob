---
name: disruptajob-repo-and-push
description: "Disruptajob repo location, that pushing works, and that William wants commits pushed as they are made"
metadata: 
  node_type: memory
  type: project
  originSessionId: 522e9daa-11e4-47f6-a31b-f1378a359124
  modified: 2026-10-15T11:41:45.731Z
---

Disruptajob lives at `github.com/WilliamGitty/Disruptajob` (public, note the capital D — it was
renamed from `disruptajob` on 15 Oct 2026 and the local remote was updated to match).

**`git push origin main` works.** Early in the 15 Oct 2026 session the safety classifier denied
`ssh-keygen`, `git remote add` and `git push`, so William ran them himself — but that restriction
did not persist, and I spent most of that session wrongly repeating "push is blocked for me"
without retrying. Twelve commits piled up as a result. Try the command before claiming it is
blocked.

**Why:** he set the repo up so his coder can review the work, and unpushed commits are invisible
to that person.

**How to apply:** push after committing rather than leaving it to him, and if a command was refused
earlier in a session, re-test rather than assuming it is still refused. See
[[disruptajob-verification-habits]].
