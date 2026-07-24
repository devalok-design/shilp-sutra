# composed/deadline-indicator — finish-bar audit

Finish: 3/5   Market: LAGS(GitHub relative-time / React Aria)   Rebuild: polish

DeadlineIndicator is a leaf inline-status `<span>`: it parses a `deadline`, computes
minutes-remaining, maps it to a success→warning→error text color, formats relative or
absolute time, and pulses opacity when critical/overdue. Structurally clean — no surface,
no card, no accent rail, no gradient, no emoji, no radius, semantic color tokens throughout.
Since the 2026-07-01 baseline (3/5) the headline motion gap is **fixed** (a proper
`useReducedMotion()` guard now gates the pulse and falls through to a static span). What
remains are the accessibility live-region gap, a doc that contradicts the source, an
off-scale motion literal, and an unhandled invalid-date edge. Non-interactive atom, so
hover/active/focus/keyboard/touch-target axes are N/A.

## Scores

| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | ✓ | No edge-soup/gradient/emoji/radius. Semantic `text-{success,warning,error}-11`, `text-body-sm` composite utility, `gap-ds-01` (fine for icon↔text). Mild reflex: far-off deadlines render saturated `success-11` green ("status-color-everything"); a neutral/muted default would read as "color = urgency". Redundant `font-sans` on both spans (sans is already the body default). |
| accessibility | gap | **P1.** The 60s `setInterval` re-renders the text ("12h left"→"Overdue") but the span has no `role="status"`/`aria-live` — auto-updates are never announced. No semantic `<time datetime>` element. Warning vs critical differ only by color (both read "Xh left"); the numeric value is the primary signal so it's not a strict 1.4.1 sole-color failure, but an `aria-label` naming the tier ("Critical: 2h left") would close it. axe passes (no interactive element, contrast-safe `-11` tokens). |
| api-composability | ✓ | `forwardRef<HTMLSpanElement>` + `displayName`, extends `HTMLAttributes<HTMLSpanElement>`, typed number thresholds, `format` string-union, no `any`. Sensible defaults (1440/240/60000). Leaf node — correctly does not reach for `asChild`/slots. `refreshInterval={0}` disables ticking (nice escape hatch). |
| docs-dx | ✗ | **Doc contradicts source.** `deadline-indicator.md:28,34` states "**Doesn't live-update** … does not live-update (re-render to refresh)" while the source auto-refreshes every `refreshInterval` (default 60000) via `setInterval(forceUpdate)`. A consumer trusting the doc adds a redundant parent ticker. Also `refreshInterval` is absent from the Props/Defaults tables. Source-is-truth rule violated. |
| testing | ✓ | `describeConformance` + 8 specs + `vitest-axe`; covers all four color tiers, "Overdue"/"Overdue by 2d", sub-minute overdue, string-input parsing, `showIcon` SVG. Solid. Missing: reduced-motion branch and the auto-refresh tick (would need fake timers). |
| motion | gap | Reduced-motion guard now correct (`prefersReduced` → static span, since a MotionConfig can't stop a non-transform opacity loop). But `transition={{ duration: 2, repeat: Infinity }}` is a **raw literal off the `ui/lib/motion.ts` `durations` scale** (longest preset is `slow02: 0.7`) — the timing equivalent of a hardcoded px. Opacity-only (HW-safe), but a keyframe loop is non-interruptible and a board of overdue rows all pulsing at 2s is a soft 2.2.2 concern for non-reduced-motion users. |
| state-coverage | gap | Four urgency tiers deliberately designed (success/warning/critical/overdue) + bold escalation on overdue + pulse on critical/overdue only. But **invalid input is unhandled**: `deadline="garbage"` → `new Date` is `Invalid Date` → `minutesRemaining` is `NaN` → every comparison is false → falls through to green `success-11` with text `"NaNd left"`. No guard/empty/error state. |
| content-resilience | gap | Relative strings ("left", "Overdue by ", "m/h/d") are **hardcoded English** while `formatAbsolute` uses locale-aware `toLocaleDateString` — inconsistent i18n. No `Intl.RelativeTimeFormat`. No overflow risk (short computed text). RTL: inline-flex + gap is safe, no logical-property issues. Invalid-date "NaN" (see state). |
| theming-resilience | ✓ | Semantic `-11` foreground tokens survive brand accent swap and light↔dark inversion; no surface/elevation to vanish. No radius so `[data-shape]` is irrelevant. |
| system-cohesion | ✓ | Composes sibling `SimpleTooltip`, the `Icon` API, `motionProps`, `useReducedMotion`, `cn`, and DS type/spacing utilities. One drift: the `duration: 2` literal bypasses the shared motion scale its siblings pull from (folded into the motion axis). |
| craft | ✓ | Thoughtful touches: tooltip surfaces the absolute timestamp on relative format; bold-semibold escalation at overdue; pulse reserved for critical/overdue (not warning); `useMemo` for date parse; `clearInterval` cleanup on unmount; `refreshInterval` falsy short-circuits the effect. |
| perceived-performance | ✓ | Instant render, no layout shift, trivial cost. Minor: each instance owns its own `setInterval` — a page with many indicators has N unsynced tickers rather than one shared clock (fine at current scale). |
| market-benchmark | gap | **LAGS.** vs GitHub `<relative-time>` and React Aria date formatting: we lack a semantic `<time datetime>` element, use English-only relative strings instead of `Intl.RelativeTimeFormat`, have no `aria-live`, and use a per-instance ticker vs a shared one. We LEAD on the urgency color-tiering + threshold props, which neither peer bundles. |
| cross-DS-adoption | ✓ | Concrete import ideas listed below. |

## Top gaps (prioritized)

- **[P1] accessibility** — auto-updating urgency is silent to AT and not a semantic time element → render a `<time dateTime={deadlineDate.toISOString()}>`, add `role="status"`/`aria-live="polite"` so the 60s ticks and threshold crossings announce, and set `aria-label` naming the tier (`"Critical: 2h left"`) so warning/critical isn't reinforcement-only.
- **[P1] docs-dx** — doc says the exact opposite of the behavior ("doesn't live-update") and omits `refreshInterval` → rewrite both lines to describe the `refreshInterval` auto-refresh (default 60000; `0` disables) and add the prop to the Props/Defaults tables.
- **[P2] state-coverage** — invalid `deadline` yields green `"NaNd left"` → guard `isNaN(deadlineDate.getTime())` and render a neutral fallback (em-dash or `"—"`) instead of a false on-track green.
- **[P2] motion** — `duration: 2` is off the DS timing scale → add a named `pulse`/`attention` loop preset to `ui/lib/motion.ts` (or a commented local const) and soften the floor (e.g. `0.85` not `0.7`) so a list of overdue rows isn't a strobe field.
- **[P2] content-resilience / i18n** — English-only relative strings → adopt `Intl.RelativeTimeFormat` for locale-aware "in 2 hours" / "2 days ago" to match the already-locale-aware absolute path.
- **[P3] visual-integrity** — re-tier the far-off default to muted/neutral text and drop the redundant `font-sans`, so color reads strictly as "pay attention."

## What it does well

- Reduced-motion is now handled correctly (the baseline's headline P1), including the subtle detail that a non-transform opacity loop can't be stopped by MotionConfig, so it drops to a static span rather than trying to zero the transition.
- Clean leaf architecture: correct `HTMLSpanElement` ref, `forwardRef` + `displayName`, no `any`, no re-rolled primitives — composes `SimpleTooltip`/`Icon`.
- Genuinely considered micro-details: absolute-time tooltip on the relative view, semibold escalation at overdue, pulse gated to critical/overdue only, interval cleanup, and a `refreshInterval={0}` opt-out.
- Strong test coverage across all urgency tiers plus conformance + axe.

## Cross-DS adoption ideas

- **GitHub `@github/relative-time-element`** renders a semantic `<time datetime>` with the machine-readable timestamp as the accessible name and a human string as content — adopt the `<time>` element so the exact instant is always available to AT and copy-paste, independent of the rendered relative string.
- **GitHub relative-time / Intl** drive text from `Intl.RelativeTimeFormat` + `Intl.DateTimeFormat` — import this to make the relative path locale-aware (we already do it for absolute) and kill the hardcoded English "left"/"Overdue by".
- **React Aria (`useDateFormatter`)** centralizes a locale/timezone-aware formatter — a shared formatter (and a single shared ticker interval) would replace our per-instance `setInterval` and English literals at once.

## Rebuild note

**Polish, not rebuild.** The component is structurally sound — a correctly-typed leaf `<span>` with clean tokens, proper reduced-motion handling, and good test coverage. All gaps are in-place fixes: swap the wrapping element to `<time>` + add `role="status"`/`aria-live`/tier `aria-label`; tokenize the pulse duration into the motion lib; guard the invalid-date NaN path; move relative formatting to `Intl.RelativeTimeFormat`; and correct the two doc lines plus the missing `refreshInterval` row. Optionally collapse the two near-identical render branches (pulse `motion.span` vs static `span`) into one element with conditional animate props while doing the a11y work. No structural or API change required.
