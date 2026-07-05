# ui/slider — audit
**Finish score:** 4/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:2 P2:3 P3:2

Slider is a thin, well-behaved wrapper over the vendored Radix Slider primitive. It composes the base primitive (F5 clean), forwards controlled + uncontrolled value (F6 clean), wires real a11y (aria-invalid/describedby/required from FormField, per-thumb aria-label), uses semantic tokens throughout, and has zero visual AI tells (no accent rail, no gradient, no glow, correct `rounded-pill` per the radius vocabulary). The gaps are: two arbitrary px sizes that bypass the spacing token system, a color axis that drifts from the canonical taxonomy, a documented-but-now-false "does NOT consume FormField" claim that contradicts the source, and thin state/story coverage (no focus/error/RTL/forced-colors stories).

## Findings

### [P1][J] Doc + llms-full claim "Slider does NOT auto-consume FormField" — source does
- **Category:** docs
- **Evidence:** `docs/components/ui/slider.md:25` — `**FormField:** Slider does NOT auto-consume FormField state. No validation UX` and `:32` same in Gotchas; llms-full.txt line ~3861 repeats it. But `ui/slider.tsx:81-84` — `const fieldCtx = useFormField()` / `const isError = fieldCtx.state === 'error'` / wires `aria-describedby ?? fieldCtx.helperTextId` and `aria-required ?? fieldCtx.required`.
- **Why:** Source wins (CLAUDE.md rule). The component *does* consume FormField for a11y wiring; the doc tells an AI agent the opposite, so an agent will hand-wire `aria-describedby` it doesn't need, or assume `required`/`error` propagation doesn't happen.
- **Fix:** Reword to: "Slider consumes FormField for a11y wiring (`aria-invalid`, `aria-describedby`, `aria-required`) but renders **no visual** validation treatment — values are valid by construction." Keep the "no validation visuals" point, drop the false "does NOT auto-consume."

### [P1][G3] `color` axis drifts from the canonical color taxonomy (missing `neutral`/`info`)
- **Category:** vocabulary
- **Evidence:** `ui/slider.tsx:33-38` — `color: { accent, success, warning, error }`. Card's canonical set is `accent | neutral | success | warning | error | info` (`card.tsx:33-41`); rubric G3 names `accent/neutral/success/warning/error/info`.
- **Why:** Family vocabulary drift. A consumer who does `color="neutral"` (valid on Card, Badge, etc.) gets a TS error here; `info` is silently unavailable. Not a hard tell, but inconsistent axis membership across the family.
- **Fix:** Add `info` (and optionally `neutral`) to `sliderThumbVariants.color` + `sliderRangeColorMap`, or document why a slider deliberately restricts to the four semantic-meaning colors (accent + the 3 status tones).

### [P2][G2] Arbitrary px track heights bypass the spacing token system
- **Category:** drift
- **Evidence:** `ui/slider.tsx:16,18` — `sm: 'h-[4px]'` and `lg: 'h-[10px]'`. The `md` row already uses the token `h-ds-02b` (6px) on line 17. `--spacing-ds-02` = 4px (`tokens/semantic.css:298`), so `h-[4px]` should be `h-ds-02`.
- **Why:** G2 — raw values instead of tokens, inconsistent with the `md` row that does use a token. `h-[4px]` has an exact token (`h-ds-02`). `h-[10px]` has no token (sits between ds-02b=6 and the next step), so it's an off-scale value.
- **Fix:** `sm: 'h-ds-02'`. For `lg`, either add a token for 10px or snap to an existing one (e.g. `h-ds-03` if 8px reads acceptably). At minimum replace `h-[4px]` with the existing token.

### [P2][H] State coverage: stories omit focus-visible, error, RTL, forced-colors, reduced-motion
- **Category:** state-coverage
- **Evidence:** `ui/slider.stories.tsx` has only Default, Range, Disabled, Sizes, Colors. No focus-visible demo (the component ships a `focus-visible:ring-2 ring-offset-2` treatment, `slider.tsx:25`), no `color="error"` + `aria-invalid` story, no RTL story (range fill direction), no forced-colors story. Tests (`slider.test.tsx`) cover render/value/min-max/disabled/step only — no focus, no onValueChange, no multi-thumb assertion.
- **Why:** Rubric H wants applicable states demonstrated. Slider has a non-trivial focus ring and an error color path that nothing exercises; range direction under RTL is a real risk for a fill that's `absolute h-full`.
- **Fix:** Add stories: Focus (autofocus or play-fn `.focus()`), Error (`color="error"` inside a FormField in error state), RTL (`dir="rtl"` wrapper), ForcedColors. Add a test for `onValueChange` firing and for two thumbs rendering on `defaultValue={[25,75]}`.

### [P2][M3/M4] Thumb micro-feedback is CSS-only with no reduced-motion guard
- **Category:** motion
- **Evidence:** `ui/slider.tsx:25` — `transition-[color,transform,box-shadow] duration-fast-02 ... hover:scale-110 active:scale-[1.15]`. This is a raw CSS transition, not routed through the motion system (`lib/motion.ts`), and there is no `motion-reduce:` variant or `prefers-reduced-motion` guard on the scale.
- **Why:** M3 — animation (scale on hover/active) with no reduced-motion path. Minor because it's hover/press feedback (low vestibular risk) and respects `duration-fast-02`, but it's inconsistent with the framer-motion-routed feedback the rest of the family uses (Card uses `whileHover/whileTap` + springs that MotionConfig can damp). The track Range has no width transition at all on value change (M4 — no feedback motion when the value updates programmatically).
- **Fix:** Add `motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100` (or gate scale behind a reduced-motion-aware utility). Optionally add a `transition-[width]` on the Range so controlled value changes ease instead of jumping.

### [P3][V2] Thumb carries both a border and a shadow (double-edge) — acceptable for a knob, flag for review
- **Category:** visual-tell
- **Evidence:** `ui/slider.tsx:25,29-31` — thumb has `shadow-raised` (+`hover:shadow-raised-hover`) AND a colored `border` / `border-2` / `border-[3px]` per size.
- **Why:** V2 bans border+shadow on the same element — but that rule targets cards/surfaces. A slider thumb is a physical knob where a colored ring (state color) over an elevation shadow is the conventional, intentional pattern (the border *is* the color affordance, the shadow is the lift). Calling it out only so synthesis can confirm it's a deliberate exception, not a reflex.
- **Fix:** None required if intentional. If you want strict V2 compliance, drop the shadow and let the colored ring + thumb fill carry it, or drop the border and tint via ring/fill. Recommend keep as-is (documented exception).

### [P3][G3] `lg` thumb border width `border-[3px]` is an arbitrary value
- **Category:** drift
- **Evidence:** `ui/slider.tsx:31` — `lg: 'h-8 w-8 border-[3px]'`.
- **Why:** Minor G2/G3 — arbitrary border width. `sm`/`md` use the scale (`border`, `border-2`); `lg` jumps off-scale to `[3px]`. No token namespace for border widths exists, so low priority.
- **Fix:** Use `border-4` (the next scale step) if 4px reads fine at the lg thumb, or leave as a deliberate intermediate width.

## Composability gaps
- **None significant.** Slider composes the vendored Radix `SliderPrimitive` base (F5 clean), supports both `value` (controlled) and `defaultValue` (uncontrolled) and passes `onValueChange` straight through Radix (F6 clean), derives thumb count from value array, and forwards `aria-label` to the single-thumb case. Prop surface is small (`size`, `color` + Radix passthrough) — well under the F3 threshold.
- Minor: multi-thumb per-thumb labelling has no first-class API — the JSDoc (`slider.tsx:67-69`) tells consumers to "provide per-thumb labels via the aria-label array... or wrap each in a labelled form field," but there's no `thumbProps`/`labels` slot; only the `thumbCount === 1` case gets `aria-label` (`slider.tsx:109`). Range thumbs are unlabelled by default. Not a Card-bar miss (it's an a11y nicety), but a `getThumbProps`/`labels?: string[]` escape hatch would close it.

## Motion gaps
- Thumb hover/press scale is CSS-only with no `motion-reduce` guard (M3) — see P2 finding above.
- Range fill has no transition on value change (M4) — controlled value updates snap rather than ease. The rest of the family routes feedback through framer-motion + MotionConfig; this one doesn't, so reduced-motion users can't damp the thumb scale via the global MotionConfig.
- No entrance motion, which is correct — a form control shouldn't animate in.

## Polish plan (ordered steps to reach the finish bar)
1. **Fix the docs lie (P1):** correct `slider.md` + `llms-full.txt` so they don't claim "does NOT auto-consume FormField" when the source wires aria-invalid/describedby/required. Keep the "no visual validation" point.
2. **Tokenize the track heights (P2):** `sm: 'h-ds-02'` (exact token for 4px); resolve `lg`'s 10px to a token or accept it as a deliberate off-scale with a comment.
3. **Align the color axis (P1):** add `info` (and consider `neutral`) to match the family taxonomy, or document the deliberate restriction.
4. **Add reduced-motion guard (P2):** `motion-reduce:hover:scale-100 motion-reduce:active:scale-100 motion-reduce:transition-none` on the thumb; consider a `transition-[width]` on the Range fill.
5. **Fill state/story coverage (P2):** Focus, Error (in FormField), RTL, ForcedColors stories; tests for `onValueChange` and two-thumb render.
6. **(Optional) per-thumb label API:** add `labels?: string[]` or `thumbProps` so range sliders aren't unlabelled by default.

## Clean (rubric dims that pass)
- **V1 accent rail:** none. **V3 gradient text:** none. **V4 framework palette:** none — all `accent-*`/`success-*`/`warning-*`/`error-*`/`surface-*` semantic tokens. **V5 emoji:** none. **V6 blob/glass/glow:** none. **V7 rounded-everything:** `rounded-pill` is the correct vocabulary for a slider track/thumb (llms-full radius table line 126 lists Slider under `rounded-pill`). **V8 pill spam:** n/a.
- **E1–E8 verbal tells:** JSDoc + doc copy are clean, direct, no em-dash tic abuse beyond legitimate punctuation, no AI vocabulary.
- **F5 composes base primitive:** yes (Radix Slider). **F6 controlled/uncontrolled:** both supported; `onValueChange` (correct Radix semantics, not `onChange`).
- **G1 surface:** track uses `bg-surface-raised-hover`, thumb `bg-surface-overlay` — appropriate for an inline control, not flagged by the surface-1 rule.
- **H a11y baseline:** `aria-invalid`/`aria-describedby`/`aria-required` wired from FormField; single-thumb `aria-label` forwarded; `touch-target` utility gives the small thumb a 44px hit area (`utilities.css:181`) so sub-44px visual thumb still meets the target; `focus-visible:ring-2 ring-offset-2` with per-color ring; `disabled:opacity-action-disabled` uses the token. Keyboard nav inherited from Radix.
- **I types:** `SliderSize`/`SliderColor` derived from CVA and exported; `SliderProps` extends Radix `ComponentPropsWithoutRef` with `color` omitted/re-typed; `forwardRef` + `displayName` present (mirrors `SliderPrimitive.Root.displayName`). No `any`, no stringly-typed enums.
- **J docs (partial):** prop table + defaults match source for `size`/`color`; story exists (publish gate met). Only the FormField claim is stale (flagged P1 above).
