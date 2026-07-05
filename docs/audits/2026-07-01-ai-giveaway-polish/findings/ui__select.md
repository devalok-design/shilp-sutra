# ui/select — audit
**Finish score:** 4/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:2 P2:4 P3:2

## Findings

### [P1][M3] SelectContent entrance animation has no reduced-motion guard
- **Category:** motion
- **Evidence:** select.tsx:157-160 — `<motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...springs.snappy, opacity: tweens.fade }}>`
- **Why:** The dropdown always scales/fades in regardless of `prefers-reduced-motion`; the motion lib ships `withReducedMotion()` for exactly this and it is not used. Vestibular-sensitivity a11y gap, and the rubric treats unguarded entrance motion as a P1 tell.
- **Fix:** Gate with `useReducedMotion()` from framer-motion (or `withReducedMotion(transition)`) so the scale collapses to opacity-only / instant when the user asks for reduced motion. Match whatever guard Dialog/Popover use.

### [P1][M4] No exit animation on the dropdown (mount/unmount, no AnimatePresence)
- **Category:** motion
- **Evidence:** select.tsx:151-181 — `SelectPrimitive.Content` is rendered with `asChild` wrapping a `motion.div` that only declares `initial`/`animate`; there is no `exit` and no `AnimatePresence`. Radix unmounts Content on close, so close is an instant pop.
- **Why:** Asymmetric feedback — content animates open but snaps shut. The Card bar is "entrance/exit/feedback that means something." Overlays should ease out, not vanish.
- **Fix:** Wrap in `AnimatePresence` (Radix exposes `forceMount` + open state for this) with an `exit={{ opacity: 0, scale: 0.95 }}` mirroring the enter, or drive open/close via the Radix `data-state` CSS so close isn't abrupt.

### [P2][M4] SelectTrigger has no press/hover feedback on the default variant
- **Category:** motion / state-coverage
- **Evidence:** select.tsx:46-52 — only the `ghost` variant has a `hover:bg-surface-raised-hover`; `default` and `outline` have no hover or active transition, and there is no `transition-colors` on the base trigger string (line 42).
- **Why:** Interactive control with no resting→hover micro-feedback (M4). Items get `transition-colors duration-fast-01` (line 204) but the trigger itself does not, so hover/press on the most-touched element is dead.
- **Fix:** Add a subtle hover (e.g. border/bg shift) + `transition-colors duration-fast-01 ease-productive-standard` to the trigger base, consistent with SelectItem and the Button/Input family.

### [P2][G3] `color` axis omits the canonical info/neutral members and the warning/success tokens are partial
- **Category:** vocabulary / drift
- **Evidence:** select.tsx:53-58 — `color: { default, error, success, warning }`; success/warning set only `border-*-7` (no text/ring) while `error` sets `border + text + ring`. Canonical color taxonomy (rubric G3) is `accent/neutral/success/warning/error/info`.
- **Why:** Cross-family inconsistency: the validation palette is incomplete vs the taxonomy, and only `error` is fully styled (text + focus ring), so `success`/`warning` read as half-applied states. Not a hard tell, but it's vocabulary drift.
- **Fix:** Either document that Select intentionally ships only validation colors (error/success/warning) and bring success/warning to parity (text + ring like error), or align the axis to the family. Don't ship a color that only paints a border when error paints three properties.

### [P2][H] No story or test coverage for `size` axis, focus-visible, or RTL/forced-colors
- **Category:** state-coverage / docs
- **Evidence:** select.stories.tsx covers Default, WithGroups, WithLabel, Disabled, WithDisabledItems, Variants, ValidationColors — but the CVA exposes `size: xs|sm|md|lg` (select.tsx:59-64) with **no Sizes story** and no size test. No focus-visible, RTL (chevron mirroring), or forced-colors story/test.
- **Why:** The rubric's state matrix wants size + focus-visible + RTL + forced-colors demonstrated. A whole CVA axis ships untested/unstoried.
- **Fix:** Add a `Sizes` story (xs/sm/md/lg) and a size assertion in the test; add focus-visible + forced-colors coverage (at least a story) consistent with other input components.

### [P2][M2] Two different entrance transitions on one surface (snappy spring + fade tween) without a stated rhythm
- **Category:** motion
- **Evidence:** select.tsx:160 — `transition={{ ...springs.snappy, opacity: tweens.fade }}` mixes a spring for scale and a tween for opacity.
- **Why:** Borderline — this is a legitimate pattern (spring the transform, tween the opacity) but it's undocumented here and easy to read as accidental. Calling it out so synthesis can confirm it matches the system's overlay convention (Popover/Dropdown should use the identical pairing).
- **Fix:** Confirm Popover/DropdownMenu/HoverCard use the same spring-scale + tween-opacity pairing; if so leave a one-line comment; if not, unify.

### [P3][docs] Doc says color is "Not auto-consumed from FormField" but trigger DOES consume FormField error state
- **Category:** docs
- **Evidence:** select.md:44 — "Set `color="error"` … Not auto-consumed from FormField"; but select.tsx:86-90 reads `useFormField()` and auto-derives `isError` from `fieldCtx.state === 'error'`, plus pulls `helperTextId` and `required` into aria.
- **Why:** Doc parity drift — the component auto-consumes FormField error state (and aria wiring), contradicting the doc. Source wins.
- **Fix:** Update select.md Composability bullet: error visuals ARE auto-consumed from a FormField in `error` state (and `aria-describedby`/`aria-required` are wired) unless `color` is set explicitly.

### [P3][a11y] Disabled-item dimming relies on `opacity-action-disabled` (token, fine) but disabled trigger contrast not verified in forced-colors
- **Category:** a11y
- **Evidence:** select.tsx:42 `disabled:opacity-action-disabled`; select.tsx:204 `data-[disabled]:opacity-action-disabled`. No `forced-colors` handling in the unit.
- **Why:** Opacity-based disabled states can disappear under Windows High Contrast (forced-colors collapses opacity). Low-severity / system-wide, noting per the matrix.
- **Fix:** Verify the global forced-colors layer handles disabled controls; if not, add a `forced-colors:` fallback. Likely handled centrally — flag for synthesis, don't patch in-unit.

## Composability gaps
- **Clean on F1/F2/F4/F5/F6.** This is a faithful thin wrapper over the vendored Radix Select primitive: compound parts (`SelectTrigger`/`Content`/`Item`/`Group`/`Label`/`Separator`), `asChild` used correctly on `SelectPrimitive.Icon` (line 103) and `SelectPrimitive.Content` (line 154), controlled/uncontrolled both supported via Radix (`value`/`defaultValue`/`onValueChange`/`open`/`onOpenChange` — verified in test render, lines 33-38), correct `onValueChange` naming. No bespoke corner-prop, no re-rolled surface.
- **Minor (F-adjacent):** `SelectValue`/`SelectGroup` are re-exported as the raw primitive with zero styling — fine, but means there is no DS-styled affordance hook if one is later needed. Not a gap today.

## Motion gaps
- M3: entrance animation (scale 0.95→1 + fade) has no reduced-motion guard despite `withReducedMotion()` existing in the motion lib. (P1)
- M4: no exit animation — dropdown snaps closed; needs AnimatePresence/exit. (P1)
- M4: trigger default/outline variants have no hover/press feedback transition. (P2)
- M2: spring+tween mix on one transition is undocumented; confirm it matches the overlay family rhythm. (P2)
- M1/M5: clean. No bounce-by-default (snappy is a controlled spring, no overshoot config), no animating layout props (animates scale/opacity only).

## Polish plan (ordered steps to reach the finish bar)
1. **Reduced-motion (M3):** wrap the SelectContent transition in a `useReducedMotion()` check (or `withReducedMotion`) so scale collapses to instant/opacity-only. Mirror the Dialog/Popover implementation for consistency.
2. **Exit motion (M4):** introduce `AnimatePresence` + Radix `forceMount` so close eases out symmetrically with open; add `exit={{ opacity: 0, scale: 0.95 }}`.
3. **Trigger feedback (M4):** add `transition-colors duration-fast-01 ease-productive-standard` + a hover affordance to the default/outline trigger, matching SelectItem and the input family.
4. **Color parity (G3):** bring `success`/`warning` to the same property coverage as `error` (or document the intentional validation-only subset) and decide on `info`/`neutral`.
5. **Coverage (H):** add a `Sizes` story + size test; add focus-visible and forced-colors demonstration.
6. **Docs (J):** correct the FormField auto-consumption note in select.md.

## Clean (rubric dims that pass)
- **V1 accent rail:** none. **V2 double-edge:** clean — trigger variants pick edge OR (overlay) elevation; content uses `shadow-floating` with no competing border. **V3 gradient text:** none. **V4 framework palette:** none — all semantic tokens (`accent-9`, `surface-*`, `error-7`). **V5 emoji:** none. **V6 blob/glass/glow:** none. **V7 rounded-everything:** uses `rounded-control`/`rounded-overlay` tokens, single vocabulary. **V8 pill spam:** none.
- **V9–V15:** no hardcoded fonts, no decorative numbering, no eyebrow/all-caps defaults.
- **G1 surface:** correct — overlay content is `bg-surface-overlay` (line 162), an overlay per the layering rule, not a card on surface-1. **G2 tokens:** no raw px/hex/bare-shadow; uses `rounded-control`, `shadow-floating`, `duration-fast-01`, `ds-*` spacing throughout. **G5 soft-vs-outline:** N/A (Select trigger isn't a soft/outline button choice).
- **I types:** `forwardRef` + `displayName` on every part (mirrors Radix displayName), `VariantProps`-derived axes, `Omit<..., 'color'>` to avoid the HTML `color` clash, `SelectTriggerProps` exported, no `any`, correct element ref types via `React.ElementRef<typeof ...>`.
- **H (partial pass):** disabled (+`disabled:` styling and `does not open when disabled` test), error (+`aria-invalid`), focus-visible ring present (`focus-visible:ring-2 ring-accent-9 ring-offset-2`, line 42), keyboard open (Enter/Space tested), axe-clean test present. RTL chevron is a fixed down-chevron (acceptable — non-directional).
- **J docs (mostly):** prop table matches CVA; size-on-trigger gotcha documented and JSDoc'd; only the FormField note drifts (P3 above).
