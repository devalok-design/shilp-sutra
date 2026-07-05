# ui/charts — audit
**Finish score:** 3/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:6 P2:7 P3:3

Scope: `chart-container.tsx`, `line-chart.tsx`, `area-chart.tsx`, `bar-chart.tsx`, `pie-chart.tsx`, `gauge-chart.tsx`, `radar-chart.tsx`, `sparkline.tsx`, `_internal/{colors,types,animation,axes,legend,tooltip,grid-lines,scales}`, tests in `ui/__tests__/`, stories, `docs/components/ui/charts.md`.

Overall: the chart family is **clean on the headline AI visual tells** — colors are bound to brand `--chart-*` tokens (pink/purple/blue/green/yellow/red/cyan/orange-9, `semantic.css:542`), gradients are legitimate chart fills, no accent rails, no gradient text, no emoji, surfaces use tokens. The gaps are in the Card-bar dimensions: **state coverage (keyboard/focus inconsistency, empty-data crashes), motion correctness (a broken SVG `d` transition, non-token timing), type vocabulary drift (`color?: string`), composability (no shared ref-merge, no slots), and docs drift**.

## Findings

### [P1][H] LineChart keyboard focus is invisible — focus ring removed with no replacement
- **Category:** a11y / state-coverage
- **Evidence:** line-chart.tsx:241-244 — `tabIndex={0} role="graphics-symbol" ... className="focus-visible:outline-hidden"` on a `fill="transparent"` rect
- **Why:** The hover/focus zone is keyboard-focusable but `outline-hidden` kills the only visible focus affordance and nothing replaces it — a sighted keyboard user tabbing through points sees nothing. BarChart got this right (`focus-visible:opacity-80`, bar-chart.tsx:245); LineChart didn't.
- **Fix:** On focus, render a visible marker (e.g. a focus dot/ring at the focused point) or keep a `focus-visible:` outline on a non-transparent element. Mirror BarChart's approach.

### [P1][H] AreaChart tooltip zones are not keyboard-reachable at all
- **Category:** a11y / state-coverage
- **Evidence:** area-chart.tsx:170-214 `renderTooltipZones()` — `<rect ... onMouseMove onMouseLeave>` with **no** `tabIndex`, `role`, or `aria-label`; Line (line-chart.tsx:241-243) and Bar (bar-chart.tsx:246-248) all expose these.
- **Why:** Same data, three charts, three different a11y contracts. AreaChart tooltips are mouse-only — keyboard and SR users get no per-point access, while Line/Bar do. Inconsistent + a WCAG gap.
- **Fix:** Give AreaChart's hover rects the same `tabIndex={0}` / `role="graphics-symbol"` / `aria-label` / `onFocus`/`onBlur` treatment as Line/Bar. Factor the hover-zone into one shared `_internal` component so the three can't drift.

### [P1][M5] GaugeChart animates the SVG `d` attribute via CSS transition (broken / layout-prop)
- **Category:** motion
- **Evidence:** gauge-chart.tsx:127 — `style={ duration > 0 ? { transition: \`d ${duration}ms ease-out\` } : undefined }` on the value-arc `<path>`
- **Why:** CSS `transition: d` only interpolates in Blink and only when the path has an identical command count; the d3 arc string changes command structure as the angle sweeps, so the "animation" is effectively a no-op (and a hard cut in Firefox/Safari). It also animates a non-transform/opacity property — exactly the M5 anti-pattern. The gauge is the only chart whose *value change* is meant to animate, and it doesn't.
- **Fix:** Drive the sweep with framer-motion — animate `endAngle` (or a 0→1 progress scalar) and regenerate the arc per frame via a `useMotionValue` + `useTransform`, or animate `pathLength` on a stroked arc. Respect `reducedMotion` (already wired via `getTransitionDuration`).

### [P1][I] `color?: string` stringly-typed and inconsistent across the family
- **Category:** types / vocabulary
- **Evidence:** gauge-chart.tsx:25 `color?: string`; sparkline.tsx:21 `color?: string`; pie-chart.tsx (PieSlice) `color?: string` (pie-chart.tsx:19); radar series `color?: string` (radar-chart.tsx:21); Series `color?: string` (types.ts:22) — vs BarChart's `ChartColor | ChartColor[] | string | string[]` (bar-chart.tsx:32).
- **Why:** Rubric I explicitly flags `color?: string`. The `ChartColor` union ('chart-1'…'chart-8') exists and `resolveColor` already accepts it, but only BarChart surfaces it in its public type. Every other chart loses the autocomplete/safety for the token names it actually supports.
- **Fix:** Type every public color prop as `ChartColor | (string & {})` (or the array forms where multi-series). Export `ChartColor` from the barrel (currently internal-only).

### [P1][J] Doc claims "spring-based entry" but charts use a tween; "8 chart types" miscount
- **Category:** docs / drift
- **Evidence:** docs/components/ui/charts.md:36 "all charts use Framer Motion spring-based entry"; charts.md:46 "All 8 chart types migrated to Framer Motion". Actual entrance is `transition: tweens.fade` (a tween, not a spring) in line/area/bar/pie/radar/gauge (e.g. line-chart.tsx:89). There are 7 chart components + Sparkline + ChartContainer + Legend, not "8 chart types."
- **Why:** Source wins (MEMORY "Source of Truth Rule"). Docs assert a motion model the code doesn't use.
- **Fix:** Reword to "fade-in entrance (`tweens.fade`), reduced-motion respected." Correct the count or drop the number.

### [P1][F5] Charts re-roll their own surface/sizing instead of composing ChartContainer / Card
- **Category:** composability
- **Evidence:** pie-chart.tsx:77-130 and radar-chart.tsx:69-138 each hand-roll a `ResizeObserver` + `useState(width)` + ref-merge callback — duplicating ChartContainer (chart-container.tsx:41-66) verbatim. Gauge/Sparkline render bare `<svg>` with no container at all. The doc (charts.md:32) says "Always render charts inside a ChartContainer," but Pie/Radar/Gauge/Sparkline don't.
- **Why:** Three copies of the same resize/ref logic = drift risk (the StatCard-composes-Card lesson). Container's `ariaDescription`→`<desc>` path is also bypassed.
- **Fix:** Pie/Radar should consume `ChartContainer` (or a shared `useChartSize` hook) instead of re-implementing the observer. At minimum extract the ref-merge + ResizeObserver into one `_internal` hook.

### [P2][H] No empty-data state — empty arrays produce `-Infinity`/`NaN`, not a graceful empty
- **Category:** state-coverage
- **Evidence:** line-chart.tsx:128 `const yMax = Math.max(...allValues)` (empty → `-Infinity`); bar-chart.tsx:145, area-chart.tsx:155, radar-chart.tsx:89 same pattern; pie total 0 is partially guarded but slices still map. No `data.length === 0` early return anywhere.
- **Why:** Rubric H: "empty state that crashes on zero children." A dashboard feeding a still-loading/empty series gets a broken/NaN render rather than an empty placeholder.
- **Fix:** Early-return a neutral empty state (or guard `yMax`/`maxValue` with a fallback of 1) when `data.length === 0`. Add an empty-data test + story.

### [P2][a11y] Duplicate `<desc>` inside one `<svg>`
- **Category:** a11y
- **Evidence:** line-chart.tsx:152 `<desc>{dataSummary}</desc>` rendered as a child of ChartContainer's `<svg>`, while ChartContainer itself also renders `{ariaDescription && <desc>…</desc>}` (chart-container.tsx:71). bar-chart.tsx:170 same. Two `<desc>` elements per SVG when `ariaDescription` is passed.
- **Why:** Only the first `<desc>` is exposed to AT; the data summary may be ignored, or the two conflict. The data summary should flow through the container's `ariaDescription` prop, not be a second sibling.
- **Fix:** Pass `dataSummary` into `<ChartContainer ariaDescription={dataSummary}>` and delete the inline `<desc>` in line/bar.

### [P2][M2] Sparkline path-draw uses hardcoded non-token timing
- **Category:** motion
- **Evidence:** sparkline.tsx:32 `const pathDrawTransition = { duration: 1, ease: 'easeOut' }` — a literal 1s, not a `--duration-*`/`durations.*` token; StatCard's inline sparkline uses the same literal `1s ease-out` (stat-card.tsx:180).
- **Why:** Rubric M2 (uniform/non-token timing). 1000ms is also long for a sparkline and bypasses the duration scale every other component honors.
- **Fix:** Use `durations.slow01` (400ms) or a `tweens` preset; thread reduced-motion (already have `shouldAnimate`).

### [P2][M2] Every chart shares one identical entrance regardless of size
- **Category:** motion
- **Evidence:** identical `initial:{opacity:0,scale:0.96}, animate:{opacity:1,scale:1}, transition:tweens.fade` block copy-pasted in line-chart.tsx:89, area-chart.tsx:108, bar-chart.tsx:114, pie-chart.tsx:127, radar-chart.tsx:126, gauge-chart.tsx:107.
- **Why:** Rubric M2: uniform timing, no differentiation by importance/size. Also 6× duplication invites drift. A full dashboard chart and a 200px gauge get the same 110ms scale-in.
- **Fix:** Extract a shared `chartEntrance(reducedMotion)` helper in `_internal/animation.ts`; optionally scale duration with chart height.

### [P2][vocabulary/G2] Swatch radius vocabulary disagrees within the family
- **Category:** vocabulary
- **Evidence:** Legend swatch uses `rounded-control-inner` (legend.tsx:31); tooltip series dots use `rounded-pill` (line-chart.tsx:221, area-chart.tsx:199, radar-chart.tsx:298). Same "series color swatch" concept, two radii.
- **Why:** Minor inconsistency — one is a rounded square, the other a circle, for the identical semantic.
- **Fix:** Pick one swatch shape and share a `<SeriesSwatch>` between Legend and tooltip rows.

### [P2][F1] Tooltip content is bespoke-built inline, not a slot/render-prop
- **Category:** composability
- **Evidence:** the `tooltipContent` JSX is hand-assembled inside each chart (line-chart.tsx:212-231, bar-chart.tsx:224-234, area-chart.tsx:189-208, pie-chart.tsx:175-181, radar-chart.tsx:288-309) with no consumer override.
- **Why:** Consumers can't customize tooltip rendering (format numbers, add units, localize) without forking. A `renderTooltip?: (point) => ReactNode` slot is the Card-bar move.
- **Fix:** Add an optional `renderTooltip`/`formatValue` render-prop; default to the current markup.

### [P3][docs] `ariaDescription` advertised on ChartContainer but no chart passes it
- **Category:** docs / a11y
- **Evidence:** chart-container.tsx:18 documents `ariaDescription` "summarize key data points," but none of the 7 charts forward a summary into it (they use inline `<desc>` or nothing — see duplicate-desc finding).
- **Why:** Dead prop in practice; the documented a11y affordance isn't wired.
- **Fix:** Wire `dataSummary` → `ariaDescription` (see P2 duplicate-desc fix); covers both.

### [P3][types] Repeated ref-merge callback is hand-written 3× with a `MutableRefObject` cast
- **Category:** types / composability
- **Evidence:** chart-container.tsx:61-65, pie-chart.tsx:120-124, radar-chart.tsx:119-123 — identical `(node) => { (containerRef as React.MutableRefObject…).current = node; … }`.
- **Why:** Triplicated; easy to drift. A `useMergedRef` util (or `useComposedRefs`, which the primitives layer already has) would erase the cast.
- **Fix:** Extract/reuse a `mergeRefs` helper.

### [P3][state-coverage] Tests are render-smoke only — no tooltip/keyboard/empty/reduced-motion coverage
- **Category:** state-coverage / docs
- **Evidence:** line-chart.test.tsx:14-48 (and siblings) cover only render/axe/ref/className/props. No focus, no empty data, no `showTooltip`, no reduced-motion, no multi-series.
- **Why:** The a11y findings above (invisible focus, area keyboard gap, empty crash) all slipped through precisely because tests don't exercise those states. Stories likewise show no empty/loading state.
- **Fix:** Add empty-data, keyboard-focus, and reduced-motion stories/tests once the fixes land.

## Composability gaps
- Pie/Radar re-roll ResizeObserver + width state + ref-merge instead of composing `ChartContainer` (F5); Gauge/Sparkline have no container at all despite the doc mandating one.
- No `renderTooltip` / `formatValue` slot — tooltip markup is locked (F1).
- Legend is sibling-only by design (documented, fine) but its swatch isn't shared with the tooltip swatch — no `<SeriesSwatch>` primitive.
- `ChartColor` union is internal; public color props fall back to bare `string`, so the token vocabulary isn't composable into consumer code.
- Ref-merge logic triplicated rather than a shared `mergeRefs`.

## Motion gaps
- GaugeChart's value sweep uses `transition: d …` — broken in non-Blink, no-op in Blink due to changing command count; the one chart whose value should animate doesn't (M5).
- All 6 charts share one copy-pasted `tweens.fade` scale-in regardless of size (M2); Sparkline uses a hardcoded `{ duration: 1, ease:'easeOut' }` off the token scale (M2).
- Pie slice hover (`transition-transform`, pie-chart.tsx:156) and bar/line `transition-opacity` hovers have no reduced-motion guard (they're CSS transitions, not gated by `shouldAnimate`) — minor M3.
- Reduced-motion IS respected for entrance across all charts (via `useReducedMotion` + `shouldAnimate`) and Sparkline — good. This is the one motion dimension that's solid.

## Polish plan (ordered steps to reach the finish bar)
1. **Fix the gauge animation (P1/M5):** drive the arc sweep with framer-motion (`useMotionValue`→`useTransform` on the angle, or `pathLength`), respecting reduced motion. This is the only outright-broken behavior.
2. **Unify the per-point a11y contract (P1×2/H):** one shared `_internal/HoverZone` (or `DataPointTarget`) used by Line/Area/Bar with `tabIndex`/`role`/`aria-label`/`onFocus`/`onBlur` AND a visible focus marker. Kills the invisible-focus and area-keyboard-gap findings together.
3. **Type the color props (P1/I):** `ChartColor | (string & {})` everywhere; export `ChartColor` from the barrel.
4. **Empty-data guard (P2/H):** early-return empty placeholder or clamp `yMax`/`maxValue` fallback; add tests + a story.
5. **Wire `dataSummary` → `ariaDescription`, delete duplicate `<desc>` (P2):** removes the duplicate-desc bug and lights up the dead `ariaDescription` prop.
6. **Compose, don't re-roll (P1/F5):** Pie/Radar consume ChartContainer or a shared `useChartSize`; extract `mergeRefs`; extract `chartEntrance()` so the 6 copies converge.
7. **Add a `renderTooltip`/`formatValue` slot (P2/F1)** and a shared `<SeriesSwatch>` for Legend + tooltip.
8. **Token-ize Sparkline + shared entrance timing (P2/M2).**
9. **Fix the doc (P1/J):** "spring-based entry" → fade; correct the count; document the new slots and empty state.

## Clean (rubric dims that pass)
- **V1 accent rail:** none. **V2 double-edge:** charts are SVG; tooltip uses border *or* shadow on overlay surface (acceptable). **V3 gradient text:** none. **V4 framework palette:** chart colors are brand-token-bound (`--chart-1..8` → pink/purple/blue/green/…-9, semantic.css:542) — a legitimate categorical palette, not raw indigo/slate. **V5 emoji:** none. **V6 blob/glass/glow:** none. **V7 rounded-everything:** radii are token-based (`rounded-overlay-sm`, `rounded-pill` for circles). **V8 pill spam:** none.
- **Gradients** (area fill, sparkline fill, accent tint) are legitimate chart fills bound to resolved series colors — explicitly exempt per rubric §26.
- **Verbal tells (E1–E8):** doc + JSDoc are direct and prescriptive; no em-dash tic as connector, no AI-vocabulary, no hedging, no emoji. Clean.
- **Tokens (G2):** spacing `gap-ds-*`/`mt-ds-*`, colors `var(--color-surface-*)`, `text-ds-*` throughout; no raw hex/px shadows; `bg-linear-to-*` (not dead `bg-gradient`). Axis/grid stroke via `var(--color-surface-border*)`.
- **Surface (G1):** tooltip on `bg-surface-overlay` (correct for a floating overlay). No card-on-surface-1 violation.
- **Reduced motion (M3, entrance):** respected via MotionProvider context in every chart + sparkline.
- **forwardRef/displayName:** present on every public component.
- **Gauge a11y:** `role="meter"` + `aria-valuenow/min/max` correctly applied (gauge-chart.tsx:110-114).
