---
"@devalok/shilp-sutra": minor
---

**DataTable:** fix mount echo, virtualRows+expandable overlap, enableExport wiring, filterable+card gap — and add filterableColumns, rowClassName, onSelectionChange IDs

**Bug fixes (closes #212, #213, #249):**

- `onSelectionChange` no longer fires on mount with `[]`. A first-render guard (`isFirstRenderRef`) was added alongside the existing `isSyncingFromPropRef`. Any handler that called `router.refresh()`, triggered a refetch, or wrote to external state would cascade from this single spurious call.

- `virtualRows + expandable` was a silent no-op: `DataTableExpandedRow` was only rendered in the non-virtual path. The expand toggle fired, `row.getIsExpanded()` returned `true`, zero content appeared. Fixed completely rather than partially: each windowed row now renders as its own `<tbody>` carrying `data-index` and the virtualizer's `measureElement` ref, with `aria-hidden` spacer row groups reserving the un-rendered remainder. Because the measured group holds both the data row and its expanded detail row, the panel's real height lands in `getTotalSize()` — it can no longer resolve to the same offset as the row below it and paint on top of it.

- `filterable + mobileView="card"`: filter inputs now render above the card list in `DataTableCards`. Previously lived inside `<thead>` which card mode never renders.

**Changed (virtual rendering — visual):**

- Virtual rows are no longer absolutely positioned with a forced `height: virtualRowHeight` and `display: flex` cells. They sit in normal table flow at their measured height, so column widths track `<thead>` again instead of being divided evenly. `virtualRowHeight` is now the pre-measurement ESTIMATE: it sets the initial scroll extent and how many rows render before the first measurement pass, not the final row height.

**New props (closes #250 — all backward compatible):**

- `onSelectionChange` second arg: `selectedIds: Set<string>` — complement of the `selectedIds` controlled prop. Existing single-arg handlers unaffected.
- `filterableColumns?: string[]` — restrict filter inputs to specific column IDs without touching `ColumnDef`.
- `rowClassName?: (row: TData) => string | undefined` — conditional classes on the `<tr>` (table layout) or the `Card` (card layout).
- `enableExport?: boolean` — was stranded on `DataTableToolbar` and never forwarded through `DataTableProps`. Now exposed. **The default is unchanged (`true`):** the Export button has rendered unconditionally since the toolbar existed, so defaulting it off — even only under server-side `pagination` — would silently delete a live affordance on upgrade. Opt out with `enableExport={false}`.
- `onExport?: (visibleRows: TData[]) => void` — replaces the built-in CSV export. `DataTableToolbar.onExport` was widened from `() => void` to the same signature (a widening: a `() => void` handler still assigns), so the prop forwards straight through and the two components no longer carry two different `onExport` shapes.
