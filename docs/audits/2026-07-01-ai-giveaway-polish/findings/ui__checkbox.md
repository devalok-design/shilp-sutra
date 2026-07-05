# ui/checkbox — audit
**Finish score:** 4/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:2 P2:3 P3:2

This component is clean of the loud visual/verbal AI tells (no accent rail, no gradient, no
indigo, no emoji, no glass, semantic tokens throughout, intentional path-draw motion). The gaps
are finish-level: a missing reduced-motion guard on its only animation, a genuine doc↔source
contradiction about FormField consumption, and a few token re-rolls. Solid but a notch under the
Card bar.

## Findings

### [P1][M3] Path-draw + fade animation has no reduced-motion guard
- **Category:** motion
- **Evidence:** checkbox.tsx:108-157 — `<motion.path ... initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: durations.moderate02, ease: 'easeOut' }} />` and the indicator `motion.span` opacity fade; nothing reads `useReducedMotion()` or `withReducedMotion()`.
- **Why:** The check stroke draws in on every toggle with no respect for `prefers-reduced-motion`; the repo ships a `withReducedMotion()` helper (motion.ts:58) that is not used here. M3 is a P1 motion tell — animation with no reduced-motion guard.
- **Fix:** `const reduce = useReducedMotion()` then gate the path-draw transition — e.g. `transition={reduce ? { duration: 0 } : { duration: durations.moderate02, ease: 'easeOut' }}` for both the line and path (and ideally collapse the opacity fade too). Matches how the motion system intends overlays to behave.

### [P1][J] Doc contradicts source on FormField consumption
- **Category:** docs
- **Evidence:** docs/components/ui/checkbox.md:30 — "Checkbox does NOT auto-consume FormField state — the `error` prop must be set explicitly." But checkbox.tsx:67-69 does: `const fieldCtx = useFormField(); const isError = error ?? fieldCtx.state === 'error'; const ariaDescribedBy = props['aria-describedby'] ?? fieldCtx.helperTextId; const ariaRequired = props['aria-required'] ?? fieldCtx.required`.
- **Why:** The source DOES auto-consume FormField error/required/describedby (error only when the explicit `error` prop is `undefined`). The doc tells consumers the opposite, so a consumer inside a `<FormField state="error">` who omits `error` will get the red border the doc says they won't. Source wins per rubric; the doc is stale/wrong.
- **Fix:** Rewrite md:30 and the md:36 gotcha to: "Checkbox auto-consumes FormField `state==='error'`, `required`, and `helperTextId` via `useFormField()`. The explicit `error` prop, when provided, overrides the field state." Update the JSDoc too (checkbox.tsx:11-37 never mentions FormField).

### [P2][G2] Control + icon sizes are raw Tailwind/arbitrary px, not DS size tokens
- **Category:** drift
- **Evidence:** checkbox.tsx:45-55 — `checkboxSizeClasses = { sm: 'h-5 w-5', md: 'h-6 w-6', lg: 'h-7 w-7' }` and `checkboxIconClasses = { sm: 'h-[14px] w-[14px]', md: 'h-[18px] w-[18px]', lg: 'h-5 w-5' }`.
- **Why:** Bare numeric `h-5/w-5` and arbitrary `h-[14px]` bypass the `--spacing-ds-*` / size vocabulary the rest of the system uses (Card sizes everything off `ds` tokens). Hardcoded `px` is the G2 re-rolled-token pattern; the 14/18px icon values are unhookable to any token.
- **Fix:** Map sizes to `ds` spacing utilities (e.g. `size-ds-*` equivalents) or, if no matching token exists, add the three control sizes to the size scale once so checkbox/radio/switch share them. At minimum replace the arbitrary `h-[14px]/w-[18px]` icon values with token-derived sizes.

### [P2][H] No forced-colors / Windows High Contrast handling for the check glyph
- **Category:** a11y
- **Evidence:** checkbox.tsx:98-99 checked state is `data-[state=checked]:bg-accent-9 ... text-accent-fg`; the SVG stroke is `currentColor`. No `forced-colors:` styles or `@media (forced-colors)` consideration; checkbox.tsx:95 focus ring is a color ring with no forced-colors fallback.
- **Why:** Rubric H requires forced-colors coverage on interactive controls. In forced-colors mode the `bg-accent-9` fill and `accent-fg` glyph are overridden by the system palette, and a same-color check can disappear against the box. The focus ring (`ring-accent-9`) also may not survive forced-colors.
- **Fix:** Add `forced-colors:` rules — e.g. force the indicator to `CanvasText`/`Highlight` system colors and ensure the focus ring falls back to a system outline. Verify the checked box vs glyph contrast in HCM.

### [P2][H] State matrix shown in stories is incomplete vs the rubric matrix
- **Category:** state-coverage
- **Evidence:** checkbox.stories.tsx:94-123 `AllStates` covers unchecked/checked/indeterminate/error/disabled/disabled-checked. No story or test demonstrates focus-visible, required, reduced-motion, forced-colors, or dark.
- **Why:** The rubric expects the applicable states demonstrated in stories OR tests. Focus-visible (a styled ring exists at checkbox.tsx:95) and required (`aria-required` wiring exists) are implemented but never shown, so regressions in them aren't caught by Chromatic/play tests.
- **Fix:** Add a focus-visible story (autofocus or `play` that tabs to it) and a `required` story; optionally a dark-mode and reduced-motion variant. Cheap, raises confidence in the implemented-but-unshown states.

### [P3][F2] Hand-rolled SVG check bypasses the Icon API
- **Category:** composability
- **Evidence:** checkbox.tsx:118-153 — inline `<svg viewBox="0 0 16 16">` with literal `d="M3.5 8.5l3 3 6-6"` and a literal indeterminate `<line>`.
- **Why:** The system has an Icon API (lucide/tabler via `Icon`), and most components route glyphs through it. This is a justified exception (you can't `pathLength`-animate a packaged icon glyph the same way), so it is NOT a V5 tell — but it is a small consistency drift worth a comment so a future reader doesn't "fix" it into a static icon and lose the draw animation.
- **Fix:** No change needed; add a one-line comment explaining the inline SVG is deliberate to enable the path-draw entrance. Keeps intent legible.

### [P3][F6] `indeterminate` as a separate boolean prop overlaps Radix's tri-state `checked`
- **Category:** composability
- **Evidence:** checkbox.tsx:38-43, 72 — `indeterminate?: boolean` exists alongside `checked` (which Radix already supports as `boolean | 'indeterminate'`); `actualChecked = indeterminate ? 'indeterminate' : (...)` makes `indeterminate` hard-override `checked`.
- **Why:** Two ways to express the same tri-state (`indeterminate` prop vs `checked="indeterminate"`) is a mild API redundancy; the override precedence (`indeterminate` wins, documented as a "gotcha") is the kind of footgun a single tri-state `checked` avoids. Low impact because it's documented and tested, hence P3.
- **Fix:** Optional — keep `indeterminate` as ergonomic sugar but document it as forwarding to `checked='indeterminate'` rather than overriding, or deprecate it in favor of the tri-state in a future major. Not urgent.

## Composability gaps
- `indeterminate` boolean duplicates Radix's `checked="indeterminate"` tri-state (F6, P3) — two paths to one state with a documented override footgun.
- No `asChild` — correct here: a checkbox is a leaf control, not a polymorphic wrapper. Not a gap.
- Controlled/uncontrolled is handled well (checkbox.tsx:60-81 tracks `internalChecked` for uncontrolled so AnimatePresence works in both modes, fires `onCheckedChange` not `onChange`) — F6 controlled/uncontrolled is otherwise CLEAN.
- Does not re-roll surface/elevation (composes the Radix primitive directly) — F5 clean. Correctly does NOT compose Card (a form control should not).

## Motion gaps
- M3 (P1): no `prefers-reduced-motion` guard on the path-draw + opacity animation, despite a `withReducedMotion()` helper existing in motion.ts.
- M1 clean: the entrance uses `easeOut` tween + opacity, no bounce/overshoot spring — appropriate restraint for a form control.
- M4 clean: hover (`data-[state=unchecked]:hover:border-accent-7 ...`), focus-visible ring, and a check entrance/exit via AnimatePresence are all present — feedback motion is covered.
- M5 clean: animates `pathLength`/opacity/transform-free SVG, not layout props.
- M2 minor: line and check both use `durations.moderate02`; fine for a single glyph.

## Polish plan (ordered steps to reach the finish bar)
1. **Add the reduced-motion guard (M3, P1).** Wire `useReducedMotion()` and gate both the `pathLength` path/line transition and the indicator opacity fade through `withReducedMotion()` or a `duration: 0` branch.
2. **Fix the doc contradiction (J, P1).** Correct checkbox.md:30/36 to state Checkbox DOES auto-consume FormField error/required/describedby (with explicit `error` as override), and add a FormField note to the JSDoc.
3. **Token the sizes (G2, P2).** Replace `h-5/w-6/h-7` and the arbitrary `h-[14px]/h-[18px]` with DS size tokens; if none fit, add the three control sizes to the scale so checkbox/radio/switch share one source.
4. **Add forced-colors handling (H, P2).** `forced-colors:` rules for the checked fill, glyph, and focus ring so the control survives Windows High Contrast.
5. **Extend stories (H, P2).** Add focus-visible and required stories (and optionally dark / reduced-motion) so implemented states are visually regression-guarded.
6. (Optional) Comment the deliberate inline SVG (F2, P3); reconsider the `indeterminate` prop vs tri-state in a future major (F6, P3).

## Clean (rubric dims that pass)
- **V1–V8 visual tells:** none. No accent rail, no double-edge (single `border`, no shadow on the box), no gradient/gradient-text, no indigo/violet/slate-as-brand (uses `accent-*`/`error-*`/`surface-*` semantic tokens), no emoji icons, no blob/glass/glow, single `rounded-control-inner` radius, no pill spam.
- **V9–V15 visual reflexes:** none in the component, story, or doc. No hardcoded Inter/Geist, no decorative numbering, no eyebrow kickers, no all-caps default.
- **E1–E8 verbal tells:** doc/JSDoc/stories are clean and prescriptive. The em dashes present are connective prose in JSDoc/doc (not the E1 stylistic-connector-everywhere tic) and the "feel free to combine props creatively!" closer in the JSDoc is the repo's shared template line, not generated slop — borderline E5 but consistent house style across components.
- **F5 / surface drift (G1):** correctly composes the Radix primitive, no surface re-roll; not a card so SURFACE1 rule N/A.
- **G3 variant-axis:** `size: 'sm' | 'md' | 'lg'` is a valid subset of the canonical xs/sm/md/lg/xl scale; no `filled`/`primary`/`small`/`color="default"` drift. `error` as a boolean (not a `color` axis) is the right call for a binary form-control state.
- **F6 controlled/uncontrolled:** properly supports both `checked`+`onCheckedChange` and `defaultChecked`, uses `onCheckedChange` (not `onChange`).
- **I types:** clean — extends `ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>`, `forwardRef` with correct `ElementRef`, `displayName` set, no `any`, no `React.FC`, size is a string-literal union not stringly typed.
- **H a11y (implemented):** `touch-target` utility + md=24px meets WCAG 2.5.8; `focus-visible:ring-2`; `aria-invalid`/`aria-describedby`/`aria-required` wired from FormField; `disabled:` styling; uses real `<button role=checkbox>` semantics via Radix (not `<div onClick>`). axe-clean via `describeConformance`.
- **J tests/stories exist:** story present (publish gate met) with `play` interaction test; `describeConformance` + unit tests cover check/uncheck/sm-size.
