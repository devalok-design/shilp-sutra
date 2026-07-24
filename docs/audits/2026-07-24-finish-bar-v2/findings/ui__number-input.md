# ui/number-input — finish-bar audit
Finish: 3/5   Market: LAGS (React Aria / Base UI NumberField)   Rebuild: polish

_Source-verified against `number-input.tsx`, `.stories.tsx`, `.test.tsx`, `docs/components/ui/number-input.md`, and the 2026-07-01 baseline (3/5). Since baseline: `w-[28px]` was tokenized to `w-ds-06b`, a per-component doc was added, `state` now uses the shared `FieldState`. Unfixed: broken uncontrolled contract, one magic number on the stepper buttons, no `readOnly`._

## Scores
| Axis | Verdict | Note |
|---|---|---|
| 1 visual-integrity | gap | Border-only wrapper (`rounded-control`, no shadow) = no edge-soup; semantic `surface-*`/`accent-*`/`error-7` tokens; role radius `rounded-control` + `rounded-control-inner` (NOT `rounded-ds`/`full`). One drift tell: `xs` button size is `h-[22px] w-[22px]` (line 35) — a raw arbitrary value while every sibling row uses `ds-*` tokens (baseline's `w-[28px]` was fixed to `w-ds-06b`; the button row was missed). `active:scale-90` press is a strong 10% shrink vs house `~0.97`. |
| 2 accessibility | gap | Native `<input type=number>` = correct `spinbutton` role with `min`/`max`/`step`; icon buttons have `aria-label` + `title`; `aria-invalid` on error; `aria-describedby` + `id` wired from FormField; `focus-visible:ring-2 ring-accent-9`. Gaps: focus ring sits on the inner `<input>`, not the bordered wrapper (ring floats inside the perceived boundary); **no 44px touch target** — steppers are 22–40px (`touch-target` util unused); `warning`/`success` are border-color-only with no `aria` semantics; no `forced-colors` fallback so states vanish in Windows high-contrast. |
| 3 api-composability | ✗ | **Broken uncontrolled contract.** No internal state, no `defaultValue`, yet `value` defaults to `0` — so `<NumberInput/>` renders a real input permanently stuck at 0 (typing no-ops, React re-renders back to 0). The JSDoc admits it. Best-in-class all support uncontrolled. Also re-rolls the base `Input` surface (border/radius/focus) instead of composing it → drift risk; no adornment/affix slot; no `readOnly` (docs fake it with `disabled` + no-op handler). Positives: canonical `value`/`onValueChange`, `state` (not `color`/`error`), `NumberInputState` kept as `@deprecated` alias, `forwardRef` + `displayName`, typed props, correct native-prop `Omit`, clean FormField context merge. |
| 4 docs-dx | ✓ | Doc exists, matches source: Props/Defaults/Example/Composability/Gotchas/Changes; `state` 4-value table accurate; `Server-safe: No` correct. Minor: no explicit Types section; doesn't surface the controlled-only footgun as strongly as the source JSDoc. |
| 5 testing | gap | `describeConformance` + behavior (increment/decrement/step/bounds-disable/disabled). Missing: `vitest-axe` play assertion in-file, the `handleInputChange` typed-entry path (clamp on type, empty-string fallback), and any `warning`/`success`/`focus` coverage. |
| 6 motion | ✓ | Press feedback `active:scale-90` on transform, `duration-fast-01`, `ease-productive-standard`, `transition-[color,background-color,transform]`; reduced-motion honored globally (semantic.css reset). No bounce, no layout-animating props. Minor: no value-change micro-feedback, no press-and-hold auto-repeat (standard spinbutton affordance). |
| 7 state-coverage | gap | default/hover/active/focus/disabled/error deliberate; buttons disable at bounds. `warning`/`success` border-only (no aria); no `readOnly`; empty-input clears to `0`/`min` (baseline P3: negative-min clears to 0, may surprise). Loading N/A. |
| 8 content-resilience | gap | Fixed input widths (`w-ds-06b`=28px at xs, `w-ds-sm-plus`=36px at sm/md) clip large values (e.g. `1000000`) under `text-center`; no `tabular-nums`. Arrows are symmetric so RTL is tolerable, but width is the real risk. |
| 9 theming-resilience | ✓ | `accent-9` focus, semantic `surface-*` / `error/warning/success-7` borders, `rounded-control` honors `[data-shape]`. No sunken track → no dark-mode elevation-inversion trap; `border-surface-border-strong` stays visible in dark. |
| 10 system-cohesion | gap | Shares `rounded-control`, `accent-9` focus, ds spacing, `Icon` API, `FieldState`/`resolveFieldState`/`useFormField` with siblings — strong cohesion. Drift: re-rolls the `Input` control surface rather than composing it, plus the lone `h-[22px]` magic number. |
| 11 craft | gap | Nice touches: `title` tooltips, `appearance:textfield` + spin-button suppression, `font-semibold`, bound-aware button disable. Missing: `tabular-nums` (digits shift width on change), and the 10% press-shrink is heavier than the house feel. |
| 12 perceived-performance | ✓ | Instant feedback, no async, fixed widths avoid layout shift (at the cost of clipping), controlled re-render is cheap. |
| 13 market-benchmark | ✗→LAGS | vs React Aria / Base UI / Ark NumberField: they ship locale-aware formatting (`Intl.NumberFormat`), press-and-hold repeat, scrub/drag-to-change, PageUp/PageDown large-step, `aria-valuetext`, and true controlled+uncontrolled. We rely on native input arrows for keyboard step and have none of the rest, plus the broken uncontrolled default. Clear lag. |
| 14 cross-DS-adoption | — | See ideas below. |

## Top gaps (prioritized)
- [P0] api-composability — `value` defaults to `0` with no `defaultValue`/internal state, so uncontrolled `<NumberInput/>` is silently stuck at 0 → add `defaultValue` + internal `useState`, resolve `isControlled = value !== undefined`, drive input+steppers from the resolved value; or make `value` required and drop the `= 0`.
- [P1] visual-integrity / system-cohesion — `xs: 'h-[22px] w-[22px]'` magic number → add the missing `xs` control-size token step and reference it (baseline fixed the sibling `w-[28px]`, missed this one).
- [P1] accessibility — focus ring on inner input not the perceived wrapper boundary; steppers under 44px touch target; `warning`/`success` a11y-silent + no `forced-colors` fallback → move ring to `focus-within` on the wrapper, add `touch-target`, add forced-colors outline + aria/`data-state` for non-error states.
- [P2] api / state-coverage — no `readOnly` (docs fake it with `disabled` + no-op) → add first-class `readOnly` that keeps focus/announcement but blocks edits.
- [P2] content-resilience — fixed-width input clips large numbers → width from `ch`/`min-width` or auto-grow; add `tabular-nums`.
- [P2] composability — re-rolls the base `Input` surface → compose `Input` with the steppers as start/end adornments (add an Input adornment slot; benefits Input/Select too).
- [P2] motion / craft — no value-change tick, no press-and-hold repeat; soften the 10% press-shrink.

## What it does well
- Correct native `spinbutton` semantics for free (`type=number` + `min`/`max`/`step`), with `aria-invalid`/`aria-describedby`/`id` cleanly merged from FormField context — the context-precedence logic (explicit prop wins) is right.
- Canonical API vocabulary: `value`/`onValueChange`, shared `FieldState` (`NumberInputState` kept as a `@deprecated` alias — no hard break), `forwardRef` + `displayName`, typed props with correct native-prop `Omit`.
- Anti-slop clean: role radius tokens (`rounded-control`/`-inner`), border-only wrapper (no edge-soup), semantic tokens throughout, reduced-motion-honored transform press feedback.
- No systemic tells: no `border-card-strong` (uses the real `border-surface-border-strong`), no `slide-no-fade` (no framer), no `rounded-ds`/`rounded-full`.

## Cross-DS adoption ideas
- **React Aria NumberField** — locale-aware formatting via `Intl.NumberFormat` (currency/percent/decimals) and `aria-valuetext`. We render raw numbers; adopt an optional `formatOptions` prop for currency/percent quantity fields.
- **Base UI / Ark NumberField** — press-and-hold auto-repeat on the steppers and PageUp/PageDown large-step. Standard spinbutton affordances we lack.
- **Base UI NumberField** — scrub/drag-to-change on the value label (pointer-drag increments). High-delight for sliders-in-a-box use cases.
- **React Aria** — true controlled+uncontrolled with `defaultValue`; directly fixes our P0.
- **Ark** — clamp-on-blur vs clamp-on-change strategy option, so a user can type an out-of-range value transiently before it snaps (our clamp-on-every-keystroke fights fast typists).

## Rebuild note
**Polish, not rebuild** — visuals, tokens, and structure are sound and on-system. The work is a focused, mostly-additive pass: (1) fix the controlled/uncontrolled contract with `defaultValue` + internal state (the one genuinely structural change, and the reason this can't score above 3); (2) tokenize the `xs` button size; (3) move focus to the wrapper + add touch-target + forced-colors/aria for warning/success; (4) add `readOnly`; (5) width/`tabular-nums` for large values; then optional formatting + press-hold-repeat to close the market gap. Composing the base `Input` instead of re-rolling its surface is the one item that edges toward a refactor, but it's deferrable and shouldn't gate the P0 fix.
