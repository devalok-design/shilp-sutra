# Shilp Sutra — Copy Context

> **Load before any site-copy work.** Pairs with Smriti `writing/AI-RULES.md` (canonical hard rules) and `writing/voice-foundation.md` (sound, triplets, close patterns). Those win on conflict.
>
> **Last updated:** 2026-05-25
> **Status:** Living doc. Update inline as positioning sharpens.
> **Owner:** Mudit + Devalok.

---

## 1. What Shilp Sutra is

### Origin
Started inside Devalok as the brand-identity layer for products we were shipping with AI help. Each one risked looking like every other AI-built SaaS. Shilp Sutra fell out of that need. Karm was the first consumer. Devalok Hiring and several internal tools followed. v0.40.0 is the first public beta.

### Name
- शिल्प (Shilp) — craft.
- सूत्र (Sutra) — thread, aphorism, the line that binds.
- "The thread of craft."

Surface the meaning only where it earns its place — footer signature, `/about-devalok`, opening line of a longform post. Not in CTAs. Not in the hero. Never decorative.

### One-line definition
**A React design system from Devalok that disappears into your brand. Same components, your colour, your radius, your scale — out of the box.**

---

## 2. The wedge (vs every other DS)

Most systems give builders primitives plus their own look. shadcn looks like shadcn. Mantine looks like Mantine. Material looks like Google. Your product looks like theirs.

Shilp Sutra gives builders primitives plus their own look. Same component, recoloured live, every surface, every state, light and dark, no re-render. OKLCH ramps generate themselves from one hue. Semantic surface layers and shadow ramps survive the recolour. Designers stop rebuilding the base.

What makes the wedge real, not marketing:

- **CSS-vars only.** No theme provider. No re-render. Brand change is a stylesheet swap.
- **OKLCH ramp.** Perceptually uniform — a step-9 pink and a step-9 indigo carry the same visual weight.
- **Semantic surface layers.** `bg-surface-1` through `bg-surface-4`, enforced by a CI audit. Cards never sit on page-bg. Dialogs never collide with cards.
- **Tailwind 4, CSS-first.** No JS preset. No `@config`. One `@import` and one CSS line in the consumer.

---

## 3. Three pillars (every page serves one)

### 3.1 Be yourself
Customisability is the headline, not a docs page. Brand switcher lives in the chrome. `/theming` is the showcase page. Every demo recolours live.

### 3.2 Thought through
Shown, not claimed. Component pages carry composability notes, gotchas, accessibility behaviour, forced-colors output. Surface-layer audit runs in CI, not in a wishlist.

### 3.3 Real-scale
`/blocks` ships full pages, not toys. Dashboards, settings, pricing, sign-up, data tables. What a builder actually ships. No Lorem Ipsum.

---

## 4. Audience (in order)

### 4.1 Builders (primary)
Indie devs. Vibe-coders. Studio teams. Anyone shipping a product who needs branded UI without a designer next to them. They evaluate in fifteen minutes. The hero needs to make the wedge legible in one line and one demo.

### 4.2 Designers (secondary, important)
Designers are builders too. The pitch to designers lives in the Devalok block on the homepage and on `/theming`. Shape of the pitch: Shilp Sutra ships the base layer so designers spend their hours on polish, brand fit, motion personality, illustration — not on rebuilding the fifth Button this year.

### 4.3 AI-driven teams (secondary, growing)
For teams whose primary author is Claude, Cursor, Codex, Aider. The Skill, `llms.txt`, and `AGENTS.md` ship with every release so the agent stops guessing. Surfaced on `/agents` and in one homepage line. Not in the hero — agent-first reads ahead of builder-first, and that flips the positioning.

### 4.4 Positioning line (filter, not headline)
**Shilp Sutra is for tasteful builders, not AI-sloppers.** Every copy decision filters through this. The system makes branded UI shippable by people who care how it looks. AI-purple-gradient apps are not the win.

---

## 5. Devalok mini-context (homepage block + `/about-devalok` eventually)

### Who Devalok is
Design and strategy studio. Based in Bharat. Brand-craft house — manifestos, identity systems, packaging, publications. Builders of Karm (project ops platform), Manas, Sahayak. Shilp Sutra is studio infrastructure made public.

### Why a studio built a design system
We needed a way to brand the products we were shipping with AI help without each one looking like every other AI-built SaaS. Shilp Sutra fell out of that need. It is open because keeping it private gives us no edge — the edge is the studio that wields it.

### Designer line (keep this in the block)
**"Designers are builders too. Shilp Sutra hands you the base layer so you spend time on the parts that carry the brand — motion, illustration, voice — not on rebuilding the fifth Button this year."**

### Link out
One link to devalok.in. Subtle. No "learn more about our services" CTA — this is positioning, not lead-gen.

---

## 6. Beta posture

### What "stable" means right now
- **Install path:** stable on Next 15, Next 16, Vite.
- **API surface:** pre-1.0. Minors may break.
- **Commitment:** any break touching more than two components ships a codemod.
- **Distribution:** npm `latest` tag. No separate `@beta` tag (see beta plan §2.2).
- **Support:** best-effort. Triage weekly. AI-agent-feedback issue template is the primary inbox.

### Beta signal placement
- **README banner** — loud, top of file (per beta plan §6.3).
- **Site banner** — quieter dismissable strip on `/`, links to the feedback issue template.
- **Footer line** — `Beta · v0.40.0 · Codemods on breaks. Feedback shapes 1.0.`

### Banner copy — LOCKED 2026-05-25

**Default (short):** `Public beta · v0.40.0 — APIs may move. Codemods ship for any break touching more than two components. → Give feedback`

**Dismiss behaviour:** `localStorage` key per-minor (`beta-banner-v0.40-dismissed`). Re-shows on `0.41`, `0.42`, every minor — those carry real change. One-time global dismiss is too sticky.

### Beta voice
Honest, not apologetic. The install path works. The API will move. Codemods catch the breakage. State it once, calmly, and move on. Beta is a commitment to honesty about which surfaces are settled and which are not.

---

## 7. Built-with showcase (the cred signal at beta)

Replaces "no external users yet" with "Devalok ships on it." Strongest social signal available right now.

### Placement
Homepage. After `UnifiedCanvas` + `ButtonShowcase`. Before `FeatureGrid`. Section title — **"Shipped on Shilp Sutra."**

### Confirmed list (verified via package.json scan, 2026-05-25)
- **Karm** — project ops platform. Largest consumer. → `karm.devalok.in`
- **Devalok Hiring Platform** — design hiring review tool. Internal, no public link; name only.
- **BharatTools** — browser-only utilities for Indian government forms. Photo-to-spec, signature merge, KB compression, print sheet. Files never leave the device. On the freshest version (`^0.37.1`). → `bharattools.in`
- **Gurukul** — Devalok's open knowledge hub. Practical guides for founders, designers, builders. Public, MIT. → `gurukul.devalok.in` (verify URL before linking)

**Not in the strip:** devalok.in itself runs on Framer, not Shilp Sutra. Do not claim it as a built-with example.

Add external consumers as they land during beta. The block becomes the GA proof asset.

### Tone
Quiet. No "trusted by" trope. The product names, a screenshot or favicon strip, a one-line description per. Let the visual carry the weight.

---

## 8. What Shilp Sutra is NOT

Three non-goals. One line each. Live near the install section or on `/docs`.

- **Not a CSS framework.** Tailwind 4 does that job. Shilp Sutra layers on top.
- **Not a headless primitives kit.** Opinions ship, not just escape hatches.
- **Not no-code.** The audience is people who write code (or whose agent does).

Purpose — block audience-mismatch installs before they land in the issue tracker. Beta has thin triage budget.

---

## 9. Honest claim boundary

"Disappears into your brand" holds today for: **colour ramp, radius scale, spacing scale, shadow ramp, surface layers.**

Does NOT yet hold for:
- Font swap from the chrome dropdown (only via consumer CSS override).
- Illustration system / iconography.
- Motion personality / brand-tuned timing curves.

**Plan:** broaden during beta. Until then, copy stays narrow — "your colour, your shape, your scale", not "your everything." A narrow honest claim earns more than a wide soft one.

Track this list — when an item moves from "not yet" to "holds today", update §1 and the hero claim.

### Broaden sequence — LOCKED 2026-05-25

1. **Fonts** — first. Cheapest, highest visible impact. `font-family` token already lives in `tokens/typography.css`; remaining work is a chrome dropdown surface plus a preset set. Target: during beta.
2. **Illustration system** — second. Real lift. Icon refresh + illustration kit. Post-beta.
3. **Motion personality** — third. Brand-tuned timing curves per preset. Polish track.

Each step unlocks a wider hero claim. Update §1, the hero one-liner, and the chip set when each lands.

---

## 10. Trust signals (hero chips and scattered)

### Recommended hero chips (three, not four)
1. **`Powers Karm, Devalok Hiring + studio tools`** — social, real.
2. **`WCAG-AA · forced-colors verified`** — craft floor, hard to fake.
3. **`119 components · 1,750+ tests`** — surface area and rigour.

### Demoted (still present, not in the hero)
- MIT → footer badge.
- "Open source, free forever" → about block.
- "v0.40 live" → header version pill.

### Scattered cred
- `/agents` — "Sigstore-signed releases. Provenance verifiable on npm."
- `/theming` — "Same OKLCH algorithm Shilp Sutra ships with."
- `/components` — "Every component runs through axe in CI."

### Numbers discipline
**Verified 2026-05-25:** 119 components (78 ui + 28 composed + 8 shell + 5 ai). 1,751 test cases across 161 files. Recount before each minor — `2100+` was stale by ~350 cases at this verification.

---

## 11. Open and free posture

- MIT today. Will stay MIT.
- One sentence on the about block. No long pledge, no governance roadmap in copy.
- Broader open governance (RFC process, external maintainers, public roadmap mirror) stays out of marketing copy until there is substance behind the words.

---

## 12. Taglines and signature lines

### Hero — LOCKED 2026-05-25

**`Your brand. Every component. Out of the box.`**

Three-beat rhythm. Each beat carries a different semantic load — *what you own* · *what we ship* · *how fast it works*. No banned vocabulary. Specific. Easy to recall.

#### Archived alternates (use elsewhere, not in hero)
- *"The library that looks like yours."* — predecessor. Still strong; reuse as a section header on `/components` or `/blocks`.
- *"Be yourself, beautifully."* — v2 thesis line. Reuse on `/theming` lead or a manifesto post.
- *"One colour in. Your entire UI out."* — secondary hook on `/theming`.

### Footer signature (the "Made in Bharat" line)
**`Made in Bharat with love by Devalok, for the world.`**

Lives as the closing line above the © row. Quiet. Earns its place by being a signature, not a slogan. Do not promote it to the hero.

### Per-page leads (subtitle lines)
- `/theming` — *"Be yourself in OKLCH."* (current, holds)
- `/blocks` — *"Real pages. Real spacing. Real copy."*
- `/agents` — *"Your editor already knows the library."*
- `/components` — *"One hundred and nineteen pieces. Every one yours."*
- `/showcase` — *"Same library. Six brands. Zero re-renders."*

---

## 13. Voice notes for site copy (subset of AI-RULES)

Full rules live in Smriti `writing/AI-RULES.md`. This is the subset most tempting to violate in marketing copy.

### Banned words (high temptation in product copy)
seamless, robust, transformative, leverage, unlock, world-class, cutting-edge, next-level, navigate (metaphor), landscape (metaphor), tapestry, holistic, comprehensive, foster, harness, paramount, delve, dive into, realm.

### Banned structures
- **Strict contrastive negation** — "Not X. Y." where the second clause replaces the first. Grep for sentence-start `Not /Don't /Isn't /It's not`.
- **AI redundancy triplets** — "It's not just X, it's Y, and it's also Z."
- **Hypothetical openers** — "What if [imagined scenario]?"
- **Motivational closers** — "go build something great", "your brand deserves better."
- **Engagement bait** — "what do you think?", "let us know."
- **"At its core"** / **"At the heart of"** / **"In today's world"** openers.

### Approved structures
- **Three-beat rhythm with semantic load** — *"your colour, your radius, your scale."*
- **Expansion negation** — *"Not just a colour swap — a token system that survives the recolour."* (Clause 2 widens to include clause 1.)
- **Conjunction-led paragraphs** ("And", "But", "Because") are fine and used.
- **Specifics over generics** — name Tailwind 4, OKLCH, Karm, shadcn, axe by name (per AI-RULES §9).

### CTA discipline
- Verbs, not nouns. *"Try theming"* not *"Theming demo."* *"Install in your editor"* not *"Editor setup."*
- Pair primary + soft secondary. Per `CLAUDE.md`: `variant="soft"` beats `variant="outline"` for secondary actions in this codebase.

### Em-dashes
Long-form pages can use them. LinkedIn-style spaced hyphens belong on LinkedIn, not the site.

---

## 14. Page-by-page rework checklist

Next session executes against this table.

| Surface | File | Current | Action |
|---|---|---|---|
| Hero | `components/hero.tsx` | *"The library that looks like yours."* | Lock tagline (§12). Reshuffle chips per §10. |
| Feature grid | `components/feature-grid.tsx` | 4 features, brand / fast / AI / a11y | Reframe to three pillars (§3) + one builder line. |
| Agent callout | `components/agent-callout.tsx` | Below feature grid | Keep position (builder > agent per §4). Tone-check the "first time, every prop" claim. |
| Brand showcase | `components/brand-showcase.tsx` (planned) | Not built | Industry strip — 4–6 brands, same component, recoloured. |
| Built-with section | new component | Not built | Per §7. Karm + Devalok Hiring + studio tools. |
| About Devalok | new section on `app/page.tsx` | Not built | Per §5. Link to devalok.in. Designer line included. |
| Footer | `components/site-footer.tsx` | Tagline + tech list | Replace with positioning line + signature line per §12. |
| Beta banner | new component | Not built | Site-wide dismissable strip. Links to feedback template. |
| `/theming` | `app/theming/page.tsx` | *"Be yourself in OKLCH."* | Holds. Polish microcopy. |
| `/agents` | `app/agents/page.tsx` | *"Your AI editor already knows shilp-sutra."* | Tighten. Tone-check chip set. |
| `/components` index | `app/components/page.tsx` | Card grid | Subtitle pass for builder-first phrasing. |
| `/blocks` index | `app/blocks/page.tsx` | "Real-world proof." | Lead-line per §12. |
| `/showcase` index | `app/showcase/page.tsx` | Six fictional brand pages (Devalok, Lendis, Mira, Patrika, Atlas, Vaidya) read as real companies | **Reframe as mock setups.** Add `Mock setup` / `Sample brand` chip on each card. Page intro must say *"fictional brands demonstrating breadth — see `/built-with` for real consumers."* |
| `/built-with` (new) | `app/built-with/page.tsx` (new) | Not built | Real consumer entries per §7. Homepage strip links here for the expanded view. |

---

## 15. Status

### Resolved 2026-05-25
- [x] Devalok Hiring on Shilp Sutra — `^0.33.2`. Named in §7.
- [x] Studio tools enumerated — Karm, Hiring Platform, BharatTools, Gurukul. Backlinks in §7. devalok.in is on Framer, excluded.
- [x] Hero tagline locked — *"Your brand. Every component. Out of the box."* (§12).
- [x] Beta banner copy + dismiss behaviour locked (§6).
- [x] Numbers verified — 119 components / 1,751 tests. Chip updated in §10.
- [x] Designer line approved (founder voice-pass owns final wording).
- [x] Built-with canonical home — homepage strip + new `/built-with` page. `/showcase` reframed as mock industry breadth (§14).
- [x] Broaden-claim sequence — fonts → illustration → motion (§9).

### Still open (pre-execution)
- [ ] Verify `bharattools.in` and `gurukul.devalok.in` URLs before they land in copy.
- [ ] BharatTools and Gurukul logos / favicons for the homepage strip.
- [ ] Visual treatment for the built-with strip — favicon row, screenshot strip, or mini brand-tile.
- [ ] Voice for `/built-with` entries — single-line, case-study, or both.
- [ ] `/showcase` mock-card chip wording — `Mock setup`, `Sample brand`, `Fictional` — pick one.

---

## 16. Related docs

- `docs/plans/2026-05-24-beta-release-plan.md` — beta posture, entry gates, exit criteria.
- `docs/plans/2026-05-24-site-v2-be-yourself.md` — site v2 architecture and phase breakdown.
- Smriti `writing/AI-RULES.md` — canonical hard writing rules. Load before any draft.
- Smriti `writing/voice-foundation.md` — the Devalok sound, triplets, close patterns.
- `CLAUDE.md` — repo-level design preferences (e.g. soft over outline for secondary CTAs).

---

*Living doc. Update inline as positioning sharpens or new evidence lands.*
