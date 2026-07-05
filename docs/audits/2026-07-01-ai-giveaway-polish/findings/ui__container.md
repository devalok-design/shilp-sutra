# ui/container — audit
**Finish score:** 5/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:0 P2:1 P3:1

## Findings

### [P2][J] Doc prop table omits a prop that doesn't exist, but understates the polymorphic ref/spread surface
- **Category:** docs
- **Evidence:** `packages/core/docs/components/ui/container.md:7-13` — lists only `maxWidth` and `as`; no mention that the component forwards a ref and spreads element-specific props (`React.ComponentPropsWithRef<T>`).
- **Why:** Doc is accurate but thin — it doesn't tell a consumer the component is ref-forwarding and accepts native props for the chosen element. Minor parity gap vs. the source surface, not a wrong claim.
- **Fix:** Add a line under Props: "Forwards `ref` and spreads all native props for the element chosen via `as`." Optional; the doc is otherwise correct and the example is clean.

### [P3][H] No explicit forced-colors / RTL coverage in story or test
- **Category:** state-coverage
- **Evidence:** `packages/core/src/ui/container.test.tsx:1-51` and `container.stories.tsx:1-73` — cover `maxWidth` axis, `as` polymorphism, base classes; no forced-colors/RTL/dark story.
- **Why:** Container is a non-interactive, non-colored layout box (only `mx-auto w-full px-page-x` + max-width). It paints no fill, no border, no text color by default, so forced-colors/RTL/dark have nothing to break. Listing this only for completeness — there is genuinely nothing stateful to demonstrate.
- **Fix:** None required. A layout primitive with no visual surface has no meaningful state matrix beyond what's already shown.

## Composability gaps
- None. This is itself a base composability primitive. It is polymorphic via `as` (F2 satisfied — `as` is the idiomatic polymorphism here; `asChild`/Slot would be redundant since `as` already lets any element/component be the root), forwards `ref` correctly (`ContainerComponent` type preserves `T` so element-specific props typecheck — same pattern as `stack.tsx:86-88` and text.tsx), has only 2 layout props (`maxWidth`, `as`) — well under the F3 threshold, and does not re-roll surface/spacing tokens (F5 — it pulls `max-w-layout`, `max-w-layout-body`, `px-page-x` straight from the token layer).
- No bespoke corner-props (F1), no compound/slot confusion (F4), no controlled/uncontrolled surface (F6 N/A — it holds no state).

## Motion gaps
- None applicable. Container is a static layout box with no entrance, hover, press, or layout animation — correct for a structural primitive (a wrapper that animated by default would itself be an M1/M4 tell). No motion to guard for reduced-motion (M3 N/A).

## Polish plan (ordered steps to reach the finish bar)
The component is already at the finish bar. Optional, low-priority touch-ups only:
1. (P2) Add one line to `container.md` noting ref-forwarding + native-prop spread for the `as` element, so the doc fully describes the API surface.

## Clean (rubric dims that pass)
- **A. Visual tells (V1–V8):** Clean. No accent rail, no border+shadow double-edge, no gradient text, no raw framework palette, no emoji, no blob/glass/glow, no rounded-everything (no radius at all — it's a layout box), no pill spam. The only classes it ships are `mx-auto w-full px-page-x` + a max-width token (`container.tsx:33`).
- **B. Visual reflexes (V9–V15):** Clean. No hardcoded font, no decorative numbering, no eyebrow/kicker, no all-caps, no AI imagery. Story placeholders use DS tokens (`rounded-control`, `border-surface-border-strong`, `text-ds-sm`) — not raw values.
- **C. Motion (M1–M5):** N/A — no motion by design (correct for a layout primitive).
- **D. Structural (S1–S4):** Clean. The `AllVariants` story uses one consistent surface with dashed accent borders to visualize bounds — a legitimate demo affordance, not a colored-section-background tell.
- **E. Verbal (E1–E8):** Clean. JSDoc-equivalent comments (`container.tsx:19-24`) and the doc are direct and prescriptive — no em-dash tic used as a stylistic connector beyond standard punctuation, no AI vocabulary, no hedging, no over-structuring.
- **F. Composability:** Clean (see above) — exemplary base primitive.
- **G. Drift + vocabulary (G1–G5):** Clean. No surface drift (it sets no surface — `// @server-safe` box, correctly omitted from any surface concern). Tokens not raw values (`max-w-layout`, `px-page-x` — G2 clean). `maxWidth` axis values (`default`/`body`/`full`) are layout-semantic, not the variant/size/color taxonomy, so G3 doesn't apply. No family vocabulary conflict.
- **H. State coverage:** Clean for a non-interactive primitive — `as` polymorphism, all 3 `maxWidth` values, base classes all tested (`container.test.tsx:13-49`) + storied.
- **I. Types + API:** Clean. No `any`, no `React.FC`, no stringly-typed enums (`maxWidth` is a string-literal union, `as` is `React.ElementType`). Proper `forwardRef` with `displayName` (`container.tsx:40`), exported `ContainerProps` type (`container.tsx:44`). The `as unknown as ContainerComponent` cast (`container.tsx:42`) is the standard polymorphic-component pattern shared with `stack.tsx:114` / text.tsx — intentional, documented, and necessary to preserve `T` across the call site. `ref` typed `HTMLElement` is acceptable here because the element is consumer-chosen via `as`.
- **J. Docs parity:** Doc exists (`docs/components/ui/container.md`), props match source, server-safe correctly noted, example clean. Story tagged `stable` + `autodocs`. One thin spot noted as P2 above.
- **Tests + stories:** Both present. Test uses `describeConformance` (the shared conformance helper) + targeted assertions; story covers every `maxWidth` and the `as` axis.
