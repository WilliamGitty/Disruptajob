---
name: talent-pool-local-setup
description: How to run the Disruptajob app locally, and where its code and deploy config live
metadata:
  node_type: memory
  type: project
  originSessionId: 522e9daa-11e4-47f6-a31b-f1378a359124
---

Running Disruptajob locally at `~/Documents/Disruptajob`:

1. Node 22 or later is required — the app uses `node:sqlite`, which ships with Node 22.
   Installed here via nvm (`nvm install 22`).
2. `npm ci` then `npm run dev`.
3. Open **http://localhost:3000** (not 3001 — the `dev` script is plain `next dev`).

Notes:
- The SQLite database is created and seeded automatically on first run at `.data/disruptajob.db`.
  No extra setup command. Deleting that folder resets to the demo population.
- Sign in at `/signin` as `will@example.com` (candidate) or `hiring@meridianrobotics.com`
  (employer). No password locally.
- A schema change needs a **server restart** to apply: the database handle is cached on
  `globalThis` across hot reloads, so migrations don't run on a hot reload alone.
- In a fresh terminal, `npm` may not be found until nvm loads — run `source ~/.zshrc` first.

Code is on GitHub at **github.com/WilliamGitty/disruptajob** (public), pushed over SSH as
`WilliamGitty`. Deployment is configured for Fly.io but not yet deployed — see `DEPLOY.md` in the
repo for the runbook, costs (~£5/month) and the go-live checklist. The repo README carries an
honest "State of the build" section listing what's still missing.
