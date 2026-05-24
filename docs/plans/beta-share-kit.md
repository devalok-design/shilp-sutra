# Beta Share Kit

> **For:** Mudit, sending shilp-sutra beta to friends, ex-colleagues, devs/designers.
> **Companion to:** [2026-05-24-beta-release-plan.md § 3.5](./2026-05-24-beta-release-plan.md#35-share-kit-the-distribution-unit-for--31)
> **Date:** 2026-05-25
> **Status:** Draft. Edit as voice settles.

---

## How to use this

Pick the variant that fits the contact. Personalize the first line ("hey [name], saw you've been doing X lately…") — never send the template raw. The kit is the skeleton; the muscle is your voice.

**Distribution channels:**

| Channel | When |
|---|---|
| 1:1 DM (WhatsApp / iMessage / Telegram / Signal) | Closer contacts — ex-colleagues, dev friends, people you'd grab coffee with |
| Broadcast list (WhatsApp / Telegram broadcast — NOT a group) | Wider circle, ~10–30 people. Each recipient sees it as a 1:1 message. Replies come back to you only. **Do not use a group chat** — feedback turns into side-conversation. |
| LinkedIn DM | Designers/devs you only know professionally |
| Twitter/X DM | Folks active there |
| Public LinkedIn post | Once you've sent ~20 DMs and have ~2-3 friendly testers using it |
| r/IndiaDev post | Week 2 of beta — after inner-circle bugs flushed |
| dev.to longform | Week 2–3 of beta |

Order matters: DMs first → bugs surface → fix → broader posts. Don't compress.

---

## Variant 1 — Short DM (3 lines, fast send)

> Hey [name] — wanted to share something I've been working on. Shilp Sutra is a React design system we've been using inside Devalok; just put out a public beta and want honest feedback from people who'd actually install it. Site: https://shilp-sutra.devalok.in · Repo: https://github.com/devalok-design/shilp-sutra
>
> No pressure if you're slammed. If you do try it and something breaks, here's where to file: [link to ai-agent-feedback template]. Bot will ack in <1 min, I'll get back in <48h for anything install-breaking.

**When to send:** wide broadcast list, ~10–30 people. Each gets it as a 1:1.

---

## Variant 2 — Long DM (paragraph, for people who'll actually try it)

> Hey [name] —
>
> Quick context: at Devalok we've been building a React design system called Shilp Sutra. It's been powering Karm (our internal product) for ~8 months. We've just put out a public beta — version 0.40.0 — and I'm sharing it with people whose opinion I'd actually trust.
>
> The thesis is the opposite of shadcn/ui's homogenization play: shilp-sutra is built to **disappear into your brand**. Theming sits in the chrome, every component is built so token overrides actually work end-to-end, and we obsess over the "thought through" details (forced-colors, RSC-safety, composability) that most DSes treat as edge cases.
>
> What I want from you:
> 1. **Install it** in a fresh Next or Vite project. Should take 5 min. Recipe: https://shilp-sutra.devalok.in/docs/install
> 2. **Tell me what broke.** Anything that didn't match the docs, anything your AI agent (Claude / Cursor / Copilot) tripped on, anything that felt clunky.
> 3. **Or tell me it's not for you** — I'd rather know why than not know.
>
> Feedback link: [ai-agent template] for agent-filed issues, [bug-report] for human-filed. Discussions: https://github.com/devalok-design/shilp-sutra/discussions
>
> Bot acks in <1 min. I personally respond inside 48h for anything install-breaking, weekly Mondays for everything else. Travel/sick weeks pause — I'll post a notice if I drop off.
>
> Beta runs open-ended until 3 outside teams use it for real. No Show HN until then. No pressure to share publicly — keep this between us if you prefer.
>
> Thanks for taking a look.

**When to send:** closer contacts who actually code, who'd give blunt feedback, who you trust to spend 30 min.

---

## Variant 3 — r/IndiaDev post (week 2 of beta)

**Title:** Built a React design system that disappears into your brand — public beta, would love feedback

> Hey r/IndiaDev — I'm Mudit, design + product lead at Devalok (Bengaluru). Sharing a project we've been building for ~10 months: **Shilp Sutra** (@devalok/shilp-sutra), a React design system in public beta as of v0.40.0.
>
> The honest pitch: shadcn/ui solved discoverability + copy-paste, but it also accidentally homogenized the web. Every YC-stage SaaS now looks identical. Shilp Sutra is built for the opposite — **be yourself, beautifully**. Theming is the headline, not a docs page. Token overrides actually cascade through every component. We obsess over the "thought through" details (forced-colors mode, RSC-safety, composability) that most DSes treat as edge cases.
>
> **Tech:** React 19, Tailwind 4 (CSS-first), CVA, Radix primitives vendored, framer-motion peer.
>
> **Public beta** because:
> - We've been the only consumer for 8 months. Need outside eyes.
> - No Show HN until 3 external teams use it for real. This is the soft-launch.
> - Honest feedback > polished launch. If the thesis doesn't resonate, I want to know now, not after a big post.
>
> **Links:**
> - Site: https://shilp-sutra.devalok.in
> - Repo: https://github.com/devalok-design/shilp-sutra
> - Install: `pnpm add @devalok/shilp-sutra` + 2 lines of CSS
> - Feedback: [issue template]
>
> **What I'd love from you:**
> - Try installing it. Tell me what broke.
> - Push back on the thesis. Is "disappears into your brand" a real differentiator or marketing fluff?
> - If you're using Claude Code / Cursor — try having your agent install it cold. Tell me where the agent tripped.
>
> Happy to answer anything in comments. Roast freely — beta is for finding things to fix.

**Tone notes:** Indian-context cue ("Bengaluru," r/IndiaDev) builds trust. Acknowledge shadcn directly — refusing to mention it reads evasive. The "Roast freely" line invites real engagement.

---

## Variant 4 — LinkedIn post (after first 2-3 friendly testers report back)

**Format:** medium-length post, 1 image (site v2 screenshot).

> 10 months ago, we started building Shilp Sutra — a React design system for Devalok's internal products.
>
> Today, it's in public beta.
>
> Why now? Because we've been the only consumer for 8 months, and the friction we hit was teaching us things only outside eyes can teach.
>
> The thesis is contrarian: in a world where every SaaS uses the same DS and looks identical, **Shilp Sutra is built to disappear into your brand.** Theming is the headline, not a footnote. Every token override cascades through every component end-to-end.
>
> We obsess over the details most DSes treat as edge cases:
> – Forced-colors mode (Windows high-contrast)
> – RSC-safety per component
> – Composability that doesn't break when you add a wrapper
> – AI-agent install paths that actually work cold
>
> If you build with React + Tailwind, I'd love your honest feedback:
> - Site: shilp-sutra.devalok.in
> - Repo: github.com/devalok-design/shilp-sutra
> - Install: pnpm add @devalok/shilp-sutra
>
> Beta is open-ended. No Show HN until 3 outside teams use it for real. This is the soft-launch — bugs welcome, opinions welcome, roasts welcome.
>
> Tag a designer or engineer who'd care. Or DM me — I respond to every install-breaking issue inside 48h.

**Tone notes:** Less Reddit-irreverent than r/IndiaDev variant. More "founder builds in public." Don't pad with hashtags.

---

## Variant 5 — dev.to longform skeleton

**Working title:** *Why we built a design system that disappears into your brand*

**Outline (target ~1500 words):**

1. **Hook** — the problem with current DS landscape (homogenization, every SaaS looks identical, shadcn solved discoverability but at this cost).
2. **What "disappear into your brand" actually means** — concrete: theming as headline, not footnote. Show before/after of the same Card in 4 industry brands.
3. **What we obsess over that others skip** — forced-colors, RSC-safety per component, composability invariants, AI-agent install paths.
4. **The AI angle** — agents can install shilp-sutra cold from the package name. Recipes, llms.txt, AGENTS.md. Demo: paste prompt → agent installs + theming → working dashboard.
5. **Why beta, why now** — 8 months single-consumer (Karm). Need outside eyes. No Show HN until 3 outside teams use it for real.
6. **What we want from you** — install, break it, file. Honest pushback on the thesis.
7. **What we promise** — bot ack instant, urgent human ack <48h, codemods for breaks touching >2 components, weekly digest of what we heard + shipped.
8. **CTA** — install + site + repo + feedback link.

**Voice notes:** First-person, single-author voice (Mudit). Don't hide behind "we built." Frame it as a designer's perspective ("I've spent 10 years watching brands flatten themselves into the same shadcn shape — that's the thing this fixes").

Drop this on dev.to first (best dev discovery). Cross-post to personal site or Devalok Substack after week 1.

---

## Variant 6 — Twitter/X / Bluesky / Mastodon (single post + thread)

**Lead post:**

> Public beta — Shilp Sutra, the React design system that disappears into your brand.
>
> No Show HN. No Product Hunt. Just want honest install feedback.
>
> 🔗 https://shilp-sutra.devalok.in

**Thread (optional, 4-5 posts):**

1. (lead above)
2. The thesis: shadcn solved discoverability. It also accidentally homogenized the web. Shilp Sutra is the opposite — theming is the headline, every token override cascades end-to-end.
3. What we obsess over: forced-colors mode, RSC-safety per component, composability, AI-agent install paths that work cold.
4. AI angle: agents can install cold from the package name. `curl install.sh | bash` for Claude Code skill; `pnpm add @devalok/shilp-sutra` for everyone else. Recipes + llms.txt + AGENTS.md ship with the package.
5. Beta exit: 3 outside teams using it for real. Until then, soft-launch. Roast freely.

**When:** after r/IndiaDev + LinkedIn have flushed obvious bugs. Twitter is broader but noisier.

---

## Link bundle (paste-ready)

```
Site:        https://shilp-sutra.devalok.in
Repo:        https://github.com/devalok-design/shilp-sutra
Install:     pnpm add @devalok/shilp-sutra
Recipe:      https://shilp-sutra.devalok.in/docs/install
Feedback:    https://github.com/devalok-design/shilp-sutra/issues/new/choose
Discussions: https://github.com/devalok-design/shilp-sutra/discussions
Claude Code skill: curl -fsSL https://raw.githubusercontent.com/devalok-design/shilp-sutra/main/skills/shilp-sutra/install.sh | bash
```

---

## What we're explicitly asking

Single sentence to copy into every variant:

> Install it cold. Tell me what broke — install failure, runtime crash, doc gap, surprise behavior, or "I just don't get the value prop." All of it useful.

---

## What we're explicitly NOT asking

To set expectations cleanly:

- Not asking for stars / shares / public endorsement during beta.
- Not asking them to migrate their existing project.
- Not asking them to evangelize. If they love it, that comes later organically.
- Not asking for unpaid labor. If they spend >30 min, that's their generosity — say thanks publicly + privately.

---

## Feedback channel cheat-card (paste at end of every long DM)

```
🐛 Found a bug?           → https://github.com/devalok-design/shilp-sutra/issues/new/choose
🤖 AI agent tripped?      → Use the "AI agent feedback" template above. Bot acks <1 min.
💬 Question / "how do I"  → https://github.com/devalok-design/shilp-sutra/discussions
📨 Prefer DM?              → Reply here. I read every one.

SLA:
- Urgent (install-break / runtime crash):  human response ≤48h
- Normal (API / docs / agent-trap):         weekly Monday triage
- Nice-to-have (polish / preference):       batched, no calendar
```

---

## After-send hygiene

- Track who you sent to in a spreadsheet (name, channel, date, replied yes/no, filed issue yes/no). Doesn't have to be fancy — Google Sheet, Notion, whatever.
- Wait ~5–7 days before nudging non-responders. Don't double-tap sooner.
- Thank everyone who replied, even if their feedback was "not for me."
- People who install + report back = potential first 3 external consumers for the exit criterion. Treat them well.

---

## What to do if nobody replies

Realistic possibility. Mitigations in order:

1. **Wait full week.** First 48h response rate ≠ overall rate.
2. **Personalize the next send better.** Generic DM gets generic ignore.
3. **Drop r/IndiaDev post earlier than week 2** to widen funnel.
4. **Lower the ask** — instead of "install it," try "just open the site and tell me what you think in one sentence."
5. **Reassess after 2 weeks.** Zero engagement = signal about the thesis or the framing. Update plan accordingly.
