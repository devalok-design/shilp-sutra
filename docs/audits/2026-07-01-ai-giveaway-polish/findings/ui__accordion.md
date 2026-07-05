# ui/accordion — audit
**Finish score:** 3/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:2 P2:4 P3:2

Accordion is a thin, mostly-clean wrapper over the vendored Radix primitive. No hard AI visual tells (no accent rail, no gradient text, no emoji, no indigo). It composes the primitive correctly and uses our tokens throughout. The gaps are finish-level: a dead/no-op Framer Motion layer that the doc actively misdescribes, no styling vocabulary (no `variant`/`size`/CVA — every other layout primitive has one), height-prop animation with no transform alternative, and no story/test coverage for the motion, RTL, forced-colors, or chevron-rotation reduced-motion states.

## Findings

### [P1][M4/motion] AccordionContent's Framer Motion wrapper is a no-op
- **Category:** motion
- **Evidence:** accordion.tsx:111-115 — `<motion.div initial={false} animate={{ opacity: 1 }} transition={tweens.fade}>`
- **Why:** `initial={false}` makes Framer Motion mount at the `animate` value, and `opacity` is hardcoded to `1` and never changes — so the transition never fires. It is a dead motion layer: it pulls in `framer-motion` + `tweens`, adds a wrapper `<div>` to every open panel, and produces zero visual effect. The only real reveal animation is the CSS `accordion-down`/`-up` height keyframe on the parent.
- **Fix:** Either delete the `motion.div` entirely (let the CSS height keyframe own the reveal — simplest, removes the framer-motion import) OR make it real: `initial={{ opacity: 0 }} animate={{ opacity: 1 }}` so content fades in as it expands. Don't ship a wrapper that does nothing.

### [P1][G3/vocabulary] No variant / size / CVA — the only layout primitive with zero styling axes
- **Category:** vocabulary
- **Evidence:** accordion.tsx:57-120 — no `cva(...)`, no `VariantProps`; trigger padding `py-ds-05`, content `pb-ds-05 pt-ds-02`, separator `border-b border-surface-border` are all hardcoded one-offs.
- **Why:** Card/StatCard expose `variant`/`size`/`color` via CVA so consumers stay on the vocabulary; Accordion forces a single hardcoded density and a single bottom-border separator style. A consumer who wants a compact accordion or a card-style/boxed accordion must override with `className`, which is exactly the drift the token system exists to prevent. This is the biggest distance from the Card bar.
- **Fix:** Add a `size` axis (`sm`/`md`/`lg`) driving trigger/content padding via CVA + a size context (mirror Card's `CardSizeContext`), and consider a `variant` axis (`bordered` rows vs `separated`/`contained`). At minimum extract the current values into a CVA so the surface is intentional and documented.

### [P2][M5/motion] Animates the `height` layout prop
- **Category:** motion
- **Evidence:** animations.css:55-63 — `@keyframes accordion-down { from { height: 0 } to { height: var(--radix-accordion-content-height) } }`; consumed at accordion.tsx:108 `data-[state=open]:animate-accordion-down`.
- **Why:** Rubric M5 flags animating layout props (height/width) over transform/opacity — they trigger layout/paint each frame. This is the *idiomatic* Radix accordion pattern (the content height is unknown until runtime, so transform can't substitute), so it is a justified tradeoff, not a reflex — but it is the one layout-prop animation in the unit and should be acknowledged as deliberate. Reduced-motion is globally neutralized (semantic.css:675 zeroes `animation-duration`), so the cost is bounded.
- **Fix:** Acceptable as-is; document it as the deliberate Radix-coupled exception (the keyframe comment at animations.css:53 already does). No change required beyond noting it's intentional.

### [P2][H/state-coverage] No story or test for the reveal motion, reduced-motion, RTL, or forced-colors
- **Category:** state-coverage
- **Evidence:** accordion.stories.tsx:1-127 (Single/Multiple/DefaultOpen/ChevronLeft only); accordion.test.tsx covers open/collapse/chevron order/rotation but no motion, RTL, or forced-colors assertion.
- **Why:** The Card bar requires applicable states demonstrated in stories or tests. Accordion has interactive hover (`hover:bg-surface-raised`), open-state bg, a rotating chevron, and a height animation — none of the motion/contrast/RTL states are shown. Forced-colors matters here because the only separator between items is a `border-b` (H: edges can vanish in forced-colors).
- **Fix:** Add a reduced-motion story (or a test asserting the keyframe is gated), a forced-colors visual story, and an RTL story confirming `chevronPosition` + chevron rotation read correctly mirrored.

### [P2][J/docs] Doc claims "Framer Motion handles the fade" — it doesn't
- **Category:** docs
- **Evidence:** accordion.md:38 — "Framer Motion handles the fade. Don't wrap AccordionContent children in additional motion components — doubles the animation."
- **Why:** Direct drift from source: the `motion.div` (accordion.tsx:111) does not produce a fade (see M4 finding). The doc instructs consumers to avoid "doubling" an animation that isn't actually happening. Misleads anyone reasoning about the motion model.
- **Fix:** After resolving M4, update accordion.md:38 to match reality (either "the CSS height keyframe handles the reveal; there is no JS fade" or, if you keep a real fade, describe it accurately).

### [P2][F4/composability] No size/density context for compound parts; trigger & content carry independent hardcoded padding
- **Category:** composability
- **Evidence:** accordion.tsx:88 `py-ds-05` (trigger) vs accordion.tsx:116 `pb-ds-05 pt-ds-02` (content) — two parts, two independently-hardcoded paddings, no shared source.
- **Why:** Card solved exactly this with `CardSizeContext` + `slotPxClasses` so all slots stay in lockstep and can't drift. Accordion's parts each hardcode their own spacing, so changing density means editing two places and they can silently diverge.
- **Fix:** Introduce an `AccordionSizeContext` (set on root) read by `AccordionTrigger`/`AccordionContent`, mirroring the Card pattern. Pairs with the CVA size axis above.

### [P3][G4/vocabulary] Separator hardcoded as `border-b` per item rather than a configurable model
- **Category:** vocabulary
- **Evidence:** accordion.tsx:65 — `'border-b border-surface-border'` on every `AccordionItem`.
- **Why:** Hardcodes one separator style (bottom rule on each row, including a trailing border under the last item). No way to get a borderless/contained accordion without `className` override. Minor — but it's a baked layout decision that a `variant` would own.
- **Fix:** Fold into the `variant` axis when CVA is added; consider dropping the trailing border on `:last-child` for a cleaner edge.

### [P3][docs] Doc + JSDoc minor staleness against source
- **Category:** docs
- **Evidence:** accordion.md:8-12 prop table omits `chevronPosition` from the prop list proper (it's only mentioned inline at line 17); JSDoc on the root (accordion.tsx:12-56) documents parts but the `chevronPosition` default lives only in the signature.
- **Why:** Minor parity gap; source is authoritative and correct, doc is just thin.
- **Fix:** Add `chevronPosition` to the AccordionTrigger prop section in the doc with its `"right"` default.

## Composability gaps
- **No CVA / variant / size axes** — unlike Card, StatCard, and the rest of the layout family, Accordion exposes no styling vocabulary; density and separator style are hardcoded and only overridable via `className`. (G3/F4)
- **No shared size context across compound parts** — trigger and content hardcode padding independently, the drift risk Card's `CardSizeContext` eliminates. (F4/F5)
- **Dead motion layer** — the `motion.div` wrapper adds structure (and a framer-motion dependency on this module) for no behavior. (M4)
- Positives: correctly composes the Radix primitive (F-clean), controlled/uncontrolled both supported via the primitive's `value`/`defaultValue`/`onValueChange` discriminated union (F6-clean), `chevronPosition` is a legitimate layout prop (a slot would be overkill for a single chevron).

## Motion gaps
- **No-op fade** (accordion.tsx:111-115): `initial={false}` + constant `opacity:1` ⇒ the transition never runs. Either make it a real `0→1` fade on reveal or remove it.
- **Height-prop animation** (animations.css:55-63): animates `height`, not transform — justified by Radix's runtime-height pattern, but it is the one M5 case in the unit; mark as deliberate.
- **Reduced-motion: covered globally** (semantic.css:675 zeroes animation/transition durations) — no per-component guard needed, but no story demonstrates it.
- **Chevron rotation** (accordion.tsx:80): `transition-transform duration-moderate-02 ease-productive-standard` — clean, transform-based, on a real token. Good.
- **Trigger hover/open feedback** (accordion.tsx:88): `hover:bg-surface-raised` / `data-[state=open]:bg-surface-raised` present — feedback motion exists. (M4-clean for the trigger.)

## Polish plan (ordered steps to reach the finish bar)
1. **Resolve the dead motion layer (M4).** Decide: delete the `motion.div` (let the CSS height keyframe own the reveal, drop the framer-motion import from this module) or make it a real `initial={{opacity:0}}→animate={{opacity:1}}` fade. Then fix accordion.md:38 to describe the actual motion model (J).
2. **Add a CVA with a `size` axis** (`sm`/`md`/`lg`) driving trigger + content padding, plus an `AccordionSizeContext` so the compound parts read one source (G3/F4/F5) — mirror Card's `CardSizeContext`/`slotPxClasses`.
3. **Add a `variant` axis** for the separator/container model (bordered rows vs separated vs contained), folding in the hardcoded `border-b` and dropping the trailing-item border (G4/G3).
4. **Backfill state stories/tests:** reduced-motion, forced-colors (separator visibility), and RTL (chevron mirror + rotation) (H).
5. **Doc parity:** add `chevronPosition` to the prop table with its default (J).

## Clean (rubric dims that pass)
- **V1 accent rail** — none. No colored left/top stripe.
- **V2 double edge** — items use a single `border-b`, no border+shadow doubling.
- **V3 gradient text** — none.
- **V4 framework palette** — uses `surface-*`, `accent-9`, `surface-fg-muted` semantic tokens; no indigo/violet/slate.
- **V5 emoji** — none in source, story, or doc.
- **V6 blob/glass/glow, V7 rounded-everything, V8 pill spam** — none.
- **V9 safe-face font** — `text-ds-md` token, no hardcoded Inter/Geist.
- **E1–E8 verbal tells** — JSTDoc/doc copy is direct; no em-dash tic as connector, no AI vocabulary, no contrastive negation, no over-structuring.
- **G1 surface drift** — trigger hover/open lift to `surface-raised` is the correct "row lifts on the page" pattern; not a misplaced card surface.
- **G2 re-rolled tokens** — spacing (`py-ds-05`, `pb-ds-05`, `pt-ds-02`), radius (`rounded-control`), colors, durations (`duration-moderate-02`) all on tokens; no bare `shadow`/`rounded`/hex/px.
- **H a11y baseline** — built on Radix (correct `button` semantics, keyboard nav, `data-state`); axe-clean test present; `focus-visible:ring-2 focus-visible:ring-accent-9` replacement for the removed outline.
- **I types** — proper `forwardRef` + `displayName` on all parts; `ElementRef`/`ComponentPropsWithoutRef` typing; types exported; no `any`; `chevronPosition` is a string-literal union, not stringly-typed.
- **F6 controlled/uncontrolled** — inherited from Radix root; both `value` and `defaultValue` + `onValueChange` supported.
