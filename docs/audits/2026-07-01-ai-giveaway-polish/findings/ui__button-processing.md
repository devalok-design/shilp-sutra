# ui/button-processing — audit

**Finish score:** 4/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:1 P2:3 P3:2

> Scope note: `ProcessingOverlay` is an **internal, non-barrel-exported** leaf component (confirmed in `button-processing.md:1-16` and by absence from the ui barrel). It is a single absolutely-positioned SVG marching-ants overlay owned entirely by `Button`. Most composability rules (F1–F6: slots, `asChild`, compounding a base primitive) are **N/A** — there is no consumer-facing surface to compose, no card/panel chrome, no variant axes. It is judged here as an animation primitive, not a container. It is notably clean on the headline visual tells (no accent rail, no gradient text, no blob/glass, no emoji, no framework palette).

## Findings

### [P1][I] `color` prop is stringly-typed (`string`) instead of the parent's union
- **Category:** types
- **Evidence:** `button-processing.tsx:16` — `color: string` (with comment `/** Resolved color name — maps to CSS token --color-{name}-9 */`)
- **Why:** Button already narrows the public surface to `processingColor?: 'accent' | 'error' | 'success' | 'warning' | 'neutral'` (`button.tsx:242`), but the overlay accepts any `string` and silently falls back via `COLOR_MAP[color] ?? COLOR_MAP.accent` (`button-processing.tsx:47`). A typo or a future color passes the type checker and silently degrades to accent. The rubric (section I) calls out `color?: string` as a types tell explicitly.
- **Fix:** Define `type ProcessingColor = 'accent' | 'error' | 'success' | 'warning' | 'neutral'` (or reuse Button's), type the prop `color: ProcessingColor`, and key `COLOR_MAP` as `Record<ProcessingColor, string>` so the map is exhaustively checked. The JSDoc says `--color-{name}-9` but the map actually uses step-11 tokens (`button-processing.tsx:23-29`) — fix the stale comment while you're there.

### [P2][G2] Re-rolled `useReducedMotion` instead of framer-motion's exported hook
- **Category:** drift
- **Evidence:** `button-processing.tsx:156-170` — a 15-line hand-rolled `useReducedMotion()` reimplementing `matchMedia('(prefers-reduced-motion: reduce)')` with its own listener, while the file already imports from `framer-motion` (`button-processing.tsx:3`), which exports a battle-tested `useReducedMotion`.
- **Why:** `framer-motion` is a required peer (per CLAUDE.md) and exports `useReducedMotion`; rolling our own is duplicate surface that can drift from the canonical motion system (the rubric's M3/G2 spirit — respect reduced-motion *via our motion system / MotionConfig*, don't re-implement). The hand-rolled version also won't honor a `MotionConfig reducedMotion="always"` override the way framer's hook does.
- **Fix:** `import { useReducedMotion } from 'framer-motion'` and delete the local hook. Behavior is equivalent for the media-query case and gains MotionConfig integration.

### [P2][G2/M2] Hardcoded `stroke 0.3s ease` transition off the duration scale
- **Category:** drift / motion
- **Evidence:** `button-processing.tsx:139` — `style={{ transition: 'stroke 0.3s ease' }}` on the `<motion.rect>`.
- **Why:** The color-change transition is a raw `0.3s ease` literal, not a `--duration-*` token / `tweens.*` preset. Everywhere else the file correctly uses `durations.moderate01b` (`button-processing.tsx:117`). 300ms isn't even on the duration scale (nearest is `slow01` 0.4s / `moderate02` 0.24s). Minor uniform/ad-hoc-timing drift (M2) plus a re-rolled token (G2).
- **Fix:** Use a scale value, e.g. `transition: \`stroke ${durations.moderate02}s ${easings...}\``, or drive the stroke color via a framer `animate`/`transition` that pulls from the motion lib. At minimum pick a value that exists on the scale.

### [P2][G2] Magic-number SVG geometry fallbacks
- **Category:** drift
- **Evidence:** `button-processing.tsx:51-52` (`useState(8)` radius, `useState({ array: '8 6', cycle: 14 })`), `:70` (`parseFloat(...) || 8`), `:86-87` (`dashPx = 8`, `gapPx = 6`), `:134` strokeWidth `2`, `:131-132` inset `- 2`.
- **Why:** The dash/gap/radius fallbacks are bare pixel literals. Most are genuine computed SVG geometry derived from live `getComputedStyle`/`offsetWidth` (legitimate — you can't tokenize a measured perimeter), so this is low severity. But the `8`px fallback radius and the `8 6` dash defaults are design decisions hardcoded inline rather than named. Not a visual AI tell; a tidiness gap against the "tokens not raw values" bar.
- **Fix:** Hoist the dash/gap targets to named consts (`DASH_PX`, `GAP_PX`, `FALLBACK_RADIUS`) with a one-line rationale. Leave the measured math as-is. Optional — this is the lowest-value item.

### [P3][H] Fragile DOM-sibling coupling to locate the button
- **Category:** state-coverage / structural
- **Evidence:** `button-processing.tsx:62-63` — `const wrapper = svgRef.current?.closest('span'); const btnEl = wrapper?.previousElementSibling as HTMLElement | null`.
- **Why:** The overlay measures its target by walking up to the nearest `<span>` and grabbing `previousElementSibling`. This is an implicit contract with `button.tsx`'s wrapper layout (`button.tsx:518-531`); any reorder (e.g. moving the overlay before the button, or adding a sibling) silently breaks measurement and the ants render at 0×0. It's documented intent and works today, so P3 — but it's brittle for an internal primitive.
- **Fix:** Pass the measured size/radius down as props from Button (which already has `btnRef`/`wrapperRef`), or accept a `targetRef`. Removes the DOM-walk and the `as HTMLElement` cast.

### [P3][J] Doc lacks a props table; stale token reference in source JSDoc
- **Category:** docs
- **Evidence:** `button-processing.md:1-21` has no props/`speed`/`color` table; `button-processing.tsx:16` JSDoc says `--color-{name}-9` but the implementation maps to step-11 (`:23-29`).
- **Why:** Per-component doc is intentionally thin because it's internal (acceptable — rubric J requires stories only for *public* components, and this is correctly excluded). The only real defect is the stale `-9` vs `-11` comment, which could mislead someone copying the pattern as the doc invites them to (`button-processing.md:15`).
- **Fix:** Correct the JSDoc to `--color-{name}-11`. Optionally note in the .md that speeds map to 3s/2s/1s loop durations (already in Changes section, so optional).

## Composability gaps
- None that are real defects. This is an internal animation primitive with no consumer-facing API — slots/`asChild`/base-primitive-composition (F1–F6) do not apply. The one genuine structural seam is the DOM-sibling coupling (P3 above), which is an internal-coupling smell rather than a composability gap.
- It correctly does **not** re-roll Card/surface (F5 clean) — it's an overlay, not a container, and paints no background, border, or shadow of its own.

## Motion gaps
- **Reduced motion is respected** (`:140-145` gates the `strokeDashoffset` loop behind `prefersReduced`) — M3 effectively clean. The only issue is *how*: it re-rolls the hook instead of using framer-motion's (logged as G2 above), and the `prefersReduced ? {} : {...}` pattern leaves the rect static (correct) but the entrance opacity fade still runs — arguably fine since opacity is reduced-motion-safe.
- **No bounce-by-default** (M1 clean): the loop uses `ease: 'linear'` (`:143`) — correct for continuous marching ants; overshoot would be wrong here.
- **Animates `strokeDashoffset`** (`:140`), not layout props (M5 clean) — this is the SVG-idiomatic, compositor-friendly way to animate a dashed stroke. The `width`/`height` on the wrapper (`:120`) are set from measured size, not animated.
- **Entrance/exit differentiated** via `AnimatePresence` with `initial/animate/exit` opacity (`:110-118`) — M4 clean.
- Minor: the stroke-color crossfade uses an off-scale `0.3s` (M2, logged above).

## Polish plan (ordered steps to reach the finish bar)
1. **Type `color`** as `ProcessingColor` union (P1) and make `COLOR_MAP` a `Record<ProcessingColor, string>` so it's exhaustive. Fix the `-9`→`-11` JSDoc.
2. **Replace the hand-rolled `useReducedMotion`** with framer-motion's exported hook (P2); delete `:156-170`.
3. **Pull the `0.3s ease` stroke transition** onto the duration scale (P2).
4. **(Optional)** Hoist dash/gap/radius magic numbers to named consts (P2-low).
5. **(Optional)** Replace the `closest('span')`/`previousElementSibling` DOM walk by threading size/radius (or a `targetRef`) down from Button (P3).

## Clean (rubric dims that pass)
- **V1 accent rail** — clean. No left/top colored stripe; the marching ants are a *full* animated perimeter outline (a loading affordance), not a static decorative edge rail. Color is bound to semantic step-11 tokens, gated behind an explicit `processing` prop, and documented as intentional → a choice, not a tell.
- **V2 double edge** — clean. The overlay paints no border+shadow of its own; it's a transient stroke-only outline.
- **V3 gradient text** — clean. No text rendered at all.
- **V4 framework palette** — clean. Colors are `var(--color-*-11)` / `--color-surface-fg` semantic tokens (`:23-29`), zero raw `indigo/violet/slate`.
- **V5 emoji** — clean. None.
- **V6 blob/glass/glow** — clean. No backdrop-blur, no glow box-shadow; a solid 2px stroke.
- **V7 rounded-everything** — clean. Radius is *measured from the actual button* and capped at half-dimension (`:77`), so it mirrors the button rather than imposing `rounded-2xl`.
- **V8–V15** — N/A (no badges, fonts, kickers, hero, copy).
- **E1–E8 verbal** — clean. Doc + JSDoc are direct and prescriptive; no em-dash tic as connector, no AI vocabulary, no hedging, no chatbot artifacts.
- **M1/M3/M4/M5 motion** — clean (see Motion gaps; only the off-scale stroke timing dings M2 lightly).
- **H state-coverage / a11y** — strong. `aria-hidden="true"` on the decorative overlay (`:118`); Button owns `aria-busy` while processing (`button.tsx:499`). Renders nothing when `active={false}` (`:111`). SSR-guarded (`typeof window === 'undefined'` `:158`, `typeof ResizeObserver !== 'undefined'` `:98`). ResizeObserver keeps ants glued during width transitions. axe-clean test present (`__tests__/button-processing.test.tsx:32-40`).
- **F5 base-primitive composition** — clean/N/A; correctly does not re-roll surface.
- **G3 variant-axis drift** — N/A; no CVA variants. `speed` tiers (ambient/working/urgent) are a bespoke but well-named, documented axis appropriate to an animation, not the canonical variant/size/color taxonomy (which doesn't apply to a non-interactive overlay).
- **Tests** — present and meaningful (active/inactive/speed/axe). Acceptable for an internal component; no story required (not public).
