# Visual identity

Editorial, paper-coloured, deliberately quiet. It should look like something that respects your
attention rather than competes for it — the opposite of every hiring product, which all look like
software demos.

## Colour

Defined once in `src/app/globals.css`. **Never hard-code a hex value in a component.**

| Token | Role |
|---|---|
| `--paper`, `--paper-dim` | Backgrounds. Warm off-white, never pure white. |
| `--ink`, `--ink-soft`, `--ink-faint` | Text, descending emphasis. |
| `--accent` | A burnt red. **One thing per view** — the single important action, or the one piece of risk. Used twice, it marks nothing. |
| `--evidence` | A quiet green. Proof, confirmation, things that are true. |

`--evidence` exists because the product has a concept the palette should know about: something
backed by real work has to look different from something merely asserted.

**For marketing:** the accent is the only colour that may appear large. Everything else is paper
and ink.

## Typography

- **Serif display** for headlines. Editorial, not corporate — it signals "something to read".
- **Sans** for everything else.
- Generous line height, generous whitespace, a measure of roughly 65–75 characters.
- No Title Case. No all-caps except small tracked eyebrow labels.

## Illustration

**The illustration is the argument.** Every drawing states something. The hero shows a job title as
a small closed box sitting on top of everything it hides — that *is* the thesis, not a picture next
to it.

Hand-authored SVG, so it reads CSS variables and can never drift from the palette.

**What we don't do:** stock photography, smiling people at laptops, abstract gradient blobs,
3D illustration, AI-generated hero images. Decoration is what you reach for when the idea isn't
strong enough to show.

*Note: this is a deliberate position, not a budget constraint. If you decide warmth needs
photography, change it here first — and then change the product, so the two agree.*

## Logo

The wordmark is "Disruptajob" set in the serif display face. The mark is a pair of scissors —
cutting the paper. Don't stretch it, don't add a gradient, don't put it on a busy photograph.

## What it should feel like

| It is | It isn't |
|---|---|
| A well-set page | A SaaS landing page |
| Calm | Energetic |
| Confident | Loud |
| Printed | Rendered |

## Applying it off-product

- **Slides:** paper background, one idea per slide, serif headline, accent on one word. No bullet lists of five.
- **Social:** text on paper beats any graphic. The product's own illustrations are the best asset you have.
- **Email:** plain text, left-aligned, no header image, no template chrome. It should look like a person wrote it.
