# ui/stepper — audit
**Finish score:** 3/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:3 P2:5 P3:3

Stepper is clean of the loud AI visual tells — no accent rail, no gradient text, no emoji, no raw indigo, tokens used throughout, `role="list"`/`listitem` + `aria-current` present, connector fill animates `transform` not width. The gaps are finish-bar gaps: a default-reflex slide-in with no reduced-motion guard, an active/completed state collision, flat content props where slots would compose better, controlled-only API, and missing per-component doc.

## Findings

### [P1][M3] Slide animation + delta-style entrance have no reduced-motion guard
- **Category:** motion
- **Evidence:** stepper.tsx:298-313 — `StepperContent` `<motion.div … variants={stepContentVariants} initial="enter" animate="center" exit="exit" transition={springs.smooth}>`; variants translate `x: direction * SLIDE_OFFSET` (40px). No `useReducedMotion()` / `withReducedMotion()` anywhere in the file.
- **Why:** Rubric H + M3 require every animation respect `prefers-reduced-motion`; a 40px horizontal slide on every step change is exactly the vestibular-trigger motion that must be gated. `withReducedMotion` already exists in `lib/motion.ts:58`.
- **Fix:** `const reduce = useReducedMotion()`; when true, set `SLIDE_OFFSET` to 0 (opacity-only crossfade) and/or pass `withReducedMotion(springs.smooth)`. Same guard belongs on the connector-fill transition.

### [P1][F1] `Step` ships content as flat props (`label`, `description`, `icon`) instead of composable slots
- **Category:** composability
- **Evidence:** stepper.tsx:139-143 `interface StepProps { label: string; description?: string; icon?: IconInput }`; rendered at 181-197 into a fixed `<div className="flex flex-col"><span>{label}</span>…{description}</div>`.
- **Why:** Card-bar pattern (CardHeader/CardTitle/CardDescription slots) is composition, not corner-props. A consumer can't put a badge, a secondary action, or rich content in a step without forking. `label`/`description` are F1 "bespoke prop where a slot belongs."
- **Fix:** Accept `children` as the step body (keep `label`/`description` as the convenience path, or expose `<StepTitle>`/`<StepDescription>` sub-components). At minimum allow `description?: React.ReactNode` and a `children` override.

### [P1][H] Active and completed steps are visually identical (same fill), distinguished only by glyph
- **Category:** state-coverage
- **Evidence:** stepper.tsx:160-162 — `state === 'completed' && 'bg-accent-9 text-accent-fg'` and `state === 'active' && 'bg-accent-9 text-accent-fg'` are the same classes. The only difference is content (checkmark vs number, lines 165-179).
- **Why:** Rubric H requires distinct, demonstrated states. "Active" is the most important state in a stepper and currently reads the same as every step behind it — the user can't tell where they are at a glance, only by reading numbers. A ring/elevation/weight difference on active is the intentional-emphasis the Card bar expects.
- **Fix:** Give `active` a distinguishing treatment — e.g. `ring-2 ring-accent-7 ring-offset-2` or a solid fill with `active` carrying a focus-like ring while `completed` stays flat-filled. Add an explicit "active vs completed adjacent" story so the distinction is visible.

### [P2][F6] Controlled-only API — `activeStep` required, no `defaultActiveStep` / uncontrolled mode
- **Category:** composability
- **Evidence:** stepper.tsx:64 `activeStep: number` (required); no `defaultActiveStep`, no internal state fallback.
- **Why:** F6 controlled/uncontrolled gap. For a self-contained wizard the consumer must always lift state (as every story does via `useState`). A `defaultActiveStep` uncontrolled path is the standard Radix-style affordance.
- **Fix:** Make `activeStep` optional with `defaultActiveStep`, internal `useState` fallback, and keep `onStepClick` driving it when uncontrolled. Document the controlled/uncontrolled split.

### [P2][M4] Step circle state change (pending→active→completed) has no entrance/feedback motion; only color transitions
- **Category:** motion
- **Evidence:** stepper.tsx:159 `'transition-[background-color,border-color,color] duration-moderate-01 ease-productive-standard'` — circle only cross-fades color. The number→checkmark swap (165-179) is an instant DOM replace with no crossfade/scale.
- **Why:** StatCard's delta arrow gets a `springs.bouncy` pop on mount (stat-card.tsx:288-291) as intentional feedback. The stepper's completion moment — the most meaningful event — has no micro-feedback; the check just appears. M4 missing-feedback-motion.
- **Fix:** Wrap the checkmark in a `motion.svg` with a small `initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={springs.bouncy}` (reduced-motion-guarded), so completing a step has a felt confirmation.

### [P2][docs/J] No per-component doc; story `AllVariants` mislabels what are states, not variants
- **Category:** docs
- **Evidence:** No `packages/core/docs/components/**/stepper.md` (Glob returned none). stepper.stories.tsx:209 `export const AllVariants` — Stepper has no variant axis; the story shows active-index states + orientation.
- **Why:** J docs-parity: public component should have a doc with an accurate prop table. Calling state permutations "AllVariants" muddies the vocabulary the rubric wants kept canonical.
- **Fix:** Add the per-component doc (props, orientation, controlled usage, a11y notes). Rename the story to `States` or `Showcase`.

### [P2][H] `cloneElement(_index)` injection silently breaks for non-`<Step>` children (fragments, conditionals, wrappers)
- **Category:** state-coverage
- **Evidence:** stepper.tsx:91-95 — maps children, `React.isValidElement<StepInternalProps>(child) ? React.cloneElement(child, { _index: index }) : child`. Index is also used as the React `key` (line 92) and to compute connector fill (line 114).
- **Why:** A consumer wrapping a `<Step>` (tooltip, conditional `{cond && <Step/>}` producing `false`, or a custom wrapper) gets `_index = 0` default (line 149) → all such steps render as the first step's state. No dev warning. Robustness gap vs the explicit-children contract.
- **Fix:** Either flatten/validate children and dev-warn on non-Step nodes, or move index off `cloneElement` (e.g. count rendered steps via context order). At minimum document the "direct `<Step>` children only" constraint and warn in dev.

### [P2][a11y] Clickable step loses `aria-current="step"` on the active step
- **Category:** a11y
- **Evidence:** stepper.tsx:201-232 (clickable branch) sets `role="listitem"` but no `aria-current`; only the non-clickable branch (line 240) sets `aria-current={state === 'active' ? 'step' : undefined}`. With `onStepClick`, the active step is non-clickable (`isClickable` requires `completed`), so it falls to the clickable branch's sibling — but the active step itself is rendered through the non-clickable path only when not completed; completed steps (clickable) correctly shouldn't be current. Edge: the active step never gets the clickable branch, so current is preserved — but the markup duplication means any future change to `isClickable` (e.g. allowing active click) drops `aria-current`.
- **Why:** Fragile a11y — the current-step signal lives in only one of two branches. H requires `aria-current` on the active step regardless of clickability.
- **Fix:** Compute `aria-current` once and apply it in both branches.

### [P3][G3] No `size` axis — step circle, gap, and connector are fixed
- **Category:** vocabulary
- **Evidence:** stepper.tsx:158 `w-ds-sm h-ds-sm` hardcoded; connector `h-ds-01 min-w-ds-05` (line 102-103). No `size` prop.
- **Why:** Canonical axis taxonomy (G3) expects `size`; a compact stepper (sidebar, dense wizard) can't shrink. Not a tell, but a finish-bar completeness gap.
- **Fix:** Add a `size` axis (sm/md) driving circle dimensions, text scale, and connector thickness, mirroring sibling components.

### [P3][docs] Doc-example icon uses manual sizing classes instead of the Icon API
- **Category:** docs
- **Evidence:** stepper.tsx:137 (JSDoc) `icon={<IconShieldCheck className="h-ico-sm w-ico-sm" />}`.
- **Why:** The component already wraps the icon in `<IconProvider size="sm">` (line 165), so a passthrough element with manual `h-ico-sm w-ico-sm` is redundant and models the non-canonical pattern in copy-pasteable docs. (Not a runtime bug — passthrough elements aren't resized by IconProvider, so the class is doing real work, which is itself the smell.)
- **Fix:** Show `icon={IconShieldCheck}` (component ref) so IconProvider sizes it, matching the Icon API contract.

### [P3][I] `StepInternalProps` cast pulled out of `props` is a typing smell
- **Category:** types
- **Evidence:** stepper.tsx:148-149 — `StepProps` has no `_index`, then `({ … ...props }, ref)` and `const { _index = 0, ...restProps } = props as StepInternalProps`. The injected `_index` is cast in rather than typed on the public surface.
- **Why:** Minor — relies on a cast to read an internally-injected prop; brittle if `StepProps` spread order changes. Not consumer-facing.
- **Fix:** Acceptable as-is (internal), but a context-based index (see M-finding above) removes the cast entirely.

## Composability gaps
- `Step` is flat-prop (`label`/`description`/`icon`) where slots/children would compose — can't inject rich content, badges, or actions into a step (F1).
- Controlled-only: no `defaultActiveStep` / uncontrolled mode (F6).
- No `asChild` on `Step` — a step that should be a link (e.g. wizard with URL-routed steps) can't polymorph; consumer must wrap, which then breaks `_index` injection.
- Index injection via `cloneElement` couples the API to direct `<Step>` children only; wrappers/conditionals silently misindex.
- No `size` axis; circle/connector dimensions fixed.

## Motion gaps
- M3: no `prefers-reduced-motion` guard on the `StepperContent` 40px slide or the connector fill — the most important motion in the component is ungated.
- M4: the completion moment (number→checkmark) has no micro-feedback motion; it's an instant DOM swap while StatCard's delta arrow gets a deliberate pop.
- M2 (minor): connector fill and circle color use the same `duration-moderate` family; fine, but no enter/exit differentiation on the content slide beyond direction sign.
- Connector fill correctly animates `transform: scaleX/scaleY` (not width) — clean, not a gap.

## Polish plan (ordered steps to reach the finish bar)
1. **Reduced-motion**: add `useReducedMotion()` to `StepperContent`; collapse `SLIDE_OFFSET` to 0 and use `withReducedMotion(springs.smooth)` when set. Guard any new circle motion the same way.
2. **Distinguish active from completed**: give `active` a ring/elevation/weight treatment so it doesn't share `bg-accent-9` identically with `completed`; add an adjacent active-vs-completed story.
3. **Feedback motion on completion**: animate the checkmark in with a guarded `springs.bouncy` scale/opacity.
4. **Composability**: accept `children` (and/or `<StepTitle>`/`<StepDescription>` slots) on `Step`; widen `description` to `ReactNode`. Consider `asChild`.
5. **Uncontrolled mode**: add `defaultActiveStep` + internal state fallback; document controlled/uncontrolled.
6. **Robustness**: validate/flatten children and dev-warn on non-`Step` nodes (or move index to context); apply `aria-current` in both render branches via a single computed value.
7. **Docs + vocabulary**: add `packages/core/docs/components/**/stepper.md` with an accurate prop table; rename the `AllVariants` story to `States`/`Showcase`; fix the JSDoc icon example to use a component ref.
8. **(Optional) size axis**: add sm/md.

## Clean (rubric dims that pass)
- **V1 accent rail**: none — emphasis is fill + glyph, no left/top colored stripe.
- **V2 double edge**: pending circle uses border-only; filled circles use bg-only. No border+shadow on one element.
- **V3 gradient text / V4 raw palette**: numbers and labels are solid `text-accent-fg`/`text-surface-fg`; all color via semantic `accent-9`/`surface-*` tokens, no `indigo`/`violet`/hex.
- **V5 emoji**: none — uses a real SVG checkmark and the Icon API.
- **V6 blob/glass/glow / V7 rounded-everything**: `rounded-pill` only on the step circle (legitimate), `rounded-control` on the click target. No glass/blur/glow.
- **V8 pill spam / V10–V15**: numbering is on genuine sequential steps (V10 legitimate); no kickers, no all-caps default, no AI imagery.
- **G2 tokens**: spacing `ds-*`, durations `duration-*`/`ease-productive-standard`, colors semantic — no raw px/hex, no dead TW4 (`bg-gradient-to-*`, `w-[--var]`).
- **G1 surface**: inline indicator (not a card); connector track `bg-surface-border`, pending circle `bg-surface-raised` — appropriate, not a surface-1 card violation.
- **a11y baseline**: `role="list"`/`role="listitem"`, `aria-current="step"` on active (non-clickable path), connector `aria-hidden`, clickable step is a real `<button type="button">` with `aria-label` and `focus-visible:ring-2 … ring-offset-2`. axe test present and passing.
- **E1–E8 verbal**: JSDoc/stories prose is plain and direct — no em-dash tic beyond legitimate punctuation, no AI vocabulary, no hedging.
- **forwardRef + displayName**: all three components forward refs and set displayName.
