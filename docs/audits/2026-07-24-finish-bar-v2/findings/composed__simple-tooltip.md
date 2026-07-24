# composed/simple-tooltip — finish-bar audit
Finish: 3/5   Market: PARITY (Radix Tooltip)   Rebuild: polish

SimpleTooltip is a thin one-liner wrapper over the `ui/tooltip` compound
(`TooltipProvider` + `Tooltip` + `TooltipTrigger asChild` + `TooltipContent`). It composes the
base primitive cleanly — no re-rolled surface, motion, or tokens — and inherits all visuals/motion
from `TooltipContent`. Visual, theming, cohesion and perceived-perf are all at bar. It drops from
the baseline's 4/5 to **3/5** under this rubric because (a) its test file has been deleted, so the
component's entire reason to exist (show content on hover/focus) is now untested at this layer;
(b) the doc makes a behavioral claim the code contradicts; (c) the `...props`/`ref` typing surface
mis-routes props to the wrong DOM node; and (d) the inherited motion has no reduced-motion guard.
No P0 (no a11y failure, no slop), so it stays shippable — but these are real gaps, not nits.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | ✓ | Delegated to `TooltipContent`: `rounded-overlay-sm` (role), `bg-surface-inverted`/`-fg` (correct inverted tooltip surface), `shadow-floating` (role), `px-ds-04 py-ds-02b` token spacing. No edge-soup, no dead class, no `rounded-ds`/`full`, no magic numbers. |
| accessibility | gap | Radix gives correct `role="tooltip"` + `aria-describedby` + Escape + hover/focus triggers (solid foundation). But `ref` typed `HTMLButtonElement` while `asChild` lands it on the consumer's element (could be a link/span); focusable-single-child requirement is undocumented — a non-focusable child silently loses keyboard reach and the test uses a `<button>` so axe won't catch it. Touch (no hover) is an inherited Radix limitation. |
| api-composability | gap | `content: ReactNode` ✓, `forwardRef`+`displayName` ✓, composes the primitive ✓. But props typed as `ComponentPropsWithoutRef<'div'>` are spread onto the portalled content bubble, not the trigger; `ref` mistyped vs `asChild`; no `open`/`defaultOpen`/`onOpenChange` passthrough (doc even sends you to `ui/Tooltip` for it); no `sideOffset`; no trigger-vs-content `className` split. |
| docs-dx | gap | Has Props/Defaults/Example/Composability/Gotchas. But makes a FALSE claim: "SimpleTooltip respects [an ancestor] TooltipProvider if present" — the code (`<TooltipProvider delayDuration={delayDuration}>`, unconditional) always mounts its own provider and shadows the ancestor's `delayDuration`. Source-is-truth: doc lies. |
| testing | ✗ | No test file exists (deleted since the 2026-07-01 baseline, which cited `simple-tooltip.test.tsx:9-26`). Stories exist but no `play`/interaction — the tooltip is never opened, `role="tooltip"` never asserted, no axe test, no reduced-motion path. Core behavior wholly untested at this layer. |
| motion | gap | Inherited from `TooltipContent`: `springs.snappy` (stiff 500 / damp 30 — controlled, bounce-free) + `tweens.fade` (110ms easeOut) + scale 0.95→1 + per-side directional slide; transform/opacity only (HW-accel); interruptible spring; `AnimatePresence` exit. GOOD — but NO `useReducedMotion`/`withReducedMotion` guard (the helper exists in `lib/motion` and is unused), and tooltips fire very frequently. Scale origin is center, not the anchored edge. Belongs to `ui/tooltip`, surfaces here. |
| state-coverage | ✓ | Applicable states are open/closed + hover/focus-in, all handled by Radix + the enter/exit animation. No disabled/loading/empty/error semantics apply to a label tooltip. |
| content-resilience | gap | `content` is `ReactNode`, rich content works, bubble is `overflow-hidden`. But no `max-width` cap — a long string stretches the bubble edge-to-edge with no wrap ceiling. Per-side slide uses physical `x` offsets (not logical); Radix flips `side` under `dir` but the motion offset won't mirror. |
| theming-resilience | ✓ | `bg-surface-inverted` inverts correctly light↔dark (intentional high-contrast, not a recess — no elevation-inversion trap); role radius honors `[data-shape]`; uses no accent, survives accent-9 swap. |
| system-cohesion | ✓ | Shares the DS spring (`springs.snappy`), tween (`tweens.fade`), role radius, role shadow, surface + spacing tokens with its siblings. No bespoke drift. |
| craft | gap | Nice touches: `asChild` polymorphic trigger, portal, collision avoidance, per-side directional entrance. Undermined by the props-land-on-the-wrong-node wart and no reduced-motion — exactly the unseen details this axis grades. |
| perceived-perf | ✓ | Instant, portalled, `forceMount`+`AnimatePresence` so exit animates cleanly; no layout shift; HW-accel transform/opacity; 300ms default delay is standard. |
| market-benchmark | PARITY | We ARE Radix (vendored `@primitives/react-tooltip`) + a motion layer, so we match it and our directional slide+spring+fade edges bare Radix (which ships no motion). We do NOT lead: no arrow, no `disableHoverableContent`/`skipDelayDuration` surfaced, no reduced-motion guard, no touch story. |
| cross-ds | ✓ | Ideas below. |

## Top gaps (prioritized)
- [P1] docs-dx — doc claims it "respects" an ancestor `TooltipProvider`, but it unconditionally mounts its own and shadows the ancestor's `delayDuration`. → Prefer the code fix: make the internal `TooltipProvider` conditional on `TooltipProviderContext` (mirror `AutoProvider`) so the ancestor's delay genuinely wins; otherwise correct the doc.
- [P1] api-composability — `...props` typed as `div` attributes but spread onto the portalled content bubble while `ref` (typed `HTMLButtonElement`) lands on the `asChild` trigger of unknown type. → Drop the `ComponentPropsWithoutRef<'div'>` extension; accept only the real props plus an explicit `className` (→ content, documented) and optionally `triggerProps`; type `ref` as `HTMLElement` given `asChild`.
- [P1] testing — zero tests (regressed from baseline). → Add an RTL test that hovers/`.tab()`s the trigger and asserts `findByRole('tooltip')` shows `content`, plus a `vitest-axe` pass and a `play` on the Default story that opens the tooltip.
- [P2] motion — no reduced-motion guard on the inherited entrance/exit (`ui/tooltip`). → Gate the `motion.div` transition through `useReducedMotion()`/`withReducedMotion` at the `TooltipContent` layer.
- [P2] api-composability — no `open`/`defaultOpen`/`onOpenChange` passthrough forces a drop to the full compound for the common force-show case. → Forward them as optional props to `<Tooltip>`.
- [P3] content-resilience — no `max-width` cap on long content. → Add a sensible default `max-w` on the bubble (or expose `maxWidth`).
- [P3] a11y/docs — undocumented "child must be a single focusable element" contract. → State it in Gotchas; consider a dev-only warning.

## What it does well
- Textbook "compose, don't re-roll" — wraps the `ui/tooltip` compound instead of duplicating portal/surface/motion. Ships no classes of its own; every visual is a role/surface token inherited from `TooltipContent`.
- Correct inverted-surface tooltip (`bg-surface-inverted`) that reads in both themes with no elevation-inversion risk.
- Fully in-tune motion: shared `springs.snappy` + `tweens.fade`, per-side directional slide with a genuine `opacity:0` start (NOT slide-no-fade), interruptible spring, clean `AnimatePresence` exit.
- Sensible defaults (`side="top"`, `align="center"`, `delayDuration=300`), `forwardRef` + `displayName`, `content: ReactNode` (not stringly-typed).

## Cross-DS adoption ideas
- **Radix** exposes `TooltipArrow` and `disableHoverableContent` — we surface neither; an optional `arrow` prop and a hoverable-content toggle would close the gap with the primitive we already vendor.
- **Radix/Base UI** offer `skipDelayDuration` (fast successive tooltips skip the delay) at the provider — worth threading through since we always mount our own provider anyway.
- **Base UI Tooltip** anchors `transform-origin` to the trigger edge so the scale-in emanates from the anchor; ours scales from center. Cheap polish via a per-side `transformOrigin`.
- **React Aria (Adobe)** ships a real touch/long-press tooltip story — the single biggest true UX gap for tooltips (Radix/ours effectively don't show on touch).
- A `maxWidth` prop (Tremor/MUI convention) for the long-content wrap ceiling.

## Rebuild note
**Polish, not rebuild.** The composition is correct and the structural choice (thin wrapper over the compound) is right. Every gap is an in-place fix: (1) honest typing surface + `ref` type, (2) reconcile the provider behavior with the doc — prefer making the internal provider conditional so the ancestor's `delayDuration` wins, (3) restore a hover/focus + axe test and a `play` story, (4) add a reduced-motion guard at the `ui/tooltip` layer (benefits every tooltip, not just this one), (5) optional `open`/`onOpenChange` passthrough and a `max-width` cap. No API-vocabulary break and no visual rework required.
