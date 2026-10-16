# Deploying Disruptajob

**Launched 16 October 2026.** Live at https://disruptajob.com — sign-up open, demo mode off.
This file is now two things: the record of what is set up (below), and the recipe to rebuild it
from nothing on a new machine.

## What is live, and where it's controlled

| Piece | Where | Account |
|---|---|---|
| App + database | Fly.io, app `disruptajob`, region lhr, 1GB volume | Fly account (to move off the BC email) |
| Domain + DNS | Cloudflare, zone `disruptajob.com` | personal Outlook |
| Outbound email | Resend, domain verified, region eu-west-1 | personal Outlook |
| Inbound email | Cloudflare Email Routing: hello@ -> personal Outlook; catch-all drops | personal Outlook |
| Code, CI, deploys | GitHub `WilliamGitty/Disruptajob` — push to main deploys itself | personal GitHub |

Secrets set on Fly: `DEMO_ACCOUNT_PASSWORD`, `RATE_LIMIT_SALT`, `ADMIN_EMAILS`,
`RESEND_API_KEY`, `EMAIL_FROM`. Local gitignored copies of the API tokens live in `.env.*`
files on the founder's machine; every one of them can be re-minted from its dashboard, so losing
the laptop loses nothing.

DNS on Cloudflare, all DNS-only (grey cloud): A/AAAA for apex and www to Fly's IPs; TXT
`resend._domainkey` + CNAMEs `rsend`/`send` for Resend; MX + SPF added by Email Routing.

## Why not Vercel

The app stores its database as a **file on disk** (SQLite via `node:sqlite`). Vercel and Netlify
have ephemeral filesystems: the database would be wiped on every deploy and wouldn't reliably
survive between requests. So we need a host that gives a **persistent volume**.

Fly.io is configured here. Railway, Render or any VPS would work the same way.

## Cost

| | |
|---|---|
| Fly.io — shared-cpu-1x, 512MB, 1GB volume | **~£3/month** |
| Domain — optional; `.fly.dev` is free and fine for a prototype | £0–11/year |
| **Total year one** | **~£36**, or ~£47 with a domain |

Email (Resend) adds £0 — the free tier (100 emails/day) is far beyond early needs. Payments and
OAuth still only matter once real people use it.

### Why not £0

Worth knowing what was ruled out, so it doesn't get relitigated:

| Option | Why not |
|---|---|
| **Vercel / Netlify free** | Ephemeral filesystem. The SQLite database is wiped on deploy and isn't shared between serverless invocations, so signing in as a candidate and then as an employer can hit different instances with different data — which breaks the one thing the demo exists to show. |
| **Vercel free + Turso** | Genuinely £0 and a good long-term answer. But `node:sqlite` is **synchronous** and the libSQL client is **async**, so every repository function and every page that calls one has to change. Two to four hours of refactoring to save £36 a year. |
| **Render free** | No persistent disk, and the instance sleeps — a cold start in front of someone you're trying to impress. |
| **Oracle Cloud Always Free** | Actually free forever and powerful enough. But you're administering a VM: Docker, a reverse proxy, TLS renewal, security updates. Fine if you want that; it is not the cheap option once your time counts. |

£3/month is roughly one coffee a quarter. Spend the hours on the product.

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

> Deploy order no longer matters here: in production, an account with no password cannot be
> signed into at all (enforced at sign-in, `server/credentials.ts`). Setting this secret is what
> makes the demo accounts *usable* in production, not what makes them safe.
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

## Deploys after the first one

You never run `fly deploy` again by hand. CI deploys `main` automatically once typecheck, lint,
tests and the production build pass — so a change merged from any machine, including a Claude
Code session on a phone, is live about four minutes later. This needs one secret in GitHub
(repo Settings → Secrets and variables → Actions): `FLY_API_TOKEN`, a deploy-scoped token that
can release this one app and nothing else. Create a fresh one anytime with
`flyctl tokens create deploy -a disruptajob`.

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
- [x] ICO position settled — their self-assessment (run 16 Oct 2026, answer: not yet trading)
      says no fee is due pre-trading. **Retake it the week commercial activity starts**; the fee
      is then ~£52/year. Fee-exempt is not law-exempt: UK GDPR applies regardless, which is what
      the privacy policy, export, deletion and retention code are for.
- [ ] Email verification on sign-up — **built**; needs `RESEND_API_KEY` set (see Email below)
- [ ] Rate limiting on sign-in and sign-up
- [ ] GDPR data export and account deletion
- [ ] `ALLOW_INDEXING=true` set, so search engines are explicitly invited rather than accidentally let in

## Email (Resend)

Password reset, sign-up verification and invite notifications are wired and send through Resend.
Without a key everything still works — sends become stderr log lines — so this is only needed
when real people should actually receive mail.

1. Create an account at resend.com (free tier: 100 emails/day, 3,000/month).
2. Create an API key (Sending access only) and set it:
   ```
   fly secrets set RESEND_API_KEY='re_...'
   ```
3. **Test mode:** that alone sends from `onboarding@resend.dev`, which Resend only delivers to
   your own account email — enough to prove the loop end to end, useless for real users.
4. **Real mode:** verify a domain you own in Resend (Domains → Add, add their DNS records), then:
   ```
   fly secrets set EMAIL_FROM='Disruptajob <hello@yourdomain.com>'
   ```
   This is the step that makes sign-up verification and password reset work for strangers — do it
   before opening sign-up, or recovery emails to real users will silently not arrive.

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
| `RESEND_API_KEY` | Enables real email delivery. Unset, sends are logged to stderr and every flow still completes. |
| `EMAIL_FROM` | Sender address, once a domain is verified in Resend. Defaults to Resend's test-only address. |
| `APP_URL` | Where links in outbound email point. Set in `fly.toml`; defaults to localhost in dev. |
