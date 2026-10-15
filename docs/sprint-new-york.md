# Sprint: Thu 15 — Thu 29 October

Two weeks, ending with a trip to New York where the point is to **show people this**.

## What "done" means

Not "more features". Three things, in this order of importance:

1. **It's live and a stranger can use it on their phone, in a bar, in thirty seconds.** A laptop
   demo on localhost is a different and much weaker conversation.
2. **Real people have used it.** Twenty real profiles beats two hundred seeded ones. It changes
   the sentence from "here's what it would do" to "here's what happened when people did it".
3. **You can answer "how's it going?" with numbers.** `/funnel` exists now. By NY it should have
   real traffic in it, and you should know your own drop-off step by heart.

Everything below serves one of those three. Anything that doesn't, isn't in this sprint.

---

## Week 1 — make it real (Thu 15 → Wed 21)

### Thu 15 / Fri 16 — ship it
| | Task | Why it's first |
|---|---|---|
| 1 | `fly deploy` — app, volume, secrets | Nothing else can be tested, shown, or measured until there's a URL. ~£3/month. |
| 2 | Set `ADMIN_EMAILS` and confirm `/funnel` opens for you and 404s for everyone else | The numbers are the point of the next fortnight. |
| 3 | Walk both flows **on your actual phone** | The onboarding is nine steps. It has never been used on a 390px screen by someone standing up. Assume it's broken until proven otherwise. |

### Sat 17 / Sun 18 — the legal minimum to let strangers in
Right now `DEMO_MODE=true` closes sign-up, which is correct and also means **nobody can be a real
user**. Opening it needs three things, and only three:

| | Task | Note |
|---|---|---|
| 4 | Privacy policy + terms page | Near-boilerplate. Draft it, then have it checked — the risk isn't the drafting, it's assuming it's fine. |
| 5 | ICO registration | UK, online form, ~£52/year. Required the moment real personal data exists. |
| 6 | GDPR export + delete account | Legally required, and a *sales asset* for this product specifically: "you can take your evidence and go" is the opposite of what LinkedIn offers. |

### Mon 19 / Tue 20 — don't get embarrassed
| | Task | Why |
|---|---|---|
| 7 | Rate limiting on sign-in and sign-up | Open sign-up with no limit is an invitation. |
| 8 | Tests on privacy + matching | The two places a bug costs a real person their job. This is the one "invisible" item worth the time — if a blocklist leak happens in front of a New York audience, nothing else matters. |
| 9 | Turn `DEMO_MODE` off; sign-up opens | The switch from demo to product. |

### Wed 21 — first ten users
| | Task | Why |
|---|---|---|
| 10 | Personally recruit **ten** people who fit the pain exactly | Not a launch. Ten individual messages to people whose title undersells them. Watch at least three of them do it, in person or on a call, and say nothing while they do. |

> Watching three people onboard in silence will teach you more than the entire first week of
> building did. Write down every place they hesitate.

---

## Week 2 — learn, fix, prepare the story (Thu 22 → Thu 29)

### Thu 22 / Fri 23 — act on the funnel
| | Task |
|---|---|
| 11 | Read `/funnel`. Find the step with the biggest fall. Fix **that one thing** — nothing else. |
| 12 | Re-check after another five users. Did the number move? |

This is the whole method. One change, one measurement, repeat. Resist fixing five things at once:
you'll learn nothing about which one worked.

### Sat 24 / Sun 25 — the demo itself
| | Task | Note |
|---|---|---|
| 13 | Build a **90-second path** you can run from a cold phone | Land → one real profile → the capability → the project behind it → "and companies search this, not keywords". Rehearse it until it needs no apology. |
| 14 | Seed one *good* employer-side example with a real-sounding role | Half the people you meet will be hiring, not job-hunting. They need to see their own side. |
| 15 | Custom domain (optional, ~£10/yr) | `disruptajob.com` on a business card beats `disruptajob.fly.dev`. Cheap credibility. |

### Mon 26 / Tue 27 — the numbers and the ask
| | Task |
|---|---|
| 16 | One page: users, completion rate, drop-off step, what you changed, what happened. |
| 17 | Decide what you actually want from New York — intros? a design partner company? money? The answer changes who you talk to and what you show. |

### Wed 28 / Thu 29 — buffer
Deliberately empty. Everything above will overrun. If it somehow doesn't, add the second
capability-matching improvement you've been wanting — but not before.

---

## Explicitly not in this sprint

Named so they can be argued with rather than quietly skipped:

- **An article/blog system.** No readers, no distribution, and nothing to say that isn't theory.
  Revisit once there are forty real profiles and you can write the piece only you can write.
- **A brand book.** `docs/design-principles.md` already is one.
- **Email sending.** Needs a provider and a domain reputation. The interest list can sit until
  there's something worth sending it.
- **Any new matching cleverness.** The matching is already more defensible than the funnel. Fix
  the funnel.

## The one risk worth naming

The temptation in New York is to describe the vision, because the vision is genuinely good. The
thing that will actually land is handing someone your phone and watching them use it. Protect the
time that makes that possible, and cut anything that doesn't.
