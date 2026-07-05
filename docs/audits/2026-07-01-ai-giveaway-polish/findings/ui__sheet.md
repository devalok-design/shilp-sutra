# ui/sheet — audit
**Finish score:** 4/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:2 P2:5 P3:2

Sheet is a genuinely well-built overlay primitive: composes the vendored Dialog primitive (not re-rolled), real compound slots with `asChild`, controlled/uncontrolled handled, transform-based slide (not layout props), tokens throughout, a mobile swipe-to-dismiss that's gated behind `useReducedMotion`. No visual AI tells (no accent rail, no gradient text, no emoji, no blob/glass, no framework palette). The gaps are polish + a couple of contract issues: the *entrance* slide ignores reduced-motion (only `drag` is gated), `Sheet` is typed `React.FC`, and the Sheet family diverged from the Card-era gap model (still uses `space-y`/`space-x`). Doc + stories miss the reduced-motion / forced-colors / RTL state coverage the rubric asks of an interactive overlay.

## Findings

### [P1][M3] Entrance/exit slide ignores `prefers-reduced-motion`
- **Category:** motion
- **Evidence:** sheet.tsx:230 — `transition={springs.smooth}` on the slide `motion.div`; `isReduced` (line 204) is only consumed at line 231 `drag={isMobile && !isReduced ? 'y' : false}`.
- **Why:** A user with reduced-motion set still gets the full 75%-of-viewport translate slide on every open/close. `useReducedMotion()` is already wired in — it just isn't applied to the transition.
- **Fix:** When `isReduced`, swap the slide for an opacity-only fade (or `withReducedMotion(springs.smooth)` from `lib/motion`): `initial={isReduced ? { opacity: 0 } : slideInitial[...]}` etc., and `transition={isReduced ? tweens.fade : springs.smooth}`. Same fix Dialog needs.

### [P1][I] `Sheet` root typed as `React.FC`
- **Category:** types
- **Evidence:** sheet.tsx:64 — `const Sheet: React.FC<React.ComponentPropsWithoutRef<typeof SheetPrimitive.Root>> = ({ ... })`
- **Why:** Rubric I explicitly flags `React.FC`. It bakes in an implicit `children`, blocks generics, and is inconsistent with the rest of the family (Card/StatCard use `forwardRef`; Dialog also uses `React.FC` — both should move off it). No `displayName`-via-FC benefit here since it's set manually on line 96.
- **Fix:** Type the params explicitly: `function Sheet({ ... }: React.ComponentPropsWithoutRef<typeof SheetPrimitive.Root>)` or a named `SheetProps` interface, and export that prop type (currently unexported — see I/inferred-not-exported).

### [P2][V2] Double-edge on the panel — border AND shadow on the same surface
- **Category:** visual-tell
- **Evidence:** sheet.tsx:139 base `... bg-surface-overlay p-ds-06 shadow-overlay` + per-side `border-b/-t/-r/-l border-surface-border-strong` (lines 143–146).
- **Why:** Rubric V2: a 1px border plus a wide drop shadow on the same element is the "double edge" tell. Sibling Dialog (dialog.tsx:159) uses `shadow-overlay` with **no** border. The Card finish bar (card.tsx:27) is explicit: "no border+shadow double-edge." A sheet is edge-anchored so the seam border is more defensible than on a free-floating card — but it's still a divergence from the elevation-led system and from Dialog.
- **Fix:** Drop the side borders and let `shadow-overlay` carry the edge (matches Dialog), OR if the seam against the screen edge is intentional, document it as a deliberate choice in the JSDoc / doc so it reads as a decision, not a reflex.

### [P2][G4] Family vocabulary drift — `space-y`/`space-x` instead of the gap model
- **Category:** drift
- **Evidence:** sheet.tsx:273 `flex flex-col space-y-ds-03` (SheetHeader); sheet.tsx:287 `flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-ds-03` (SheetFooter). Base `sheetVariants` uses `gap-ds-05` (line 139) — so the component itself mixes `gap` and `space-*`.
- **Why:** Card was deliberately rebuilt on the gap model (card.tsx:18-20 comment: "gap is the rhythm"); `space-y`/`space-x` margin-injection is the older pattern and is internally inconsistent with the `gap-ds-05` on the same component. Header uses `space-y-ds-03` while Dialog header uses `space-y-ds-02b` — also a cross-family inconsistency in the header gap value.
- **Fix:** `SheetHeader` → `flex flex-col gap-ds-03` (or `gap-ds-02b` to match DialogHeader); `SheetFooter` → `... sm:flex-row sm:justify-end sm:gap-ds-03`. Align the header gap value with DialogHeader so the two overlay families share one vocabulary.

### [P2][M2] Close button color transition missing a duration token
- **Category:** motion
- **Evidence:** sheet.tsx:254 — `... transition-colors ease-productive-standard hover:text-surface-fg-muted ...` (no `duration-*`).
- **Why:** Dialog's identical close button (dialog.tsx:165) specifies `transition-colors duration-fast-01 ease-productive-standard`. Without the token the transition falls back to the browser default (150ms), giving the two overlays visibly different hover feedback timing — uneven rhythm (rubric M2).
- **Fix:** Add `duration-fast-01` to the close button's class to match Dialog.

### [P2][H] No reduced-motion / forced-colors / RTL story coverage
- **Category:** state-coverage
- **Evidence:** sheet.stories.tsx — stories cover Right/Left/Top/Bottom/MobileBottomSheet only. No reduced-motion, forced-colors, or RTL (left/right slide should mirror under `dir="rtl"`) story.
- **Why:** Rubric H asks interactive components to demonstrate reduced-motion, forced-colors, and RTL. For an edge-anchored slide panel, RTL mirroring (does `side="right"` slide from the correct edge under RTL?) and forced-colors (does the panel keep a visible boundary when the shadow is stripped?) are real risks. Note: under forced-colors the `shadow-overlay` disappears — the side border (V2) is actually load-bearing there, which is an argument for keeping a forced-colors-only border rather than an always-on one.
- **Fix:** Add a reduced-motion story (after M3 fix) and a forced-colors story; verify left/right under `dir="rtl"`. Consider `forced-colors:border` as the forced-colors fallback edge.

### [P2][J] Doc omits the `responsive` prop and the mobile/swipe behavior
- **Category:** docs
- **Evidence:** docs/components/ui/sheet.md:7-9 lists only `side` under SheetContent props; `responsive?: boolean` (sheet.tsx:195) is undocumented. The doc's "Gotchas" don't mention the mobile→bottom-sheet remap or swipe-to-dismiss, which the JSDoc (sheet.tsx:194) and source (lines 203, 231-246) implement.
- **Why:** Rubric J: per-component doc must carry an accurate prop table. A consumer reading the doc can't discover `responsive` or know that a `side="right"` sheet silently becomes a bottom sheet on mobile.
- **Fix:** Add `responsive` to the SheetContent props block and a Gotcha: "On mobile (<768px), any side remaps to a bottom sheet with swipe-to-dismiss unless `responsive={false}`."

### [P3][I] `SheetContentProps` exported but `SheetProps` (root) is not
- **Category:** types
- **Evidence:** sheet.tsx:191 exports `SheetContentProps`; the root `Sheet` consumes `React.ComponentPropsWithoutRef<typeof SheetPrimitive.Root>` inline with no exported alias.
- **Why:** Consumers wrapping Sheet can't import its prop type. Minor — paired with the `React.FC` fix, define and export `SheetProps`.
- **Fix:** `export interface SheetProps extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Root> {}` and type the root with it.

### [P3][docs] Doc "Changes" log stale at v0.18.0
- **Category:** docs
- **Evidence:** sheet.md:48-57 — last entry v0.18.0; current package is 0.44.x. The mobile swipe-to-dismiss + `responsive` prop + reduced-motion drag-gate aren't reflected in any changelog entry in this doc.
- **Why:** Minor doc-parity nit; the per-component change log drifted from the source's feature set.
- **Fix:** Add a changelog entry covering the mobile bottom-sheet remap + swipe-to-dismiss when those landed.

## Composability gaps
- **Strong overall.** Composes the vendored Dialog primitive directly (F5 ✓ — does not re-roll surface/portal/focus-trap), exposes the full slot set (`SheetHeader/Title/Description/Footer/Close/Portal/Overlay`), `asChild` available on `SheetTrigger`/`SheetClose` via the primitive (F2 ✓), controlled + uncontrolled both handled at the root with a proper `isControlled` guard (F6 ✓).
- Minor: `SheetContent` auto-injects the close button (sheet.tsx:254) with no opt-out prop — a consumer who wants a sheet with no close affordance (e.g. a forced-choice panel) must restyle/hide it. Dialog has the same constraint; not a regression, but a `hideClose`/slot escape hatch would be the Card-bar move. (P3-ish; not listed above to avoid double-counting with Dialog.)
- No `SheetProps` type export (see P3 above) — small composability/types gap for consumers wrapping the root.

## Motion gaps
- **M3 (P1):** entrance/exit slide does not respect reduced-motion — `useReducedMotion` is read but only applied to `drag`, not the `springs.smooth` slide transition. Primary motion gap.
- **M2 (P2):** close-button `transition-colors` has no duration token (falls back to browser 150ms; Dialog uses `duration-fast-01`).
- **M5 ✓:** slide animates `x`/`y` transforms (percentages), not `width`/`height`/`top`/`left` — correct.
- **M1 ✓:** uses `springs.smooth` (damping 30, no overshoot) for the panel, `tweens.fade` for the overlay — no bounce-by-default. The mobile `dragElastic={0.2}` is a deliberate rubber-band on a drag gesture, not a default entrance bounce — a choice, not a tell.
- **M4 ✓:** overlay fade in/out and panel slide in/out are both present; close button has hover + `active:scale-90` feedback.

## Polish plan (ordered steps to reach the finish bar)
1. **M3 fix (P1):** apply `isReduced` to the slide — fade-only initial/animate/exit and `tweens.fade` transition when reduced. Then add a reduced-motion story.
2. **Types (P1+P3):** drop `React.FC` on the root; type params explicitly; add and export `SheetProps`.
3. **G4 fix (P2):** convert `SheetHeader`/`SheetFooter` from `space-y`/`space-x` to `gap-*`; align header gap with `DialogHeader` (`gap-ds-02b`).
4. **V2 decision (P2):** either drop the side border to match Dialog's shadow-only edge, or keep it as an explicit forced-colors fallback (`forced-colors:border`) and document the rationale.
5. **M2 fix (P2):** add `duration-fast-01` to the close button.
6. **Docs (P2+P3):** document `responsive`, the mobile bottom-sheet remap + swipe-to-dismiss; refresh the change log.
7. **Stories (P2):** add forced-colors + RTL (left/right mirroring) coverage.

## Clean (rubric dims that pass)
- **V1** no accent rail. **V3** no gradient text. **V4** no indigo/violet/slate framework palette — semantic surface/accent tokens only. **V5** no emoji (real `IconX` via Icon API). **V6** no blob/glass/glow — solid `bg-surface-overlay`, `shadow-overlay` is the layering token. **V7** one radius vocabulary (`rounded-pill` for the drag handle, `rounded-control-inner` on close). **V8** no pill-badge spam.
- **E1–E8** JSDoc/doc/story prose is clean: no em-dash-as-connector tic beyond standard usage, no AI vocabulary, no meta-hedging, no chatbot artifacts. (The "feel free to combine props creatively!" closer in the JSDoc, sheet.tsx:189, borders on E5 engagement-bait but is a shared house JSDoc footer, not Sheet-specific.)
- **G1** correct surface: overlay → `bg-surface-overlay` per the MANDATORY layering rule. **G2** tokens throughout (`p-ds-06`, `gap-ds-05`, `z-modal`, `shadow-overlay`) — no raw px/hex, no dead TW3 patterns. **G3** `side` axis is appropriate (not a misuse of variant/size/color).
- **F5** composes Dialog primitive (does not re-roll). **F6** controlled/uncontrolled both handled. **H/a11y** SheetTitle required + axe-clean test; close button has `focus-visible:ring`, `sr-only` label, `min-h/w-ds-xs` touch target.
