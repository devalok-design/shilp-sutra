# ui/checkbox — finish-bar audit
Finish: 4/5   Market: PARITY (Radix / React Aria)   Rebuild: polish

Radix-powered, accessible, semantically-tokened checkbox with a tasteful path-draw
check/indeterminate entrance. Fundamentally solid — no slop tells, strong a11y, canonical
`state` API, forced-colors handled at the token layer. The gaps are all finish-level and
one-line-fixable: a missing reduced-motion guard on its only animation, a doc that now
contradicts the source AND references a prop deleted in 0.49, one broken story, and arbitrary
px icon sizes. Nothing structural — holds the prior 4/5.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| 1. visual-integrity | gap | Clean: single `border` (no shadow → no edge-soup), `rounded-control-inner` **role token** (not `rounded-ds-*`/`-full`), all semantic tokens (`accent-*`/`error-*`/`surface-*`), no accent-rail/gradient/glass/emoji/pill-spam. Docked only for `magic-number`: icon sizes `h-[14px] w-[14px]` / `h-[18px] w-[18px]` (lines 61-63) are raw arbitrary px, off the `ds` scale. |
| 2. accessibility | ✓ | Real Radix `role=checkbox` (not `<div onClick>`); `touch-target` util + md=24px meets WCAG 2.5.8; `focus-visible:ring-2 ring-accent-9 ring-offset-2`; `aria-invalid` on error, `aria-describedby`/`aria-required` auto-wired from `useFormField()`; `disabled:` styling. **forced-colors handled at token layer** — `surface-border-strong→CanvasText`, `accent-fg→HighlightText`, `surface-raised-hover→Canvas` (semantic.css:736-764), so the checked glyph is HighlightText-on-Highlight in HCM. Better than the prior finding assumed. |
| 3. api-composability | ✓ | Canonical `state: FieldState` (not `error`/`color`); controlled (`checked`+`onCheckedChange`) **and** uncontrolled (`defaultChecked`) both handled — internal state tracked so AnimatePresence works uncontrolled; `forwardRef` + `displayName`; extends `ComponentPropsWithoutRef<Root>`, no `any`. Minor: `indeterminate` boolean duplicates Radix's tri-state `checked='indeterminate'` (documented override footgun). |
| 4. docs-dx | ✗ | Doc actively **wrong** on two counts: (a) Composability §L30 + Gotcha §L36 tell consumers to "pass `error` explicitly" — but `error` was **removed in 0.49.0** (the doc's own Changes section says so); it's now `state`. (b) §L30 claims "Checkbox does NOT auto-consume FormField state" — source does the opposite (`useFormField()` + `resolveFieldState(stateProp, fieldCtx.state)`, lines 76-77 + aria-describedby/required inheritance). A consumer inside `<FormField state="error">` gets the tint the doc says they won't. Props table itself is accurate. |
| 5. testing | gap | `describeConformance` (axe) + check/uncheck/checked/sm-size units. **No** test for `indeterminate`, `state` tints, or FormField inheritance. `ErrorState` **story is broken** — passes `error: true` (dead prop) so it renders a plain checkbox, not an error one; should be `state: 'error'`. Only `Default` has a play test. |
| 6. motion | gap | Exemplary on 5 of 6 sub-points: `easeOut` tween (no `ease-in`), **no bounce** (correct for a functional toggle), sub-300ms (`moderate02`=240ms draw), HW-accel only (`pathLength`/`opacity`, no layout props), interruptible via `AnimatePresence`+transition. Fails one: **no `useReducedMotion()` guard** — the check stroke draws on every toggle regardless of `prefers-reduced-motion`, and the repo's own `withReducedMotion()` helper (motion.ts:58) sits unused. This is the finish-bar signature miss. |
| 7. state-coverage | gap | unchecked/checked/indeterminate/disabled/disabled-checked/hover/focus-visible all deliberately designed. But `state` now supports `warning`/`success` tints (stateTintClasses) that **no story or test exercises**, and the one error demo is broken (see testing). Loading/empty N/A for a leaf toggle. |
| 8. content-resilience | ✓ | Leaf control, no text content to overflow/truncate/i18n. Glyph is centered; tri-state (unchecked/checked/indeterminate) all render cleanly. RTL-safe (no directional layout). |
| 9. theming-resilience | ✓ | Survives accent-9 swap (checked fill = `accent-9`); honors `[data-shape]` — `--radius-control-inner` varies 0/2/4px across shape presets (semantic.css:859-881); light↔dark fine — unchecked box is `surface-raised-hover` (neutral-3), visible on near-black, no elevation-vanish. |
| 10. system-cohesion | ✓ | Shares `FieldState`/`resolveFieldState`, `durations` from motion.ts, the DS focus-ring pattern, and the `rounded-control-inner` radius language with its form-family siblings (Radio/Switch/Input). No bespoke drift. |
| 11. craft | ✓ | `cursor-not-allowed` on disabled; path-draw entrance + AnimatePresence exit is a genuinely nice unseen detail; optically centered glyph; per-size icon scaling. Minor absence: no `active:scale` press feedback (Button/SegmentedControl have it). |
| 12. perceived-perf | ✓ | Radix toggle is instant; animation is transform/opacity only → no CLS/jank; state change is optimistic (internal state updates immediately). |
| 13. market-benchmark | ✓ | PARITY with Radix (our primitive) / Base UI / React Aria. Path-draw entrance is a differentiator most peers lack; React Aria's press/hover state machine + `isReadOnly` and Base UI's cleaner single tri-state are where they edge us. |
| 14. cross-DS | ✓ | Ideas below. |

## Top gaps (prioritized)
- **[P1] motion** — no `useReducedMotion()` guard on the pathLength draw + opacity fade → gate both the line/path transition and the indicator fade through the existing `withReducedMotion()` helper (or a `reduce ? {duration:0} : …` branch). This is the one axis-6 miss and the audit's signature issue.
- **[P1] docs-dx** — doc references the removed `error` prop (§L30, §L36) and claims Checkbox does NOT auto-consume FormField, contradicting source. Rewrite to: "auto-consumes FormField `state`/`required`/`helperTextId`; explicit `state` overrides." Update the JSDoc (lines 19-45 never mention FormField).
- **[P1] testing** — `ErrorState` story passes dead `error: true` (renders plain checkbox) → change to `state: 'error'`; add `warning`/`success` demos.
- **[P2] state-coverage** — add stories for `state="warning"`/`"success"` (implemented, unshown) and a focus-visible/required demo so implemented states are Chromatic-guarded.
- **[P2] visual-integrity/magic-number** — icon sizes `h-[14px]/w-[14px]`, `h-[18px]/w-[18px]` are arbitrary px; map to `ds` size tokens (or add three shared control-icon sizes for checkbox/radio/switch).
- **[P3] api** — `indeterminate` boolean redundant with tri-state `checked`; document as forwarding to `checked='indeterminate'` rather than overriding, or deprecate in a future major.

## What it does well
- No slop tells whatsoever — single border, role-token radius, semantic tokens end to end.
- a11y is a strength, not an afterthought: real Radix semantics, touch-target, focus ring+offset, full aria wiring auto-inherited from FormField, and forced-colors resolved at the token layer.
- Clean controlled/uncontrolled handling that keeps the exit animation working in both modes.
- Canonical `state` API unified with the rest of the form family via `resolveFieldState`.
- Restrained, tasteful motion: bounce-free path-draw, HW-accelerated, interruptible.

## Cross-DS adoption ideas
- **React Aria (Adobe)**: press-scale / `data-pressed` feedback and an explicit `isReadOnly` state — we have neither; a subtle `active:scale-[0.97]` would match Button/SegmentedControl press feel.
- **Base UI**: expresses indeterminate purely through the tri-state `checked` (no parallel boolean) — cleaner than our dual path; worth converging on in a major.
- **GitHub Primer / Carbon**: first-class checkbox **group** with a "select all" indeterminate header wired to child state — we ship the indeterminate glyph but no group/roving helper; a `CheckboxGroup` composable would close the gap.

## Rebuild note
**Polish, not rebuild.** The structure (Radix primitive + FieldState + motion tokens) is right; nothing is architecturally wrong. Scope: (1) wire `useReducedMotion()` through the two `motion` transitions; (2) fix the doc's `error`→`state` references and the reversed FormField claim + JSDoc; (3) fix the `ErrorState` story (`error`→`state='error'`) and add warning/success + focus/required stories; (4) token the arbitrary icon px. All independent, all one-file, ~1-2 hrs total.
