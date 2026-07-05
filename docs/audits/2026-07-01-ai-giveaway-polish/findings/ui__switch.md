# ui/switch — audit
**Finish score:** 4/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:3 P2:3 P3:1

Switch is a well-built, primitive-composed control: it wraps the vendored Radix
`@primitives/react-switch`, wires form context (`useFormField`), exposes a real
`focus-visible` ring, `touch-target`, `aria-invalid`/`aria-describedby`/`aria-required`,
forced-colors token coverage, and a conformance test. No hard AI tells (no accent rail,
no gradient text, no emoji, no indigo, no rounded-everything). The gaps are structural
(a controlled/uncontrolled double source of truth), axis-vocabulary drift, raw-px track
sizes, an in-component reduced-motion guard, and a missing per-component doc.

## Findings

### [P1][F6] Internal `useState` mirror duplicates the primitive's own state
- **Category:** composability / state-coverage
- **Evidence:** switch.tsx:40-52 — `const [internalChecked, setInternalChecked] = React.useState(defaultChecked ?? false)` … `const isChecked = checked !== undefined ? checked : internalChecked` … `handleCheckedChange` calls `setInternalChecked` then `onCheckedChange?.(value)`; meanwhile `checked`/`defaultChecked` are ALSO passed straight to `SwitchPrimitives.Root` (switch.tsx:63-65).
- **Why:** Two sources of truth for the same boolean. The thumb's animated `x` (line 78 `animate={{ x: isChecked ? travel : 0 }}`) is driven by the local mirror, not the primitive's actual `data-state`. In uncontrolled mode anything that changes the Radix state outside the `onCheckedChange` path (native form reset, programmatic state, future Radix internal changes) moves the track's `data-[state]` styling but NOT the thumb — they desync. The mirror exists only because Framer animates off a JS value instead of the `data-[state]` attribute.
- **Fix:** Drop the `internalChecked` state entirely. Drive the thumb from the primitive's resolved state instead — either read `data-state` via a ref/CSS (animate the thumb with a `data-[state=checked]:translate-x-*` Tailwind variant + `transition-transform`, no JS), or use Framer `useAnimate`/a CSS var keyed off the attribute. Let Radix own checked/uncheck; the component should mirror, never fork.

### [P1][G3] `color` axis is non-canonical and `error` is split into a separate boolean
- **Category:** vocabulary / drift
- **Evidence:** switch.tsx:17-21 `colorMap = { accent, success, warning }`; switch.tsx:24 `error?: boolean`; switch.tsx:60 `isError && "border-error-7 data-[state=checked]:bg-error-9"`.
- **Why:** Canonical color taxonomy (rubric G3) is `accent/neutral/success/warning/error/info`. Switch ships a 3-value subset and then re-introduces `error` as a parallel boolean prop with its own override precedence (`error` beats `color`, tested at switch.test.tsx:79). That's two ways to express semantic color on one axis — the same drift the family is trying to kill. `info`/`neutral` are absent with no stated reason.
- **Fix:** Fold error into the color axis (`color="error"`) or, if `error` must stay for form-state ergonomics, document that it is a state flag (mirrors `fieldCtx.state==='error'`) not a color, and still widen `color` to the full canonical set or explicitly document the subset as intentional.

### [P1][G2] Track sizes use raw arbitrary px instead of spacing tokens
- **Category:** drift
- **Evidence:** switch.tsx:12-14 — `sm: 'h-6 w-[38px]'`, `lg: 'h-7 w-[52px]'` and `travel: 16/20/24` magic numbers.
- **Why:** `w-[38px]` / `w-[52px]` are hardcoded arbitrary values, not `--spacing-ds-*` tokens (G2 hardcoded px). The `md` row uses real tokens (`w-11`, `h-ico-md`) which makes the `sm`/`lg` arbitrary-px rows look like a stopgap. `travel` is a parallel set of pixel constants that must be hand-kept in sync with track/thumb widths — if a token changes, travel silently drifts.
- **Fix:** Express track width via a spacing token (or document why a switch needs an off-cadence width). Derive `travel` from `trackWidth − thumbWidth − borders` rather than a separate hand-tuned constant, so it can't desync.

### [P2][M3] No in-component reduced-motion guard; relies on a consumer `MotionConfig`
- **Category:** motion
- **Evidence:** switch.tsx:78-80 — `animate={{ x: ... }} whileTap={{ scale: 0.85 }} transition={springs.snappy}` with no `useReducedMotion()` check; no `MotionConfig` inside the component.
- **Why:** Framer's `whileTap` scale and the spring on `x` only respect reduced-motion if an ancestor `MotionConfig reducedMotion` is present (the repo's `MotionProvider` supplies it, but it is not guaranteed in consumer apps). Button (button.tsx:292 `useReducedMotion()`) sets the bar of guarding in-component. A bare consumer with no provider gets a spring-bouncing thumb under `prefers-reduced-motion`.
- **Fix:** Read `useReducedMotion()` in the component and collapse to a transitionless/instant set the thumb position (and drop `whileTap`) when reduced. The token-driven CSS-transform approach from the F6 fix also makes this trivial via the existing `@media (prefers-reduced-motion)` base layer.

### [P2][V2] Track carries both a 2px border AND `shadow-raised` (double edge)
- **Category:** visual-tell
- **Evidence:** switch.tsx:57 — `border-2 border-surface-border-strong shadow-raised ...`.
- **Why:** Rubric V2 bans border+shadow on the same element. On a small control this is more defensible than on a card (the border is the unchecked affordance, the shadow gives the track depth), but it is still the double-edge pattern and `shadow-raised` on a flat toggle track reads as reflexive elevation. The thumb separately stacks `shadow-raised-hover` (line 75) on top.
- **Fix:** Pick one edge model for the track — keep the border (it carries the unchecked state) and drop `shadow-raised`, OR keep elevation and make the unchecked state a fill/border-color shift only. Reserve `shadow-raised-hover` for the thumb alone (where it legitimately reads as a lifted knob).

### [P2][J] No per-component doc; props table lives only in JSDoc-less interface
- **Category:** docs
- **Evidence:** no `packages/core/docs/components/**/switch.md` (Glob returned none); `SwitchProps` (switch.tsx:23-28) has zero JSDoc on `error`/`size`/`color`/`thumbIcon`, unlike Card/StatCard which carry rich `@example` blocks.
- **Why:** Card/StatCard (the bar) ship multi-`@example` JSDoc and the family has per-component docs. Switch's public props are undocumented at the source, so autodocs/llms-full have nothing to pull a description from.
- **Fix:** Add JSDoc to each `SwitchProps` member (esp. the `error` vs `color` relationship and `thumbIcon` usage) plus 2-4 `@example` blocks on the interface, matching Card's pattern.

### [P3][state-coverage] Stories/tests omit error, RTL, forced-colors, reduced-motion, thumbIcon-checked-vs-unchecked
- **Category:** state-coverage
- **Evidence:** switch.stories.tsx has Default/Checked/Disabled/DisabledChecked/WithLabel/FormExample/Sizes/Colors/WithThumbIcon — no Error story, no required/aria-invalid demo, no RTL, no forced-colors, no reduced-motion. Test covers error precedence (switch.test.tsx:79) but no story renders the error visual.
- **Why:** The rubric state matrix (H) wants error, required, RTL, forced-colors, reduced-motion demonstrated. The `error` styling and `aria-required`/form-context wiring ship with no visual story.
- **Fix:** Add an `Error` story (and ideally a `FormFieldError` story driving `error` from `useFormField`), plus a reduced-motion / forced-colors demonstration row.

## Composability gaps
- **F6 (primary):** internal `useState` mirror forks the primitive's checked state to feed Framer's `animate` value — the thumb position can desync from Radix's `data-state` in uncontrolled mode. The controlled/uncontrolled split is handled, but via duplication rather than reading the single source.
- `error` as a separate boolean prop instead of part of the `color`/state axis (F-style API smell — two ways to say semantic color).
- No `asChild` is fine here (Switch is a leaf control, not a polymorphic wrapper) — not a gap.
- `thumbIcon` is a legitimate slot prop (single fixed region, `React.ReactNode`); acceptable, though it has no checked/unchecked differentiation (can't show ✓ when on / ✕ when off without re-deriving state outside).

## Motion gaps
- **M3:** no in-component `useReducedMotion()` guard; thumb spring + `whileTap` scale depend on an ancestor `MotionConfig` that consumers may not mount (Button guards in-component — that's the bar).
- The thumb animates `x` (transform) and `scale` — correct, transform/opacity not layout props (M5 clean). Spring `snappy` is the right token (M1/M2 clean).
- Track color change uses `transition-colors duration-fast-01` (clean feedback motion, M4 satisfied for the track). The thumb's only feedback is the spring; no hover affordance on the thumb itself, but the track hover (`data-[state=unchecked]:hover:bg-surface-raised-active`) covers it.

## Polish plan (ordered steps to reach the finish bar)
1. **Kill the state fork (F6).** Remove `internalChecked`/`setInternalChecked`. Drive the thumb from the primitive's `data-state` — prefer a pure-CSS `data-[state=checked]:translate-x-*` + `transition-transform` (eliminates the JS mirror, the `travel` constants, AND the reduced-motion gap in one move), or read state via Radix and feed Framer.
2. **Resolve the reduced-motion guard (M3).** Folded into step 1 if CSS-transform; otherwise add `useReducedMotion()` and collapse spring/`whileTap` when reduced.
3. **Unify the color axis (G3).** Make `error` a documented state flag and either widen `color` to the canonical set or document the subset as intentional. Update the test that asserts `error` beats `color`.
4. **Tokenize track sizes (G2).** Replace `w-[38px]`/`w-[52px]` with spacing tokens; derive `travel` from track−thumb instead of hand constants.
5. **Resolve the double edge (V2).** Drop `shadow-raised` from the track or drop the border; keep `shadow-raised-hover` only on the thumb.
6. **Docs + stories (J, H).** Add JSDoc + `@example`s to `SwitchProps`; add Error / required / RTL / forced-colors / reduced-motion stories.

## Clean (rubric dims that pass)
- **V1** no accent rail. **V3** no gradient text. **V4** no indigo/violet/slate — uses semantic `accent/success/warning/error` tokens. **V5** no emoji. **V6** no blob/glass/glow. **V7** `rounded-pill` is the correct radius vocabulary for a toggle. **V8** no badge spam.
- **V9** no hardcoded font. **G1** surface-correct (it is an input control; `bg-surface-border-strong` track is appropriate, not a card-on-surface-1 violation). **G4** surface vocabulary consistent with family.
- **Tokens (G2 colors):** all colors via semantic tokens (`accent-9`, `surface-border-strong`, `accent-fg`, `error-7/9`), `opacity-action-disabled`, `rounded-pill`, `shadow-raised`. No raw hex. Only the track *widths* are raw px (flagged above).
- **a11y (H):** real `role="switch"` via Radix, `focus-visible:ring-2` (not bare outline removal), `touch-target`, `disabled:cursor-not-allowed`, `aria-invalid`/`aria-describedby`/`aria-required` wired from form context, forced-colors token mappings exist (`surface-border-strong`→`CanvasText`, `accent-fg`→`HighlightText`). axe-clean per conformance test.
- **Types (I):** `forwardRef` with correct `ElementRef`/`ComponentPropsWithoutRef` typing, `displayName` set, no `any`, props are a typed union not stringly-typed, `thumbIcon: React.ReactNode` is the correct wide slot type. No narrowing concerns.
- **State coverage (partial):** default/checked/disabled/disabled-checked/error(test)/required(wired)/dark(tokens)/focus all handled in source; tests cover controlled, uncontrolled, disabled-no-toggle, thumbIcon, error precedence, default md/accent.
- **Motion (partial):** transform+opacity only (M5), correct spring token (M1/M2), track color feedback (M4).
