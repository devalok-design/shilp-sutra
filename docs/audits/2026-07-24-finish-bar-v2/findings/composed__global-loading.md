# composed/global-loading — finish-bar audit
Finish: 3/5   Market: LAGS(nextjs-toploader / NProgress)   Rebuild: polish

A thin top-of-viewport route-progress bar (NProgress archetype). Single required
boolean `isLoading`; three-phase CSS state machine (grow→80% while pending,
race→100%+fade on complete, collapse to `w-0 opacity-0` when idle). Architecture
is sound; the gaps are finish-level, not structural.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | gap | Clean flat 4px `bg-accent-9` bar, no edge-soup, no radius, no accent-rail. But the completion phase applies a **hardcoded inline `boxShadow: '0 0 8px var(--color-accent-9)'`** (global-loading.tsx:50) — bypasses the shadow-role token system. The glow *concept* is peer-canonical (NProgress ships a `.peg` glow), so it's a hygiene/tokenization miss, not a pure slop tell. |
| accessibility | gap | `role="progressbar"` + `aria-label` + `aria-hidden` toggle + `aria-valuetext`; `pointer-events-none` so it never blocks the page. Indeterminate → omitting `aria-valuenow` is fine. But pairing `aria-hidden` with no `aria-live` means SR users get **no announcement** when navigation starts/ends. No `forced-colors` fallback — a `bg-accent-9` fill can flatten/vanish in high-contrast mode. |
| api-composability | gap | Clean types, `forwardRef`+`displayName`, spreads `ComponentPropsWithoutRef<'div'>`, no `any`. But placement/height/z-layer fully baked (`fixed inset-x-0 top-0 z-toast h-1`); no `position`/`placement` prop, no `asChild`; the 80% park target is hardcoded. Least composable in the family (acceptable for a narrow primitive, but zero escape hatch beyond `className`). |
| docs-dx | ✗ | Doc still asserts **"Auto-unmounts when isLoading=false"** and **"Renders nothing when isLoading is false"** (global-loading.md:22,26) — both **false**: the fixed wrapper `<div>` is always mounted; only the inner bar collapses. Flagged in the 2026-07-01 baseline, still unfixed. Stories cover 4 scenarios but have **no axe/interaction play test**. |
| testing | gap | Test file now exists (`__tests__/global-loading.test.tsx`) — improvement over baseline's "none" — but it's **2 axe smoke tests only**. No assertion of `aria-hidden`/role toggling with `isLoading`, no timeout-cleanup-on-unmount test, no width-class transition coverage, no `describeConformance`. The stateful `onTransitionEnd`+200ms-timeout machine is exactly what regresses silently and is untested. |
| motion | gap | Good: `duration-slow-01` + `ease-productive-standard` tokens (no bounce), plain CSS transitions so the global `prefers-reduced-motion` reset zeroes them automatically. But **animates `width`** (layout prop) not a `scaleX`/`opacity` transform — off the HW-accel rule (cheap here at 1px, still non-conformant). Parked-80% then jump-to-100% has no trickle, so the pending phase reads static rather than alive. |
| state-coverage | gap | Enter / pending / completing / exit are all deliberately choreographed via the state machine — most states covered. Error/empty are genuinely N/A for a route bar. The one lazy state is **pending**: a static park at 80% instead of a designed incremental trickle. |
| content-resilience | ✓ | No text/overflow/i18n surface — it's a fixed-width color line. Minor RTL nit: fill anchors physical-left (`w-4/5`) rather than logical inline-start, but stakes are near-zero for a symmetric top bar. |
| theming-resilience | gap | Survives an accent-9 swap (bar + glow both track `--color-accent-9`). No radius → `[data-shape]` N/A. No elevation-inversion risk (it's an emissive bar, not a recess) so dark mode is safe. Remaining risk: no `forced-colors` handling — background fill can disappear for high-contrast users. |
| system-cohesion | gap | Motion tokens, `z-toast`, `bg-accent-9` are all cohesive with siblings. Drift: the inline hardcoded `boxShadow` (no shadow-role token) + `h-1` uses raw Tailwind spacing rather than the `--spacing-ds-*` namespace + width-animation diverges from the transform convention. |
| craft | gap | Real craft: `pointer-events-none` (never traps clicks), timeout tracked in a ref and cleared on unmount (no leak — a prior v0.18.0 fix), `aria-hidden` when idle, tidy 3-phase `onTransitionEnd` choreography. Undersold by the static 80% park and a whole-bar glow (vs a crafted leading peg). |
| perceived-performance | gap | Instant feedback on `isLoading=true`; no layout shift / CLS (fixed + pointer-events-none, page never reflows). But width-animates (layout per frame) and the parked-80% can read as "stuck" under a slow load, where a trickle would feel responsive. |
| market-benchmark | gap | LAGS nextjs-toploader / NProgress — see verdict below. |
| cross-DS-adoption | gap | Concrete imports available — see ideas below. |

## Top gaps (prioritized)
- [P1] docs-dx — doc's "auto-unmounts / renders nothing" claims are false and mislead consumers on DOM/stacking reasoning → rewrite to "always mounted; inner bar collapses to `w-0 opacity-0` and fades when idle; `pointer-events-none` so it never blocks; `aria-hidden` when idle." (Carried unfixed from 2026-07-01 baseline.)
- [P1] visual-integrity / system-cohesion — hardcoded inline `boxShadow: '0 0 8px var(--color-accent-9)'` bypasses the shadow-token system → either drop it or promote it to a named `@utility` shadow role and (ideally) scope it to a leading peg element rather than the whole bar.
- [P2] testing — expand beyond 2 axe smoke tests → assert role/`aria-hidden` toggle with `isLoading`, timeout-clear-on-unmount, and the width-class transition path (loading→complete→collapsed).
- [P2] motion — animates layout prop `width` → switch to `scaleX` + `origin-left` (transform/opacity only) to stay on the HW-accel rule; keep the opacity fade.
- [P2] accessibility — no SR announcement of nav start/end and no `forced-colors` fallback → add an `aria-live="polite"` visually-hidden status (or `aria-busy` on root) and a `forced-colors` fill fallback.
- [P3] api-composability — fully baked `top-0`/`h-1`/`z-toast` placement and hardcoded 80% target → optional `placement`/`position` and a configurable target/trickle if extended.

## What it does well
- Correct z-layer, `bg-accent-9` semantic fill, motion tokens (`duration-slow-01`, `ease-productive-standard`) — no re-rolled durations or raw z-index.
- `pointer-events-none` means the always-mounted fixed wrapper never intercepts page clicks.
- Timeout tracked in a ref and cleared on unmount — no leak (v0.18.0 fix holds).
- Clean, minimal, correctly-typed API: `forwardRef` + `displayName`, spreads native div props, one honest required boolean.
- No radius tokens at all → immune to the `rounded-ds-*`/`rounded-full` release-gate trap; no edge-soup, no accent rail, no gradient/glass/emoji tells.

## Cross-DS adoption ideas
- **NProgress trickle algorithm** — increment the bar by a shrinking random delta on an interval while pending, instead of parking at a static 80%. Makes slow loads feel alive rather than stuck. This is the single biggest market gap.
- **nextjs-toploader's leading peg** — its default glow is a small element pinned to the bar's leading edge (`box-shadow` peg), not a halo on the whole bar. If we keep a glow, adopt the peg pattern via a token; it reads more crafted and is peer-canonical.
- **Configurability props** — nextjs-toploader/NProgress expose `color`, `height`, `speed`/`easing`, `showSpinner`, and (effectively) placement. A `placement`/`height`/`showSpinner` surface would close the composability gap without a rebuild.
- **App Router integration recipe** — ship a documented Next.js `useRouter`/navigation-events wiring snippet (and a react-router `useNavigation` one), which nextjs-toploader's popularity shows consumers want.

## Rebuild note
**Polish, not rebuild.** The state machine, tokening, ref-cleanup, and API shape are architecturally sound — no structural reason to rebuild. In-place fixes: (1) correct the false doc claims [P1]; (2) tokenize or drop the inline glow, ideally as a leading peg [P1]; (3) expand the test beyond axe smoke to cover the state machine + timeout cleanup [P2]; (4) migrate width→`scaleX`/`origin-left` [P2]; (5) add SR announcement + forced-colors fallback [P2]; optionally a trickle and placement prop to reach market parity with nextjs-toploader.
