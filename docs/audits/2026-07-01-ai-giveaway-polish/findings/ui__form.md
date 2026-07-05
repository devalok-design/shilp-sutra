# ui/form — audit
**Finish score:** 4/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:1 P2:3 P3:2

`ui/form` is a thin, well-disciplined primitive: `FormField` (a flex container that broadcasts `{state, helperTextId, inputId, required}` via context), `FormHelperText` (a state-colored message line), and the `useFormField()` hook. It ships **no surface, no card chrome, no gradient, no accent rail, no raw palette, no emoji** — almost the entire A-section visual-tell battery is N/A by construction. The token vocabulary is clean (`gap-ds-02`, `text-ds-sm`, semantic `text-error-11` etc.), state axis is canonical, types are tight, a11y wiring is the showcase feature, and tests/stories/docs are present and accurate. The gaps are polish-tier, not tells.

## Findings

### [P1][F6] `state` is broadcast but there is no controlled/uncontrolled `error`/message API; helper `state` can desync from the input's own `state`
- **Category:** composability
- **Evidence:** form.tsx:54 `state = 'helper'` on FormField; input controls take their own `state` prop independently (docs/components/ui/form.md:42 "Explicit props always override context").
- **Why:** The field's truth (is this errored?) lives in two places — `FormField state` and each control's `state` — with no single source. A consumer can render `<FormField state="error">` with `<Input state="success">` and get a green input under a red helper. This is the exact drift the Card-bar single-source-of-truth principle targets.
- **Fix:** Keep context as the single source; have controls *default* to `context.state` (they already can via `useFormField`) and document that setting `state` on a child is an override, not a parallel channel. Consider a dev warning when a child's explicit `state` disagrees with context.

### [P2][M3] `FormHelperText` ships an unconditional entrance animation with no component-level reduced-motion guard
- **Category:** motion
- **Evidence:** form.tsx:99-108 `<motion.p initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }} exit={...} transition={tweens.fade}>` — no `useReducedMotion`/`withReducedMotion`.
- **Why:** Reduced-motion is only respected if the consumer wraps the tree in `MotionProvider`/`MotionConfig` (motion/motion-provider.tsx). Absent that, a screen of validation messages all slide in on every keystroke/validation. This matches the exemplar's posture (StatCard relies on the same provider), so it is a *system* gap surfaced here, not a form-specific regression — but a helper line that re-mounts on every validation pass is more motion-noisy than a once-mounted stat, so it deserves the flag.
- **Fix:** Gate the `y` offset behind `useReducedMotion()` (collapse to opacity-only / `withReducedMotion(tweens.fade)`), or document that FormHelperText requires `MotionProvider` for reduced-motion compliance.

### [P2][M4/state] `exit` variant declared but `FormHelperText` is never wrapped in `AnimatePresence`, and FormField doesn't provide one
- **Category:** motion / state-coverage
- **Evidence:** form.tsx:106 `exit={{ opacity: 0, y: -4 }}` — but neither FormField (form.tsx:63-72, a plain `<div>`) nor any story wraps helpers in `AnimatePresence`.
- **Why:** The exit animation is dead code in the default composition — a helper that disappears (error clears) pops out with no transition. The asymmetry (animated enter, instant exit) is the "uniform/missing-exit" motion smell, and the declared `exit` misleads maintainers into thinking it works.
- **Fix:** Either drop the `exit` prop (honest: enter-only), or make `FormField` render an `AnimatePresence` around its children so add/remove of a helper actually animates both directions. The latter reaches the Card bar.

### [P2][H] No first-class required-indicator or error-message wiring shown for the `required` flag; `aria-invalid`/`aria-required` live only in consumer controls
- **Category:** state-coverage / a11y
- **Evidence:** form.tsx:49 `required?: boolean` is broadcast but FormField renders nothing for it; `inputId` is added to context (form.tsx:57) but no story/test/doc demonstrates the Label↔Input auto-wire via `inputId`, and the doc explicitly says labels are *not* auto-wired (form.md:40).
- **Why:** `inputId` was added to the context value but the documented contract (form.md:40) still says FormField doesn't wire Label→Input — so a real capability is shipped-but-undocumented/undemonstrated, and the `required` state has no visual/aria affordance at the FormField level. State-coverage matrix items (required, error) are only half-covered.
- **Fix:** Document + add a story for the `inputId` auto-wire (Label `htmlFor` / Input `id` pulled from context). Reconcile the doc's "does NOT auto-wire" line with the new `inputId` context field — one of them is stale.

### [P3][docs] Doc `useFormField()` return + context shape is stale vs source (`inputId` missing)
- **Category:** docs
- **Evidence:** form.md:21 `useFormField() => { state, helperTextId, required }` and form.md:50 comment omit `inputId`, which the source returns (form.tsx:16, 59, 132-134 — context includes `inputId`).
- **Why:** Docs-parity drift: the hook now also returns `inputId` (used for Label/Input auto-association) but the documented shape doesn't list it. Source wins per CLAUDE.md.
- **Fix:** Add `inputId` to the documented `useFormField()` return shape and to the JSDoc on line 116-117 ("returns `{ state, helperTextId, required }`").

### [P3][motion] `FormHelperText` `exit` + missing `AnimatePresence` also means the JSDoc/example never shows the intended motion lifecycle
- **Category:** motion / docs
- **Evidence:** form.tsx:20-34 JSDoc example and all stories (form.stories.tsx) render static helpers; none demonstrate the enter/exit the component was built for.
- **Why:** The motion intent is invisible to anyone reading examples — reinforces the M4 gap above and leaves the animated behavior untested (no Storybook interaction/visual coverage of the transition).
- **Fix:** Add a story toggling `state`/helper presence inside `AnimatePresence` to exercise enter+exit.

## Composability gaps
- **Single-source-of-truth for field state is leaky (F6):** `FormField state` and each control's own `state` prop are parallel channels rather than one cascading source; a child can visually contradict the field. No `error`/message convenience prop and no controlled/uncontrolled story for the state lifecycle.
- **`inputId` context capability is undocumented/undemonstrated:** the Label↔Input auto-association via context exists in source (form.tsx:57) but the doc says it doesn't (form.md:40). Either ship it as a real, documented slot-style convenience or remove it.
- **Otherwise composability is strong:** context-driven (not bespoke corner props), `useFormField()` is the public extension point, no `asChild` needed (these are layout/context primitives, not polymorphic elements), prop count is well under the compound threshold.

## Motion gaps
- **M3:** `FormHelperText` entrance (`y:-4` slide + fade) has no component-level reduced-motion guard; relies entirely on consumer wrapping `MotionProvider`. Same posture as the exemplar, but higher noise because helpers re-mount on validation.
- **M4:** `exit` variant declared but never driven by an `AnimatePresence` in the default composition — exit is dead; enter/exit asymmetry.
- **Clean:** uses the shared `tweens.fade` token (no bespoke duration/easing), no bounce/overshoot on a text line, animates `opacity`+`y` (transform) not layout props (M5 clean), timing comes from the duration scale (M2 clean).

## Polish plan (ordered steps to reach the finish bar)
1. **Resolve the state single-source (F6):** make child controls default to `context.state` (document the override semantics), and reconcile the doc's "explicit overrides" wording so the model is unambiguous. Optionally add a dev-warning on contradiction.
2. **Fix the motion lifecycle (M4):** wrap `FormField` children in `AnimatePresence` (or drop the `exit` prop). Add a story that toggles a helper in/out to exercise both directions.
3. **Guard reduced-motion at the component (M3):** collapse the `y` offset under `useReducedMotion()` so the slide degrades to opacity-only without requiring `MotionProvider`.
4. **Reconcile `inputId` (H + composability):** decide whether Label↔Input auto-wire is a supported feature; if yes, document it + add a story; update form.md:40. If no, drop `inputId` from context.
5. **Docs parity (docs P3):** add `inputId` to the documented `useFormField()` shape (form.md:21, JSDoc form.tsx:116).

## Clean (rubric dims that pass)
- **V1 accent rail:** none — FormField is a borderless flex column (form.tsx:67). Clean.
- **V2 double edge / V6 blob-glass-glow / V7 rounded-everything:** N/A — no surface, no border, no radius, no shadow.
- **V3 gradient text:** none. **V4 default framework palette:** none — semantic tokens only (`text-error-11`, `text-warning-11`, `text-success-11`, `text-surface-fg-subtle`, form.tsx:85-90). **V5 emoji:** none in source/story/doc. **V8 pill spam:** N/A.
- **V9 safe-face font:** uses `text-ds-sm` token, no hardcoded font. **V10–V15:** N/A (no headings/heroes/imagery/numbering).
- **G1 surface drift:** N/A — non-surface primitive, correctly not on `bg-surface-1`. **G2 re-rolled tokens:** clean — all spacing/type/color via `-ds-*`/semantic tokens, no raw px/hex, no dead TW3 utilities. **G3 variant-axis drift:** `state: helper|error|warning|success` is the canonical validation axis (not `variant`/`color` misuse); no `primary`/`small`/`filled`. **G4/G5:** N/A.
- **E1–E8 verbal tells:** JSDoc + doc copy are direct and clean — no em-dash tic as connector (en/dashes used correctly), no AI vocabulary, no hedging, no tricolons. (Doc uses one em-dash narratively at form.md:35 but reads naturally, not a stylistic crutch.)
- **I types:** tight — `forwardRef` + `displayName` on both components (form.tsx:53,76,92,113), specific element types (`HTMLDivElement`/`HTMLParagraphElement`), exported prop interfaces + `FormHelperState` union, no `any`, no `React.FC`, no `color?: string`. `motionProps` cast is documented and narrowest-safe.
- **H a11y (core):** strong — `role="alert"` on error (form.tsx:102), context-driven `aria-describedby` wiring, axe-clean test (form.test.tsx:195-209). This is the component's strlength.
- **J docs/stories:** story exists (publish gate met), prop tables mostly accurate, state variants demonstrated (Default/Error/Warning/Success/AllHelperStates). Only the `inputId` omission is stale.
