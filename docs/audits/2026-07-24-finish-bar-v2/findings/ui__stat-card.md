# ui/stat-card — finish-bar audit
Finish: 4/5   Market: PARITY (leads on breadth/motion, lags Tremor on sparkline)   Rebuild: polish

StatCard is one of the DS's two named finish exemplars (with Card). It composes `<Card>` +
`<CardContent>`/`<CardFooter>` for surface/padding/elevation, composes `<Progress.*>` for the
progress bar, and composes `<StatFlash>` for the entrance flash — three real compositions, not
re-rolls. Since the 2026-07-01 baseline it has *improved*: the delta arrow's celebration spring
(`springs.bouncy`) was downgraded to `springs.smooth`; `aria-busy="true"` is now on the loading
card; the progress fill no longer hand-animates `width` (delegated to the Progress primitive); and
`reveal` is now an **opt-in prop defaulting to `false`**, so the default render is fully static
(fixing the old "entrances need a consumer MotionProvider" concern for the common path).

Two things kept it off 5/5. (1) The sparkline still runs a **raw CSS `@keyframes` draw
(`1s ease-out`) with zero reduced-motion path** — the one animation in the component that neither
`useReducedMotion` nor a consumer `<MotionConfig reducedMotion>` can suppress. (2) The `delta` node
always fades/slides on mount and is **not self-guarded** (no `useReducedMotion` in the component at
all, unlike its own `StatFlash` dependency). No P0 a11y or slop failure; no structural problem.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | ✓ | Composes Card surface (no border+shadow edge-soup); solid `text-surface-fg`/`text-accent-11` value with `tabular-nums` (no gradient text); `accentStyle="tint"` is an explicit, documented `from-accent-2 to-surface-raised` wash — a choice, not a tell. Radius uses role tokens (`rounded-control`, `rounded-control-inner`) only. Minor: skeleton/sparkline use bare Tailwind sizing (`w-24`, `h-8`, `w-20`, `h-3`) off the `--spacing-ds-*` namespace — small cadence drift, not arbitrary brackets. |
| accessibility | gap | Clickable card hand-rolls `role="button"` + `tabIndex` + Enter/Space on a `<div>` (tested, works) rather than a real `<button>`/Slot; auto `aria-label` for clickable; sparkline & icon `aria-hidden`; progress carries `aria-label`; `aria-busy` on loading. Missing: no `aria-live` on the value region, so an async value swap is announced silently; no explicit forced-colors handling in-component. |
| api-composability | gap | `forwardRef` + `displayName`, exported `StatCardProps`, no `any`, `icon: IconInput`. But `label`/`title` are **two optional aliases for one slot** (precedence `title ?? label` is undocumented in types); ~20 flat content props with **no `children`/slot escape hatch** and no `asChild` polymorphism. Justifiable for a config-shaped metric tile, but the opposite end of Card's slot model. |
| docs-dx | gap | Doc has Props/Defaults/Example/Composability/Gotchas/Changelog and is largely accurate, but drifts from source: claims value steps to `text-ds-2xl` (source uses `text-heading-md`) and lists a `size="lg"` (source types `CardSize`; no story exercises it). `reveal`, `deltaPlacement`, and per-prop defaults are documented. |
| testing | ✓ | `describeConformance` + ~20 behavior tests (label/title alias, delta directions, comparison, loading skeleton hides value, clickable role/keyboard/aria-label, progress ARIA + clamp, secondary/footer, size, accent/flash). No dedicated `vitest-axe` assertion beyond conformance, and no reveal/sparkline/reduced-motion test. |
| motion | ✗ | **Sparkline `@keyframes … 1s ease-out forwards` has no reduced-motion escape** (raw CSS, outside framer — unescapable); `delta` entrance (opacity+`y:8`, plus icon `scale:1.4→1`) always runs on mount and is **not** `useReducedMotion`-guarded (StatFlash guards itself, StatCard doesn't). Positives: delta de-bounced to `smooth`, `reveal` opt-in/off by default, staggered delays, transform/opacity only. The `1s ease-out` draw is also long + string-eased vs the DS's custom curves. |
| state-coverage | ✓ | default / hover (Card `interactive`) / focus / pressed / disabled (via Card) / loading (skeleton) / clickable / link all deliberately handled. Empty-ish handled (sparkline <2 pts renders nothing; progress clamps 0–100). No explicit "error" metric state, but `delta.direction` + threshold colors cover metric health. |
| content-resilience | gap | Value sits in an `overflow-hidden` wrapper but has **no truncation/ellipsis** — a very long value or big i18n-expanded label clips silently rather than truncating gracefully. Sparkline `preserveAspectRatio="none"` stretches the path to any width. prefix/suffix/comparison/secondary all flex sensibly. No RTL-specific handling (delta arrows are semantic up/down, so mirroring is a non-issue). |
| theming-resilience | ✓ | All color via semantic tokens (`accent-*`, `success-11`, `error-11`, `surface-*`, `surface-border-subtle`), survives an accent-9 swap; radius role tokens honor `[data-shape]`; `size` maps to Card density. Tint wash is token-bound both themes. |
| system-cohesion | ✓ | Shares the DS spring language (`springs.smooth`), radius roles, Icon API, and composes Card/Progress/StatFlash siblings rather than drifting. Feels like one system. |
| craft | ✓ | `tabular-nums` on the value (no digit jitter), delta color encodes trend health, sparkline color follows delta direction, footer sits behind a true edge-to-edge divider (not an inset border-t), prefix/suffix stepped down in size and muted. Nice unseen details. |
| perceived-performance | ✓ | Full-card skeleton with `aria-busy` during fetch; static default render (no entrance jank); no layout shift; pure-SVG sparkline (no chart lib). Sparkline measures path length in an effect (one extra paint) but gated behind opacity so no flash of wrong state. |
| market-benchmark | gap | vs **Tremor** (best-in-class KPI card) + Linear/Vercel dashboards: StatCard **leads on breadth** (delta+sparkline+progress+flash+accent+prefix/suffix+comparison+secondary+footer+clickable in one composable tile) and on the novel state→identity `flash` motion. It **lags on the sparkline**: hand-rolled 2-point-min SVG with no hover tooltip, no crosshair, no min/max markers, and `preserveAspectRatio="none"` distortion, where Tremor's SparkAreaChart/Recharts give interactive tooltips and proper scaling. Net PARITY. |
| cross-DS-adoption | gap | See ideas below. |

## Top gaps (prioritized)
- **[P1] motion** — Sparkline raw CSS `@keyframes` draw (`1s ease-out`) has no reduced-motion path (stat-card.tsx:186-196). → Add `useReducedMotion()` to `Sparkline`; when reduced, render with `strokeDashoffset:0` + `animation:'none'`, or wrap the keyframe in `@media (prefers-reduced-motion: no-preference)`. Also consider shortening from 1s and using a DS curve.
- **[P2] motion** — Component has no `useReducedMotion`; the always-on `delta` entrance (opacity+`y`+icon `scale:1.4`) isn't self-guarded (stat-card.tsx:287-311). → Mirror StatFlash: `const prefersReduced = useReducedMotion()` and set `initial={prefersReduced ? false : …}` on the delta so it holds without a consumer provider.
- **[P2] api-composability** — `label`/`title` dual alias for one slot, both optional, precedence undocumented in types (stat-card.tsx:68-71, 249). → Keep `label` canonical, `@deprecated` JSDoc on `title` with a dev warning; or expose the heading as a slot.
- **[P2] content-resilience** — Long value/label clips (overflow-hidden, no ellipsis) (stat-card.tsx:361). → Add `truncate`/line-clamp or a `title` attr on overflow; decide a truncation strategy for big numbers.
- **[P3] accessibility** — No `aria-live` on the value; value arrival after loading is silent to AT (stat-card.tsx:359-377). → Add `aria-live="polite"` to the value region so the resolved metric is announced.
- **[P3] docs-dx** — Doc drift: value type (`text-ds-2xl` vs source `text-heading-md`) and a `size="lg"` that source/stories don't exercise. → Reconcile doc to source; add a `size` story if `lg` is real.

## What it does well
- **Three genuine compositions** (Card / Progress / StatFlash) — the pattern to copy for any new metric/widget card; no primitive re-roll.
- **Static-by-default render** — `reveal` opt-in/off means the common case has zero entrance motion and zero CLS.
- **Clean visual integrity** — no accent rail, no gradient text, no edge-soup; `tabular-nums`; token-bound tint wash; radius role tokens throughout.
- **Rich, deliberate state coverage** — loading/clickable/link/hover/focus/keyboard all real and tested; delta encodes trend health with semantic color.
- **Novel flash motion** — the `state → identity` chip (green up-arrow settling to the metric icon) is a differentiator most KPI cards lack, and it self-guards reduced motion.

## Cross-DS adoption ideas
- **Tremor SparkAreaChart / Recharts** ship interactive sparklines with hover tooltips, min/max dots, and proper aspect scaling — our sparkline is a static, distortable 2-point SVG. Consider an optional interactive sparkline mode (or delegate to the Chart components for anything beyond a decorative trend line) and drop `preserveAspectRatio="none"`.
- **Tremor BadgeDelta** encodes delta as a self-contained toned badge with an icon; we render bare colored text + arrow. A `deltaVariant="badge"` option would give a denser, more scannable trend chip for grids.
- **Linear/Geist dashboards** animate the numeric value with a count-up on mount (opt-in, reduced-motion-guarded). A `countUp` companion to `reveal` would suit a metric tile and stay content-safe.
- **React Aria / Adobe** expose interactive cards via a real focusable element (`<a>`/`<button>`) rather than `role="button"` on a div; adopting an `asChild`/Slot for the clickable surface would harden forced-colors + AT semantics.
- **MUI / Carbon** metric widgets provide a built-in number formatter (locale + compact notation); we require a pre-formatted string. An optional `format`/`Intl.NumberFormat` hook would reduce consumer boilerplate and unify tabular rendering.

## Rebuild note
**Polish, not rebuild.** Structure is exemplary (composes Card/Progress/StatFlash, canonical variant taxonomy, clean surface/radius/type tokens). Scope of polish: (1) reduced-motion guard the sparkline keyframe [P1] and self-guard the delta entrance [P2] via `useReducedMotion`; (2) deprecate `title` in favor of a single `label` [P2]; (3) add a value truncation strategy [P2] and `aria-live` on the value [P3]; (4) reconcile doc drift [P3]. No structural change to the composition model.

---
### Systemic flags for rollup
- **slide-no-fade** — present in the `reveal` path: `revealProps = { initial: { y: 8 }, animate: { y: 0 } }` (stat-card.tsx:314-315), applied to label/value/icon-chip/secondary/progress. Elements slide in already-opaque (no `opacity:0`). Mechanically the tell — but here it is **opt-in (`reveal` defaults `false`) and deliberately content-safe** (the component comments state opacity is *never* gated so text can't vanish). Flagged for cross-component aggregation; low severity in isolation.
- No `border-card-strong`, no `rounded-ds-*`/`rounded-full`, no `p-[..]`/`h-[..]` arbitrary magic numbers.
