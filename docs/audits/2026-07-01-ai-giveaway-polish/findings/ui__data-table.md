# ui/data-table — audit

**Finish score:** 3/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:5 P2:7 P3:3

DataTable is a large, genuinely-engineered TanStack wrapper (sorting, server/client modes, virtualization, expansion, controlled selection, bulk actions, mobile cards). It is **free of the loud visual AI tells** — no accent rails, no gradient text, no indigo/violet palette, no emoji, no glass/blob, no rounded-everything. Tokens are used throughout (no raw hex/px shadows). The gaps that keep it off the Card bar are structural/composability and polish: it re-rolls a Card surface for mobile (F5 drift), exposes a wall of ~35 flat boolean props instead of any compound/slot composition (F1/F3), has several bespoke prop-injected regions that should be slots, and motion is partially un-guarded for reduced-motion (M3). Inputs (search, filter, page-size, cell-edit) are raw `<input>`/`<select>` rather than composing the DS Input/Select, which is a quieter drift tell.

---

## Findings

### [P1][F5] Mobile card view re-rolls the Card surface instead of composing `<Card>`
- **Category:** composability / drift
- **Evidence:** data-table-card.tsx:77 — `'rounded-surface border border-surface-border bg-surface-raised p-ds-04'`; loading skeleton card same at data-table-card.tsx:37
- **Why:** StatCard's whole lesson (rubric F5) is "compose `<Card>`, don't re-roll surface/padding/elevation." This hand-rolls a card (border + raised bg + radius + padding) in two places, so it will drift from Card's gap model / shadow-ring / radius vocabulary the moment Card changes.
- **Fix:** Render each mobile row as `<Card variant="outline">` / `<CardContent>` (or `<Card interactive>` when `onRowClick`), and the skeleton as the same. Removes the duplicated surface recipe and inherits Card's finish.

### [P1][V2] Mobile card double-edges (border AND on a raised/white surface)
- **Category:** visual-tell
- **Evidence:** data-table-card.tsx:77 — `border border-surface-border bg-surface-raised` (a 1px border on the white raised surface); selected state adds `ring-2 ring-accent-9` on top (line 78)
- **Why:** V2 bans border + elevation on the same element; the DS surface system says pick edge OR elevation. The hand-rolled card pairs a visible border with the raised surface, and the selected state stacks a 2px accent ring — three edges competing. Card's `outline` vs `default` variants exist precisely to avoid this.
- **Fix:** Compose Card (per F5) and let its variant own the single edge; express selection with `data-state=selected` (Card/TableRow already styles this as `bg-accent-3`) rather than a stacked ring.

### [P1][F1] Bespoke prop-injected regions that should be slots (`emptyState`, `renderExpanded`, `bulkActions`, `footer`-less)
- **Category:** composability
- **Evidence:** data-table.tsx:171 `emptyState?: React.ReactNode`; :155 `renderExpanded?: (row) => React.ReactNode`; :208 `bulkActions?: BulkAction<TData>[]`
- **Why:** F1 — content is injected into fixed regions via props rather than composable children/slots. `bulkActions` in particular is a config-array (label/onClick/color) that re-implements Button styling internally (data-table-bulk-actions.tsx:47-58) instead of accepting `<Button>` children, so consumers can't use the full Button API (icons, soft variant, loading).
- **Fix:** Keep the convenience props, but also accept a render/slot escape hatch for the bulk bar (e.g. `renderBulkActions={(rows, clear) => ...}`) so consumers can compose real `<Button>`s. Lower priority than F5 but it's the same "bespoke prop where a slot belongs" pattern.

### [P1][F3] Flat component with ~35 layout/behaviour props (over the compound threshold)
- **Category:** composability / structural-tell
- **Evidence:** data-table.tsx:113-213 — `DataTableProps` declares ~35 props (`sortable`, `filterable`, `globalFilter`, `paginated`, `selectable`, `toolbar`, `editable`, `expandable`, `virtualRows`, `stickyHeader`, `singleExpand`, `mobileView`, `density`, `columnPinning`, `pagination`, `onSort`, `onRowClick`, `bulkActions`, `emptyState`, `loading`, …)
- **Why:** F3 — CONTRIBUTING threshold is >8 layout/content props ⇒ should be compound. This is a feature-flag wall; every feature is a boolean rather than an opt-in sub-component (e.g. `<DataTable.Toolbar>`, `<DataTable.Pagination>`). The internal pieces (`DataTableToolbar`, `DataTablePagination`, `DataTableBulkActions`) already exist as components but are gated behind booleans instead of exposed for composition.
- **Fix:** Acknowledged tradeoff — TanStack wrappers are legitimately config-heavy. At minimum, export the sub-components for advanced composition and document the flat API as the "easy mode". Don't rebuild blindly; flag for a v0.45+ composition pass.

### [P1][G2] Raw `<input>` / `<select>` controls instead of composing DS Input/Select
- **Category:** drift / vocabulary
- **Evidence:** global search input data-table.tsx:639-650 and data-table-toolbar.tsx:114-126; per-column filter input data-table-header.tsx:151-168; cell-edit input data-table-body.tsx:46-69; page-size `<select>` data-table-pagination.tsx:33-51
- **Why:** G2 — these re-roll the input recipe (`h-ds-xs-plus border border-surface-border-strong bg-surface-raised-hover px-ds-02 outline-hidden focus:border-accent-7`) four separate times rather than composing the DS `Input`/`Select`. Each copy is a drift point (focus ring, disabled, invalid, forced-colors all hand-maintained) and the focus treatment (`focus:border-accent-7`, no visible focus ring) diverges from the DS focus-ring utility.
- **Fix:** Replace with `<Input size="sm">` and `<Select>` (or `<NativeSelect>`). Consolidates the recipe and inherits focus-visible/forced-colors/disabled states for free.

### [P2][M3] Animations have no reduced-motion guard
- **Category:** motion / a11y
- **Evidence:** sort-arrow rotate/opacity in data-table-header.tsx:82-129 (`initial/animate/exit` rotate ±90, `springs.snappy`); expand chevron `rotate-90` transition data-table.tsx:419; bulk bar `animate-in slide-in-from-bottom-2` data-table-bulk-actions.tsx:38
- **Why:** M3 — the motion lib ships `withReducedMotion()` (motion.ts:58) and the system uses `MotionConfig`, but these inline `motion.*` entrances/rotations don't opt into it, and the CSS `animate-in slide-in` has no `motion-reduce:` variant. A `prefers-reduced-motion` user gets full rotation/slide.
- **Fix:** Wrap the spring transitions so they collapse under reduced motion (or rely on a top-level `MotionConfig reducedMotion="user"` if that's the system contract — verify), and add `motion-reduce:animate-none` to the bulk bar.

### [P2][M5] Bulk bar entrance animates layout (`slide-in-from-bottom`) via CSS keyframe, not transform/opacity through the motion system
- **Category:** motion
- **Evidence:** data-table-bulk-actions.tsx:38 — `'animate-in slide-in-from-bottom-2'`
- **Why:** M5/M2 — this is a one-off `tailwindcss-animate`-style class rather than the framer-motion `AnimatePresence` + `springs` vocabulary the rest of the table (and StatCard) uses. It also has no exit animation (the bar is conditionally unmounted at data-table.tsx:684, so it pops out with no transition), so enter/exit are asymmetric.
- **Fix:** Render the bar via `AnimatePresence` with `initial/animate/exit` on `y`/`opacity` using `springs.smooth` or `springs.bouncy` for parity with StatCard's feedback motion.

### [P2][H] Editable cell loses its focus ring; relies on border-color only
- **Category:** state-coverage / a11y
- **Evidence:** data-table-body.tsx:66-67 — `'outline-hidden focus:border-accent-7'` (same pattern in header filter and toolbar search)
- **Why:** H — `outline-hidden` removes the focus outline and the only replacement is a border-color change, which is invisible in forced-colors mode and weak for low-vision users. The DS has a `focus-ring` utility for exactly this.
- **Fix:** Use the DS focus-ring utility (or compose Input which has it) instead of `outline-hidden` + border tint.

### [P2][H] `onRowClick` rows are not keyboard-operable
- **Category:** state-coverage / a11y
- **Evidence:** data-table-body.tsx:108-116 — `<TableRow onClick={handleRowClick} className={onRowClick && 'cursor-pointer'}>` with no `role`, `tabIndex`, or key handler
- **Why:** H — a clickable `<tr>` with no keyboard affordance is a `<div onClick>`-class violation; mouse-only. (StatCard's clickable path adds `role="button" tabIndex={0}` + Enter/Space handling — the bar to match.)
- **Fix:** When `onRowClick` is set, add `tabIndex={0}`, a key handler for Enter/Space, and an appropriate role/`aria` (or render the primary cell as a real link/button). Note row-as-button has semantics tradeoffs in a table — consider documenting that `onRowClick` is a pointer convenience and steering keyboard users to an in-row action.

### [P2][H] Sortable header button has no `:focus-visible` styling
- **Category:** state-coverage / a11y
- **Evidence:** data-table-header.tsx:67-77 — sort `<button>` has `hover:bg-surface-raised` but no focus-visible treatment; column-visibility/density/export toolbar buttons (data-table-toolbar.tsx:47-52 `toolbarButtonClass`) likewise have only `hover:bg-surface-raised`
- **Why:** H — keyboard users tabbing through sortable headers / toolbar get no visible focus state beyond the UA default (which is often suppressed by resets). Hover is covered; focus-visible is not.
- **Fix:** Add the DS `focus-ring` / `focus-visible:` treatment to the sort button and `toolbarButtonClass`.

### [P2][state-coverage] Loading skeleton emits `aria-hidden` cells but the table has `aria-busy`; no `aria-live` on async result swaps
- **Category:** state-coverage / a11y
- **Evidence:** `aria-busy={loading || undefined}` data-table.tsx:607 (good); but global-filter result changes (rows appearing/disappearing) and server-pagination page swaps have no `aria-live` region
- **Why:** H — `aria-busy` covers the loading flip, but a screen-reader user filtering/paginating gets no announcement of "N results". Minor; many DS tables skip this.
- **Fix:** Add a visually-hidden `aria-live="polite"` region announcing row count after filter/sort/page changes. Low priority.

### [P2][docs] Doc prop table drifts from the source API
- **Category:** docs
- **Evidence:** data-table.md:35 lists `defaultDensity` and :80 references `defaultDensity="compact"`, but the source prop is `density` (data-table.tsx:229 `density: initialDensity`); the doc has no `defaultDensity` prop. Also data-table.md:30 documents `bulkActions` color as `'default'|'error'` but the type is `'accent'|'error'` (data-table-bulk-actions.tsx:14-16).
- **Why:** J — variant/prop names in docs that don't match source (source wins). A consumer copying `defaultDensity` from the doc gets a silently-ignored prop; `color: 'default'` likewise isn't in the union.
- **Fix:** Update data-table.md: `defaultDensity` → `density`, and bulk-action `color` union to `'accent' | 'error'`.

### [P3][G3] `density` axis uses non-canonical value names (`compact`/`standard`/`comfortable`)
- **Category:** vocabulary
- **Evidence:** data-table-toolbar.tsx:23 `export type Density = 'compact' | 'standard' | 'comfortable'`
- **Why:** G3 — canonical `size` axis is `xs/sm/md/lg/xl`. Density is arguably a distinct, well-understood concept (not a size axis) so this is borderline, but it is a second sizing vocabulary in the family. Flagging as a preference, not a defect.
- **Fix:** Leave as-is unless the DS standardizes a `density` token elsewhere; if so, align. No action needed now.

### [P3][types] Cell-edit value typed `unknown` and stringified; no typed editor slot
- **Category:** types
- **Evidence:** data-table.tsx:149 `onCellEdit?: (rowIndex, columnId, value: unknown) => void`; data-table-body.tsx:146 `initialValue={String(cell.getValue() ?? '')}`
- **Why:** I — editing always coerces to a text `<input>` and emits an `unknown` string; no per-column editor type (number/select/date). Acceptable for v1 but limits typed editing.
- **Fix:** Future: allow `meta.editor` to supply a typed cell editor; keep `unknown` only at the boundary.

### [P3][structural] `getColumnMetaClasses` hardcodes `hideBelow` breakpoints; card view has dead-code comment
- **Category:** structural-tell
- **Evidence:** data-table-card.tsx:104-113 — a `meta?.hideBelow` block that computes nothing (empty `if` bodies with only comments)
- **Why:** Dead conditional left in source reads like unfinished generated code; no behavioural effect.
- **Fix:** Remove the no-op `if` block (or implement the intended skip). Cosmetic.

---

## Composability gaps
- **Re-rolls Card** for mobile rows + skeleton instead of composing `<Card>`/`<CardContent>` (F5) — the single biggest gap vs the StatCard bar.
- **~35 flat feature-flag props**; the real sub-components (`DataTableToolbar`, `DataTablePagination`, `DataTableBulkActions`, `DataTableCards`) exist but are gated behind booleans and not exported for consumer composition (F3).
- **`bulkActions` is a config array** that re-implements Button internally rather than accepting `<Button>` children — no access to icons/soft/loading (F1).
- **`emptyState` / `renderExpanded` are prop-injected regions** rather than slots (acceptable, but it's the bespoke-prop pattern).
- **Raw `<input>`/`<select>` everywhere** instead of composing DS `Input`/`Select` — four duplicated input recipes (G2).
- No `asChild` anywhere, but this is a table orchestrator, not a polymorphic leaf — F2 not applicable.

## Motion gaps
- **No reduced-motion guard** on the sort-arrow rotation, expand-chevron rotation, or the bulk-bar slide (M3) — `withReducedMotion()` exists in the lib but isn't wired in here; verify whether a top-level `MotionConfig reducedMotion="user"` covers it.
- **Bulk bar uses a CSS `animate-in slide-in-from-bottom` keyframe** (layout-ish slide) rather than the framer-motion `springs` vocabulary used elsewhere; M5/M2 — inconsistent with StatCard.
- **Bulk bar has no exit animation** — conditionally unmounted, so it pops out (M4 asymmetry).
- Sort-arrow `AnimatePresence` enter/exit is well done (clean, mode="wait", differentiated) — that part meets the bar.

## Polish plan (ordered steps to reach the finish bar)
1. **Compose Card in the mobile view** (data-table-card.tsx): replace the hand-rolled `rounded-surface border bg-surface-raised p-ds-04` rows and skeletons with `<Card variant="outline">`/`<CardContent>`; express selection via `data-state=selected` instead of a stacked `ring-2`. Kills F5 + V2 at once.
2. **Replace raw inputs/select** (search, column filter, cell-edit, page-size) with DS `Input`/`Select`. Kills G2 + the four focus-ring H findings + the `outline-hidden` regressions.
3. **Add keyboard + focus-visible coverage**: `onRowClick` rows get `tabIndex`/key handler/role; sort button and `toolbarButtonClass` get the DS `focus-ring`.
4. **Move the bulk bar onto framer-motion** `AnimatePresence` + `springs` with symmetric enter/exit; add reduced-motion handling to it and to the sort/expand rotations (M3/M4/M5).
5. **Fix the doc drift**: `defaultDensity`→`density`, bulk-action `color` union `'accent'|'error'` (J).
6. **Composition pass (v0.45+, flag don't rush)**: export the sub-components and add a `renderBulkActions` slot so the flat API becomes the easy mode over a composable core (F1/F3).
7. Remove the dead `hideBelow` no-op block (P3 cleanup).

## Clean (rubric dims that pass)
- **V1 accent rail** — none. No colored left/top stripe on any surface.
- **V3 gradient text** — none. No `bg-clip-text`. (The sparkline `linearGradient` in StatCard is a legit chart fill, not in this unit.)
- **V4 framework palette** — none. All color via semantic tokens (`accent-*`, `success-*`, `error-*`, `surface-*`); no indigo/violet/slate as brand.
- **V5 emoji** — none in source/story/doc/JSDoc.
- **V6 blob/glass/glow** — none. Bulk bar uses `shadow-floating` token, not a colored glow.
- **V7 rounded-everything** — uses `rounded-surface`/`rounded-control`/`rounded-overlay`/`rounded-pill` tokens consistently; no `rounded-3xl` reflex.
- **V8 pill spam / V10 decorative numbering / V12 eyebrow / V14 all-caps** — none.
- **E1–E8 verbal tells** — JSDoc and doc copy are direct and prescriptive; no em-dash tic, no "delve/robust/seamless", no contrastive negation, no chatbot artifacts. (One JSDoc closer "feel free to combine props creatively!" is a mild E5-ish flourish inherited from the Card/StatCard template — borderline, not flagged as a defect since it's house-consistent.)
- **G1 surface** — `bg-surface-base` on sticky header/pinned cells is the correct occluding page surface; `bg-surface-raised` on hover/expanded rows is intentional row emphasis. Not surface drift.
- **G3 variant/size axes** — bulk-action `color` is canonical (`accent`/`error`); `density` is the only borderline axis (P3).
- **I types** — generics `<TData, TValue>` throughout, no `any` in the public surface, `displayName` set, props interface exported. Solid.
- **State coverage (data)** — loading skeleton (+`aria-busy`), empty/custom-empty, selected (`data-state`), disabled-select-row, controlled+uncontrolled selection, server+client sort/pagination all handled and tested. Strong test suite (data-table-integration.test.tsx, 9 feature blocks + axe).
- **Sort-arrow motion** — `AnimatePresence mode="wait"` with differentiated enter/exit rotations meets the intentional-motion bar.
