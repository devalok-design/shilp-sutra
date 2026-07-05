# ui/input — audit
**Finish score:** 4/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:1 P2:3 P3:2

## Findings

### [P1][G2] Hardcoded arbitrary px widths for icon sections (re-rolled tokens)
- **Category:** drift
- **Evidence:** input.tsx:36–41 — `const sectionWidthMap = { xs: 'w-[26px]', sm: 'w-[30px]', md: 'w-[38px]', lg: 'w-[46px]' }`
- **Why:** Arbitrary `w-[NNpx]` bypasses the `--spacing-ds-*` scale; these are the only raw pixel values in the component and they drift independently of the size tokens that set wrapper height (`h-ds-xs-plus`/`h-ds-sm`/`h-ds-md`/`h-ds-lg`). G2 explicitly calls out hardcoded px instead of our tokens.
- **Fix:** Map each icon-cell width to a `--spacing-ds-*` token (`w-ds-*`) sized to match the corresponding height token, or derive it from the height token so it can't drift. If no spacing step lands on these exact values, add the token rather than hardcoding px.

### [P2][M3] CSS transitions have no reduced-motion guard
- **Category:** motion
- **Evidence:** input.tsx:18 — `transition-[color,background-color,border-color,box-shadow] duration-fast-02 ease-productive-standard`
- **Why:** The wrapper animates color/bg/border/ring with no `prefers-reduced-motion` fallback. These are low-distance color fades (the least offensive case), but the motion system contract is to respect reduced-motion everywhere; Card/StatCard route through `motionProps`/MotionConfig which honors it. Color-only transitions are borderline, hence P2 not P1.
- **Fix:** Gate the transition behind a `motion-reduce:transition-none` utility (or confirm the global reduced-motion CSS reset already neutralizes `transition-*`). If a global reset exists, document it and downgrade to clean.

### [P2][H] Focus ring not validated for forced-colors / high-contrast
- **Category:** a11y
- **Evidence:** input.tsx:19 — `focus-within:ring-2 focus-within:ring-accent-9 focus-within:ring-offset-2` with no `forced-colors:` companion; state borders (input.tsx:164–166) use `border-error-7`/`warning`/`success` color tokens only.
- **Why:** H requires focus ring + state affordances to survive forced-colors mode. In Windows High Contrast, `ring-*` box-shadow rings and tinted borders can be flattened, leaving error/warning/success visually indistinguishable and the focus ring possibly invisible. No story or test exercises forced-colors. semantic.css ships a `@media (forced-colors)` block — needs confirming it covers ring + state borders here.
- **Fix:** Add a `forced-colors:` outline fallback on `:focus-within` and verify state borders map to system colors; add a forced-colors story or note in the doc. At minimum confirm the global forced-colors block covers this control.

### [P2][J] Doc Sizes table omits `xl`; props doc list is otherwise complete but `size` axis stops at `lg`
- **Category:** docs
- **Evidence:** input.md:8 `size: "xs" | "sm" | "md" | "lg"`; make-kit/components/input.md:43 same. CVA (input.tsx:25–30) defines only `xs/sm/md/lg`.
- **Why:** Docs match the source exactly here, so this is NOT a docs-drift bug. The note is that the canonical size taxonomy in the rubric (G3) is `xs/sm/md/lg/xl`; Input simply has no `xl`. That is a legitimate omission for a text field, not drift. Flagged only so synthesis doesn't misread the missing `xl` as drift. Effectively clean — leave as is.
- **Fix:** None required. Do not add `xl` to chase taxonomy completeness.

### [P3][V14] Story label uses all-caps tracking as decorative emphasis
- **Category:** visual-tell
- **Evidence:** input.stories.tsx:43 — `<Label className="text-ds-xs text-surface-fg-muted uppercase tracking-wider">{size}</Label>`
- **Why:** All-caps + letter-spacing as a label treatment is the V14 reflex. It is in a story (a size-demo legend), not the shipped component, and it labels a real axis, so impact is minimal — but it is the kind of uppercase-everywhere tic the rubric flags.
- **Fix:** Drop `uppercase tracking-wider`; use plain `text-ds-xs text-surface-fg-muted`. Cosmetic.

### [P3][F2] No `asChild` / polymorphism escape hatch
- **Category:** composability
- **Evidence:** input.tsx:101–254 — always renders a `<div>` wrapper + raw `<input>`; no Slot/`asChild`.
- **Why:** F2 targets components consumers would want to polymorph. Input is a leaf form control rendering a native `<input>` — polymorphing the element rarely makes sense, and the wrapper-vs-input split is already exposed via `wrapperClassName`/`className`. So this is a deliberate non-need, not a real gap. Noted for completeness; do not add `asChild`.
- **Fix:** None. The container-first split already covers the real styling need.

## Composability gaps
- Sections are true slots (`startSection`/`endSection` take any `ReactNode`), with auto-inference (string→label, element→icon) and an explicit override (`startSectionType`/`endSectionType`) — this is the correct slot model, NOT the F1 bespoke-corner-prop anti-pattern. Clean.
- `startSectionClickable`/`endSectionClickable` correctly toggle `pointer-events`, so interactive content (clear button, reveal toggle) composes inside a section. Clean.
- Composes `useFormField()` context for state + a11y wiring instead of re-rolling label/helper logic (input.tsx:120–130). This is the F5 "compose, don't re-roll" virtue.
- No `asChild` — acceptable for a native form leaf (see F2 above).
- Native `value`/`defaultValue`/`onChange` controlled+uncontrolled both supported via input HTML attrs — no F6 gap.

## Motion gaps
- No framer entrance/exit motion — correct for a text field; inputs should not animate in. Not a gap.
- Hover/focus feedback IS present via CSS transition on bg/border/ring (input.tsx:18) — satisfies M4 micro-feedback.
- M3: that CSS transition has no explicit reduced-motion guard (finding above). Only motion concern.
- No M1 (bounce), M2 (uniform timing — single transition), or M5 (animating layout props — only color/box-shadow) issues.

## Polish plan (ordered steps to reach the finish bar)
1. Replace the four `w-[NNpx]` icon-cell widths (input.tsx:36–41) with `--spacing-ds-*`-derived `w-ds-*` tokens tied to the size's height token, killing the only raw-px drift. (G2)
2. Confirm or add reduced-motion handling for the wrapper transition (`motion-reduce:transition-none` or a documented global reset). (M3)
3. Verify the focus ring + error/warning/success borders render in `@media (forced-colors)`; add a `forced-colors:` outline fallback on `:focus-within` if not already covered, and add a forced-colors story. (H)
4. Drop `uppercase tracking-wider` from the Sizes story legend label. (V14, cosmetic)

## Clean (rubric dims that pass)
- V1 no accent rail; V2 single edge (border-led wrapper, no drop shadow — ring is focus affordance, not a resting double-edge); V3 no gradient text; V4 uses `accent-*`/`surface-*`/`error-7`/`warning-7`/`success-7` semantic tokens, no raw indigo/violet/slate; V5 no emoji; V6 no blob/glass/glow; V7 single `rounded-control` radius; V8 no pill spam.
- V9 uses `font-sans` token, no hardcoded Inter/Geist. V10/V12/V13/V15 n/a for a form leaf.
- Verbal (E1–E8): JSDoc, doc, and make-kit copy are direct and prescriptive; no em-dash tic abuse, no AI vocabulary, no hedging or chatbot artifacts. The one `—` usages are legitimate parenthetical/range, not stylistic-connector spam.
- G1 surface: wrapper uses `bg-surface-raised-hover` (input control on surface-1 page) — correct per layering rule (input controls live at surface-1 family). G3 axes canonical (`size`, plus a legitimate `state` validation axis). G4/G5 n/a.
- F1/F3/F4/F5/F6 clean (slot model correct, composes FormField, native controlled/uncontrolled).
- H states: default/hover/focus-visible(via focus-within)/disabled(`has-[:disabled]` + `opacity-action-disabled`)/read-only/error(`aria-invalid`)/warning/success all handled and shown in stories; `aria-describedby`/`aria-required` wired. Tests cover state borders, section types, padding, pointer-events, className routing, and run `describeConformance` across all sizes.
- I types: `forwardRef` + `displayName` present, typed `HTMLInputElement` ref, `InputState` exported union (no stringly-typed/`any`), `size` correctly omitted from HTML attrs to avoid the native collision.
- J docs: doc + make-kit prop tables match CVA source exactly; story present (publish gate met); changelog history maintained.
