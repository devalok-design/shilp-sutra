# ui/icon — audit
**Finish score:** 4/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:2 P2:3 P3:3

Icon is a leaf primitive (context-aware wrapper around a Tabler SVG component). It has no surface, so most visual tells (V1 accent rail, V2 double-edge, V6 blob/glass, V7 rounded-everything, surface drift) are N/A. It is genuinely well-built: real icon set (not emoji), reduced-motion respected, a11y label→`role="img"`/`<title>` vs decorative `aria-hidden`, conformance test, 10 stories, accurate doc. The gaps are all about the **motion system not flowing through the animation presets** and a few type/vocab nits.

## Findings

### [P1][M2] Animation presets re-roll raw durations/easings instead of the motion token scale
- **Category:** motion / drift
- **Evidence:** icon.tsx:30-43 — `spin: { transition: { duration: 1, repeat: Infinity, ease: 'linear' } }`, `pulse: { duration: 2, ease: 'easeInOut' }`, `bounce: { duration: 1.5, ease: 'easeInOut' }`
- **Why:** The repo has a single source of truth for motion (`lib/motion.ts` `durations`/`springs`/`tweens`, mirroring `--duration-*` CSS tokens). These three presets bypass it with hand-typed seconds and string easings — exactly the "uniform/robotic timing, numbers not from the scale" tell, and a drift risk if the scale changes.
- **Fix:** Pull durations from `durations` (e.g. spin loop ≈ `durations.slow02`-derived, pulse/bounce from the scale) and easings from the tween/spring presets, or add named loop presets to `lib/motion.ts` and reference them here. At minimum stop hardcoding `1`/`2`/`1.5` + raw `'linear'`/`'easeInOut'`.

### [P1][I] `ref as any` casts on the icon ref (3 sites) defeat the typed `SVGSVGElement` ref
- **Category:** types
- **Evidence:** icon.tsx:184 `<TablerIcon ref={ref as any} …>`; icon.tsx:186 same; icon.tsx:204 `<motion.span ref={ref as any} …>`
- **Why:** The component is `forwardRef<SVGSVGElement, …>` yet erases the ref type with `any` at every forward site. The static branch forwards to an SVG (correct element) and the animated branch forwards to a `span` (a *different* element than the declared ref type — a real inconsistency, not just a cast). `any` hides that mismatch from consumers.
- **Fix:** Type the Tabler ref as `React.Ref<SVGSVGElement>` (Tabler components already accept `RefAttributes<SVGSVGElement>`, so no cast needed). For the animated branch, either forward to the inner SVG (keep the contract `SVGSVGElement`) or widen the declared ref type and document that animated icons expose the wrapper span.

### [P2][M3] State-machine branch (loading/success/error) has no reduced-motion guard
- **Category:** motion / a11y
- **Evidence:** icon.tsx:102-119 — the `if (state && state !== 'idle')` branch returns an `AnimatePresence` + `motion.span` (opacity tween) and a `<Spinner>` and runs *before* `prefersReduced` is consulted (the `useReducedMotion()` result at line 99 only gates the `draw` and preset branches at 122/181).
- **Why:** A spinning loader is the one animation that arguably should keep going (progress feedback), but the entrance opacity tween and the success/error glyph animation still fire under reduced-motion. The doc claims "All animations respect `prefers-reduced-motion`" (icon.md:38) — that's not strictly true for the state branch.
- **Fix:** Either route the state branch through `prefersReduced` (skip the entrance tween, let Spinner's own reduced-motion handling cover the loop) or soften the doc claim. Confirm `Spinner` honors reduced-motion; if it does, just guard the wrapper `motion.span` tween.

### [P2][H] `state="loading"` Spinner has no `aria-busy`/`aria-live` on a standalone Icon
- **Category:** state-coverage / a11y
- **Evidence:** icon.tsx:105-118 — renders `<Spinner … />` inside a bare `motion.span`; no `aria-busy="true"` and no live region. `label` is dropped entirely in this branch.
- **Why:** When an Icon is used standalone as a loading indicator, screen-reader users get the Spinner's `role="status"` but the caller-supplied `label` is silently ignored and there's no busy/live signal tying it to the surrounding control. The rubric H calls out "loading with no `aria-busy`; async with no `aria-live`."
- **Fix:** Pass `label` through to Spinner (as its accessible name) and set `aria-busy` / appropriate live semantics, or document that loading-state Icons must be paired with a labeled control.

### [P2][J] Doc omits the `{ rotate?; scale? }` object form of `animate`
- **Category:** docs
- **Evidence:** icon.md:12 lists `animate: "spin" | "pulse" | "bounce" | "draw" | "none" | { rotate?: number; scale?: number }` — but the prose "Animation presets" examples and the story `argTypes` (icon.stories.tsx:22 `options: ['spin','pulse','bounce','none']`) never show the object form or `draw` in controls.
- **Why:** Minor doc/story parity gap; the controlled-motion object escape hatch and `draw` are real public API surface that's invisible in Storybook controls.
- **Fix:** Add `draw` to the story `animate` control options and add one story demonstrating the `{ rotate }` / `{ scale }` object form.

### [P3][V12/V14] Eyebrow kicker (uppercase + tracking) in the MigrationGuide story
- **Category:** visual-tell (story only)
- **Evidence:** icon.stories.tsx:198,205 — `className="text-xs font-semibold text-text-secondary uppercase tracking-wider"` Before/After labels
- **Why:** All-caps letter-spaced kicker is the eyebrow-kicker reflex. Harmless as a one-off demo label and not shipped in the component, but it's the AI-default styling for section labels.
- **Fix:** Optional — use normal-case `font-medium` labels, or leave (it's a doc-only demo, not a default rendering).

### [P3][G2/J] Story uses non-DS `text-text-secondary` / `text-text-tertiary` and raw `text-xs`
- **Category:** vocabulary / docs (story only)
- **Evidence:** icon.stories.tsx — 13 uses of `text-text-secondary`/`text-text-tertiary` (e.g. lines 47, 60, 116) and raw `text-xs` instead of `text-ds-xs`; the canonical muted token is `text-surface-fg-muted` (used by Card/StatCard).
- **Why:** Vocabulary drift in the demo. `text-text-secondary` is not defined in `tokens/` — it's a legacy alias carried across several stories (badge, button, icon-group). Component source itself is clean.
- **Fix:** Migrate the story labels to `text-surface-fg-muted` + `text-ds-xs`. Low priority (consistent with sibling stories; a family-wide story sweep, not icon-specific).

### [P3][M1] `bounce` preset is overshoot-by-name, but gated behind explicit opt-in
- **Category:** motion (not a tell — noted for completeness)
- **Evidence:** icon.tsx:39-42 — `bounce: { animate: { y: [0,-4,0] }, … }`
- **Why:** Bounce/elastic is the M1 tell *when it's a default*. Here it only fires on explicit `animate="bounce"`, so it's a deliberate consumer choice, not a reflex. Listed so synthesis doesn't re-flag it.
- **Fix:** None required. (If anything, ensure its timing comes from the scale per M2 above.)

## Composability gaps
- **None material.** Icon is a leaf primitive; it does not need slots, `asChild`, or to compose Card. Polymorphism is correctly expressed via the `icon` prop (pass any ForwardRef SVG component), and context inheritance via `IconProvider` is the right composition model (F-dimensions N/A). No bespoke-corner-prop or flat-props-should-be-compound issues.
- Minor: the `icon` prop type (`ForwardRefExoticComponent<IconComponentProps & RefAttributes<SVGSVGElement>>`) is tight and correct, but a consumer passing a plain `(props) => <svg/>` function component (no forwardRef) won't typecheck. Acceptable given the Tabler-standard contract documented at icon.md:35; not a gap, just a constraint.

## Motion gaps
- M2 (primary): `spin`/`pulse`/`bounce` presets hardcode durations (1s/2s/1.5s) and easings (`'linear'`/`'easeInOut'`) instead of `lib/motion.ts` tokens — the rest of the system (Card, StatCard) routes through `springs`/`tweens`/`durations`.
- M3: state-machine branch (loading/success/error entrance tween) isn't gated by `prefersReduced`; doc overstates reduced-motion coverage.
- Clean: `draw` and the preset/object branches DO check `prefersReduced` and fall back to static render (icon.tsx:122, 181). No layout-prop animation (M5) — all transforms/opacity/pathLength. Feedback motion (M4) N/A for a leaf icon.

## Polish plan (ordered steps to reach the finish bar)
1. **Route preset motion through the token scale (M2).** Replace the hardcoded `duration`/`ease` in `ANIMATION_PRESETS` with values derived from `durations` and the tween/spring presets in `lib/motion.ts` (or add named loop presets there). This is the one change that meaningfully separates this from "AI-default animation."
2. **Drop the `ref as any` casts (I).** Type the Tabler ref as `React.Ref<SVGSVGElement>`; decide and document what the animated branch's ref points at (inner SVG vs wrapper span) so the `forwardRef<SVGSVGElement>` contract is honest.
3. **Guard the state branch for reduced motion + a11y (M3/H).** Run the loading/success/error branch through `prefersReduced`, pass `label` to Spinner, add `aria-busy`. Then the icon.md:38 reduced-motion claim is fully true.
4. **Close doc/story parity (J).** Add `draw` to the story `animate` control + one object-form (`{ rotate }`) story.
5. **(Optional) Story vocab sweep (G2).** Migrate `text-text-secondary`/`text-xs` → `text-surface-fg-muted`/`text-ds-xs`; drop the uppercase eyebrow in MigrationGuide. Best done family-wide.

## Clean (rubric dims that pass)
- **V1–V8 visual tells:** N/A or clean — leaf primitive, no surface/border/shadow, no gradient text, real Tabler icon set (V5 clean — no emoji), no pill spam, single radius vocabulary not in play.
- **V5 specifically:** stories and source use the real lucide-style Tabler icon set throughout; zero emoji-as-icon.
- **E1–E8 verbal:** JSDoc and icon.md are direct and prescriptive — no em-dash tic (en/em used correctly), no AI vocabulary, no hedging, no chatbot artifacts, no over-structuring.
- **F1–F6 composability:** appropriate for a leaf; polymorphism via `icon` prop, composition via `IconProvider` context, explicit-props-override-context is correct precedence.
- **G1 surface / G3 variant-axis / G5 soft-vs-outline:** N/A (no surface, no variant/color axis, no actions).
- **H a11y baseline:** label→`role="img"`+`aria-label`+`<title>`; decorative→`aria-hidden="true"`; both axe-clean in tests (icon.test.tsx:158-168). State/size/stroke all covered in tests.
- **I types (mostly):** props are well-typed unions, no `color?: string`, no `React.FC`, `forwardRef` + `displayName` present. Only blemish is the `ref as any` (flagged).
- **J docs/tests/stories:** doc prop table matches source, conformance test present (`describeConformance`), 10 stories covering size/stroke/context/animation/state/a11y. Publish-gate satisfied.
- **M4/M5:** no missing-feedback (N/A for leaf), no layout-prop animation.
