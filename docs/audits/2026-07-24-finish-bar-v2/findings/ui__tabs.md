# ui/tabs — finish-bar audit
Finish: 3/5   Market: PARITY   Rebuild: polish

Tabs is a competent, token-driven, accessible compound built on the vendored Radix
Tabs primitive, with a Framer `layoutId` sliding indicator layered on top. No hard
slop tells, correct `tablist`/`tab`/`tabpanel` ARIA (this IS a panel-ful pattern, so
`tablist` is right — unlike SegmentedControl), roving tabindex + arrow keys inherited
from Radix, focus-visible ring, role-radius tokens. What holds it at 3/5 is unchanged
from the 2026-07-01 baseline (re-verified: **none of the prior P1/P2s were fixed in
0.49/0.50/0.52**): the animation ships with **no reduced-motion guard** (the
`withReducedMotion`/`useReducedMotion` helper exists in `lib/motion.ts` and is never
called), the root **re-implements controlled/uncontrolled state Radix already owns**
(mirror `useState` + sync effect + a parallel `TabsValueContext`), a couple of
**token-hygiene drifts** (`duration-100` raw, dead `ring-offset-background`, `z-[1]`),
**no forced-colors fallback** on the active indicator (it vanishes in HCM), and a
**stale doc** (the `color` axis is missing from the prop table).

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | gap | No slop tells; role-radius (`rounded-surface`/`rounded-control`), accent/surface tokens, one edge treatment per part. Drift: `duration-100` raw (tabs.tsx:151), dead `ring-offset-background` (:315, no `--color-background` token), `z-[1]` arbitrary (:282), `w-48` off the `--spacing-ds-*` namespace (:143,145). |
| accessibility | gap | Correct `tablist` pattern + roving tabindex + arrows (Radix), focus-visible ring-2/offset-1, axe-clean test. Gaps: **no forced-colors fallback** — indicator is `bg-accent-9`/`shadow-raised` pill, flattened in HCM, selected state disappears (list border survives via `CanvasText`, the indicator does not); touch targets **below 44px** (md h-10=40px, sm h-8=32px), no `touch-target` util. |
| api-composability | ✓ | Canonical `value`/`defaultValue`/`onValueChange`; controlled + uncontrolled; `forwardRef` + `displayName` on all four parts; `VariantProps`-typed, exported type aliases; compound context propagation (variant/size/color/orientation). `line`\|`contained` is a defensible domain axis. (Internal state-mirror is an impl smell — scored under system-cohesion.) |
| docs-dx | gap | `color: "accent"\|"neutral"` prop is on `TabsListProps` (source) + has a full Colors story, but is **absent from the doc prop table** (tabs.md:13-16) — appears only in the v0.31.0 changelog. Otherwise doc has Props/Defaults/Example/Composability/Gotchas and matches source. |
| testing | gap | Unit + RTL + `vitest-axe` + keyboard (Arrow L/R) + size + color assertions. No `describeConformance`; no reduced-motion / RTL / forced-colors assertion. |
| motion | ✗ | **No reduced-motion guard** — indicator springs (`springs.smooth`, :279/:296) and content fade (`tweens.fade`, :321-327) fire unconditionally on every switch; `useReducedMotion`/`withReducedMotion` unused. Otherwise good: bounce-free spring (stiffness 300/damping 30, no overshoot), transform-only HW-accel `layoutId`, interruptible spring, 110ms easeOut fade. |
| state-coverage | gap | hover/active/focus-visible/disabled/selected all deliberately designed. loading/empty/error are N/A for tabs. Selected state **not designed for forced-colors** (vanishes). |
| content-resilience | gap | `whitespace-nowrap` + `truncate` on labels — good. But **no overflow/scroll strategy** for many tabs (ManyTabs story just fits 5; no horizontal scroll or scroll-buttons). RTL: vertical line indicator pins physical `left-0` (:292), won't mirror under `dir="rtl"`. |
| theming-resilience | ✓ | Accent-swap safe (`accent-9`/`accent-11`), honors `[data-shape]` via role radius. Contained pill `bg-surface-overlay` sits above `bg-surface-raised` track (elevation, not a recess) so it doesn't hit segmented's dark-track-vanish trap — but verify contained pill contrast in dark. |
| system-cohesion | gap | Shares springs/role-radius/focus-ring/ds-spacing with siblings. Drift: the **state mirror** (mirror `useState` + sync `useEffect` + `TabsValueContext`, :62-99) re-tracks what Radix `data-state` already owns — no other Radix-based component does this; plus `duration-100`/`ring-offset-background`/`w-48` bespoke to this file. |
| craft-details | ✓ | Nice optical touches: `-mb-px` so triggers sit on the list border, `-ml-px` vertical, `z-[1]` content above indicator, `min-w-0` for truncation. |
| perceived-performance | ✓ | Instant Radix state flip; indicator animates transform (no layout shift/CLS); content fade masks Radix's fresh mount of the active panel. No skeleton needed. |
| market-benchmark | PARITY | vs Radix (the primitive): a11y parity by construction, and we ADD an animated indicator + size/color/orientation axes Radix lacks. vs Base UI / Ark: they ship a first-class `Indicator` part (CSS-var driven, reduced-motion-friendly) and scrollable-overflow; we lag there and on reduced-motion. Net PARITY. |
| cross-ds-ideas | — | See below. |

## Top gaps (prioritized)
- [P1] motion — indicator springs + content fade ignore `prefers-reduced-motion` → gate both behind `useReducedMotion()`/`MotionConfig` (instant position + `duration:0` when reduced); the helper already exists in `lib/motion.ts`, just wire it.
- [P1] system-cohesion — root double-tracks Radix's active value (mirror state + sync effect + `TabsValueContext`) → drive indicator presence off the trigger's own `data-[state=active]`/Radix context, delete the mirror. Fragile: transient `value={undefined}` or a changed `defaultValue` can desync it.
- [P1] visual-integrity — `duration-100` → `duration-fast-*`; drop dead `ring-offset-background` (emits nothing, no `--color-background` token); reconsider `z-[1]`/`w-48`.
- [P2] accessibility — add a `forced-colors:` outline/border on the active trigger so selection survives HCM color-flattening; bump md/sm to satisfy the 44px touch target (or add `touch-target`).
- [P2] content-resilience — switch the vertical line indicator to logical props (`start-0`/`ms`) for RTL; add a horizontal-overflow scroll strategy for many tabs.
- [P2] docs-dx — add `color: "accent" | "neutral"` (default `accent`) to the TabsList prop table in tabs.md.

## What it does well
- Correct `tablist` semantics (not misapplied like a panel-less toggle), roving tabindex + Home/End/arrows via Radix, axe-clean.
- Clean compound API: canonical value/defaultValue/onValueChange, controlled + uncontrolled, context-propagated variant/size/color/orientation, full `forwardRef`/`displayName`/typed exports.
- Bounce-free `springs.smooth` indicator, transform-only (HW-accel), per-list `LayoutGroup` correctly isolates indicators when multiple tab bars share a page.
- Optical craft: `-mb-px` border-sit, `min-w-0`+`truncate` label resilience.
- No slop: role radius, semantic accent/surface tokens, no accent rail / gradient text / glass / emoji.

## Cross-DS adoption ideas
- **Base UI Tabs.Indicator** exposes the active tab's position via CSS custom props (`--active-tab-left/-width`), letting the indicator animate in pure CSS — reduced-motion-friendly and no JS state mirror. Adopting this would kill both our P1s (mirror + reduced-motion) in one move.
- **Ark / Radix `activationMode="manual"`** — decouple focus from selection for keyboard users (arrow to focus, Enter/Space to activate). We currently only get automatic activation.
- **MUI / Carbon scrollable tabs** — overflow scroll container + prev/next scroll buttons + scroll-into-view on the active tab; solves the many-tabs content-resilience gap.

## Rebuild note
**Polish, not rebuild.** The structure (Radix primitive + compound context + layoutId indicator) is sound and market-competitive. Every gap is an in-place fix: (1) wire `useReducedMotion` into the two motion sites, (2) delete the state mirror and read Radix `data-state`, (3) token hygiene (`duration-fast-*`, drop `ring-offset-background`), (4) forced-colors fallback + touch-target, (5) logical props for the vertical indicator + overflow strategy, (6) doc `color` parity. Ideally fold the Base UI CSS-var indicator idea in while touching motion, which retires the mirror and the reduced-motion gap together.
