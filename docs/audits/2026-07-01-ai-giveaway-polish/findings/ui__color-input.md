# ui/color-input — audit

**Finish score:** 2/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:1 P1:5 P2:5 P3:2

A capable, feature-rich color picker (undo/reset history, format switching, contrast-aware inline text). But it ships the single most recognizable AI palette tell as its default preset set and story default (indigo `#6366F1` + violet `#8B5CF6`), re-rolls a bespoke trigger surface/input control instead of composing the DS's own field/popover primitives, defaults all labels to all-caps, leans on bounce-by-default on every swatch, and exposes a controlled-only API with the non-canonical `onChange(string)` signature. Not a Card-bar component yet.

## Findings

### [P0][V4] Default presets are the raw Tailwind/AI palette, led by indigo
- **Category:** visual-tell
- **Evidence:** color-input.tsx:57-68 — `NAMED_PRESETS = [{ '#EF4444' Red }, … { '#8B5CF6' Violet }, … { '#6366F1' Indigo }]`; story default color-input.stories.tsx:31 `value: '#6366F1'`
- **Why:** `#6366F1` is indigo-500 and `#8B5CF6` is violet — the exact "AI default palette" the rubric hard-bans (V4), shipped as the component's out-of-the-box swatch row AND the first thing every Storybook viewer sees as the default value.
- **Fix:** These are raw hex literals by necessity (a color picker needs literal colors), but the *default set* and the *story default* should not telegraph the AI palette. Re-base the default presets on a designed, color-blind-distinguishable spectrum that doesn't open on indigo/violet, and change the Default/Inline/Disabled story `value` off `#6366F1` (use a brand-adjacent or neutral hex like `#D33163`, which the test already uses). The presets being literal hex is fine; *choosing indigo+violet as the shipped defaults* is the tell.

### [P1][F6] Controlled-only API; non-canonical `onChange(value: string)` instead of `onValueChange` + `defaultValue`
- **Category:** composability / types
- **Evidence:** color-input.tsx:90-93 `value?: string` + `onChange?: (value: string) => void`; :183-184 `const [internalColor, setInternalColor] = useState(value); useEffect(() => setInternalColor(value), [value])`
- **Why:** F6 — there is no `defaultValue` for true uncontrolled use, and the change handler is named `onChange` firing a `string` (not a DOM event) for non-input semantics; the rubric's canonical name is `onValueChange`. The `value`-into-`useState`+`useEffect` mirror is the classic anti-pattern that silently overwrites local edits on any parent re-render. `value` defaults to `'#000000'` so the component is never truly uncontrolled.
- **Fix:** Add `defaultValue`, rename the callback `onValueChange` (keep `onChange` as a deprecated alias for one minor), and use a proper controlled/uncontrolled hook (`useControllableState`) instead of the `useEffect` mirror.

### [P1][F5] Re-rolls a bespoke text input instead of composing the DS Input/field primitive
- **Category:** composability / drift
- **Evidence:** color-input.tsx:144-157 — raw `<input … className="h-ds-xs-plus w-full rounded-control-inner border border-surface-border bg-surface-overlay … focus:border-accent-7 focus:outline-hidden focus:ring-1 focus:ring-accent-9" />`
- **Why:** F5 — the hex/RGB/HSL fields hand-roll border, height, focus-ring and disabled styling rather than composing the design system's `Input` (or equivalent control), so field styling will drift from the rest of the system the moment Input changes. StatCard's whole lesson was "compose the primitive, don't re-roll the surface."
- **Fix:** Render the fields through the DS `Input` (small size) so focus ring, disabled, and border tokens come from one source. If Input can't host the prefix `#`, add a slot to Input rather than re-rolling here.

### [P1][V14] All-caps `uppercase tracking-wider` as the default label/switcher treatment
- **Category:** visual-tell
- **Evidence:** color-input.tsx:137 field label `uppercase tracking-wider`; :381 format-switcher buttons `uppercase tracking-wider`
- **Why:** V14 — all-caps + letter-spacing is reached for as the default emphasis on every micro-label (HEX/RGB/HSL, R/G/B, H/S/L). The rubric calls for consistent type hierarchy with all-caps used sparingly, not as the reflex label style.
- **Fix:** Drop `uppercase tracking-wider`; use the DS small/caption type token at normal case. Single-letter channel labels (R/G/B) read fine as-is; format names can be normal-case Title or lower.

### [P1][M1] Bounce-by-default on every preset swatch on mount + hover
- **Category:** motion
- **Evidence:** color-input.tsx:470-479 — each swatch `initial={{ opacity:0, scale:0.8 }} animate={{ scale: isSelected ? 1.15 : 1 }} whileHover={{ scale: 1.1 }} transition={{ ...springs.bouncy, delay: i*0.02 }}`
- **Why:** M1 — `springs.bouncy` (damping 15, overshoot) applied to a 10-swatch grid means every swatch springs/overshoots in on popover open with a stagger. Overshoot should mean something (a celebration/flash), not be the default entrance for a static palette grid. Reads as decorative AI motion.
- **Fix:** Use `springs.snappy` (no overshoot) for swatch mount; reserve `bouncy` for genuine feedback. Keep the selected-state scale, drop the per-swatch entrance overshoot or gate the stagger behind reduced-motion.

### [P1][G2] Hardcoded raw values instead of DS tokens (spacing, size, shadow, magic numbers)
- **Category:** drift
- **Evidence:** color-input.tsx:344 `pl-6` (raw, not `pl-ds-*`); :309 `boxShadow: '0 4px 12px rgba(0,0,0,0.12)'` (raw shadow, not `shadow-floating`/token); :356 `w-[272px]` arbitrary px; :367 `style={{ height: 160 }}`; :481/:507 `h-6 w-6`/`h-4 w-4`; :80 luminance threshold `0.4`
- **Why:** G2 — multiple raw px/shadow/rgba values bypass the token system. `pl-6` is a bare Tailwind spacing utility (the repo namespaces spacing as `ds-*` precisely to avoid this), the hover boxShadow is a hand-rolled shadow rather than a surface/elevation token, and the popover width is an arbitrary `w-[272px]`.
- **Fix:** Replace `pl-6` with a `pl-ds-*` step, the raw `boxShadow` with a DS elevation token (the inline variant should lift via `shadow-raised-hover` not a hand-tuned rgba), and either tokenize the `272px`/`160` picker dimensions or comment them as a deliberate fixed picker size.

### [P2][M3] No reduced-motion handling for the always-on inline-variant property animations
- **Category:** motion
- **Evidence:** color-input.tsx:305-311 inline trigger `animate={{ backgroundColor, color }}` + `whileHover={{ y:-1, boxShadow }}`; :331-337 default trigger animates a `linear-gradient` background; component never reads `useReducedMotion`/`useMotion`
- **Why:** M3 — the DS exposes `MotionProvider`/`MotionConfig reducedMotion="user"`, but FM's reduced-motion only auto-suppresses transform/opacity; the continuously-animated `backgroundColor`/`background`/`boxShadow` here are not transform/opacity and won't be quieted. There's no guard, and unlike Card the component opts into property animation. (Soft P2 because the family relies on the global provider; flagged because this component animates non-exempt props.)
- **Fix:** Consume `useMotion().reducedMotion` (or `useReducedMotion`) and snap `backgroundColor`/`background`/`boxShadow` to instant when reduced.

### [P2][H] Missing state coverage — no error/invalid, read-only, required, RTL, forced-colors, or focus-visible story/test
- **Category:** state-coverage / a11y
- **Evidence:** color-input.tsx focus styling uses `focus:` not `focus-visible:` (:153, :302, :322); tests color-input.test.tsx cover render/open/format/preset/disabled/inline + axe only; no invalid/required/forced-colors/RTL story
- **Why:** H — focus rings fire on mouse focus (`focus:` not `:focus-visible`), and there's no error/invalid surface (a color input can receive a malformed hex — the field silently reverts on blur with no `aria-invalid` or message). No forced-colors or RTL coverage in stories/tests.
- **Fix:** Switch `focus:` → `focus-visible:` on the triggers and fields; add an `aria-invalid`/error affordance when a typed hex can't parse; add forced-colors + RTL stories.

### [P2][V2] Double-edge on the default trigger: border + the masked overlay reads as a second edge
- **Category:** visual-tell
- **Evidence:** color-input.tsx:321 `border border-surface-border-strong` on the trigger which also paints a gradient fill + masked `bg-surface-overlay/60` overlay (:339-342)
- **Why:** V2-adjacent — the strong border plus the gradient-into-mask creates a layered edge treatment on a small control. Minor, but it's the kind of "edge + fill + mask" stacking the system tries to avoid (pick edge OR fill).
- **Fix:** Decide one: a clean bordered swatch trigger, or an elevation/fill trigger. The mask trick is clever but adds a third visual layer to a tiny control.

### [P2][H] Inline-variant hover lift has no keyboard/focus equivalent and relies on color animation for state
- **Category:** state-coverage
- **Evidence:** color-input.tsx:309 `whileHover={{ y:-1, boxShadow }}` on the inline button — no matching focus-visible elevation
- **Why:** H — pointer users get a lift; keyboard users get only the ring. Minor parity gap.
- **Fix:** Mirror the lift (or a clear ring) on `:focus-visible`.

### [P3][J] No per-component doc and no `defaultValue`/format docs parity
- **Category:** docs
- **Evidence:** `packages/core/docs/components/**/color-input.md` — not found (Glob returned nothing)
- **Why:** J — there is no per-component doc page; prop semantics (controlled-only, `onChange` string signature, preset shapes) live only in JSDoc. Lower priority but part of the Card bar.
- **Fix:** Add the component doc with an accurate prop table once the API (F6) is settled.

### [P3][V7] Mixed radius vocabulary on nested elements
- **Category:** visual-tell
- **Evidence:** color-input.tsx:356 popover `rounded-overlay-lg`; :301 inline trigger `rounded-control`; :481 swatches `rounded-control-inner`; :507 original-color preview `rounded-pill`
- **Why:** V7 (minor) — four different radius tokens in one small surface. They're all DS tokens (so not a hard tell), but the swatch grid mixing `rounded-control-inner` while the preview dot is `rounded-pill` is slightly inconsistent for two same-size color chips.
- **Fix:** Make the swatch and the original-color preview share one radius; this is a nit, not a violation.

## Composability gaps
- **Controlled-only, no `defaultValue`** (F6) — can't be used uncontrolled; `value` mirrored into state via `useEffect` will clobber local edits on parent re-render.
- **`onChange(string)` not `onValueChange`** (F6/G3) — non-canonical callback name + non-event payload for non-input semantics.
- **Re-rolls the text input** (F5) — hand-rolled `<input>` styling instead of composing the DS `Input`; focus-ring/disabled/border will drift.
- **No `asChild` on the trigger** (F2) — consumers can't swap the trigger element (e.g. render the color into their own button); the two trigger looks are baked as a `variant` enum instead of a composable slot.
- **Format switcher / footer actions hand-rolled** — Undo/Reset and the format pills are raw `<button>`s rather than DS `Button`/`ToggleGroup`, so they won't inherit button states/motion.

## Motion gaps
- **Bounce-by-default on swatch grid** (M1) — `springs.bouncy` + stagger as the entrance for a static 10-swatch palette; overshoot should be reserved for feedback.
- **No reduced-motion guard for property animations** (M3) — animated `backgroundColor`/`background`/`boxShadow` on the triggers aren't transform/opacity, so the global `MotionConfig reducedMotion="user"` won't suppress them; component does not read `useMotion`.
- **Hand-rolled boxShadow hover** (M1/G2) — `whileHover` lifts with a raw `0 4px 12px rgba(0,0,0,0.12)` instead of an elevation token.
- **Selected-swatch scale `1.15`** is a raw magic value rather than a motion/scale token; fine functionally but undocumented.

## Polish plan (ordered steps to reach the finish bar)
1. **Kill the AI palette default (P0).** Re-base default `NAMED_PRESETS` off a designed, color-blind-safe spectrum that doesn't lead with indigo/violet; change the Default/Inline/Disabled story `value` off `#6366F1`.
2. **Fix the API (F6).** Add `defaultValue`, adopt `useControllableState`, rename `onChange`→`onValueChange` (deprecated alias one minor), drop the `useEffect` value mirror.
3. **Compose primitives (F5/F2).** Render fields via DS `Input`; render Undo/Reset/format pills via DS `Button`/`ToggleGroup`; add `asChild` so the trigger can be polymorphed.
4. **Detone visuals.** Drop `uppercase tracking-wider` labels (V14); collapse the trigger's edge+fill+mask stack to one treatment (V2); unify swatch/preview radius (V7).
5. **Tokenize raw values (G2).** `pl-6`→`pl-ds-*`, raw boxShadow→`shadow-raised-hover`, comment or tokenize `272px`/`160px` picker dims.
6. **Motion discipline (M1/M3).** Swatch entrance → `springs.snappy`; read `useMotion().reducedMotion` and snap color/shadow animations to instant when reduced.
7. **State coverage (H).** `focus:`→`focus-visible:` everywhere; add `aria-invalid`/error affordance for unparseable hex; add forced-colors + RTL stories; add focus-visible lift parity on inline variant.
8. **Docs (J).** Add the per-component doc with an accurate prop table once API settles.

## Clean (rubric dims that pass)
- **V1 accent rail** — none. No colored left/top stripe on any surface.
- **V3 gradient text** — none; hex value is solid `text-surface-fg`.
- **V5 emoji** — none in source/test/story.
- **V6 blob/glass/glow** — the trigger gradient is a *legitimate color-swatch demo* (it renders the selected color), explicitly exempt by the rubric; no decorative blobs or glass surfaces.
- **G1 surface** — overlay correctly uses `bg-surface-overlay` (popover is an overlay → surface-1 family is correct); not a card-on-surface-1 violation.
- **E1–E8 verbal** — JSDoc/story prose is clean: no em-dash tic abuse, no AI vocabulary, no contrastive negation, no chatbot artifacts. (The "feel free to combine props creatively!" closer lives in Card/StatCard, not here.)
- **forwardRef + displayName** — present and correct (color-input.tsx:165, :542).
- **a11y basics** — real `<button>` triggers, `aria-label` on triggers/swatches, `role="dialog"` + `aria-label` on popover, `htmlFor`/`id` wiring on fields, axe test present. Color math (luminance contrast for inline text) is genuinely thoughtful.
- **Types** — no `any` in the public surface; `ColorFormat`/preset shapes are typed (though `value: string` for a hex is acceptably loose for a color value).
