# Context

Copies of the working memory an AI assistant built up about this project, kept in the repository
rather than only on one laptop under one account.

**Why this folder exists:** the original files live in
`~/.claude/projects/<project>/memory/` on a single machine, tied to a single Claude account. This
project is being built on a work account and may need to continue on a personal one. Code is
portable because it's in git; context isn't, unless it's put there deliberately.

If you're picking this project up on a different machine or account:

1. Clone the repo, `npm ci`, `npm run dev`. There is nothing else to install — no database service,
   no API keys. The database is created and seeded on first run.
2. Read [../../CLAUDE.md](../../CLAUDE.md) first. It's the rules, and each one has the bug that
   produced it attached.
3. Copy the `.md` files in this folder into the new machine's memory directory if you want the
   assistant to carry them automatically.

| File | What it holds |
|---|---|
| `MEMORY.md` | The index of the others. |
| `disruptajob-repo-and-push.md` | Where the repo is, and that pushing works. |
| `disruptajob-verification-habits.md` | How work on this project is expected to be verified. |
| `talent-pool-local-setup.md` | Local setup notes from an earlier version of the project. |

## What is deliberately *not* in the repository

- **`.data/disruptajob.db`** — the local database. Gitignored on purpose: it holds test accounts and
  is regenerated and seeded automatically on first run. Nothing in it needs to survive a move.
- **`.env.local`** — local secrets. There are currently none that matter; everything needed for
  development runs without configuration.

So a move is: clone, `npm ci`, `npm run dev`. Nothing else is lost.

## Running the dev server through Claude's preview pane

`.claude/launch.json` is gitignored because it contains an absolute path to one machine's Node
install. If the preview pane can't start the server on a new machine, recreate it — the only
unusual part is that Turbopack spawns child workers that don't inherit a shell PATH, so `node` has
to be put on PATH explicitly:

```json
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "disruptajob-dev",
      "runtimeExecutable": "/usr/bin/env",
      "runtimeArgs": [
        "PATH=/ABSOLUTE/PATH/TO/node/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin",
        "node",
        "node_modules/next/dist/bin/next",
        "dev",
        "-p",
        "3000"
      ],
      "port": 3000,
      "autoPort": true
    }
  ]
}
```

Find the path with `dirname $(which node)`. Plain `npm run dev` in a terminal needs none of this.
