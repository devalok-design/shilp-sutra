# ui/label — audit
**Finish score:** 5/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:0 P2:1 P3:1

## Findings

### [P2][M3] Opacity transition has no reduced-motion guard
- **Category:** motion
- **Evidence:** label.tsx:27 — `transition-opacity duration-fast-01 ease-productive-standard ... peer-disabled:opacity-action-disabled`
- **Why:** The only animation on this component is a CSS opacity fade on the peer-disabled state. It is a tiny opacity-only transition (transform/layout safe), but it is not wrapped in any `motion-reduce:` variant, so it always animates even under `prefers-reduced-motion`.
- **Fix:** Minor. Add `motion-reduce:transition-none` to the class list, OR accept as negligible — a sub-100ms opacity-only fade on disabled state is the lowest-risk motion in the system. Borderline P3; flagged only for completeness since the rubric (M3) treats any unguarded animation as a tell.

### [P3][docs] No per-component doc / make-kit prop entry verified for `required`
- **Category:** docs
- **Evidence:** No `packages/core/docs/components/**/label.md` exists (glob returned nothing); the `required` prop is a shilp-sutra addition over the Radix primitive.
- **Why:** The `required` boolean and the FormField `inputId`/`required` fallback behavior are non-obvious additions over the vanilla Radix Label API. A consumer/AI agent reading only the primitive's API would miss them. Story coverage exists (`Required`, `RequiredWithInput`) so this is not a publish-gate failure, just a doc-surface gap.
- **Fix:** Confirm `llms-full.txt` / make-kit Label section documents the `required` prop and the FormField auto-wiring (`htmlFor`/`required` fall back to context). Source already self-documents via the prop comment chain in form.tsx.

## Composability gaps
- **None material.** Label correctly composes the vendored `@primitives/react-label` base (F5 clean — does not re-roll the `<label>` element or its mousedown text-selection guard). It forwards ref to the primitive root, spreads `...props`, and forwards `className` through `cn()`. No bespoke corner-slot props (F1 clean). `asChild` is not exposed, but the Radix Label primitive does not surface it here and Label has no polymorphism need (it is already the leaf `<label>`); F2 not applicable. No controlled/uncontrolled state to gap (F6 n/a) — `required` is a pure presentational boolean with a sensible context fallback.

## Motion gaps
- The single `transition-opacity` (label.tsx:27) is opacity-only (M5 clean — no layout-prop animation), uses the design-system duration + easing tokens `duration-fast-01 ease-productive-standard` (M1/M2 clean — not bounce, not arbitrary timing). The only gap is the missing `prefers-reduced-motion` guard (M3, P2 above). No feedback-motion gap (M4) — a static label needs no hover/press affordance.

## Polish plan (ordered steps to reach the finish bar)
1. (Optional, P2) Add `motion-reduce:transition-none` to the className on label.tsx:27 to honor reduced-motion on the disabled fade — or document the opacity fade as an intentional, negligible exception.
2. (Optional, P3) Verify the `required` prop and FormField auto-wiring appear in `llms-full.txt` and the make-kit Label guide so AI consumers see the shilp-sutra additions, not just the Radix base API.

## Clean (rubric dims that pass)
- **V1–V8 (visual hard-ban tells):** Clean. No accent rail, no double edge, no gradient text (the required asterisk is a solid `text-error-11` semantic token, label.tsx:34), no raw indigo/violet/slate palette, no emoji icon (the `*` is a real typographic required-indicator with `aria-hidden="true"`), no blob/glass/glow, no rounded-everything, no pill spam.
- **V9–V15 (visual reflexes):** Clean. Uses `font-sans` + `text-ds-md` type tokens (V9 — no hardcoded Inter/Geist). No decorative numbering, no eyebrow kicker, no all-caps default, no hero, no AI imagery.
- **G1–G5 (drift/vocabulary):** Clean. All values are tokens — `text-ds-md`, `text-surface-fg`, `text-error-11`, `ml-ds-01`, `duration-fast-01`, `ease-productive-standard`, `opacity-action-disabled`. No hardcoded px/hex, no dead-in-TW4 utilities. No surface used (a `<label>` has no surface level — G1 n/a). No variant axes to drift (Label has no CVA; it's a single styled primitive).
- **H (state coverage):** Clean. `peer-disabled:opacity-action-disabled` covers the disabled state via the peer pattern; `required` indicator handled; htmlFor association handled with FormField context fallback. The required asterisk is correctly `aria-hidden` (screen readers get `aria-required` from the input via `useFormField`, not a stray "star"). Focus/hover/press n/a for a non-interactive label.
- **I (types/API):** Clean. `LabelProps extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>` — no `any`, no stringly-typed enums, no `React.FC`. `forwardRef` with `React.ElementRef<typeof LabelPrimitive.Root>` (correct specific ref type, not `HTMLElement`). `displayName` set from the primitive. `LabelProps` is exported.
- **E1–E8 (verbal tells):** Clean. JSDoc/comments are terse and technical ("Explicit htmlFor wins; otherwise fall back to FormField's inputId." label.tsx:18). No em-dash tics, no AI vocabulary, no hedging.
- **F5 (composes base primitive):** Exemplary — thin wrapper over the vendored Radix Label, adding only the `required` indicator and FormField auto-wiring. This is the correct "compose, don't re-roll" pattern.
- **J (docs parity / stories):** Story file present with 4 stories (Default, Required, WithInput, RequiredWithInput), tagged `stable`. Test file present with `describeConformance` + 5 behavior tests (text, htmlFor association, required indicator present/absent, child elements). Publish gate satisfied.
