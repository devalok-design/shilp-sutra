# ui/radio — audit
**Finish score:** 3/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:2 P2:4 P3:2

## Findings

### [P1][M1] Bouncy/overshoot spring on the selection dot by default
- **Category:** motion
- **Evidence:** radio.tsx:76 — `transition={springs.bouncy}` on the indicator `motion.span` (`initial={{ scale: 0 }} animate={{ scale: 1 }}`)
- **Why:** `springs.bouncy` is `stiffness 400, damping 15` — an overshooting pop. The motion lib documents bouncy as "Toasts, pop-ins, **celebration** feedback" (lib/motion.ts:27). A radio selecting is a routine form interaction, not a celebration; an elastic dot-pop on every selection is the textbook AI motion tell. The sibling Checkbox does NOT bounce — its indicator uses a plain `durations.fast01` opacity fade (checkbox.tsx:116). Same control family, divergent motion intent.
- **Fix:** Swap to `springs.snappy` (documented "Micro-interactions: buttons, hover, form inputs", no overshoot) or a fast scale+opacity tween matching Checkbox. Keep the family consistent.

### [P1][M4/structural] Dead `AnimatePresence` import — no exit motion on deselect
- **Category:** motion
- **Evidence:** radio.tsx:5 — `import { AnimatePresence, motion } from 'framer-motion'`; `AnimatePresence` is never rendered. The indicator (radio.tsx:71-80) animates in but Radix unmounts it instantly on deselect — no `exit`.
- **Why:** Checkbox wraps its indicator in `<AnimatePresence>` with `forceMount` + `exit={{ opacity: 0 }}` (checkbox.tsx:108-110) so deselection animates out. Radio imports the symbol but never uses it, so the dot vanishes hard on deselect — asymmetric enter/exit (M2/M4) AND a dead import that will trip lint/tree-shake review. The import being present strongly suggests an exit animation was intended and dropped.
- **Fix:** Either remove the unused `AnimatePresence` import, or (preferred, to match Checkbox) wrap the Indicator in `AnimatePresence` with `forceMount` + an `exit` so the dot fades/scales out symmetrically.

### [P2][G2] Inconsistent token usage inside the indicator-size map
- **Category:** drift
- **Evidence:** radio.tsx:45-49 — `sm: 'h-1.5 w-1.5'`, `md: 'h-ds-03 w-ds-03'`, `lg: 'h-2.5 w-2.5'`
- **Why:** The `md` indicator is on a spacing token (`ds-03`) but `sm` and `lg` are raw fractional Tailwind utilities. Three sizes, one tokenized and two not, in the same `as const` map — drift within a single object. `h-1.5` = 6px, `h-2.5` = 10px have no DS-token home, so they read as hand-tuned magic numbers.
- **Fix:** Use one vocabulary across all three rows — either tokenize sm/lg (add `--spacing-ds-*` steps for 6px/10px if they're real design values) or, if these are deliberate optical sizes, drop `ds-03` for the literal so the map is uniformly raw-with-a-comment.

### [P2][G1] Resting background uses a `-hover` surface token
- **Category:** drift / state-coverage
- **Evidence:** radio.tsx:61 — `'border border-surface-border-strong bg-surface-raised-hover'` is the **default/resting** fill; hover then escalates to `bg-surface-raised-active` (radio.tsx:65)
- **Why:** Using `surface-raised-hover` as the idle state and `surface-raised-active` as the hover state shifts the whole interaction one rung up the surface ladder — the control never shows its true resting surface, and "hover" visually reads as "active/pressed". Checkbox does the identical thing (checkbox.tsx:93,97), so it's a consistent family choice — but consistently one step off. Flagging for the family, not radio alone.
- **Fix:** Align the family on the layering rule: idle = `bg-surface-raised`, hover = `bg-surface-raised-hover`, active/checked = `bg-surface-raised-active`. Confirm against the surface-layering MANDATORY rule with the maintainer before changing (may be a deliberate input-control convention).

### [P2][H] No visual error state on the item (only aria-invalid on the group)
- **Category:** state-coverage / a11y
- **Evidence:** RadioGroup sets `aria-invalid` from form context (radio.tsx:17,24) but `RadioGroupItem` has no error styling. Checkbox renders `isError && 'border-error-7 bg-error-3'` (checkbox.tsx:100) and reads `fieldCtx.state` itself (checkbox.tsx:68).
- **Why:** A radio group in a form error state is announced to AT but visually unchanged — sighted users get no error affordance on the controls. The error matrix state (H) is unhandled at the item level, and the item diverges from its sibling Checkbox which does render an error border/tint.
- **Fix:** Have `RadioGroupItem` consume `useFormField()` (or accept the group's error via context) and apply an `border-error-7` style when the group is in error, matching Checkbox.

### [P2][H] No reduced-motion guard in-component; relies on opt-in MotionProvider
- **Category:** motion
- **Evidence:** radio.tsx:74-76 — scale animation with no `useReducedMotion`/`withReducedMotion`. Reduced motion is only honored if the consumer wraps the app in `MotionProvider` (motion/motion-provider.tsx:39, `MotionConfig reducedMotion="user"`).
- **Why:** If a consumer renders RadioGroupItem without MotionProvider (likely — it's not a required peer wrapper), the scale-pop ignores `prefers-reduced-motion`. M3 wants the animation guarded. This is a system-wide pattern (Checkbox shares it), so it's a family gap, not radio-specific — but it compounds the M1 bounce finding: an overshoot that can't be turned off by OS preference is the worst case.
- **Fix:** Lowest-effort: fixing M1 (snappy/tween, no overshoot) makes the unguarded case benign. Systemic fix: have the control read `useReducedMotion()` and collapse the transition, independent of MotionProvider.

### [P3][docs] No per-component doc; story lacks error & RTL/focus coverage
- **Category:** docs / state-coverage
- **Evidence:** No `docs/components/**/radio.md` (Glob found none). radio.stories.tsx covers Default/Horizontal/Disabled/Sizes/WithoutDefaultValue but no error-state, focus-visible, or RTL story.
- **Why:** Card-bar requires stories demonstrating the state matrix. Error, focus-visible, and forced-colors are absent. Story `Sizes` uses raw `text-sm font-medium` headings (stories.tsx:79,89,99) instead of DS type tokens — minor doc-surface tell.
- **Fix:** Add an Error story (group in form error) once the H finding is addressed; add a focus-visible/RTL story. Swap `text-sm` for `text-ds-sm` in story labels.

### [P3][F6] Controlled/uncontrolled documented but not asserted in tests
- **Category:** composability / state-coverage
- **Evidence:** radio.tsx forwards Radix `value`/`defaultValue`/`onValueChange` transparently (good — F6 is satisfied at runtime). Tests cover `defaultValue` + `onValueChange` but never a controlled `value` round-trip.
- **Why:** Controlled mode is supported by the primitive but unverified by a test; a regression in prop forwarding wouldn't be caught.
- **Fix:** Add a controlled-mode test (`value` + `onValueChange` updating state). Low priority — the primitive passthrough is sound.

## Composability gaps
- Clean overall: this is a thin, correct wrapper over the vendored Radix RadioGroup primitive — it composes the base primitive (no F5 re-roll), exposes RadioGroup + RadioGroupItem as compound parts (correct for a group/item relationship), forwards refs with primitive displayNames, and passes `value`/`defaultValue`/`onValueChange` through transparently (F6 satisfied).
- Minor: `RadioGroupItem` does not read `useFormField()` itself, so error context only reaches the group, not the item — see P2/H. Wiring the item to the field context would close the only real composability/state gap.
- No `asChild` on RadioGroupItem, but the underlying control is a native radio `<button role="radio">`; polymorphism isn't a real need here (F2 N/A).

## Motion gaps
- **M1 (P1):** `springs.bouncy` overshoot on the selection dot — celebration easing on a routine form control; diverges from Checkbox's plain fade.
- **M4/M2 (P1):** Dead `AnimatePresence` import; no exit animation — dot vanishes hard on deselect while it pops in. Asymmetric enter/exit.
- **M3 (P2):** No in-component reduced-motion guard; the scale-pop only respects `prefers-reduced-motion` if a MotionProvider is mounted (opt-in).
- M5: clean — animates `scale` (transform), not layout props.

## Polish plan (ordered steps to reach the finish bar)
1. **M1:** Change `springs.bouncy` → `springs.snappy` (or a `durations.fast01` scale+opacity tween) on the indicator. Align radio's selection motion with Checkbox's restraint.
2. **M4:** Wrap `RadioGroupPrimitive.Indicator` in `<AnimatePresence>` with `forceMount` + `exit={{ scale: 0, opacity: 0 }}` to mirror Checkbox, OR remove the unused `AnimatePresence` import if no exit is wanted.
3. **H (error state):** Have `RadioGroupItem` consume the form-field error (via context) and apply `border-error-7` styling, matching Checkbox.
4. **G2:** Make the indicator-size map use one token vocabulary across sm/md/lg (tokenize sm/lg or drop the ds token from md).
5. **G1 (family):** With the maintainer, decide the resting-vs-hover surface rung for input controls and align radio + checkbox to the surface-layering rule.
6. **docs/stories:** Add Error + focus-visible + RTL stories; add a controlled-mode test; swap `text-sm` → `text-ds-sm` in story labels.

## Clean (rubric dims that pass)
- **V1–V8 visual tells:** none. No accent rail (V1), no border+shadow double-edge on the control (V2), no gradient text (V3). Accent color is the semantic `accent-7/9/11` token, not a raw indigo/violet (V4 clean). Icon is `IconCircle` from tabler via the real icon set, no emoji (V5). No blob/glass/glow (V6). Radius is `rounded-pill` — correct for a circular radio, not rounded-everything (V7). No pill-badge spam (V8).
- **V9–V15 reflexes:** none in source/story (font is the DS sans via tokens; no decorative numbering/eyebrows/hero).
- **E1–E8 verbal:** JSDoc-free here; the size comment ("WCAG compliant") is factual, no AI vocabulary, em-dash tics, or hedging.
- **I types:** `RadioGroupItemProps` extends the primitive's props and is exported; `size` is a literal union (no stringly-typed enum, no `any`); `forwardRef` + `displayName` present on both parts; refs typed to the primitive element types. `RadioGroupProps` exported.
- **G3 variant axis:** `size: sm/md/lg` is on the canonical taxonomy. No off-taxonomy `small`/`big`/`primary`.
- **F5/F1:** composes the Radix primitive; no bespoke corner-props; no re-rolled surface.
- **a11y baseline:** focus-visible ring present (radio.tsx:63), `touch-target` utility for 44px hit area, disabled handled, group wires `aria-invalid`/`aria-describedby`/`aria-required` from form context; test suite is axe-clean.
