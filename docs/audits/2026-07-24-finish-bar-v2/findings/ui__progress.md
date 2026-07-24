# ui/progress — finish-bar audit
Finish: 3/5   Market: PARITY (Radix Progress / Mantine / Chakra)   Rebuild: polish

Prior baseline (2026-07-01) scored 3/5 with P1 motion + P1 track-surface gaps. Since then: `value` clamping landed (`clampPct`), a per-component doc + compound API (Root/Track/Indicator/Segment/Label/Value) + `segments` + `label`/`showValue` shipped in 0.49. **But the three P1/P2 motion findings and the track-surface drift are all still unfixed** — so the finish score has not moved.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | gap | No edge-soup/accent-rail/gradient/emoji; semantic `*-9` fills; `rounded-pill` role token; no `rounded-ds-*`/`rounded-full`. But track is `bg-surface-raised` (surface-2) — DS rule says track fills = surface-3. On a surface-2 card the empty track is the same color as the card, so the groove vanishes and only the fill floats. |
| accessibility | ✓ | `progressbar` role + `aria-valuenow/min/max` via Radix primitive; indeterminate correctly drops `aria-valuenow`; segments are `aria-hidden` (Track carries the value); name via `aria-label`/`aria-labelledby`, no auto-wired dangling ref; smart form maps `label`→`labelledby`. Minor: fill (`bg-*-9`) has no explicit `forced-colors` treatment — could disappear in high-contrast. |
| api-composability | ✓ | Strong. Smart all-in-one + compound parts sharing one context; `forwardRef`+`displayName` on every part; `label:ReactNode`; `Progress.Value` `format(pct,value,max)`; typed unions, no `any`; 0.49 renames (`showLabel`→`showValue`, `color="default"`→`"accent"`) shipped with migration notes. `indicatorClassName`/`trackClassName` are the weakest tool (F6) but harmless. Display-only, so controlled-only is correct. |
| docs-dx | ✓ | Doc has Props/Compound/Defaults/Example/Composability/Gotchas/Changes and matches source. Gotchas call out the unnamed-Track axe trap and outside-Root throws. |
| testing | gap | Unit+RTL+`describeConformance` (axe); asserts role, valuenow, 0, indeterminate, showValue, autoColor thresholds. Untested: `segments` render, `Progress.Value format`, `max` scaling, and the compound outside-Root throw. |
| motion | ✗ | **Worst axis, three unresolved defects.** (1) Determinate fill animates `width` (layout prop) via `motion.div`, not a compositor `transform: scaleX` — M5. (2) Driven by `springs.smooth` (stiffness 300 / damping 30, underdamped) — an underdamped spring on a *quantitative* bar overshoots past the target, so 100% briefly renders >100% then settles: a meaning-bug on a value readout. (3) No reduced-motion guard on the determinate branch (only the indeterminate branch has `motion-reduce:animate-none`); framer respects RM only if the consumer wraps `MotionConfig`. Also a redundant CSS `transition-[width] duration-moderate-02` in the CVA fighting the inline spring. |
| state-coverage | ✓ | Empty/0, complete/100, determinate, indeterminate all designed + storied; `value` clamped; `autoColor` thresholds; overflow signalled via `>100 → error`. Loading/disabled N/A for a display bar. Minor: `autoColor`/`showValue` are silent no-ops in indeterminate (documented in doc, not JSDoc). |
| content-resilience | gap | `shrink-0` label/value + `flex-1` track handle long text; segments cover zero/one/many. **RTL:** segments use physical `first:rounded-l-pill last:rounded-r-pill` (not logical `rounded-s/e`), so corner rounding lands on the wrong ends in RTL; determinate fill grows from physical left rather than inline-start. |
| theming-resilience | gap | Accent-9 swap safe; `rounded-pill` honors `[data-shape]`. Same root as visual-integrity: track `bg-surface-raised` = neutral-1 (light) / neutral-2 (dark) — one tier off the card, so on a surface-2 container the recess has no contrast in either theme. |
| system-cohesion | gap | Direct drift from its sibling track component: Slider track = `bg-surface-raised-hover` (surface-3, correct); Progress track = `bg-surface-raised` (surface-2). Same "track" concept, two surfaces. StatCard re-rolls its own clamped inline ProgressBar (composition-duplication) rather than composing this. Motion approach also diverges from a scaleX-fill sibling. |
| craft | ✓ | `tabular-nums` on the value readout, `overflow-hidden` track, memoized context, named part errors (`<Progress.Indicator> must be rendered inside <Progress.Root>`), `clampPct` helper. Genuine details — the spring overshoot is the one thing pulling against it (scored under motion). |
| perceived-performance | gap | Instant feedback, but animating `width` forces layout+paint per frame instead of a compositor-only transform. Cheap for one bar; a dashboard/table of many progress rows pays reflow cost. |
| market-benchmark | — | PARITY. **Leads** Radix (headless root+indicator only) and most peers on batteries-included API (smart + compound + segments + autoColor + label/value + indeterminate). **Lags** on fill technique: Radix/Base UI steer you to a CSS-var `transform` fill (no overshoot, compositor-only); we animate `width` with an overshooting spring. Net even. |
| cross-DS-adoption | — | See ideas below. |

## Top gaps (prioritized)
- [P0] motion — spring overshoot on a quantitative fill renders the value briefly past its max → switch the determinate indicator to `transform: scaleX(pct)` with `transform-origin: inline-start`, driven by `tweens.layout` (productive easing, no overshoot); drop the redundant CVA `transition-[width]`.
- [P1] motion / a11y — no reduced-motion guard on the determinate fill → gate with `useReducedMotion()` (snap to final) or `motion-reduce` so RM users get an instant set, matching the indeterminate branch.
- [P1] visual/theming/cohesion — track `bg-surface-raised` vanishes on a surface-2 card and drifts from Slider → change track to `bg-surface-raised-hover` (surface-3, the DS's track-fill tier) to match Slider and give a visible groove.
- [P2] content-resilience — physical `rounded-l/r` on segments + left-origin fill break RTL → use logical `rounded-s/e` and grow from inline-start.
- [P2] testing — add coverage for `segments`, `Progress.Value format`, `max` scaling, and the outside-Root throw.

## What it does well
- Two coherent APIs (smart + compound) over one shared context; clean `forwardRef`+`displayName` and typed unions throughout.
- Accessibility is right: Radix-backed `progressbar`, correct indeterminate `aria-valuenow` drop, aria-hidden segments, no dangling label references.
- Value clamping and `autoColor` semantic thresholds (accent/warning/success/error) are genuinely useful for meters/budgets.
- Indeterminate branch is exemplary — tokenized `animate-progress-indeterminate` (`--duration-slow-02`, productive easing) with a `motion-reduce:animate-none` guard.
- Craft details: `tabular-nums`, memoized context, named part-error messages.

## Cross-DS adoption ideas
- **Radix / Base UI** — CSS-var + `transform: scaleX` fill (data-attribute driven), compositor-only and overshoot-free. Adopt this technique for the determinate fill.
- **Base UI / Chakra** — a `valueText` / `getAriaValueText` slot so screen readers announce "72% — uploading" rather than a bare number; useful for non-percentage scales (`max=50 GB`).
- **Mantine** — striped + animated-stripe indicator variant (opt-in), and per-segment `aria-label` for the multi-segment case so segments aren't fully invisible to AT.
- **GitHub Primer** — a "buffered" secondary track (e.g. downloaded vs played) as a second low-opacity fill layer.

## Rebuild note
**Polish, not rebuild.** The compound architecture (Root/Track/Indicator/Segment/Label/Value + context), API surface, and accessibility are sound and market-competitive. The gaps are localized: (1) replace the width+spring determinate fill with a `scaleX` transform + tween + reduced-motion guard, (2) move the track to surface-3 to match Slider and stay visible on cards, (3) logical-property rounding/origin for RTL. All in-place edits to `progress.tsx` (+ CVA); no structural change and no API break. This is the same three-line-of-defects picture the 2026-07-01 baseline flagged — it simply hasn't been actioned yet.
