# ui/combobox — audit
**Finish score:** 3/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:4 P2:5 P3:2

Combobox is a solid, accessible component: real Radix Popover composition, full keyboard nav (Arrow/Home/End/Enter/Escape), `role="combobox"`/`listbox`/`option` wiring, `aria-activedescendant`, FormField a11y consumption, design tokens throughout, a discriminated union for single/multi, and a thorough test suite (33 tests, axe-clean) + 9 stories. No visual AI tells (no accent rail, no gradient text, no indigo, no emoji, no glassmorphism). It falls short of the Card bar mainly on: vocabulary drift from its sibling `Select` (no `variant`/`color` axis), a closed `options[]`/`renderOption`-callback API instead of composable children, no uncontrolled mode, no reduced-motion guard on its entrance, and no *visual* error state despite wiring the error a11y.

## Findings

### [P1][G4] Selector-family vocabulary drift: no `variant`/`color` axis (Select has both)
- **Category:** vocabulary
- **Evidence:** combobox.tsx:25-35 — CVA exposes only `{ size }`; sibling `select.tsx:45-66` exposes `variant` (default/ghost) + `color` (default/error) + `size`.
- **Why:** Two components in the same "Selectors" family expose different axis vocabularies, so a consumer can't move between Select and Combobox with the same mental model.
- **Fix:** Add a `color` axis (`default` | `error`) and ideally `variant` parity with Select, mapping the error path to `border-error-7 text-error-11 focus-visible:ring-error-9` so it matches `select.tsx:55`.

### [P1][H] Error state is a11y-only, no visual treatment
- **Category:** state-coverage
- **Evidence:** combobox.tsx:405-408,422 — `isError = fieldCtx.state === 'error'` sets `aria-invalid={isError || undefined}` but the trigger className (lines 426-430) never paints an error border/ring. Compare `select.tsx:96` which routes `color: isError && !color ? 'error'` into the CVA.
- **Why:** A required/invalid combobox inside a FormField reads as errored to AT but looks identical to a normal control — sighted users get no error affordance.
- **Fix:** When `isError`, apply the error border/ring (e.g. `border-error-7 focus-visible:ring-error-9`). Pairs with the G4 `color` axis above.

### [P1][F6] Controlled-only — no uncontrolled (`defaultValue`) mode
- **Category:** composability
- **Evidence:** combobox.tsx:147,153,167-169 — `onValueChange` is **required**, `value` is optional but there is no `defaultValue`; selection state lives entirely in the parent. `selectedValues` (194-198) derives only from `value`.
- **Why:** Every other "value" control in the system supports an uncontrolled mode; forcing `useState` in every call site is friction and diverges from the Card-bar finish (full state coverage, ergonomic defaults).
- **Fix:** Add `defaultValue` and make `onValueChange` optional; track internal state when `value` is undefined (standard controlled/uncontrolled merge).

### [P1][F1/F4] Closed `options[]` + `renderOption` callback instead of composable children
- **Category:** composability
- **Evidence:** combobox.tsx:124-137 — `options: ComboboxOption[]` plus a `renderOption?: (option, selected) => ReactNode` render-prop. No `<Combobox.Option>` / `<Combobox.Group>` slots; per-option `icon`/`description` are fixed fields on the data object (68-74).
- **Why:** The Card bar is "content goes through slots, not bespoke corner-props/callbacks." A render-callback is the functional equivalent of a bespoke prop — it can't compose, can't carry arbitrary children, and forces consumers to flatten everything into one `ComboboxOption` shape (no groups, no separators, no headers).
- **Fix:** Offer a compound API (`Combobox.Option`, `Combobox.Group`) alongside the data-driven `options` prop, or at minimum document `renderOption` as the deliberate escape hatch. Lower priority than G4/H since the data-driven API is a legitimate pattern for searchable lists — flag, don't force.

### [P2][M3] Entrance animation has no reduced-motion guard
- **Category:** motion
- **Evidence:** combobox.tsx:447-450 — `<motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...springs.snappy, opacity: tweens.fade }}>` with no `prefers-reduced-motion` handling. The motion lib ships `withReducedMotion()` (lib/motion.ts:58) but it is unused here, and there is no `useReducedMotion()`/MotionConfig gate in this file.
- **Why:** A scale-pop on every dropdown open ignores reduced-motion preference unless a consumer happens to wrap the tree in `<MotionConfig reducedMotion="user">`. Card/StatCard rely on the same global, but the rubric (M3) wants the guard explicit or the global guaranteed.
- **Fix:** Gate the entrance via `useReducedMotion()` (collapse to opacity-only / duration 0) or confirm a system-level MotionConfig is mandated and document it.

### [P2][M4] No exit animation on the dropdown
- **Category:** motion
- **Evidence:** combobox.tsx:437-447 — `PopoverPrimitive.Content` mounts a `motion.div` with `initial`/`animate` but there is no `AnimatePresence`/`exit`; close is instant. (`open` state at 186 toggles unmount.)
- **Why:** Enter is animated, exit is a hard cut — asymmetric feedback motion, the M2/M4 tell. Overlays in the system should have differentiated enter/exit.
- **Fix:** Wrap in `AnimatePresence` (Radix supports `forceMount` + presence) with a quick `exit={{ opacity: 0, scale: 0.97 }}`, or accept instant close and document it as deliberate.

### [P2][H] Pill remove button is `tabIndex={-1}` — not keyboard-reachable
- **Category:** a11y
- **Evidence:** combobox.tsx:370-376 — the per-pill remove `<button … tabIndex={-1}>`. Pills can only be removed by mouse; keyboard users must reopen the list and toggle the option off.
- **Why:** Interactive control unreachable by keyboard. Mitigated (you *can* deselect via the listbox) so not a P0/P1 broken-guarantee, but it's a state-coverage gap vs the Card bar.
- **Fix:** Either make pills focusable (roving tabindex / Backspace-to-remove last on the trigger) or document the listbox as the canonical keyboard removal path.

### [P2][G2] Hardcoded pill vertical padding `py-[1px]` / `py-[2px]`
- **Category:** drift
- **Evidence:** combobox.tsx:52-53 — `pillSizeMap` md/lg use `py-[1px]` / `py-[2px]` arbitrary values instead of a spacing token.
- **Why:** Re-rolled spacing — the rubric (G2) flags raw px arbitrary values over `--spacing-ds-*`. Minor (sub-token nudge for pill density) but it's drift.
- **Fix:** Use the smallest spacing token (e.g. `py-ds-005`/`py-ds-01`) or add a dedicated pill-padding token; if 1px/2px is genuinely needed, add a comment marking it intentional.

### [P2][J] Doc says FormField is NOT auto-consumed — source contradicts it
- **Category:** docs
- **Evidence:** combobox.md:44 ("Does NOT auto-consume FormField state… style error manually") vs combobox.tsx:405-408 which *does* call `useFormField()` and wires `aria-invalid`/`aria-describedby`/`aria-required`.
- **Why:** Stale doc — source wins per the make-kit rule. Consumers told to do manual work the component already does for a11y (though the *visual* error is indeed manual today — see H above, which is the real gap).
- **Fix:** Update the doc: "Auto-consumes FormField a11y (aria-invalid/describedby/required). Visual error styling is currently manual" (until G4/H lands, then drop the caveat).

### [P3][G3] `multiple` as a discriminating boolean rather than a canonical axis
- **Category:** vocabulary
- **Evidence:** combobox.tsx:145-156 — `multiple?: false | true` discriminates the union.
- **Why:** Legitimate and TS-sound (documented discriminated union). Noting only that the canonical taxonomy is variant/size/color/shape; `multiple` is a behavioral boolean, which is fine here. No action.
- **Fix:** None — keep. Listed for completeness.

### [P3][docs] `renderOption` selected-arg underused in stories
- **Category:** docs
- **Evidence:** combobox.stories.tsx:153 — `renderOption = (option, _selected) =>` discards `selected`; no story demonstrates selected styling via the callback.
- **Why:** Minor coverage nit — the second callback arg's purpose isn't demonstrated.
- **Fix:** Add a story branch that styles the selected row in `renderOption`.

## Composability gaps
- Closed data-driven API (`options[]` + `renderOption` callback); no `<Combobox.Option>`/`<Combobox.Group>` compound slots, so no groups/separators/headers (F1/F4).
- Controlled-only: no `defaultValue` / uncontrolled mode; `onValueChange` is required (F6).
- No `variant`/`color` axis to match the sibling `Select` (G4) — the selector family doesn't share one vocabulary.
- Good: it DOES compose the Popover primitive (not re-rolled), forwards a typed `HTMLButtonElement` ref, and the single/multi discriminated union is correctly typed (no `any`).

## Motion gaps
- M3: entrance `scale`/opacity animation (447-450) has no explicit reduced-motion guard; relies on an unguaranteed ambient MotionConfig. `withReducedMotion` helper exists but unused.
- M4/M2: animated enter, instant (unanimated) exit — asymmetric, no `AnimatePresence`/`exit`.
- Clean: chevron rotate (433), pill `hover:scale-110` (372), and option `transition-colors` (505) all animate transform/opacity/color (not layout props) — M5 clean; durations use tokens (`duration-fast-01`).

## Polish plan (ordered steps to reach the finish bar)
1. **Add `color` axis (`default`|`error`) to the trigger CVA** and route `isError` into it so the error state is visible, matching `select.tsx`. Closes G4 + H (error visual) together.
2. **Add `defaultValue` + uncontrolled mode**; make `onValueChange` optional (F6).
3. **Guard the entrance with `useReducedMotion()`** (or document the mandated MotionConfig) and add a symmetric `exit` via `AnimatePresence` (M3/M4).
4. **Fix the stale FormField doc line** (J) to reflect that a11y is auto-consumed; once step 1 lands, drop the "style error manually" caveat.
5. **Replace `py-[1px]`/`py-[2px]` pill padding with spacing tokens** (G2).
6. **Decide pill keyboard story:** make remove focusable or document the listbox path (H).
7. **(Stretch, lower priority)** Offer a compound `Combobox.Option`/`Combobox.Group` API alongside `options[]` for groups/headers (F1/F4).

## Clean (rubric dims that pass)
- **V1–V8 / V9–V15 visual tells:** none. No accent rail, no gradient text, no double-edge (trigger is border-led; overlay is shadow-led `shadow-floating`), no indigo/violet/slate-as-brand (uses `accent-*`/`surface-*` semantic tokens), no emoji icons (lucide/tabler via Icon API), no glassmorphism/blob/glow, one radius vocabulary (`rounded-control`/`rounded-overlay`/`rounded-control-inner`/`rounded-pill`), no pill-badge spam.
- **E1–E8 verbal tells:** docs/JSDoc are direct and prescriptive; no em-dash tic abuse, no AI vocabulary, no meta-hedging. (The JSDoc closer "feel free to combine props creatively!" at combobox.tsx:121 is a mild E5-ish flourish but matches the house pattern across Card/StatCard, so it's a deliberate convention, not a tell.)
- **G1 surface:** trigger `bg-surface-raised-hover` matches Select's default; overlay `bg-surface-overlay` is correct for a popover surface; `z-popover` correct. No surface drift.
- **I types:** no `any` in the public API (the internal `as (value: string[]) => void` casts are union-narrowing inside a correctly-typed discriminated union), typed `HTMLButtonElement` ref, `forwardRef` + `displayName`, exported `ComboboxOption`/`ComboboxProps`/`ComboboxSize`.
- **H state coverage (partial):** default/hover/focus-visible (ring)/disabled (+`aria-disabled` opacity)/selected (`aria-selected` + check)/empty (`emptyMessage`)/highlighted all handled and tested; keyboard nav complete; axe-clean test (combobox.test.tsx:473).
- **J (partial):** story exists (publish gate met, 9 stories incl. Sizes/Disabled/EmptyState/ManyPills); prop table mostly accurate (the FormField line is the one stale entry).
