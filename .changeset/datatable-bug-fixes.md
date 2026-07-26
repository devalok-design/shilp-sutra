---
"@devalok/shilp-sutra": minor
---

**DataTable:** fix mount echo, virtualRows+expandable silent no-op, enableExport wiring, filterable+card gap — and add filterableColumns, rowClassName, onSelectionChange IDs

**Bug fixes (closes #212, #213, #249):**

- `onSelectionChange` no longer fires on mount with `[]`. A first-render guard (`isFirstRenderRef`) was added alongside the existing `isSyncingFromPropRef`. Any handler that called `router.refresh()`, triggered a refetch, or wrote to external state would cascade from this single spurious call.

- `virtualRows + expandable` was a silent no-op: `DataTableExpandedRow` was only rendered in the non-virtual path. The expand toggle fired, `row.getIsExpanded()` returned `true`, zero content appeared. Fixed by rendering the expanded row in the virtual items map. DEV `console.warn` added for the fixed-height limitation.

- `enableExport` existed on `DataTableToolbar` but was never forwarded through `DataTableProps`. Added alongside `onExport`. Defaults to `false` when server-side `pagination` is active.

- `filterable + mobileView="card"`: filter inputs now render above the card list in `DataTableCards`. Previously lived inside `<thead>` which card mode never renders.

**New props (closes #250 — all backward compatible):**

- `onSelectionChange` second arg: `selectedIds: Set<string>` — complement of the `selectedIds` controlled prop. Existing single-arg handlers unaffected.
- `filterableColumns?: string[]` — restrict filter inputs to specific column IDs without touching `ColumnDef`.
- `rowClassName?: (row: TData) => string | undefined` — conditional classes on `<tr>` in table and card layouts.
- `enableExport?: boolean` and `onExport?: (visibleRows: TData[]) => void` — control or override CSV export from `DataTableProps`.
