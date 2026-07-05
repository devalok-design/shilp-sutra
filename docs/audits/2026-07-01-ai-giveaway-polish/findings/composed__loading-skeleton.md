# composed/loading-skeleton — audit
**Finish score:** 2/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:5 P2:4 P3:1

Scope: `packages/core/src/composed/loading-skeleton.tsx` exports `CardSkeleton`, `TableSkeleton`, `BoardSkeleton`, `ListSkeleton`. It composes `ui/Skeleton`. Co-located test + story + doc all present.

The component is visually restrained — no accent rails, no gradient text, no emoji, no framework palette. Its problems are all **finish/composability drift**, not AI visual tells: it re-rolls the Card surface instead of composing `<Card>` (the exact drift StatCard fixed), bypasses the dedicated `skeleton-*` tokens for `surface-raised-hover` (which breaks forced-colors and dark-mode contrast), scatters raw-px arbitrary widths, ships dead `animationDelay` code, and provides no `role="status"`/`aria-busy` wrapper so the whole loading state is silent to screen readers.

## Findings

### [P1][F5] CardSkeleton / TableSkeleton / BoardSkeleton re-roll the Card surface instead of composing `<Card>`
- **Category:** composability
- **Evidence:** loading-skeleton.tsx:19 — `'rounded-surface border border-surface-border-strong bg-surface-raised p-ds-05b'` (CardSkeleton); :59 (TableSkeleton) `'overflow-hidden rounded-surface border border-surface-border-strong'`; :137 (BoardSkeleton card) same triplet + `p-ds-04`.
- **Why:** This is the drift StatCard explicitly fixed (see stat-card.tsx:7 `import { Card, CardContent }` and the migration note at stat-card.tsx:20). A skeleton is supposed to preview the real card, but it hand-rolls `border-surface-border-strong` + no shadow (an *outline*-style edge) while the actual Card default is `bg-surface-raised border border-transparent shadow-raised` (card.tsx:27) — elevation-led, not border-led. The placeholder therefore doesn't match the surface it stands in for, and any future Card surface change won't propagate.
- **Fix:** Render `<Card variant="outline">` (or `default`) as the shell and put the `Skeleton` rows inside `<CardContent>`, exactly as StatCard's loading branch does (stat-card.tsx:241-250). Drop the hardcoded surface triplet + `p-ds-05b`; let Card's gap model own padding.

### [P1][G4] Skeleton fill uses `bg-surface-raised-hover`, bypassing the dedicated `skeleton-base` token
- **Category:** vocabulary / drift
- **Evidence:** every bar overrides the fill: loading-skeleton.tsx:23 `Skeleton className="... bg-surface-raised-hover"`, and ~20 more occurrences (:24, :28-29, :64-72, :127-149, :186-192). Base `Skeleton` fills with `bg-skeleton-base` (skeleton.tsx:7); StatCard's loading skeletons also use `bg-skeleton-base` (stat-card.tsx:245-247).
- **Why:** There is a purpose-built two-token pair (`--color-skeleton-base` / `--color-skeleton-shimmer`, semantic.css:290-291, 605-606) with forced-colors + dark overrides. Overriding it with `surface-raised-hover` means two different "skeleton" vocabularies in one system and defeats the token's forced-colors mapping (see H below).
- **Fix:** Delete the `bg-surface-raised-hover` overrides; let the base `Skeleton`'s `skeleton-base` fill apply. If a lighter shade is wanted on the card, adjust the token, not per-call.

### [P1][H] Whole loading state is silent to assistive tech — no `role="status"` / `aria-busy` / `aria-live`
- **Category:** a11y / state-coverage
- **Evidence:** each root is a bare `<div>` (loading-skeleton.tsx:14, 56, 117, 175). Every child `Skeleton` is `aria-hidden="true"` (skeleton.tsx:65), so nothing is announced. The base file ships `SkeletonGroup` (`role="status" aria-busy="true"` + sr-only label, skeleton.tsx:351-361) for exactly this, and it is unused here.
- **Why:** A screen-reader user gets zero signal that content is loading — the region is completely empty to AT. Per rubric H, "loading with no `aria-busy`; async with no `aria-live`."
- **Fix:** Wrap each skeleton root (or accept an optional label and) apply `role="status" aria-busy="true"` with an sr-only "Loading…", or compose `SkeletonGroup`.

### [P1][H] Fill token override breaks forced-colors (high-contrast) — bars go invisible
- **Category:** a11y / state-coverage
- **Evidence:** in forced-colors, `--color-skeleton-base: GrayText` and `--color-surface-raised-hover: Canvas` (semantic.css:707, 785). The bars are painted `bg-surface-raised-hover` = **Canvas**, i.e. the same color as the card/page background.
- **Why:** In Windows High Contrast the skeleton bars disappear entirely — the deliberate `GrayText` mapping on `skeleton-base` exists precisely to keep them visible. This is a direct consequence of the G4 override but is a distinct shipped a11y defect.
- **Fix:** Same as G4 — use `skeleton-base`. Verify against `forced-colors.stories.tsx`.

### [P1][G2] Raw-px arbitrary values instead of spacing/size tokens
- **Category:** drift
- **Evidence:** `h-[16px] w-[128px]` (:23), `h-[12px]` throughout (:28-29, :64-72, :127-128, :141-142, :147, :189), `w-[80px]` (:33,127), `w-[272px]` (:121, and the test/story depend on it), `w-[160px]` (:70,90), `w-[20px]` (:128), `w-[64px]` (:147), `w-[56px]` (:192), `h-[20px]` (:192). Mixed inconsistently with token classes (`h-ds-xs`, `h-ds-03`, `h-ico-sm`) in the very same elements.
- **Why:** rubric G2 (re-rolled tokens: hardcoded px instead of `--spacing-ds-*`). The mix of `h-[12px]` and `h-ds-03` in sibling bars shows there's no single cadence; base `Skeleton` uses `h-4`/`h-3.5` token-scale heights.
- **Fix:** Move recurring bar heights/widths onto the `--spacing-ds-*` scale (or at least a small local constant set), matching base `Skeleton`. Arbitrary px is acceptable only for genuinely off-scale widths, and even those should be justified.

### [P2][M2] `animationDelay` inline style is applied to a non-animated wrapper — dead code (no stagger)
- **Category:** motion
- **Evidence:** loading-skeleton.tsx:84 `style={{ animationDelay: '${rowIndex * 50}ms' }}` on the row `<div>`; :138 on the board card `<div>`; :183 on the list row `<div>`. Those wrapper divs carry no `animate-*` class — only their child `Skeleton`s pulse. `animation-delay` only affects the element it's set on.
- **Why:** The intended staggered entrance never happens; every bar pulses in unison. Either broken feature or leftover from a removed design. Rubric M2 (uniform/robotic timing — every animation the same, no differentiation).
- **Fix:** Either drop the dead `animationDelay` entirely, or push the delay onto the animated `Skeleton` elements (e.g. via a CSS var the pulse keyframe consumes) so the stagger is real. If staggering, guard with `motion-reduce`.

### [P2][F1] Board/List headers hardcode structure that consumers can't slot or vary
- **Category:** composability
- **Evidence:** BoardSkeleton column header (:124-131) and card body (:140-150), ListSkeleton row shape (:185-193) are fully fixed; only `rows`/`columns`/`cardsPerColumn`/`showAvatar` are configurable. No way to change the per-item shape, and no `children`/render-prop escape hatch.
- **Why:** These are opinionated fixed layouts (fine as a convenience), but they offer no composition beyond count knobs — consumers whose real card differs must abandon the component and drop to `Skeleton`. Borderline given intent, but flagged per F1 (fixed regions where a slot/render-prop would compose).
- **Fix:** Consider a `renderItem`/`children` slot, or document that these are intentionally rigid and point to `Skeleton` for anything custom (the doc partly does this at loading-skeleton.md:44).

### [P2][H] No empty/zero-guard on count props
- **Category:** state-coverage
- **Evidence:** `rows`/`columns`/`cardsPerColumn` feed `Array.from({ length: rows })` directly (:65, :77, :86, :118, :134, :176) with no clamp. `<TableSkeleton rows={0} />` renders a header and nothing else; negative or `NaN` throws (`Array.from({length:-1})` → RangeError). Base `Skeleton` sub-components DO clamp (`Math.max(1, lines)` skeleton.tsx:157; `Math.max(1, bars)` :269).
- **Why:** rubric H (empty state that crashes on zero children). Inconsistent with the base primitive's own defensiveness.
- **Fix:** `const safeRows = Math.max(0, Math.floor(rows ?? default))` (or `Math.max(1, …)` to match base), same for the other counts.

### [P2][V2] CardSkeleton style is border-led while the real Card default is elevation-led (double-edge mismatch)
- **Category:** visual-tell / drift
- **Evidence:** CardSkeleton :19 uses `border-surface-border-strong` and **no** shadow; the Card it previews defaults to `border-transparent shadow-raised` (card.tsx:27). This isn't a border+shadow double-edge on one element, but it is an edge-model inconsistency with the finish exemplar.
- **Why:** The placeholder reads as an outline card; the loaded card reads as an elevated card — a visible pop on load. Minor, subsumed by F5 (composing Card fixes it), tracked separately for the visual delta.
- **Fix:** Resolved by F5 — compose `<Card>` and inherit its edge model.

### [P3][J] Doc omits the base-composition guidance detail and predates the tokens issue
- **Category:** docs
- **Evidence:** loading-skeleton.md:42-47 correctly says "Built on ui/Skeleton" but doesn't mention the surface is hand-rolled (not `<Card>`), and the prop tables are accurate to source. Changelog stops at v0.2.0.
- **Why:** Once F5/G4 are fixed the doc should note the Card composition; low priority.
- **Fix:** Update after the refactor.

## Composability gaps
- **Does not compose `<Card>`** (F5) — re-rolls `rounded-surface border bg-surface-raised p-*` in three of four exports; the single biggest gap vs the StatCard bar.
- **Does not compose `SkeletonGroup`** — the accessible loading wrapper exists in the base file and is ignored, so no `role="status"`/`aria-busy`.
- **Fixed item shapes with no slot** (F1) — count knobs only; no `renderItem`/`children` for custom item geometry.
- **Fill token bypassed** — uses `surface-raised-hover` instead of composing the base `Skeleton`'s `skeleton-base` fill, so it also silently loses base's `motion-reduce`/forced-colors handling on the color.

## Motion gaps
- **M2 dead stagger:** `animationDelay` set on non-animated wrapper divs (:84, :138, :183) — no visible stagger; every bar pulses in unison. Either wire it to the animated element or remove it.
- **M3 (partial pass):** reduced-motion IS respected, but only incidentally — it comes from the base `Skeleton`'s `motion-reduce:animate-none` (skeleton.tsx:16). If the dead `animationDelay` were ever wired up on the wrappers, there is no `motion-reduce` guard on those wrappers, so it would need one.
- No entrance/exit differentiation between skeleton → content swap (out of scope for this file, but nothing here assists it).

## Polish plan (ordered steps to reach the finish bar)
1. **Compose `<Card>` + `<CardContent>`** in CardSkeleton, TableSkeleton (as the outer shell), and BoardSkeleton's per-card; delete the hardcoded `rounded-surface border-surface-border-strong bg-surface-raised p-*` triplets. Match StatCard's loading branch (stat-card.tsx:241-250). (F5, V2)
2. **Wrap each root in `SkeletonGroup`** (or apply `role="status" aria-busy="true"` + sr-only label) so the loading state is announced. Accept an optional `label`. (H)
3. **Replace all `bg-surface-raised-hover` with the base `skeleton-base` fill** — ideally by not overriding the base `Skeleton` color at all. Restores forced-colors + dark contrast. (G4, forced-colors H)
4. **Remove the dead `animationDelay`** or move it onto the animated elements with a `motion-reduce` guard. (M2)
5. **Clamp count props** (`Math.max(1, …)`) like the base primitive. (H)
6. **Replace raw-px `h-[..]`/`w-[..]` bars** with `--spacing-ds-*` scale values consistent with base `Skeleton`. Note: tests + stories assert `w-[272px]` (test :36,42; story :121) — update those selectors when the class changes. (G2)
7. Update the doc + changelog once the surface/token model changes. (J)

## Clean (rubric dims that pass)
- **V1 accent rail** — none. No colored left/top stripe anywhere.
- **V3 gradient text** — none.
- **V4 framework palette** — none; all colors are semantic tokens (`surface-*`, `skeleton-*`).
- **V5 emoji-as-icon** — none in source/story/doc.
- **V6 blob/glass/glow, V7 rounded-everything, V8 pill spam** — none. Uses `rounded-surface`/`rounded-pill`/`rounded-control` intentionally.
- **E1–E8 verbal tells** — doc + JSDoc are clean, direct, no AI vocabulary, no em-dash tic, no meta-hedging.
- **I types** — clean: `forwardRef` + `displayName` on all four, correct `HTMLDivElement` refs, typed count props, no `any`, no `React.FC`, no stringly-typed enums. Props interfaces exported.
- **G1 surface level** — `bg-surface-raised` on card-like blocks is the correct level (surface-2 territory); not flagged by SURFACE1 rule.
- **G3 variant-axis** — n/a (no variant axes; count-based API).
- **J stories/tests present** — story covers all four + grids + edge counts; test has conformance + count/className assertions. Prop tables in doc match source.
- **M3 reduced-motion** — respected via the composed base `Skeleton` (incidental, but present).
