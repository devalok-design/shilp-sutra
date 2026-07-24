# ui/form — finish-bar audit
Finish: 4/5   Market: PARITY   Rebuild: polish

`ui/form` is a thin, non-visual field primitive: `FormField` (a flex-column that
broadcasts `{state, helperTextId, inputId, required}` via React context),
`FormHelperText` (a state-colored message line), and the `useFormField()` hook.
It renders no surface, border, radius, or shadow — most of the visual-tell battery
is N/A by construction, and what exists is clean. Its strength is the context-driven
a11y wiring; verified live: `Input` consumes the context (`input.tsx:122-128`) —
`state`/`aria-describedby`/`aria-required`/`inputId` all cascade with explicit-wins
precedence via the shared `resolveFieldState`. Gaps are polish-tier: doc drift, a dead
exit animation, and no component-level reduced-motion guard. No regression vs the
2026-07-01 baseline (4/5); two of its flagged gaps persist.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | ✓ | No surface/border/radius/shadow. Semantic tokens only (`text-error-11`/`warning-11`/`success-11`/`surface-fg-subtle`), `gap-ds-02` (=4px, a real token), `text-body-sm`. No slop tells; `initial` has `opacity:0` so NOT slide-no-fade. |
| accessibility | ✓ | Showcase axis. `role="alert"` on error only; context-driven `aria-describedby`/`aria-required`/`aria-invalid`(via state) wiring into Input; axe-clean test (form.test.tsx:195). |
| api-composability | gap | Canonical `state` axis (not `error`/`color`), `forwardRef`+`displayName`, tight unions, `useFormField` as extension point. But: no controlled validation-message convenience (state lives in two parallel channels — FormField vs child `state`), and doc contradicts source on Label→Input wiring (see docs). |
| docs-dx | gap | Real drift: (1) `useFormField()` return documented as `{state, helperTextId, required}` (form.md:21 + JSDoc form.tsx:116/132) — omits `inputId`, which the hook returns and Input consumes (input.tsx:128). (2) form.md:40 says "FormField does NOT auto-wire Label→Input" — stale; Input now adopts `fieldCtx.inputId`. Source wins. |
| testing | ✓ | Broad RTL: context defaults/override, id inherit/override, `role=alert` present+absent, all 4 state colors, outside-context, aria-describedby wiring, axe. |
| motion | gap | `FormHelperText` fades+slides (`opacity:0,y:-4` → `y:0`, `tweens.fade` 110ms easeOut) — shared token, transform+opacity only, <300ms, correct fade. But no component-level `useReducedMotion` guard (relies on consumer `MotionProvider`), and `exit` is declared with no `AnimatePresence` in FormField or any story → dead exit + enter-only asymmetry; re-mounts slide on every validation pass. |
| state-coverage | ✓ | All four validation states deliberately colored + `role=alert` on error. hover/loading/empty N/A for a text line. `required` broadcast (delegated to Label/Input affordance, by design). |
| content-resilience | ✓ | Helper is a block `<p>` — long text/i18n wraps naturally, no truncation trap, no fixed height. `flex-col gap` is direction-agnostic (RTL-safe). |
| theming-resilience | ✓ | Pure semantic tokens flip with brand/dark; no radius (`[data-shape]` N/A), no elevation (no dark inversion risk). Survives accent-9 swap. |
| system-cohesion | ✓ | Shares `tweens.fade`, `gap-ds-*`, semantic color scale, and the `resolveFieldState` precedence pattern with Input/Textarea. One system. |
| craft | ✓ | `React.useId` auto-ids, memoized context value, explicit-wins precedence, `role=alert` scoped to error. Minor demerit: `exit` dead code misleads maintainers. |
| perceived-performance | ✓ | Memoized context, helper always in flow (no CLS), transform-only entrance (no reflow), instant. |
| market-benchmark | gap | Peer: Radix Form / React Aria Field / Base UI Field. Our cross-control context auto-wiring is genuinely elegant and lighter to author. We lag Radix Form on native-constraint validation + per-match `<Form.Message match="valueMissing">`, and lack a polite `aria-live` region for non-error state changes. Net PARITY. |
| cross-ds-adoption | gap | Concrete imports available (see below). |

## Top gaps (prioritized)
- [P1] docs-dx — `useFormField()` return omits `inputId` and form.md:40 denies Label→Input auto-wire that source now does → update form.md:21+40 and JSDoc form.tsx:116/132 to match source; reconcile the "does NOT auto-wire" line.
- [P2] motion — `exit` declared but never driven (no `AnimatePresence`); enter fires on every re-mount with no `useReducedMotion` guard → either drop `exit` (honest enter-only) or have FormField wrap children in `AnimatePresence`, and gate the `y` offset behind `useReducedMotion()`.
- [P2] api-composability — field-state truth lives in two parallel channels (FormField `state` + each child `state`); a consumer can render a green Input under a red helper → document override-vs-cascade semantics unambiguously; optionally dev-warn on contradiction.
- [P2] market-benchmark — no built-in validation-message-per-rule and no polite `aria-live` for success/warning transitions → consider a Radix-Form-style match API and an announced live region.

## What it does well
- Context-driven a11y is the model to copy: one `<FormField>` cascades `aria-describedby`/`aria-invalid`/`aria-required`/id into every control with explicit-wins precedence — verified in Input source, not just claimed.
- `role="alert"` scoped strictly to the error state (not fired for helper/warning/success).
- Tight types, `forwardRef`+`displayName` on both, exported prop interfaces + `FormHelperState` union, no `any`/`React.FC`/`color?: string`.
- Excellent test coverage including axe and outside-context behavior; canonical `state` axis.

## Cross-DS adoption ideas
- **Radix Form** — `<Form.Field>` + `<Form.Message match="valueMissing">` maps native constraint-validation states to messages declaratively. We could layer a match-based message API over `FormHelperText` so per-rule errors don't require consumer wiring.
- **React Aria (Adobe)** — announces validation changes via a polite live region, not only `role=alert`; adopt an `aria-live="polite"` path for success/warning so non-error transitions are read.
- **Base UI Field / Vaul-style motion** — wrap the helper in `AnimatePresence` so error-appears/error-clears both animate (fixes our dead `exit`), which is the standard pattern peers ship.

## Rebuild note
Polish, not rebuild — the architecture (context provider + hook + state-colored message line) is sound and its a11y wiring is best-in-DS. In-place fixes: (1) reconcile docs to source (`inputId` in the return shape; drop/fix the "does NOT auto-wire Label→Input" line); (2) resolve the motion lifecycle — either drop `exit` or add `AnimatePresence` in FormField, and gate the `y` offset behind `useReducedMotion()`; (3) document cascade-vs-override state semantics and consider a validation-message convenience. No structural change warranted.
