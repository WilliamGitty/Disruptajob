# Deploying Disruptajob

Everything in this repo is ready to deploy. What's left needs a card and an email address, so
it has to be you — about 15 minutes.

## Why not Vercel

The app stores its database as a **file on disk** (SQLite via `node:sqlite`). Vercel and Netlify
have ephemeral filesystems: the database would be wiped on every deploy and wouldn't reliably
survive between requests. So we need a host that gives a **persistent volume**.

Fly.io is configured here. Railway, Render or any VPS would work the same way.

## Cost

| | |
|---|---|
| Fly.io — 1 shared-cpu machine, 512MB, 1GB volume | **~£5/month** |
| Domain (.com) | ~£11/year |
| **Total year one** | **~£72** |

Nothing else is needed to be live. Email, payments and OAuth only matter once real people use it.

## Steps

1. **Install the CLI and sign up** (card required, won't be charged on the free allowance):
   ```
   brew install flyctl
   fly auth signup
   ```

2. **Pick a unique app name** — Fly names are global. Edit `app = "disruptajob"` in `fly.toml`
   to something free, e.g. `disruptajob-preview`.

3. **Create the app and its volume:**
   ```
   fly apps create disruptajob-preview
   fly volumes create disruptajob_data --size 1 --region lhr
   ```

4. **Set the secrets.** Pick one of two modes:

   **Demo mode — publicly readable.** Use this if you want to send the link to a person or an AI
   reviewer. Anyone can read the site; nobody can sign up, so no real personal data can enter it.
   ```
   fly secrets set DEMO_MODE=true
   fly secrets set DEMO_ACCOUNT_PASSWORD='pick-something'
   ```

   **Locked mode — password prompt on every page.** Use this if the site should be reachable only
   by people you've given a password to.
   ```
   fly secrets set SITE_PASSWORD='pick-something-long'
   fly secrets set DEMO_ACCOUNT_PASSWORD='pick-something-else'
   ```

   > Don't use `SITE_PASSWORD` if you want an AI to review the site. Claude and ChatGPT's browsing
   > tools can't answer an HTTP Basic auth prompt — they'll see a 401 and report the site as down.

5. **Deploy:**
   ```
   fly deploy
   ```

6. **Open it:**
   ```
   fly open
   ```
   You'll get `https://disruptajob-preview.fly.dev`. Browser asks for the site password first.

## Custom domain (optional)

Buy the domain anywhere (Cloudflare and Namecheap are cheapest), then:
```
fly certs add disruptajob.com
```
Fly prints the DNS records to add at your registrar. HTTPS is issued automatically.

## Before this can be genuinely public

The access gate exists because the site isn't ready to be open yet. Remove `SITE_PASSWORD` only
once all of these are true:

- [ ] Privacy policy and terms published
- [ ] Registered with the ICO as a data controller (~£52/year, legally required in the UK)
- [ ] Email verification on sign-up (needs a mail provider — Resend's free tier covers this)
- [ ] Rate limiting on sign-in and sign-up
- [ ] GDPR data export and account deletion
- [ ] `ALLOW_INDEXING=true` set, so search engines are explicitly invited rather than accidentally let in

## Backups

The database is one file on the volume. Fly snapshots volumes daily by default, but take your own
before anything risky:
```
fly ssh console -C "cat /data/disruptajob.db" > backup-$(date +%F).db
```

## Environment variables

| Variable | Purpose |
|---|---|
| `DISRUPTAJOB_DB` | Database file path. Set to `/data/disruptajob.db` in `fly.toml`. |
| `DEMO_MODE` | `"true"` shows the demonstration banner and closes sign-up. Safe to be public. |
| `SITE_PASSWORD` | Enables the site-wide password gate. Blocks AI browsers — see step 4. Unset locally. |
| `SITE_USER` | Username for the gate. Defaults to `preview`. |
| `DEMO_ACCOUNT_PASSWORD` | Password for the seeded demo accounts. Leave unset locally. |
| `ALLOW_INDEXING` | `"true"` lets search engines index the public pages. Anything else blocks all crawling. |
