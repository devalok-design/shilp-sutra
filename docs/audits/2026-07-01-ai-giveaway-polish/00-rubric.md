# AI-Giveaway + Polish Audit — Master Rubric

**Date:** 2026-07-01
**Purpose:** The single checklist every audit agent scores each component against. Goal is twofold:
1. **Strip AI giveaways** — the model-default "AI look" that signals "this was vibe-coded, not designed."
2. **Reach the Card bar** — the finish we gave Card + StatCard in v0.44.0: no AI tells, composable slots (not bespoke props), single source of truth (no drift), unified vocabulary, intentional motion, full state coverage, tests + stories.

**Sources:** Setu `server/house/anti-convergence.yaml` (Devalok's brand-agnostic anti-convergence layer) + web research on AI design slop (developersdigest 16-pattern Show-HN study, gendesigns 15-mistakes, 925studios, prg.sh purple-gradient piece) + our own `docs/audits/2026-05-09-principal-architect/00-best-practices.md` + CLAUDE.md learnings.

**The mechanism (why these exist):** an LLM emits the statistical average of its training data. Model collapse pulls every output toward the center — Inter, indigo gradients, rounded cards, accent rails. A rule here is a tell when it's reached for **by default**, NOT when the brand/component deliberately chooses it. Our tokens, our fonts, our intentional motion = deliberate. Flag the reflex, not the choice.

---

## How to score (every agent uses this)

For each component, assign every finding a **severity** and a **category**:

**Severity**
- **P0 — Hard tell / broken guarantee.** A near-universal AI giveaway shipped in a component default, OR a violated hard guarantee (a11y baseline, type safety, API contract). Must fix.
- **P1 — Reflex / convergence.** A model-default reached for without deliberate justification, OR a stated-convention violation with real impact (vocabulary drift, missing composability, drift from a base primitive).
- **P2 — Polish gap.** Falls short of the Card bar: missing motion, incomplete state coverage, slot that should exist, inconsistent spacing cadence.
- **P3 — Preference / future.** Minor nit, future-proofing.

**Category** (tag each finding): `visual-tell` · `verbal-tell` · `structural-tell` · `composability` · `drift` · `vocabulary` · `motion` · `state-coverage` · `a11y` · `types` · `docs`

A finding is only real if it's a **default the component ships**, not something a consumer opted into. Skeleton shimmer gradients, avatar fallback gradients, chart fills, and color-swatch demos are legitimate — do NOT flag them as gradient tells. When unsure whether something is deliberate, check: is it bound to a brand token, gated behind an explicit prop, or documented as intentional? If yes, it's a choice.

---

## A. VISUAL TELLS (hard-ban — P0 unless brand-justified)

| id | Tell | What to grep / look for | Fix |
|----|------|------------------------|-----|
| V1 | **Accent rail on a card** | colored left/top stripe on a rounded/shadowed surface (`border-l-4`, `border-t-2` + color, a thin colored `::before`). *Single most recognizable AI tell — we already killed it on Card in v0.44.0.* | Emphasis via weight/spacing/background. Full `color` border for semantic cards is fine. |
| V2 | **Double edge** | a 1px border **AND** a wide drop shadow on the same element | Pick one: edge OR elevation. Our surface system = elevation; outline variant = edge. |
| V3 | **Gradient text** | `bg-clip-text text-transparent` + `bg-linear`/`bg-gradient` on a heading or **metric/number** | Solid color. Let one separate element carry accent. (StatCard value must be solid.) |
| V4 | **Default framework palette** | `indigo-500/600`, `violet-*`, `#6366f1`, `slate-*` as a brand/accent color (not a one-off neutral) | Our semantic tokens (`accent`, `brand`, surface scale). Never raw Tailwind palette as brand. |
| V5 | **Emoji as icon system** | 🚀 📊 🎯 ✨ as bullets, section markers, or icon slots in component/story/doc source | Real icon set (lucide via our Icon API) or none. |
| V6 | **Blob / glass / glow** | big blurry gradient blobs behind content, `backdrop-blur` glassmorphism as a default surface, glowing colored `box-shadow`/`drop-shadow` on dark | Solid intentional surfaces; reserve blur/elevation for genuine layering. |
| V7 | **Rounded-everything** | `rounded-2xl`/`rounded-3xl` applied to everything; nested radii | One radius vocabulary (our `--radius-ds-*`); pill only for tags. |
| V8 | **Pill-badge spam** | multiple "New / Beta / AI-powered" pills; `New`/`Beta` sprinkled in examples | One badge max where it carries meaning. |

## B. VISUAL REFLEXES (P1 — avoid unless deliberate)

| id | Reflex | Look for | Prefer |
|----|--------|----------|--------|
| V9 | **Safe-face font** | hardcoded Inter/Geist/Space Grotesk in a component (not our type tokens) | Our `--text-ds-*` / font tokens. |
| V10 | **Decorative numbering** | `01` / `02` / `03` markers on non-sequential content | Number only genuine steps/timelines. |
| V11 | **Everything-a-card** | every block wrapped in bordered/shadowed card; identical icon-title-blurb grids; symmetric bento where every tile is equal | Spacing/type/dividers; vary block size by importance. |
| V12 | **Eyebrow-kicker default** | small uppercase letter-spaced kicker above every heading | At most one, where it categorizes a real section. |
| V13 | **Giant centered hero** | full-sentence display headline, centered, dominating (mostly apps/site + stories) | Punchy 1–3 word display, left-aligned, asymmetric. |
| V14 | **All-caps as default emphasis** | `uppercase tracking-*` on section labels everywhere | Consistent type hierarchy; all-caps sparingly. |
| V15 | **AI imagery** | 3D iridescent blobs, isometric corporate illustration, gradient stock, "diverse team at laptop" | Real screenshots, real team, commissioned art. |

## C. MOTION TELLS (P1/P2 — `motion` category)

| id | Tell | Look for | Prefer |
|----|------|----------|--------|
| M1 | **Bounce/elastic by default** | `ease: "backOut"`, spring with overshoot, bounce on every entrance | Our intentional easing tokens; overshoot only where it means something. |
| M2 | **Uniform/robotic timing** | every animation the same duration; no enter/exit differentiation | Duration scale by distance/importance (`--duration-*`). |
| M3 | **No reduced-motion** | animation with no `prefers-reduced-motion` guard | Respect reduced-motion (our motion system / MotionConfig). |
| M4 | **Missing feedback motion** | interactive element with no hover/press transition, or no entrance/exit on overlays | Add intentional micro-feedback consistent with the motion system. |
| M5 | **Animating layout props** | animating `width`/`height`/`top`/`left` instead of transform/opacity | Transform + opacity; `layout` prop where needed. |

## D. STRUCTURAL TELLS (P1/P2 — `structural-tell`, mostly docs/stories/site)

| id | Tell | Look for | Prefer |
|----|------|----------|--------|
| S1 | **Colored section backgrounds** | each section/slide its own tint/gradient "for variety"; decorative dividers/swooshes | One consistent surface; whitespace + alignment. |
| S2 | **Page-chrome filler** | auto page numbers, running headers/footers, logo lockups, kickers on every slide | Minimal load-bearing chrome only. |
| S3 | **Uniform rhythm** | every paragraph same length; reshuffle test (two paras swap with no damage = a list pretending to be prose) | Vary rhythm; structure follows the argument. |
| S4 | **SaaS skeleton** | reflexive hero → 3 feature cards → stats → pricing → FAQ → footer, all centered (apps/site) | Break the order; lead with product/demo. |

## E. VERBAL TELLS (P1 — `verbal-tell`; docs, stories, llms.txt, make-kit, JSDoc, copy)

- **E1 em-dash tic** — no `—` as a stylistic connector (en dash for numeric ranges only).
- **E2 contrastive negation** — no "It's not X, it's Y" / "Not just X, but Y". State it directly.
- **E3 AI vocabulary** — delve, tapestry, realm, landscape(metaphor), paradigm, embark, beacon, testament, robust, comprehensive, cutting-edge, leverage, pivotal, underscore, meticulous, seamless, game-changer, utilize, nestled, vibrant, thriving, deep dive, unpack, intricate, ever-evolving, holistic, actionable, impactful, learnings, at its core, synergy, boasts, foster, harness, elevate, unleash, streamline, empower, bolster, resonate, revolutionize, facilitate, nuanced, multifaceted, ecosystem(metaphor), myriad, plethora, navigate(metaphor), reimagine, world-class, best-in-class, state-of-the-art, unprecedented.
- **E4 meta-hedging** — "It's important to note", "worth noting", "Interestingly", "Notably", "At the end of the day".
- **E5 empty openers/closers** — "In today's world", "Let's dive in", "In conclusion", "The future looks bright", engagement bait ("What do you think?", "Save this").
- **E6 chatbot artifacts** — "I hope this helps", citation leakage (oaicite, citeturn, utm_source=chatgpt.com), unfilled `[placeholders]`.
- **E7 tricolon overuse / false breadth** — forced rule-of-three; "Whether you're X or Y", "From X to Y".
- **E8 over-structuring** — 3+ headings under 300 words, bullet lists of bare noun phrases, generic "Overview/Key Points/Summary" headers.

## F. COMPOSABILITY (P1 — `composability`; the Card-bar dimension)

- **F1 bespoke prop where a slot belongs.** A prop that injects content into a fixed corner/region instead of a composable child. (Card's old accent-badge → `<CardAction>` slot.) Flag props like `action`, `icon`, `badge`, `extra`, `headerRight` that could be a slot.
- **F2 missing `asChild`.** A component rendering a DOM element that consumers would want to polymorph (Button-like, Link-like, wrappers) but has no `asChild`/Slot.
- **F3 flat component > 8 layout/content props** that should be compound (per CONTRIBUTING threshold).
- **F4 compound used for fixed-order layout** (should be slot-based) OR slot/compound mixed in one component (Card with both `title` prop and `Card.Header`).
- **F5 not composing the base primitive.** A component re-rolling surface/padding/elevation instead of composing `<Card>` / base — the drift risk StatCard fixed.
- **F6 controlled/uncontrolled gap.** Supports `value` but not `defaultValue` (or vice versa); fires `onChange` for non-input semantics (should be `onValueChange`); no uncontrolled mode.

## G. DRIFT + VOCABULARY (P1 — `drift` / `vocabulary`)

- **G1 surface drift.** Wrong surface level per the MANDATORY layering rule (card on `bg-surface-1`, etc.). Cross-check `scripts/pre-publish-audit.mjs` SURFACE1_ALLOWLIST.
- **G2 re-rolled tokens.** Hardcoded px/hex/shadow instead of our tokens (`--spacing-ds-*`, `--radius-ds-*`, `shadow-raised`, semantic colors). Bare `shadow`/`rounded`/`bg-gradient-to-*`/`w-[--var]`/`theme(spacing.N)` (all dead in TW4).
- **G3 variant-axis drift.** Axis names off the canonical taxonomy: `variant` (solid/soft/outline/ghost/link), `size` (xs/sm/md/lg/xl), `color` (accent/neutral/success/warning/error/info), `shape`. Flag `filled`, `primary`/`secondary` baked into variant, `small`/`medium`/`big`, `color="default"`.
- **G4 inconsistent surface vocabulary** across a family (one uses `surface="raised"`, sibling uses `variant="elevated"`).
- **G5 soft-vs-outline default.** Non-primary actions should default to `variant="soft"` not `outline` (per CLAUDE.md design preference), except on colored/raised bg or icon-dense toolbars.

## H. STATE COVERAGE (P1/P2 — `state-coverage` / `a11y`)

Interactive components must handle + (in stories OR tests) demonstrate: default, hover, focus-visible, pressed, disabled (+`aria-disabled`), loading (+`aria-busy`), error (+`aria-invalid`), success, empty, read-only, required, **RTL** (directional icons mirror), **forced-colors**, **reduced-motion**, dark, selected, indeterminate. Flag:
- focus ring removed without `:focus-visible` replacement; lost in forced-colors.
- `<div onClick>` instead of `<button>`; missing keyboard nav.
- loading with no `aria-busy`; async with no `aria-live`.
- empty state that crashes on zero children.
- touch target < 44px on interactive.

## I. TYPES + API (P1 — `types`)

- `any` in exported props/handlers; stringly-typed enums; `color?: string`.
- `React.FC`; `HTMLElement` ref where specific element known.
- missing `forwardRef` / `displayName` / ref forwarding.
- prop-type **narrowing** mislabeled non-breaking (HARD RULE: narrowing IS breaking).
- inferred-but-not-exported prop types.

## J. DOCS PARITY (P2 — `docs`)

- variant names in docs/llms-full.txt/make-kit that don't match CVA source (source wins).
- missing story for a public component (publish gate).
- `@deprecated` without dev warning + CHANGELOG.
- per-component doc missing or stale prop table.

---

## The finish bar (what "done" looks like — model on Card/StatCard)

A component is **well finished** when:
1. **Zero AI tells** in its default rendering (sections A–E clean).
2. **Composes, doesn't re-roll** — builds on the base primitive; content goes through slots, not bespoke corner-props; `asChild` where polymorphism makes sense.
3. **One vocabulary** — canonical variant/size/color axes; surface vocabulary shared with its family; tokens not raw values.
4. **Intentional motion** — entrance/exit/feedback that means something, reduced-motion respected, transform/opacity not layout props.
5. **Full state coverage** — every applicable state in the matrix handled + shown.
6. **Tests + stories + docs** match the source; props accurate; a11y axe-clean.

## Output contract (every audit agent returns this per component)

```
component, layer, file, finish_score (0–5),
findings: [{ id (rubric id e.g. V1/F5/M3), category, severity (P0–P3),
             evidence (file:line + snippet), why (one line), fix (concrete) }],
composability_gaps: [string],
motion_gaps: [string],
polish_plan: [ordered concrete steps to reach the finish bar ],
notes
```
Be exhaustive. A false negative (missed tell) is worse than a false positive (we filter those in synthesis). When you flag something, cite `file:line`. When something is clean, say so — don't invent findings to fill the table.
