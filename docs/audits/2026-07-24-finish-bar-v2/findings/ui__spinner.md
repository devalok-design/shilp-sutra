# ui/spinner — finish-bar audit
Finish: 4/5   Market: LEADS (state-transition choreography; PARITY on base spin vs Geist/MUI)   Rebuild: polish

Leaf SVG primitive: animated arc loader with `spinning → success (check) / error (X)` state machine, `filled`/`bare` variants, `delay` flicker-guard, `onComplete` callback. Non-CVA. Interactive/keyboard axes are N/A (non-interactive status glyph).

## Scores
| Axis | Verdict | Note |
|---|---|---|
| 1 visual-integrity | ✓ | Pure SVG glyph. Semantic tokens (`--color-accent-9/success-9/error-9`, `--color-surface-border`). No edge-soup/glow/glass/gradient/emoji. No `rounded-ds-*`/`rounded-full`. Sizes via `h-ico-*/w-ico-*` tokens, not arbitrary values. Clean. |
| 2 accessibility | gap | `role="status"` + per-state sr-only text, `forwardRef<HTMLSpanElement>`, `displayName`, axe passes. But sr text is hardcoded English (`Loading...`/`Complete`/`Error`) with no `label`/`aria-label` override → i18n + specificity gap. No explicit `aria-live` (implicit polite covers it). Touch-target/focus/keyboard N/A (non-interactive). `forced-colors`: raw `var(--color-*)` strokes won't map to system colors (low sev for a status glyph). |
| 3 api-composability | gap | `variant?: 'filled' \| 'bare'` is off the canonical `solid/soft/outline/ghost/link` taxonomy — `filled` is the exact flagged synonym for `solid`, `bare` is a one-off not shared with siblings. It's really a presentational sub-mode, not the variant axis. No `label` override. Otherwise strong: typed `SpinnerProps`, controlled `state`, `delay`, `onComplete`, sensible defaults. `asChild` correctly N/A (no polymorphic target). |
| 4 docs-dx | ✓ | Per-component doc now exists (prior audit's gap closed) and matches source: props/defaults/example/composability/gotchas all accurate. JSDoc is rich. Nit: doc doesn't warn that `onComplete` is dropped under reduced-motion. |
| 5 testing | gap | RTL + `vitest-axe` + role/sr-text-per-state/size-class/delay/track-circle coverage. But no test for `onComplete` firing, no reduced-motion path test (which would catch the broken contract), no success/error icon-render assertion. No `describeConformance` (acceptable — not CVA). |
| 6 motion | gap | Choreographed sequence, intentional easing (`linear` spin loop, `easeInOut`/`easeOut` transitions), no bounce-by-default, animates only `rotate`/`strokeDasharray`/`pathLength`/`opacity` (HW-friendly), every `motion.*` has a `prefersReduced` static fallback. BUT durations are hand-rolled magic numbers (`0.4/0.3/0.25/0.35/0.5`s) off the shared `lib/motion.ts` `durations` scale, and the reduced-motion branch drops `onComplete` (see axis 7). |
| 7 state-coverage | gap | spinning/success/error each deliberately designed across both variants + reduced-motion. **Behavioral bug:** static reduced-motion success/error paths have no `onAnimationComplete`, so `onComplete` (documented contract) never fires for RM users — a flow that advances on the success tick silently stalls. Disabled/loading/empty N/A. |
| 8 content-resilience | ✓ | Fixed-size glyph, no wrapping text (sr-only only). Symmetric — no RTL mirroring needed. No overflow/i18n-length concerns beyond the sr-label (counted in axis 2). |
| 9 theming-resilience | ✓ | Survives accent-9 swap (token-driven), dark mode inherited via tokens, `bare`+`currentColor` adapts to any parent. No shape/radius presets needed for a glyph. Only nit: forced-colors adaptation (axis 2). |
| 10 system-cohesion | gap | Shares icon size tokens with Icon (good; Icon `state="loading"` reuses Spinner). But it's the one animated component NOT on `lib/motion.ts` duration/spring vocabulary, and `filled`/`bare` naming isn't shared with any sibling. Minor drift. |
| 11 craft | ✓ | Real thoughtfulness: thinner icon stroke for check/X than the arc (`iconStrokeWidths` < `arcStrokeWidths`) for a lighter mark; `delay` flicker-guard; fill circle `r = RADIUS + arcSw/2` to fully cover the track; larger bare icon paths since no circle constrains them; `bare` spinning uses `currentColor`. |
| 12 perceived-performance | ✓ | `delay` avoids flash on fast ops; transform/opacity/pathLength only (no layout thrash); fixed footprint → zero CLS; interruptible framer transitions on the spin loop. |
| 13 market-benchmark | ✓ (LEADS) | Base indeterminate spin is PARITY with Geist Spinner / MUI CircularProgress / Ant Spin. The arc→checkmark/error-X state machine with choreographed staging is richer than any of those (they are load-only). `delay` matches React Aria/MUI best practice. Net LEADS on transition richness. |
| 14 cross-DS-adoption | — | Ideas below. |

## Top gaps (prioritized)
- [P1] state-coverage / motion — reduced-motion drops `onComplete` (broken documented contract). → Fire `onComplete?.()` from a `useEffect`/`rAF` when the static success/error path mounts, so the callback holds regardless of motion preference. This is the only behaviorally-broken item.
- [P1] api-composability / a11y — no `label` override; sr text hardcoded English. → Add optional `label?: string` (or per-state labels) defaulting to current strings; closes i18n + "Loading projects…" specificity gap.
- [P1] api-composability — `variant: 'filled' | 'bare'` off canonical taxonomy. → Rename off the `variant` axis (e.g. `tone`/`surface`) or map `filled`→`solid`, shipping the old names as `@deprecated` aliases (rename = breaking).
- [P2] motion / system-cohesion — magic-number durations off `lib/motion.ts`. → Map choreography onto `durations.*`; keep a comment for any staging delay that genuinely can't snap to the scale.
- [P2] verbal-tell — sr-only `'Loading...'` uses a literal 3-dot ellipsis (SR reads "dot dot dot"). → `'Loading'` (or `…` glyph); update the test assertion.
- [P2] testing — add tests for `onComplete` firing (both animated and reduced-motion) + success/error icon render.
- [P3] types — `srText`/`stateColors` typed `Record<string, string>` lose exhaustiveness. → `Record<NonNullable<SpinnerProps['state']>, string>`.
- [P3] a11y — consider explicit `aria-live="polite"` + `aria-atomic` on the status span to make announce-on-completion deterministic across the content swap.

## What it does well
- Genuine anti-slop cleanliness: semantic tokens throughout, no arbitrary values, no radius/shadow/glow tells.
- State-machine spinner (load → success/error) is a real differentiator vs market peers that only spin.
- Reduced-motion handling is comprehensive — every animated element has a static fallback (the `onComplete` omission is the sole crack).
- Craft details (differential stroke widths, delay flicker-guard, currentColor bare mode, track-covering fill radius) that users feel without noticing.
- Doc + stories + tests all present and accurate; stories exercise sizes, states, variants, delay, button context, live transitions.

## Cross-DS adoption ideas
- **React Aria / MUI determinate progress** — Spinner is indeterminate-only. A `value?: number` determinate mode (arc as progress ring, reusing the existing `strokeDasharray` math) would cover upload/download progress without a separate component.
- **React Aria requires an accessible name** on progress indicators — formalize the `label` prop as the first-class way to name the status, matching their contract.
- **Sonner's loading→result toast** — Spinner already has `onComplete`; document the canonical `spinning → success → auto-dismiss` recipe so consumers wire the state machine consistently (Sonner made this the default mental model for async feedback).
- **Geist's multi-bar spinner** — an alternative determinate-agnostic visual for dense/inline contexts; optional, low priority.

## Rebuild note
Polish, not rebuild — the structure, visuals, motion architecture, and reduced-motion scaffolding are sound and market-leading on the transition choreography. Scope: (1) fire `onComplete` in the reduced-motion branch (behavioral fix), (2) add `label` prop, (3) restage the `filled`/`bare` prop off the `variant` taxonomy with deprecated aliases, (4) pull durations onto `lib/motion.ts`, (5) drop the `...` ellipsis and tighten lookup types + add the missing tests. No structural teardown warranted.
