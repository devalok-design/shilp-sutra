# ui/number-input — audit
**Finish score:** 3/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:3 P2:5 P3:1

## Findings

### [P1][F6] Controlled-only with a default `value` that masks a broken uncontrolled mode
- **Category:** composability
- **Evidence:** number-input.tsx:110 — `value = 0,` ; :96–97 `value?: number / onValueChange?: (value: number) => void` (no `defaultValue`)
- **Why:** The component renders a real `<input>` (`type=number`) wired to the `value` prop with no internal state, yet `value` defaults to `0`. So `<NumberInput />` looks like a working uncontrolled input but is permanently stuck at 0 — typing fires `handleInputChange` → `onValueChange?.()` which no-ops, and React re-renders the controlled value back to 0. The JSDoc even admits "Uncontrolled usage is possible but the buttons won't update the displayed value." That's a half-state the finish bar rejects: support a real uncontrolled mode (`defaultValue` + internal `useState`) or make `value` required and drop the silent `= 0` default. Card/StatCard never ship a prop that quietly doesn't work.
- **Fix:** Add `defaultValue?: number`; keep internal state seeded from `defaultValue`, treat `value` as the controlled override (`const isControlled = value !== undefined`). Drive `<input>` and the steppers from the resolved value, call `onValueChange` on every change. Then `<NumberInput defaultValue={3} />` works standalone.

### [P1][G2] Hardcoded arbitrary pixel sizes instead of size tokens
- **Category:** drift
- **Evidence:** number-input.tsx:33 `xs: 'h-[22px] w-[22px]'`; :49 `xs: 'text-ds-sm w-[28px]'`
- **Why:** Every other dimension in the file is a `ds-*` token (`h-ds-sm`, `w-ds-sm-plus`, `h-ds-md`). The `xs` row drops to raw `[22px]`/`[28px]`, which is exactly the re-rolled-token tell G2 names — a magic number that won't track a token change and reads as "AI guessed a pixel value." There's no `xs` button/width token, so this is a gap in the scale, not a deliberate exception (nothing documents it).
- **Fix:** Add the missing `xs` step to the size token scale (a `--spacing-ds-*` / control-size token) and reference it, or reuse an existing token that resolves to 22/28px. No bare `[Npx]` in shipped defaults.

### [P1][H] No focus-visible affordance on the wrapper; warning/success states are border-only and a11y-silent
- **Category:** state-coverage / a11y
- **Evidence:** number-input.tsx:14–15 wrapper `cva` has no `focus-within:` ring; :56–61 `stateColorMap` only sets `border-*-7` for warning/success; :202 `aria-invalid` is set for `error` only
- **Why:** The visible focus ring lives on the inner `<input>` (:205 `focus-visible:ring-2`), but the bordered wrapper is the perceived control boundary — focus reads as a ring floating inside a box. Sibling inputs put focus on the whole control. Worse, `warning`/`success` change only the border color with no `aria-invalid`/`aria-describedby` semantics and no `forced-colors` fallback (in Windows high-contrast the `border-warning-7` is stripped and the state is invisible). The matrix in section H wants focus-visible, error+`aria-invalid`, and forced-colors all covered.
- **Fix:** Move the focus ring to the wrapper via `focus-within:ring-2 focus-within:ring-accent-9` and drop it from the input (or keep both intentionally). For warning/success add a `forced-colors:` outline so the state survives high-contrast. Confirm `aria-invalid` for error is enough or add `data-state` for the others.

### [P2][F5] Re-rolls the text-input surface instead of composing the base `Input`
- **Category:** composability
- **Evidence:** number-input.tsx:14 `numberInputWrapperVariants` redefines `rounded-control border border-surface-border-strong`; :192–209 bespoke `<input>` with its own `bg-transparent border-0 … focus-visible:ring-2` block
- **Why:** This is the StatCard-vs-Card drift risk applied to inputs: the wrapper hand-rolls the same border/radius/size tokens `Input` already owns, and the inner field re-implements focus/disabled styling. Any change to `Input`'s control surface (radius, border token, focus ring) silently won't reach NumberInput. The steppers are a legitimate distinct affix pattern, but the field + frame should compose the base.
- **Fix:** Render the base `Input` (or its shared wrapper) as the field and slot the −/+ buttons as start/end adornments, so border/radius/size/focus come from one source. If Input has no adornment slot yet, that's the slot to add (benefits Input, Select, this).

### [P2][H] `disabled` doesn't set `aria-disabled`; read-only mode unsupported
- **Category:** a11y / state-coverage
- **Evidence:** number-input.tsx:200 input `disabled={disabled}`; :181/:214 buttons `disabled={disabled || …}` — no `aria-disabled`; no `readOnly` handling
- **Why:** Native `disabled` removes the control from the a11y tree and the tab order, which is often not what a form wants (announcement is lost). The rubric H row explicitly asks for `disabled (+aria-disabled)` and a `read-only` state. A read-only number (the JSDoc's "read-only-like" example at :91 is faked with `disabled` + a no-op handler) has no first-class path — read-only should keep the value focusable/announced but block edits.
- **Why it matters:** the "Disabled number display (read-only-like)" example proves the gap is already being worked around in docs.
- **Fix:** Add a `readOnly` prop that sets the input `readOnly`, disables steppers, but keeps tab focus; consider `aria-disabled` over native `disabled` where appropriate.

### [P2][J] No warning/success stories or a per-component doc; `state` axis under-demonstrated
- **Category:** docs / state-coverage
- **Evidence:** number-input.stories.tsx:70 only `ErrorState`; no `warning`/`success`/focus stories; Glob for `docs/components/**/number-input.md` → none
- **Why:** `state` supports four values (number-input.tsx:12) but only `error` is shown, so warning/success ship untested visually (Chromatic can't catch a regression in a state nobody renders). There's no per-component markdown doc. Stories are a publish gate per CLAUDE.md; the state matrix is incomplete.
- **Fix:** Add `Warning`, `Success`, and a `Focused`/`FormField` story; add the per-component doc with an accurate prop table.

### [P2][M4] Steppers have feedback motion but the typed-value change has none, and there's no held-button repeat
- **Category:** motion / state-coverage
- **Evidence:** number-input.tsx:185/:218 buttons `active:scale-90 transition-[…transform]`; value text at :192 changes with no transition; no press-and-hold auto-repeat
- **Why:** Minor polish gap vs the finish bar. The buttons animate on press (good, and reduced-motion is globally honored via the CSS reset at semantic.css:675), but pressing +/− snaps the number with no micro-feedback, and there's no auto-repeat on hold (standard spinbutton affordance). Not a tell, just below the bar.
- **Fix:** Optional tabular-nums tick/fade on value change; optional press-and-hold repeat (with reduced-motion respected).

### [P3][H] Decrement empty-input fallback can jump outside `[min, max]` intent
- **Category:** state-coverage
- **Evidence:** number-input.tsx:140–142 — on empty/`'-'` input, `onValueChange?.(min >= 0 ? min : 0)`
- **Why:** Edge nit: when `min` is negative, clearing the field resets to `0` rather than to `min` or leaving it empty, which can surprise (0 may be a valid mid-range value the user didn't choose). Low impact, no a11y break.
- **Fix:** Decide the clear-behavior intentionally (snap to `min`, or allow transient empty with `value` held) and document it.

## Composability gaps
- **No real uncontrolled mode** (F6): `value` defaults to 0 with no `defaultValue`/internal state; typed edits no-op without a consumer handler. Either make controlled-required or add a working uncontrolled path.
- **Does not compose the base `Input`** (F5): hand-rolls border/radius/size/focus that `Input` already owns → drift risk. The −/+ should be input adornments.
- **No adornment/affix slot pattern** — the +/− buttons are hardcoded children; there's no way to compose a different affix (e.g. a unit label). Not required, but the slot that would fix F5 also unlocks this.
- **`size`/`state` resolve from FormField context correctly** (number-input.tsx:124–137) — this part is good, matches Input.

## Motion gaps
- Stepper press feedback (`active:scale-90`) is present and reduced-motion is globally honored (semantic.css:675 zeroes transition-duration) — M3 clean.
- M4: no micro-feedback on the value changing; no press-and-hold auto-repeat (standard for steppers). Polish-only.
- No bounce/elastic-by-default (M1 clean), no animated layout props (M5 clean), uniform-timing not an issue (single `duration-fast-01`, M2 clean).

## Polish plan (ordered steps to reach the finish bar)
1. **Fix the controlled/uncontrolled contract (F6, P1):** add `defaultValue` + internal state, resolve controlled vs uncontrolled, drive input and steppers from the resolved value. Drop the silent `value = 0`.
2. **Tokenize the `xs` sizes (G2, P1):** replace `h-[22px] w-[22px]` and `w-[28px]` with a real token step; extend the control-size scale if `xs` is missing.
3. **Move focus to the wrapper + harden states (H, P1):** `focus-within` ring on the wrapper; `forced-colors` fallback for error/warning/success; verify `aria-invalid` coverage.
4. **Compose `Input` (F5, P2):** render the base field + slot the steppers as adornments so surface/focus come from one source (add an Input adornment slot if absent).
5. **Add `readOnly` + `aria-disabled` (H, P2):** first-class read-only; stop faking it with `disabled` in docs.
6. **Fill state coverage in stories + add the doc (J, P2):** Warning/Success/Focused/FormField stories; per-component markdown with prop table.
7. **Optional motion polish (M4, P2):** value-change tick + press-and-hold repeat, reduced-motion respected.

## Clean (rubric dims that pass)
- **V1 accent rail:** none. **V2 double edge:** wrapper is border-only (no shadow); inner ring is the focus affordance — clean.
- **V3 gradient text / V4 framework palette / V5 emoji / V6 blob-glass-glow / V7 rounded-everything / V8 pill spam:** none. Uses `rounded-control`, semantic `surface-*`/`accent-*`/`error-7` tokens, lucide via `Icon` API.
- **V9–V15 visual reflexes:** none (no hardcoded fonts, no decorative numbering, no eyebrow/hero/all-caps).
- **E1–E8 verbal tells:** JSDoc and stories are direct and prescriptive; no em-dash tic, no AI vocabulary, no meta-hedging. (The shared `"feel free to combine props creatively!"` closer at :93 is mild E5 boilerplate but matches the house JSDoc pattern across components — flag at the family level, not here.)
- **M1/M2/M3/M5 motion:** intentional easing/duration tokens, reduced-motion globally honored, transform-based press feedback.
- **G1 surface:** input control, no card surface — correct, not a surface-1 violation.
- **G3 variant-axis vocabulary:** `size` xs/sm/md/lg and `state` default/error/warning/success both match the canonical input taxonomy and sibling `Input` (input.tsx:10). Consistent.
- **G4 surface vocabulary / G5 soft-vs-outline:** N/A (not a button/surface family).
- **I types:** clean `forwardRef`, `displayName`, exported `NumberInputProps`/`NumberInputSize`/`NumberInputState`, no `any`, ref typed to `HTMLInputElement`. Omits `value/onChange/type/size` from the native input props correctly and re-types them.
- **Tests:** conformance + behavior (clamp, step, bounds, disabled) covered.
