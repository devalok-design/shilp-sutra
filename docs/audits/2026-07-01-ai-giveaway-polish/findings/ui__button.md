# ui/button — audit
**Finish score:** 4/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:3 P2:5 P3:2

This is a heavily-engineered, intentional component — no hard AI tells. It uses our semantic tokens throughout (no raw hex/indigo, no accent rail, no gradient text, no glassmorphism), has real state machines, asChild, ButtonGroup context, reduced-motion guards on the width FLIP and the marching-ants. The gaps are polish-bar items: a CSS-driven press animation that ignores reduced-motion, icon slots that are bespoke props instead of composable, a doc/source drift, and the always-on layout-width effect (an `animating-layout-props` pattern) running on every render.

## Findings

### [P1][M3] `active:` press + hover transitions not gated by reduced-motion
- **Category:** motion
- **Evidence:** button.tsx:487 — `!loading && !isAsyncFeedback && 'active:scale-[0.95] active:brightness-[0.92] active:saturate-[1.1] active:duration-[0ms]'`; lines 485–486 add `transition-[...transform...]` + `hover:` easing. These are static CVA/`cn` class strings — `prefersReduced` (read at line 292) gates the JS width effect and the wrapper width transition (303, 522) but is never applied to the scale/brightness press feedback or the hover transform.
- **Why:** A user with `prefers-reduced-motion: reduce` still gets the transform-scale + brightness/saturate jump on press; the rest of the component respects the setting, so this is an inconsistency, not a deliberate choice.
- **Fix:** Gate the `active:scale`/`active:brightness`/`active:saturate` and the transform portion of the transition behind `!prefersReduced` (e.g. `!prefersReduced && 'active:scale-[0.95] ...'`), or move to a `motion`-driven `whileTap` that MotionConfig's reduced-motion can neutralize. Keep color/opacity feedback (that's fine reduced).

### [P1][F1] `startIcon` / `endIcon` are bespoke corner props, not composable slots
- **Category:** composability
- **Evidence:** button.tsx:213–215 — `startIcon?: IconInput` / `endIcon?: IconInput`; rendered via `renderStartSlot()`/`renderEndSlot()` (385–419) into fixed leading/trailing positions.
- **Why:** This is the F1 pattern (content injected into a fixed region via a prop instead of through children). For Button it is arguably the established platform convention (MUI/Radix do the same) and the inset math depends on knowing start vs end, so it is a *soft* F1 — but the rubric asks us to flag `icon`-style props that could be slots. The cost: consumers can't put two leading icons, an avatar, or a custom node between icon and label without dropping to `children`.
- **Fix:** Keep `startIcon`/`endIcon` for the common case (the inset/dim logic earns them), but document that arbitrary leading/trailing content goes through `children`. Lower priority than the rest; flagged for completeness, not a required change.

### [P1][J] Doc/source drift — `button.md` props omit `weight` default, `processingColor` neutral, and stale "Server-safe / category" only
- **Category:** docs
- **Evidence:** button.md:13–14 types `startIcon`/`endIcon` as `ReactElement (...) | null` but source type is `IconInput` (button.tsx:213, which is wider — `ReactElement | ComponentType | null | undefined`). Per the HARD RULE the **source is authoritative**; the doc narrows the documented type vs the real one. Also the doc Props block (7–24) never lists `weight` in the type table though it's a real CVA axis (button.tsx:39–42) — it only appears under Defaults (line 26).
- **Why:** llms-full/make-kit/doc parity is a publish concern; an AI agent reading the doc would believe `startIcon` rejects a component reference, when `IconInput` accepts one.
- **Fix:** In button.md change `startIcon`/`endIcon` to `IconInput (ReactElement | ComponentType | null)` and add a `weight: "semibold" | "normal"` row to the Props block.

### [P2][M5] Always-on layout-width measurement runs every render (animating a layout prop)
- **Category:** motion
- **Evidence:** button.tsx:300–314 — effect with no dep array (`}) // run on every render`) reads `btn.offsetWidth` and writes `wrapper.style.width = '${w}px'`; the wrapper animates `transition: 'width 0.2s ...'` (522).
- **Why:** Animating `width` is the M5 anti-pattern (layout prop, not transform/opacity) and forces a measured reflow on every commit. It IS reduced-motion-gated (303, 522) and is a deliberate "smooth width on label change" feature, so not a tell — but it's a polish-bar cost: layout thrash + the documented "smooth width transition" is the kind of motion the bar wants on transform, not width.
- **Fix:** Acceptable as-is given the guard, but consider `layout` prop on the `motion.button` (FLIP via transform) instead of manual `offsetWidth` → `style.width`, and scope the effect to `[children, resolvedSize, loading]` rather than every render.

### [P2][H] Disabled relies solely on `opacity` + `saturate` — no forced-colors fallback shown/tested
- **Category:** state-coverage / a11y
- **Evidence:** button.tsx:22 base — `disabled:opacity-action-disabled ... disabled:saturate-[0.3]`. In forced-colors mode opacity/saturate are ignored by the OS, so the disabled affordance can vanish. No `forced-colors:` rule and no test/story covers forced-colors or the disabled appearance under it.
- **Why:** The rubric's state matrix requires forced-colors handling for interactive components; opacity-only disabled is a known forced-colors gap.
- **Fix:** Add a `forced-colors:disabled:text-[GrayText]` (or equivalent) rule and a forced-colors story/visual check.

### [P2][H] Focus ring uses `ring-offset-2` with no explicit offset color — risks blending on tinted surfaces
- **Category:** a11y
- **Evidence:** button.tsx:22 — `focus-visible:ring-2 focus-visible:ring-accent-9 focus-visible:ring-offset-2` with no `ring-offset-*` color token; offset defaults to the theme background, which on a colored/raised card may not match.
- **Why:** Focus-visible ring is present (good) but the 2px offset gap renders in the default ring-offset color; on non-page surfaces the halo can look detached. Minor.
- **Fix:** Bind `ring-offset-surface-raised` (or the contextual surface) where Button commonly sits, or document the offset assumption.

### [P2][G3] `weight` is a non-canonical variant axis
- **Category:** vocabulary
- **Evidence:** button.tsx:39–42 — `weight: { semibold, normal }` as a CVA axis. The canonical taxonomy in the rubric (G3) is `variant`/`size`/`color`/`shape`; `weight` is an extra axis.
- **Why:** Not a drift *tell* (it's a real, documented, deliberate axis used by popover/ghost menu items), but it's an axis outside the canonical four, worth noting for family consistency — no sibling (IconButton/SplitButton) is confirmed to share it.
- **Fix:** Keep, but verify `weight` is consistently named across the button family or fold into `size`/usage guidance. Low priority.

### [P2][I] `asChild` Slot path casts props through `as React.ComponentPropsWithRef<typeof Slot>`
- **Category:** types
- **Evidence:** button.tsx:361–373 — `const slotProps = {...} as React.ComponentPropsWithRef<typeof Slot>` to attach `disabled`/`aria-busy` that SlotProps doesn't type.
- **Why:** A deliberate, commented cast (not an `any`), so low severity — but it's a typed escape hatch on the public asChild path; if a consumer passes `asChild` to a non-`<button>` the `disabled` attr is meaningless on e.g. `<a>`.
- **Fix:** Acceptable; optionally narrow by only forwarding `disabled` when the slotted element is a button, or document that `disabled` on asChild assumes a button-like child.

### [P3][V8] Stories lean on pill-as-status-badge ("In Progress", "Approved", "Draft", "High Priority")
- **Category:** visual-tell (stories only)
- **Evidence:** button.stories.tsx:715–759 (`PillButtons`), 905–942 (`RealWorldPatterns` "Status Pills"), 1147+ — soft pill buttons used as status chips ("In Progress", "Unassigned", "High").
- **Why:** Borderline V8 (pill-badge spam) — but these are *buttons demonstrating the pill shape in a real interaction context*, not decorative "New/Beta/AI-powered" pills, so it's defensible demo content, not a shipped default. Flagged only because the volume of status-pill examples reads slightly AI-pattern.
- **Fix:** None required; optionally show one status-pill example instead of repeating the set three times.

### [P3][H] No explicit RTL / directional-icon-mirror coverage for `endIcon` arrow
- **Category:** state-coverage
- **Evidence:** stories use `IconArrowRight` as `endIcon` (button.stories.tsx:301–307, 491) with no RTL story; in RTL an arrow-right "Continue" affordance should mirror.
- **Why:** Rubric state matrix lists RTL directional mirroring; Button doesn't mirror directional icons and no story demonstrates RTL.
- **Fix:** Add an RTL story; icon mirroring is the consumer's icon concern, but a doc note + story would close the matrix item.

## Composability gaps
- `startIcon`/`endIcon` are bespoke leading/trailing props (F1) — fine as the common-case convention, but arbitrary non-icon leading/trailing content must fall back to `children`. No "icon slot via children" escape documented.
- `asChild` is present and correct (good — F2 satisfied) and ButtonGroup context consumption is a clean compound pattern. No F5 drift: Button is itself a base primitive, doesn't re-roll a higher one.
- `onClickAsync` is a controlled-only convenience (no uncontrolled/controlled split needed — it's fire-and-forget), so no F6 gap; `loading` is a plain controlled prop. Fine.

## Motion gaps
- **M3 (P1):** `active:scale-[0.95]` + `active:brightness/saturate` press feedback and the `hover:` transform easing are static classes not gated by `prefersReduced`, while the rest of the component (width FLIP, ants) is gated. Inconsistent reduced-motion respect.
- **M5 (P2):** Manual `offsetWidth → style.width` width animation (deps-less effect, every render) animates a layout prop instead of transform. Reduced-motion-gated and deliberate, but layout-thrashy; prefer `layout` prop / transform.
- **Clean:** ProcessingOverlay marching-ants fully respects `prefersReduced` (button-processing.tsx:140–145), uses our `durations`/`springs` tokens, no bounce-by-default on the button itself (the StatCard-style `springs.bouncy` is not used here). Async feedback uses `Icon animate="draw"` — intentional, on-brand.

## Polish plan (ordered steps to reach the finish bar)
1. **M3:** Gate `active:scale`/`active:brightness`/`active:saturate` and the hover transform behind `!prefersReduced` (or convert press to a `whileTap` MotionConfig can neutralize). This is the one real reduced-motion inconsistency.
2. **J:** Fix button.md — widen `startIcon`/`endIcon` to `IconInput`, add the `weight` row to the Props block. Keep doc ↔ source in lockstep.
3. **H (forced-colors):** Add a `forced-colors:` disabled affordance (text/border) so disabled survives when opacity/saturate are dropped; add a forced-colors story.
4. **M5:** Replace the deps-less `offsetWidth`/`style.width` effect with a `layout`-prop FLIP (transform) and scope deps to `[children, resolvedSize, loading]`.
5. **H (focus offset):** Bind `ring-offset-*` to the contextual surface or document the assumption.
6. **F1 / RTL:** Document children-fallback for arbitrary leading/trailing content; add an RTL story for directional `endIcon`.

## Clean (rubric dims that pass)
- **V1 accent rail:** none. No `border-l-4`/colored stripe; `outline` variant is a full border, semantic — legitimate edge.
- **V2 double-edge:** avoided by design — solid uses shadow, outline uses border; never both (mirrors Card's make-kit rule #6).
- **V3 gradient text / V4 framework palette / V6 blob-glass-glow:** none. All colors are `accent-*`/`error-*`/semantic steps; no indigo/violet/slate, no `bg-clip-text`, no `backdrop-blur`. Solid hover shadows are brand-tinted tokens (`shadow-brand`/`shadow-error`), deliberate.
- **V5 emoji icons:** none — lucide/tabler via Icon API throughout.
- **V7 rounded-everything:** uses `rounded-control` token + `rounded-pill` only for explicit pill shape. One radius vocabulary.
- **G2 re-rolled tokens:** spacing/radius/text all `-ds-*`; the few raw values (`py-[3px]`, `gap-2.5`, `active:scale-[0.95]`, icon insets `-ml-1.5`) are micro-tuning of compact heights / press scale / optical icon alignment — sub-token-grid adjustments, not palette/shadow re-rolls. Acceptable.
- **G5 soft-vs-outline:** Button correctly offers `soft` and the doc + JSDoc push soft as the secondary default (button.md:44, 47). Default `variant` is `solid` (correct for the primary action component).
- **Types (I):** `forwardRef` + `displayName` present; `Omit<...,'color'>` resolves the CVA conflict; `ButtonProps` exported; no `any` in the public surface (the one cast is the typed Slot escape hatch, commented).
- **H state coverage:** default/hover/focus-visible/pressed/disabled(`disabled` attr + `aria-disabled` for processing)/loading(`aria-busy` + spinner `role=status`)/async-success/async-error all handled and tested (button.test.tsx) and storied (AllVariants, AllFeatures, Async*, Processing*). Touch targets meet 24px+ (heights from `--ds-*` size tokens; v0.3.0 fixed WCAG 2.5.8).
- **Tests + stories:** `describeConformance` + 20+ unit tests; exhaustive stories incl. variant×color grid, processing, async, grain. Publish-gate-clean.
