# ui/progress-ring — finish-bar audit
Finish: 3/5   Market: PARITY (narrow lag to MUI CircularProgress / Mantine RingProgress)   Rebuild: polish

A restrained, well-crafted SVG primitive — no slop, correct `strokeDashoffset` fill technique, real reduced-motion guard, count-up synced to fill, solid a11y on the single ring. Not AI slop. It has not moved since the 2026-07-01 baseline (also 3/5): the three P1s that were flagged then are still open in source — off-canonical `color="default"`, a dead per-ring `label` prop on `MultiProgressRing`, and a stringly-typed `colorMap`. No forced-colors fallback. No indeterminate mode.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | ✓ | No edge-soup/gradient/glow/emoji/rail. Semantic `var(--color-*-9)` strokes, `surface-raised-hover` track, `text-body-*` + `font-semibold` center text. SVG → radius/shadow n/a. Only blemish: brand option mislabeled `default`. |
| accessibility | gap | Single ring solid: `role=progressbar` + `aria-valuenow/min/max` + `aria-label` fallback `"{n}% progress"`. But `MultiProgressRing` conveys each metric by **color only** — static group label `"Progress rings"`, per-ring `label` never rendered → SR user gets nothing. No `forced-colors` fallback (track → `Canvas`, invisible; fill `accent-9` not remapped). `aria-valuenow={value}` is the raw unclamped value. |
| api-composability | gap | Off-canonical color axis (`default` instead of `accent`, no `neutral`) — rubric G3 names `default` as off-taxonomy. Dead `label` field on `rings[]`. `showValue` boolean forecloses a center slot (no `children`). `forwardRef`+`displayName` ✓, `Omit<…,'color'>` ✓. |
| docs-dx | ✓ | Doc has Props/Defaults/Example/Composability/Gotchas and matches source. Perpetuates the "use external labels" line that excuses the dead `label` prop. |
| testing | gap | conformance + 7 unit + 2 multi-ring tests cover roles/ARIA/clamp/showValue. No `vitest-axe` play test, no reduced-motion or forced-colors assertion. |
| motion | ✓ | `strokeDashoffset` via `springs.smooth`, bounce-free (damping 30), interruptible (`animate()` + `controls.stop()` cleanup), reduced-motion guarded on both components + counter. Soft drift: count-up uses a hand-rolled inline spring (`stiffness:100,damping:30`) outside the motion vocabulary; multi-ring fills fire in unison (no per-index stagger). |
| state-coverage | gap | value 0 / mid / full handled (stories cover zero + full). Not interactive (hover/active/disabled n/a). **Missing indeterminate/loading state** — a ring commonly needs one. |
| content-resilience | ✓ | value clamped `[0,max]`; `MultiProgressRing` skips rings with radius ≤ 0. `shrink-0` guards flex squish. Numeric center → no i18n length risk; SVG direction-agnostic (rings don't mirror in RTL — matches Apple). |
| theming-resilience | gap | Survives accent-9 swap (semantic tokens). Dark track = `neutral-3` recess, visible. No `[data-shape]`/density relevance (SVG). Fails forced-colors (see a11y). |
| system-cohesion | gap | Shares `springs`, semantic color tokens, `text-body-*` with siblings. Two drifts: inline count-up spring (bespoke), and `color="default"` diverges from the DS canonical `accent`/`neutral` used by Progress/Badge. |
| craft | ✓ | `strokeLinecap="round"`, `rotate(-90)` starts at 12 o'clock, count-up synced to fill, `dominantBaseline="central"` centering, `shrink-0`. Quietly correct. |
| perceived-performance | ✓ | Fixed SVG box → no CLS; animates on mount, cleans up on unmount; instant, no jank. |
| market-benchmark | gap | See below — PARITY on determinate + motion, narrow lag on indeterminate + labeled sections. |
| cross-ds-adoption | gap | Concrete imports available (see below). |

## Top gaps (prioritized)
- **[P1] accessibility** — `MultiProgressRing` conveys each metric by color only and silently drops the typed per-ring `label` → render an accessible name per ring (`<title>`/`aria-label` per `motion.circle`, or a visually-hidden `{label}: {value}%` list), or remove the dead prop.
- **[P1] api-composability** — rename color axis to canonical `accent`/`neutral` (map `accent → --color-accent-9`, add `neutral`, default `accent`); ship the old `default` as a `@deprecated` alias, not a hard break. Mirror in `rings[].color`, story `argTypes`, doc.
- **[P1] api-composability (types)** — type `colorMap` as `Record<NonNullable<ProgressRingProps['color']>, string>` so map ↔ union can't drift and a miss can't silently yield `undefined` stroke.
- **[P2] accessibility/theming** — add a `@media (forced-colors)` fallback so track vs fill stay distinguishable in Windows HCM (system colors `CanvasText`/`Highlight`).
- **[P2] state-coverage** — add an indeterminate/loading mode (spinning arc) for unknown-progress cases.
- **[P2] motion** — promote the count-up spring to a named token (or reuse `springs.gentle`); add a reduced-motion-gated per-ring stagger (`delay: i * 0.06`) so multi-ring reads as distinct metrics.

## What it does well
- Correct, restrained SVG technique — animated `strokeDashoffset`, rounded caps, 12-o'clock origin; no chart-lib dependency.
- Genuine reduced-motion handling on both components **and** the count-up counter.
- Count-up number animates in sync with the ring fill; cleanup via `controls.stop()` — no leaked animations.
- Solid single-ring a11y with a meaningful `aria-label` fallback; value clamped internally.
- Bounce-free functional motion, semantic tokens throughout, tests + stories + doc all present and accurate to source.

## Cross-DS adoption ideas
- **MUI CircularProgress** ships a first-class `indeterminate` variant (rotating arc) — we have determinate only; add one for unknown-duration work.
- **Mantine RingProgress** supports multi-`sections` with per-section `tooltip` and a center `label` slot — solves both our dead-`label` gap and the `showValue`-boolean lock-in. Adopt a `center` children slot on `ProgressRing` and accessible per-section labels on `MultiProgressRing`.
- **Apple Activity rings** stagger and overshoot each ring slightly on fill for legibility — we can take the (reduced-motion-gated) stagger without the overshoot, staying bounce-free.

## Rebuild note
Polish, not rebuild — the SVG structure, motion technique, and single-ring a11y are sound. In-place fixes: (1) accessible per-ring naming on `MultiProgressRing` + forced-colors fallback; (2) canonical `accent`/`neutral` color axis shipped with a deprecated `default` alias (breaking-if-hard, so stage it); (3) tighten `colorMap` typing to the union; (4) named count-up spring + reduced-motion-gated multi-ring stagger; (5) optional indeterminate mode + center `children` slot. No structural teardown required.
