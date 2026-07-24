# ui/radio — finish-bar audit
Finish: 4/5   Market: PARITY   Rebuild: polish

A thin, correct wrapper over the vendored Radix RadioGroup primitive (`RadioGroup` + `RadioGroupItem` compound). Since the 2026-07-01 baseline (3/5) the two P1 motion findings were closed — the `springs.bouncy` celebration overshoot is now `springs.snappy`, and the dead `AnimatePresence` import is gone — and item-level error/warning/success border tinting now exists via `RadioStateContext`. What remains is polish, not structural.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | gap | Clean: `rounded-pill` role token (correct for a circular control), semantic `accent-7/9/11`, `IconCircle` from tabler, no slop tells. Two minor drifts: indicator-size map mixes tokenized `md: h-ds-03` with raw fractional `sm: h-1.5` / `lg: h-2.5` (off-cadence, no DS-token home); resting fill uses `bg-surface-raised-hover` (one rung up the ladder), hover escalates to `-active` — control never shows its true resting surface. Both shared with Checkbox (family consistent, consistently one step off). |
| accessibility | ✓ | Correct `radiogroup`/`radio` pattern (Radix), roving tabindex + arrow/Home/End keyboard nav pre-wired. `touch-target` util for 44px hit area, `focus-visible` ring + offset, `disabled` handled, `aria-invalid`/`aria-describedby`/`aria-required` wired from FormField. `forced-colors` supported via tokens (semantic.css maps to Canvas/CanvasText). axe-clean. |
| api-composability | ✓ | Canonical `value`/`defaultValue`/`onValueChange` (Radix passthrough), controlled + uncontrolled. `state` on the shared `FieldState` union (not `error`/`color`), inherits from FormField context, explicit prop wins. `size` literal union, no `any`. `forwardRef` + primitive `displayName` on both parts. Composes the primitive — no re-roll. |
| docs-dx | gap | Doc exists with Props/Defaults/Example/Composability/Gotchas/Changes and matches source. Stories cover Default/Horizontal/Disabled/Sizes/WithoutDefaultValue — but no **error-state** story despite the `state` prop, no focus-visible or RTL story, and no story-level `play` axe test. Story `Sizes` headings use raw `text-sm font-medium` instead of `text-ds-*`. |
| testing | gap | Unit + RTL + `vitest-axe`: selection, default-checked, single-selection, disabled propagation, ref forwarding (both parts), className merge, size map. Missing: `describeConformance`, a controlled `value` round-trip assertion, and any `state`-prop / error-context test (the code path exists, untested). |
| motion | gap | `springs.snappy` (damping ratio ≈0.95 — near-critical, no celebration bounce; M1 fixed) on the `scale:0→1` indicator; animates transform only (HW-accel). Two open gaps: **no in-component `useReducedMotion` guard** — the pop only respects `prefers-reduced-motion` if the consumer mounts `MotionProvider` (opt-in, not a required wrapper); and **no exit animation** — Radix unmounts the indicator instantly on deselect, so the dot pops in but vanishes hard (asymmetric enter/exit). Sibling Checkbox wraps its indicator in `AnimatePresence` with `forceMount` + `exit`. |
| state-coverage | ✓ | hover, active, focus-visible, disabled, checked, and error/warning/success (border tint via context) all deliberately designed. loading/empty are N/A for a radio. Item-level error visual (the baseline P2/H gap) is now closed. |
| content-resilience | ✓ | Control is text-free (label is consumer-composed), so no overflow/truncation surface. `grid gap-ds-03` root is logical-property-safe; Radix handles RTL arrow mirroring. No RTL story to prove it, but no layout risk in the control itself. |
| theming-resilience | ✓ | Uses `accent-*` tokens → survives accent-9 swap. `rounded-pill` role token survives `[data-shape]` presets (and a radio must stay circular regardless — correct). Dark mode safe: `surface-border-strong` = neutral-7 light / neutral-5 dark, `surface-raised-hover` defined in both; no sunken track to invert-vanish. |
| system-cohesion | ✓ | Shares `springs`, focus-ring, `touch-target`, and the `FieldState`/`resolveFieldState` field-state system with Checkbox/Switch/Select. One-rung surface offset is shared with Checkbox — bespoke drift is absent; the family moves together. |
| craft | ✓ | `cursor-not-allowed` + `opacity-action-disabled` on disabled, `aspect-square` guarantees a true circle, `touch-target` expands the hit area beyond the visual dot, indicator centered via flex so scale-from-0 causes no layout shift. |
| perceived-performance | ✓ | Radix state flips instantly; `transition-colors duration-fast-01` on border/bg; indicator scales in place (no CLS). No jank surface. |
| market-benchmark | ✓ | vs Radix / Base UI / React Aria radio. Behavior is at parity (it *is* Radix underneath); we add motion, three sizes, and the FieldState validation tint. Slightly behind React Aria on built-in per-item description/validation-message slots. Net: PARITY. |
| cross-ds-adoption | gap | Concrete imports available (see below) — not a defect, an opportunity axis. |

## Top gaps (prioritized)
- [P1] motion — No in-component `useReducedMotion` guard; the scale-pop ignores OS `prefers-reduced-motion` unless a `MotionProvider` is mounted → have the item read `useReducedMotion()` and collapse the transition to `duration:0`, independent of the provider. (Systemic — shared with Checkbox.)
- [P2] motion — No exit animation; dot vanishes hard on deselect while it pops in (asymmetric) → wrap `Indicator` in `AnimatePresence` with `forceMount` + `exit={{ scale: 0 }}` to mirror Checkbox.
- [P2] docs-dx / testing — `state` prop has code but no Error story and no test → add an error-state story + a `state="error"` render test and a controlled `value` round-trip test.
- [P2] visual-integrity — Indicator-size map mixes `h-ds-03` (md) with raw `h-1.5`/`h-2.5` (sm/lg) → unify the vocabulary (tokenize 6px/10px or make all three raw-with-comment).
- [P2] visual-integrity — Resting fill is `bg-surface-raised-hover` (one rung up); hover reads as pressed → decide the input-control resting rung with the maintainer and align the radio+checkbox family (may be a deliberate convention).

## What it does well
- Composes the Radix primitive cleanly — compound `RadioGroup`/`RadioGroupItem`, refs forwarded with primitive displayNames, `value`/`defaultValue`/`onValueChange` transparent.
- Full a11y baseline: correct radiogroup pattern, roving-tabindex keyboard nav, 44px touch target, focus-visible ring + offset, forced-colors tokens, axe-clean.
- Unified on the shared `FieldState` system — `state` inherits from FormField and now tints the item border, matching the rest of the form family.
- Motion restraint post-fix: near-critical `snappy` spring on a transform-only scale — no celebration bounce on a routine form action.

## Cross-DS adoption ideas
- **React Aria** ships per-item `description` and group-level validation-message slots wired into ARIA (`aria-describedby` fan-out). We wire the group-level helper only — adopt an optional per-item description slot for richer forms.
- **Base UI / Ark** expose a fully data-attribute-driven styling surface (`data-checked`, `data-disabled`) that lets consumers restyle without prop plumbing; we already have `data-[state=checked]` — document the full attribute set so consumers can target it.
- **shadcn / Linear** ship a **selectable-card radio** pattern (radio bound to a bordered card that highlights on select). A `RadioCard` composed variant would cover the common settings/pricing-picker use case we currently leave to consumers.

## Rebuild note
Polish, not rebuild. The structure is sound — a correct Radix wrapper on the shared field-state system with clean visuals and a11y. Scope: (1) add an in-component `useReducedMotion` guard (systemic — do it for the Checkbox/Switch family together), (2) add a symmetric `AnimatePresence` exit to match Checkbox, (3) unify the indicator-size token vocabulary, (4) add error story + controlled-mode/state tests, and (5) resolve the resting-vs-hover surface-rung offset as a family decision. None of these touch the component's structure or API.
