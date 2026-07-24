# ui/button-processing — finish-bar audit

Finish: 4/5   Market: PARITY (shadcn / Apple HIG button async affordance)   Rebuild: polish

> **Scope.** `ProcessingOverlay` is an **internal, non-barrel-exported** leaf: a single
> absolutely-positioned SVG marching-ants perimeter owned entirely by `Button`
> (`button.tsx:11,533`). No consumer-facing surface, no CVA axes, no card chrome.
> It is graded as an *animation primitive*, so composability slots / `asChild` /
> base-primitive-compounding, touch-targets, keyboard nav, and stories are **N/A** —
> not penalized. Source re-verified against the 2026-07-01 baseline (which scored it
> 4/5): **none of that finding's gaps were fixed** — the code is materially unchanged.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | ✓ | Clean on every slop tell. No accent rail (full animated perimeter gated behind `processing` — a choice, not a static decorative edge), no gradient text, no glass/blob/glow, no emoji. Colors bound to semantic `--color-*-11` + `--color-surface-fg` (`:23-30`). Radius measured from the button and capped at half-dimension (`:78`) — no `rounded-ds-*`/`rounded-full`. Pixel literals (`8 6` dash, `2px` stroke, `-2` inset) are genuine measured SVG geometry, not Tailwind magic numbers. |
| accessibility | ✓ | `aria-hidden="true"` on the decorative overlay (`:119`); Button owns `aria-busy` + `aria-disabled` while processing (`button.tsx:505-506`). SSR-guarded (`typeof window` `:159`, `typeof ResizeObserver` `:99`). axe-clean test present. |
| api-composability | gap | **`color: string` is stringly-typed** (`:16`) while Button narrows the public surface to a 6-member union incl. `info` (`button.tsx:248`). A typo/future color type-checks and silently falls back to accent via `COLOR_MAP[color] ?? COLOR_MAP.accent` (`:48`). Rubric §3 flags `color?: string` explicitly. No `forwardRef`/`displayName` but N/A (internal, owns its own ref). |
| docs-dx | gap | Doc intentionally thin (internal — acceptable). Real defect: JSDoc `:15` still says `--color-{name}-9`, but `COLOR_MAP` maps to **step-11** (`:23-30`) — stale, and the doc invites copying the pattern (`button-processing.md:15`). |
| testing | ✓ | Unit + `vitest-axe` covering active/inactive/speed/axe (`__tests__/button-processing.test.tsx`). No `describeConformance` (N/A internal). Reduced-motion + color-map paths untested — minor. |
| motion | gap | Correct `ease: 'linear'` for continuous marching (`:143`); reduced-motion gates the loop (`:141-146`); entrance/exit opacity fade via `AnimatePresence` (`:113-118`). Two dings: (a) **re-rolls `useReducedMotion`** (`:157-171`) instead of framer-motion's exported hook — won't honor a `MotionConfig reducedMotion` override; (b) hardcoded `stroke 0.3s ease` (`:140`) is off the duration scale (nearest `moderate02` 0.24 / `slow01` 0.4). |
| state-coverage | ✓ | active vs inactive both deliberate; overlay anchor renders before measurement settles (0×0 until a frame lands, `:104-108`); reduced-motion state handled. Error/empty are N/A for a decorative overlay. |
| content-resilience | ✓ | Measures actual button dims; ResizeObserver keeps ants glued through text change / async-icon swap / width layout-settle (`:97-101`); radius capped for pill (reports 9999px, `:78`); dash gap solved to fit the perimeter evenly (no seam, `:88-93`). Perimeter-symmetric → RTL-safe. |
| theming-resilience | ✓ | Step-11 semantic tokens survive an accent-9 brand swap; radius derived from the button honors `[data-shape]`; step-11/surface-fg legible in both light and dark (no sunken-track inversion risk — it paints a stroke, not a recess). |
| system-cohesion | gap | Uses `durations.moderate01b` from the motion lib for the fade (good), but drifts by re-rolling `useReducedMotion` (lib/framer already provide it) and hardcoding an off-scale `0.3s` stroke crossfade. Two bespoke seams vs siblings. |
| craft | ✓ | The standout axis. 1px inset so the centered 2px stroke lands *on* the visual border (`:73-75`); dash-gap solved so dashes tile evenly; radius capped for pills; explicit measured px size instead of `w-full`/`calc` to avoid outline drift during width transitions (`:54-59`); ResizeObserver to prevent an edge gap. Genuinely thoughtful sub-pixel work. |
| perceived-performance | ✓ | Instant on toggle; anchor renders immediately so no pop-in wait; `overflow:visible` SVG; continuous `strokeDashoffset` loop is tiny; no layout shift (size is measured, not animated). |
| market-benchmark | ✓ | PARITY. Peers (shadcn, Radix, Apple HIG) answer "button is busy" with a spinner/`aria-busy`; none ship a measured marching-ants perimeter. Our take is *distinctive and better-crafted* on the flourish, at parity on the underlying async-feedback job — not objectively superior to a crisp spinner for all cases, so PARITY (leaning leads on craft). |
| cross-ds-adoption | gap | Concrete imports available (see below) — MotionConfig-aware reduced motion, prop-threaded geometry. |

## Top gaps (prioritized)
- **[P1] api-composability** — `color: string` accepts anything and silently degrades to accent → type it `ProcessingColor` union (reuse Button's `'accent'|'error'|'success'|'warning'|'info'|'neutral'`) and key `COLOR_MAP` as `Record<ProcessingColor, string>` so it's exhaustively checked.
- **[P2] motion / system-cohesion** — re-rolled `useReducedMotion` (`:157-171`) → `import { useReducedMotion } from 'framer-motion'`, delete the local hook; gains `MotionConfig` integration.
- **[P2] motion** — hardcoded `stroke 0.3s ease` (`:140`) → use a scale value (`durations.moderate02`/`slow01`) or a framer `animate`/`transition`.
- **[P2] docs-dx** — stale JSDoc `--color-{name}-9` (`:15`) → correct to `-11` to match `COLOR_MAP`.
- **[P3] structural** — fragile DOM-sibling coupling: `closest('span')` + `previousElementSibling` (`:62-63`) implicitly contracts Button's wrapper order; any reorder renders ants at 0×0 → thread measured `size`/`radius` (or a `targetRef`) down from Button, which already holds the refs.
- **[P3] tidiness] visual-integrity** — hoist `8`/`6`/`8`px fallbacks to named consts (`DASH_PX`, `GAP_PX`, `FALLBACK_RADIUS`); leave the measured math. Lowest value.

## What it does well
- Sub-pixel craft: 1px inset lands the 2px stroke on the button's visual border; dash-gap solved to tile the perimeter seamlessly; radius capped at half-dimension for pills.
- Content resilience: ResizeObserver + explicit measured dimensions keep the ants glued through text/icon/width changes — no gap between button edge and outline.
- Clean tokens and a11y: semantic step-11 colors, `aria-hidden` overlay, SSR-guarded, reduced-motion gated, distinctive without any slop tell.

## Cross-DS adoption ideas
- **framer-motion / Vercel-Sonner motion discipline** — use framer's `useReducedMotion` so the overlay honors a consumer's `MotionConfig reducedMotion="always"`, matching how the rest of a framer-based system behaves. We currently ignore that override.
- **Radix/Base-UI ref-threading pattern** — pass geometry (size/radius) as props from the owner instead of DOM-walking siblings; removes the `as HTMLElement` cast and the layout contract, the same decoupling Radix uses between trigger and positioned content.

## Rebuild note
**Polish, not rebuild.** The structure is sound and the craft is above the DS bar — this is a well-built animation primitive, not edge-soup. All five open items are in-place fixes: type the `color` prop (P1), swap to framer's `useReducedMotion` (P2), put the stroke transition on the duration scale (P2), fix the stale JSDoc (P2), and optionally thread geometry down from Button to drop the sibling DOM-walk (P3). No P0, no a11y or slop failure. Finish holds at 4/5 — reaching 5 needs the P1 type fix plus the two motion/cohesion dings closed.
