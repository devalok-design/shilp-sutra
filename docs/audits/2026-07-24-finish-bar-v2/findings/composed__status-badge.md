# composed/status-badge — finish-bar audit

Finish: 3/5   Market: PARITY   Rebuild: polish

StatusBadge has been substantially rebuilt since the 2026-07-01 baseline (2/5). The headline gap then — "re-rolls ui/Badge" — is **fixed**: it now composes `<Badge variant="soft">` + `<Dot>` and owns only the `status → color` mapping table. That cascade of fixes came for free: focus-visible ring, press feedback, real `<button>`, single-source color map, neutral-surface drift, and the `ref as any` / stringly-typed maps are all resolved via composition and a properly typed `Record<StatusKey, IntentColor>`. The doc's "Built on ui/Badge" claim is now true.

What remains is a single stubborn regression carried straight from the baseline: the entrance/morph animation still has **no `useReducedMotion` / `motion-safe` guard**, and it fires an entrance pop on *every* mount — so a table of 50 status pills all scale-pop, ignoring the OS reduced-motion setting. That plus a few passthrough gaps (no `disabled`, no `truncate`, `onClick` drops the event, sub-44px interactive target) keep it at a high 3 rather than a 4.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | ✓ | Composes Badge `soft` (bg-*-3 / text-*-11, transparent border) + Dot fill. No accent rail, gradient, edge-soup, or emoji. `rounded-pill` role token (inherited). No arbitrary values in this file. |
| accessibility | gap | Interactive mode gets a real `<button>` + focus-visible ring + press feedback (all via Badge); Dot is `aria-hidden`, label carries the text. But Badge `md` is `h-6` (24px) — the clickable variant is a sub-44px touch target. No `touch-target` util applied for the interactive branch. |
| api-composability | gap | Now composes Badge+Dot correctly; discriminated `status|color` union; `forwardRef`+`displayName`; typed unions. But `onClick: () => void` drops the event; no `disabled`, `truncate`, `maxWidth`, `asChild`, or `pulse` passthrough that Badge/Dot already expose. Display-only, so no controlled/uncontrolled need. |
| docs-dx | ✓ | Doc now accurate (composition claim true), has Props/Defaults/Example/Composability/Gotchas/Changes. Minor: doc types `icon` as `ReactNode` (source is `IconInput`); no mention of the morph animation or reduced-motion behavior. |
| testing | gap | `describeConformance` + 20 behavior tests (status/color/label/dot/hideDot/clickable button/type/cursor/custom icon/backward-compat). No focus-ring assertion, no reduced-motion assertion, no explicit disabled-state test (no prop to test). Good breadth, shallow on motion/focus. |
| motion | ✗ | **No `useReducedMotion` / `motion-safe` guard** on the `initial={{opacity:0.6, scale:0.95}} animate={{...}}` entrance — runs on every mount regardless of OS setting (WCAG 2.3.3). Should-it-animate fails: a high-frequency display pill shouldn't pop on each render. `AnimatePresence mode="wait"` makes a status change a serial exit(0.3s)+enter(0.3s) ≈ 0.6s morph. Bespoke `{duration:0.3, ease:'easeOut'}` instead of the shared `tweens`/`durations` presets. |
| state-coverage | gap | hover/active/focus-visible covered via Badge. No `disabled` exposed (Badge has it) — an interactive status pill can't be disabled. No loading/empty (n/a for a display pill). |
| content-resilience | gap | No truncation strategy — long labels overflow (Badge `truncate`/`maxWidth` not exposed). No i18n length handling. `titleCase(...).replace('-', ' ')` only capitalizes the first word ("In progress", not "In Progress"). RTL: chevron-down is orientation-neutral so acceptable. |
| theming-resilience | ✓ | Semantic `*-3/*-11` (Badge) + `*-9` (Dot fill) tokens → survives accent-9 swap. `rounded-pill` honors `[data-shape]`. Soft tint + `-9` dot both hold up in dark; no sunken-track inversion risk (it's a raised pill, not a recess). |
| system-cohesion | gap | Shares radius/focus/spacing/color language with siblings via composition — strong. Docked only for the bespoke `statusMorphTransition` (hardcoded `0.3`/`easeOut`) instead of `springs`/`tweens`/`durations` presets — the comment even name-drops `durations.moderate02`/`slow01` but doesn't use them. |
| craft | ✓ | Nice affordances: auto chevron for clickable badges, custom-icon override, `Dot size="sm"` leading, cursor-pointer via Badge. The status-keyed morph is a thoughtful touch — undercut only by it being unconditional (see motion). |
| perceived-performance | ✓ | Static, instant. Transform/opacity-only animation → no CLS. `mode="wait"` adds latency to status *changes* but no layout shift. |
| market-benchmark | PARITY | vs Ant `Badge status`, Mantine, shadcn/Geist Badge, Linear status pills. Our semantic `status→color` mapping + optional interactive/chevron is **richer than shadcn** (which has no StatusBadge — you hand-roll Badge) and comparable to Ant's status badge. The unguarded entrance animation + sub-44px interactive target keep it from LEADS. |
| cross-ds-adoption | — | See ideas below. |

## Top gaps (prioritized)
- [P0] motion — entrance/morph animation has no `useReducedMotion`/`motion-safe` guard and fires on every mount → gate it: skip the entrance pop when reduced-motion is set (or use `withReducedMotion` from `lib/motion`), and consider `initial={false}` so mount is silent and only *status changes* morph.
- [P1] accessibility — interactive (`onClick`) badge is a 24px-tall (`h-6`) target; apply the `touch-target` util (or bump min-height) when clickable so it clears 44px.
- [P1] api-composability — expose `disabled` (Badge has it), and change `onClick` to forward the event (`(e) => void`) so consumers opening a picker get the anchor.
- [P2] content-resilience — pass `truncate`/`maxWidth` through to Badge for long labels; fix `titleCase` to capitalize each word ("In Progress").
- [P2] system-cohesion — replace the hardcoded `{duration:0.3, ease:'easeOut'}` with a shared preset (`tweens.layout` / `durations.*`).
- [P2] testing — add a reduced-motion assertion and a focus-ring interaction test for the clickable branch.

## What it does well
- **Composition done right** — the exact StatCard→Card pattern the baseline demanded: owns only the `STATUS_TO_COLOR` table, delegates shell/dot/icon/focus/press/motion to Badge+Dot. Four former sources of truth collapsed to one.
- **Type discipline** — discriminated `status|color` union with `never` guards; `Record<StatusKey, IntentColor>`; `IntentColor = Exclude<DotColor,'current'>` prevents the internal `current` mode leaking in. No `any`.
- **Sensible interactive affordance** — auto chevron on clickable badges, overridable via `icon`, real `<button type="button">` with inherited focus ring and `active:scale` press feedback.
- **Clean visuals** — soft tint pill + filled dot, semantic tokens throughout, `rounded-pill`, zero anti-slop tells or magic numbers in the component file.

## Cross-DS adoption ideas
- **Ant `Badge status` "processing"** — a pulsing dot for live/in-progress states. We already have `Dot pulse`; expose a `pulse` (or auto-pulse `active`/`in-progress`) passthrough so a running status reads as live.
- **Linear/GitHub status transitions** — announce status *changes* via `aria-live="polite"` (or `role="status"`) so the visual morph has a screen-reader equivalent; today the change is silent to AT.
- **Radix/Base UI polymorphism** — expose `asChild` so a status pill can *be* a link (status → filtered view), inherited free from Badge.
- **Geist/shadcn** — none to import; we lead on the built-in status taxonomy.

## Rebuild note
**Polish, not rebuild** — the structure is already correct (composes Badge+Dot, typed, documented, tested). Scope: (1) guard the entrance/morph motion behind reduced-motion and prefer `initial={false}` so only status *changes* animate; (2) add a 44px touch target + `disabled` for the interactive branch; (3) forward the click event and pass through `truncate`/`maxWidth`/`pulse`; (4) swap the bespoke transition for a shared preset; (5) backfill focus + reduced-motion tests. All in-place edits to a ~106-line file — no structural change.
