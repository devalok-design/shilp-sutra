# ui/popover — finish-bar audit
Finish: 4/5   Market: PARITY (Radix Popover)   Rebuild: polish

Source verified against `packages/core/src/ui/popover.tsx` (+ `lib/bottom-sheet.tsx`, `lib/motion.ts`, `lib/use-controllable-open.ts`), `popover.stories.tsx`, `popover.test.tsx`, `docs/components/ui/popover.md`, and the 2026-07-01 baseline (4/5). Baseline P1s re-checked below — **all three remain open in source.**

## Scores
| Axis | Verdict | Note |
|---|---|---|
| 1 visual-integrity | ✓ | `bg-surface-overlay` + `rounded-overlay` (role token) + `shadow-floating` + `z-popover` + `p-ds-05`. No border, so the `--shadow-edge-ring` in `shadow-md-internal` is the single edge treatment — no edge-soup. No slop tells. `w-72` is a standard utility default, overridable (stories pass `w-60`), not an arbitrary magic value. |
| 2 accessibility | gap | Desktop path is Radix (dialog semantics, focus mgmt, Escape) + axe-clean test. **But** the mobile `BottomSheet` hardcodes `title="Options"` (popover.tsx:54) → every mobile popover gets the same generic English SR name, with no prop to override. Real a11y + i18n defect on the mobile fork (P1, not P0 — a wrong name, not a missing one). |
| 3 api-composability | gap | Canonical `open`/`defaultOpen`/`onOpenChange`, controlled+uncontrolled via `useControllableOpen`, `forwardRef`+displayName on Content, clean Trigger/Anchor re-exports (doesn't re-roll positioning), `PopoverContentProps` exported. Gaps: root typed `React.FC` (rubric-flagged anti-pattern, blocks ref + bakes implicit children); no `mobileTitle`/`aria-label` forward to the sheet; no `responsive={false}` escape hatch for the mobile swap; no `PopoverArrow` re-export. |
| 4 docs-dx | gap | Doc has Composability/Gotchas prose but **no structured Props table** for `PopoverContent` (`align`/`sideOffset`/`className`) and **zero mention of the mobile BottomSheet swap** — a material behavior (drops side/align/sideOffset/anchor below the breakpoint) that's silently absent. Changelog stamped v0.18.0. |
| 5 testing | ✓ | 8 tests: trigger render, closed/open, controlled, uncontrolled `onOpenChange`, second-click-closes, className merge, axe-clean-when-open. Gaps (minor): no `describeConformance`, and the entire mobile `BottomSheet` fork is untested (the `MobileDrawer` story has no `play` assertion). |
| 6 motion | gap | Good bones: `springs.snappy` (stiffness 500 / damping 30 — critically damped, no overshoot), animates opacity+scale (transform) only, enter+exit via `AnimatePresence`+`forceMount`, opacity split onto `tweens.fade`. **Missing `useReducedMotion` guard on the desktop path** while `BottomSheet` *does* guard — inconsistent, and a genuine RM miss. Also not origin-aware (no `--radix-popover-content-transform-origin`) so the scale-pop doesn't emanate from the anchor edge. |
| 7 state-coverage | ✓ | open/closed/controlled/keyboard-Escape all deliberate; mobile fork is a designed state. loading/empty/error are N/A (container for consumer content); hover/press delegated to the `asChild` trigger. |
| 8 content-resilience | gap | Mobile sheet has `max-h-[85vh] overflow-y-auto`; the **desktop content has no max-height / internal scroll** — long content relies on Radix collision reposition but can still overflow the viewport with no scroll affordance. RTL align start/end are logical via Radix (good). i18n weak only via the hardcoded mobile title. |
| 9 theming-resilience | ✓ | Role tokens throughout → survives accent-9 swap and honors `[data-shape]` (`rounded-overlay`). `surface-overlay` defined for light, dark, and `forced-colors` (Canvas). Floating overlay above the page, so no elevation-inversion recess bug. |
| 10 system-cohesion | ✓ | Shares `springs.snappy`, `rounded-overlay`, `shadow-floating`, `z-popover`, `bg-surface-overlay`, `useControllableOpen`, and the `BottomSheet` with DropdownMenu/HoverCard. One-system feel. (Caveat: the RM-guard miss is a family-wide *consistent* miss — cohesive, but cohesively wrong.) |
| 11 craft | ✓ | `forceMount` + context-threaded `open` to drive exit animation cleanly; `sideOffset=4` default; thoughtful mobile→sheet swap with drag-to-dismiss + velocity threshold. Minor: `outline-hidden` with no replacement treatment on content; no transform-origin. |
| 12 perceived-performance | ✓ | Snappy critically-damped spring feels instant; portal + `forceMount`; transform/opacity only → no CLS, no jank. |
| 13 market-benchmark | PARITY | Built on vendored Radix, so matches Radix on positioning/collision/a11y and **adds** an auto mobile bottom-sheet swap + shared controllable-open. **Lags** Radix/Base UI on: no exposed `Arrow`, no origin-aware scale, no RM guard, hardcoded mobile label. Net parity — the additions offset the misses. |
| 14 cross-DS-adoption | — | See ideas below. |

## Top gaps (prioritized)
- [P1] motion — desktop content path has no `useReducedMotion` guard while `BottomSheet` does → inconsistent, RM users get a scale-pop on desktop. Fix: extract a shared `useOverlayMotion()` (collapse to `{duration:0}` when reduced) and adopt across Popover/DropdownMenu/HoverCard so the family stays in lockstep.
- [P1] accessibility/i18n — `title="Options"` hardcoded on the mobile sheet (popover.tsx:54) gives every mobile popover the same generic English SR name. Fix: forward an optional `mobileTitle`/`aria-label`, default `undefined` (BottomSheet already tolerates no title).
- [P1] api — root typed `React.FC`. Fix: plain function component with an explicit props type; keep the `PopoverContentProps` export pattern.
- [P2] docs — add a Props table for `PopoverContent` and a "Responsive" section documenting the mobile bottom-sheet swap + the positioning props it drops; the swap is currently undocumented and untested.
- [P2] content-resilience — desktop content has no `max-height`/internal scroll; long content can overflow the viewport. Fix: optional `max-h` + `overflow-y-auto` on the content shell (mirror the sheet).
- [P2] api — no `responsive={false}` escape hatch for the mobile swap; consumers can't opt a specific popover out of becoming a drawer.

## What it does well
- Clean overlay visual vocabulary — single edge treatment (no border under `shadow-floating`), role radius, semantic surface, correct `z-popover` layering above Dialog.
- Correct controlled/uncontrolled contract via the shared `useControllableOpen`, with `open` mirrored into state so `AnimatePresence` can drive exit.
- Doesn't re-roll positioning — Trigger/Anchor are honest Radix re-exports; `asChild` and `className` flow through cleanly.
- Bounce-free critically-damped enter/exit on transform+opacity only — the *desktop* motion itself is well judged (just missing the RM guard).
- Strong test surface for the desktop path (controlled, uncontrolled, Escape, className merge, axe).

## Cross-DS adoption ideas
- **Radix `Popover.Arrow`** — expose a styled `PopoverArrow` re-export (bound to `surface-overlay` fill) so consumers get an anchor tether; we currently drop it entirely.
- **Radix `--radix-popover-content-transform-origin`** — bind `motion.div` `style={{ transformOrigin: 'var(--radix-popover-content-transform-origin)' }}` so the scale-pop emanates from the trigger edge instead of the content center (origin-aware, per Emil).
- **Base UI `collisionAvoidance` / flip config** — surface a typed positioning prop set rather than relying on prose that says "forwarded to Floating UI".
- **Vaul snap-points** — the mobile sheet is a mini-Vaul; adopting snap points (already tracked as ResponsiveModal in memory) would let the mobile path host taller content gracefully.

## Rebuild note
**Polish, not rebuild.** The structure is sound — Radix core, correct tokens, shared open-state machine, cohesive with the overlay family, single edge treatment, clean desktop motion. Every gap is an in-place fix: add the RM guard (ideally as a shared `useOverlayMotion()` used by Popover/DropdownMenu/HoverCard), forward a real mobile title, drop `React.FC`, add a desktop overflow/scroll option + optional origin-aware transform-origin + arrow, and fill the doc's Props/Responsive sections. No axis scored ✗; the two systemic tells (border-card-strong, slide-no-fade) are absent — the desktop path pairs the slide/scale with `opacity:0`, and the mobile sheet's `y:'100%'` enters fully off-screen (idiomatic, not a slide-no-fade defect).
