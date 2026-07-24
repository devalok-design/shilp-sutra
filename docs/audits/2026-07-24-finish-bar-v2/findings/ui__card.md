# ui/card — finish-bar audit
Finish: 4/5   Market: PARITY (Radix Themes Card + Inset)   Rebuild: polish

Card is the DS's composition exemplar and it holds up under the 14-axis bar — zero
slop tells, elevation-XOR-edge variants, a single-variable spacing system, and a
richer slot vocabulary (`CardBleed`/`CardAction`/`CardSection`) than most peers.
The one thing that keeps it off 5/5: the `interactive` prop ships hover-lift +
tap-press motion, a pointer cursor, and an implied click affordance **without**
focusability, keyboard activation, or a focus-visible ring — it defers all of that
to the consumer. For a structural container that would be fine; for a prop literally
named `interactive` that renders a `motion.div` with `whileTap`, a finish-bar a11y
reviewer flags it.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | ✓ | Elevation-XOR-edge (`default` tonal + `border-card` hairline no shadow; `elevated` `shadow-raised-hover` + `border-transparent`; `outline` strong border no shadow) — no double edge. `rounded-surface`/`-t`/`-b`/`-l` role tokens only, no `rounded-ds-*`. Tonal default = Setu anti-slop. No gradient/glow/glass/emoji/rail. |
| accessibility | gap | Structural container needs no ARIA by default — correct. But `interactive` renders a `motion.div` with `onClick` affordance, cursor-pointer, and tap motion yet adds **no** `role="button"`, `tabIndex`, `Enter`/`Space` handler, or focus-visible ring. Docs tell the consumer to add `aria-label`, but keyboard access is entirely punted. Not P0 (opt-in, consumer can wrap) but below bar for the prop's promise. |
| api-composability | ✓ | Canonical axes (`variant`/`color`/`size`/`orientation`/`interactive`); rich slots; single-variable size cascade (no context); `CardBleed` = Radix `Inset`/Polaris `Bleed`; `CardAction` 4 placements + optical `tuck`; `forwardRef`+`displayName` on all 9 parts; `Omit<…,'color'>` avoids native clash; `cardVariants` exported. Only miss: no `asChild` on root (see cross-DS). |
| docs-dx | ✓ | Doc has Props/sub-part props/compound tree/Defaults/Example/Composability/Gotchas/changelog and matches CVA source. Four JSDoc examples on source. Dev-time `console.warn` for unwrapped text children is real DX. |
| testing | ✓ | `describeConformance` over all variants/sizes/colors + gap-model, margin-reset, size variable pair, orientation, CardBleed sides, all CardAction placements + tuck. Minor: no keyboard/focus test on `interactive` (because no such behavior exists) and no explicit interactive-motion assertion. |
| motion | gap | `springs.snappy` (stiffness 500 / damping 30 — bounce-free, correct for functional), transform-only (`y:-3`, `scale:0.98`), `whileTap` press feedback — all good. Gap: **no component-local `useReducedMotion` guard**; relies on an ancestor `MotionProvider` (`reducedMotion="user"`). An unwrapped `<Card interactive>` animates regardless of OS preference. |
| state-coverage | gap | Container states that apply are covered (default; hover + active via interactive). No focus-visible state on the interactive card (ties to a11y gap). disabled/loading/selected/empty/error are N/A for a structural shell — not penalized. |
| content-resilience | gap | Strong: `min-w-0 flex-1` on CardSection, full-width direct children (free dividers/bands), slots inset, overflow left to content. RTL gap: `CardAction` placements use **physical** `left-`/`right-`/`top-`/`bottom-` and the horizontal story uses `rounded-l-surface` — a `top-left` corner won't mirror in RTL. `CardBleed`'s `-mx` is symmetric so it's safe. |
| theming-resilience | ✓ | `rounded-surface` honors `[data-shape]`; variable-driven spacing is density-friendly; `color` uses semantic `accent-7`/`error-7`/… so it survives an accent-9 swap; dark-mode elevation handled (`surface-raised` neutral-1→neutral-2, `border-card` color-mix visible in both themes, `forced-colors` maps set). No inversion/vanish bug. |
| system-cohesion | ✓ | Shares `springs.snappy`, `rounded-surface`, ds-spacing, `shadow-raised-hover` with siblings; StatCard composes Card rather than re-rolling surface. "Thousand voices in tune." |
| craft | ✓ | Standout: gap-model can't bottom-edge-unbalance when slots change; first/last-child margin resets stop UA-margin leaks; `tuck` aligns an icon glyph (not its padding box) to the content edge; corner insets read the same `--card-spacing` at every size; dev warning for bare text. |
| perceived-performance | ✓ | Instant; transform/opacity-only motion (HW-accel); no CLS; a container needs no skeleton. |
| market-benchmark | gap | vs Radix Themes Card + Inset: **leads** on `CardBleed`/`CardSection`/variable-spacing/`tuck`; **lags** on `asChild` (Radix has it) and on built-in interactive a11y (React Aria's press-with-keyboard). Net PARITY, clearly ahead of shadcn Card (plain divs). |
| cross-DS-adoption | ✓ | Concrete imports available (see below). |

## Top gaps (prioritized)
- [P1] accessibility / state-coverage — `interactive` ships click affordance + motion but no keyboard/focus. → When `interactive` (and `onClick`/`role` absent), default `role="button"` + `tabIndex={0}` + `Enter`/`Space` → click + a `focus-visible` ring; or expose an `asChild`/`as="button"` path so the real interactive element carries semantics. Keep the current div behavior when the consumer supplies their own role.
- [P2] motion — no local reduced-motion guard. → Read `useReducedMotion()` inside Card and drop `whileHover`/`whileTap` when reduced, so an unwrapped interactive Card degrades without depending on a `MotionProvider` ancestor.
- [P2] content-resilience (RTL) — `CardAction` corners and `rounded-l-surface` are physical. → Switch corner placements to logical inset (`inset-inline-start/end`, i.e. `start-`/`end-` utilities) and use `rounded-s-surface` in the horizontal media pattern so mirroring is free.
- [P3] craft — `CardAction` uses raw `z-[1]`. → Prefer a named z role/utility for consistency with the DS z-layer system (minor; it's z-index, not a spacing magic number).

## What it does well
- Elevation-XOR-edge variant model — no border+shadow double edge anywhere; the source comments even cite make-kit rule #6.
- One-variable spacing system (`--card-spacing`/`--card-gap`): container py+gap, slot px, CardAction insets, and CardBleed negations all read the same pair; retune with a single `className` override. No React context, no per-slot padding.
- Gap-model that structurally can't unbalance the bottom edge when slots are added/removed; first/last-child margin resets guard UA-margin leaks.
- `CardBleed` (Inset/Bleed equivalent) + `CardSection` (horizontal rhythm) + `CardAction` (`tuck` optical alignment) — a genuinely composable slot vocabulary.
- Bounce-free functional spring, transform-only motion, dark-mode elevation handled, `forced-colors` tokens mapped.

## Cross-DS adoption ideas
- **Radix Themes / Radix Slot — `asChild`:** let the Card root render as an `<a>` or `<button>` so an interactive/linked card carries native semantics + focus instead of the consumer wrapping or layering a link. Solves the P1 a11y gap at the root.
- **React Aria `usePress`/`useFocusRing`:** the interactive-card pattern with pointer + keyboard press parity and a managed focus ring — the exact behavior our `interactive` prop currently omits.
- **Radix Themes Card `variant="ghost"` / size 1–5 scale:** we have `flat` (≈ghost) and 3 sizes; the variable-spacing model could expose a wider size ramp cheaply if a consumer needs denser/looser tiers, since it's one variable pair.

## Rebuild note
Polish, not rebuild. The structure is exemplary — the spacing/slot/variant architecture is best-in-class and should not be touched. Scope of polish: (1) make `interactive` actually interactive for keyboard/AT users (default `role="button"` + `tabIndex` + `Enter`/`Space` + focus-visible when interactive and no role supplied, or add `asChild`); (2) add a local `useReducedMotion` guard; (3) swap `CardAction` physical insets and the horizontal `rounded-l-` for logical properties. All in-place, no API break (the interactive-a11y default is additive; existing consumers who already wrap in a Link keep working if the default only applies when no role/href is present).
