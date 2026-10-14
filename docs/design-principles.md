# Design principles

The rules this interface is built on. Written down so they can be argued with, and so the next
person to touch it knows which choices were deliberate.

---

## 1. The illustration is the argument

Every drawing in `src/components/illustrations/` states something. The hero shows a job title as a
small closed box sitting on top of everything it hides — that *is* the company's thesis, not a
picture next to it.

**What we don't do:** stock photography, smiling people at laptops, abstract blobs. Decoration is
what you reach for when the idea isn't strong enough to show. If a drawing can be removed without
losing meaning, remove it.

**Why hand-authored SVG:** no files to download, sharp at any size, and it reads CSS variables so
it can never drift from the palette. It also means no asset pipeline and no third-party service —
consistent with the rest of the build.

## 2. Specific beats general

"Applying for months" is wallpaper. "Two hundred applications. Four replies." is a sentence
someone recognises themselves in.

Numbers, named things and concrete nouns everywhere. The product's whole argument is that
specifics beat summaries — the copy should behave the way the product does.

## 3. Write to one person, in their words

Not "talent". Nobody has ever described themselves as talent. The navigation says *Who's
interested*, not *Opportunities*, because that's what receiving an approach feels like.

Test for any string: **would you say this out loud to someone who's had a hard year?** If not,
rewrite it.

## 4. Warmth matters most where people feel worst

The empty states earn more care than the marketing pages. An empty inbox is where someone eleven
months into a job search feels the worst, and a bare "No results" is quietly cruel in that moment.

Every empty state should: say the state is **normal**, explain **why** it's empty, and offer **one**
thing to do about it. The illustrations there are deliberately calm rather than sad — a tray
waiting, a shelf with room on it.

## 5. Never pressure, never guilt

These are free users who owe us nothing. The evidence nudge **snoozes for a week** rather than
dismissing permanently, and nothing in the product nags. Declining an invite says *"You never owe
anyone a reason."*

A product built for people who've been treated badly by hiring cannot itself be pushy.

## 6. The interface should make the privacy promise feel true

Visibility controls come **first** on the settings page, not buried under profile fields. Burying
them would be its own kind of dark pattern.

Copy about privacy is always concrete about the mechanism: not "we respect your privacy" but
"they're never told you blocked them".

## 7. Two doors, labelled by intent

The landing navigation says *I'm looking for work* and *I'm hiring* — what the visitor is here to
do, not our internal nouns. Anyone should know within a second which half of the page is theirs.

## 8. Restraint is the house style

Editorial, paper-coloured, thin rules, one accent used sparingly. The accent (`--accent`, a burnt
red) marks **one** thing per view — the single important action or the one piece of evidence worth
noticing. Used twice, it marks nothing.

Serif display for headlines, sans for everything else. Generous whitespace. No shadows, no
gradients, no rounded-everything.

---

## Palette

Defined once in `globals.css`. Never hard-code a hex value in a component.

| Token | Role |
|---|---|
| `--paper`, `--paper-dim` | Backgrounds. Warm, not white. |
| `--ink`, `--ink-soft`, `--ink-faint` | Text, in descending emphasis. |
| `--accent` | One important thing per view. Also the colour of risk. |
| `--evidence` | Proof, confirmation, things that are true. Green, used quietly. |

The `--evidence` colour exists because the product has a concept the palette should know about:
something backed by real work looks different from something merely asserted.
