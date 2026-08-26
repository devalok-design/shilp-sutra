# DataTable

- Import: @devalok/shilp-sutra/ui/data-table
- Server-safe: No
- Category: ui

## Props
    columns: ColumnDef<TData, TValue>[] (TanStack column definitions)
    data: TData[]
    className: string — class name for the wrapper div
    sortable: boolean — enable column sorting
    onSort: (key: string, direction: 'asc' | 'desc' | false) => void — server-side sort callback (enables manualSorting)
    filterable: boolean — enable per-column filters
    filterableColumns: string[] — restrict filter inputs to these column IDs (only with filterable; omit for all filterable columns)
    globalFilter: boolean — enable global search
    paginated: boolean — enable client-side pagination
    pagination: { page: number, pageSize: number, total: number, onPageChange: (page: number) => void } — server-side pagination (1-based page)
    pageSize: number (default 10)
    pageSizeOptions: number[] — page-size selector options (default [10, 20, 50, 100])
    selectable: boolean — enable row selection with checkboxes
    selectedIds: Set<string> — controlled selection state
    selectableFilter: (row: TData) => boolean — disable selection on certain rows
    getRowId: (row: TData) => string — custom row ID accessor
    onSelectionChange: (selectedRows: TData[], selectedIds: Set<string>) => void — does NOT fire on mount
    expandable: boolean — enable row expansion
    renderExpanded: (row: TData) => ReactNode — expanded row content
    singleExpand: boolean — only one row expanded at a time
    loading: boolean — show skeleton shimmer rows
    emptyState: ReactNode — custom empty state (takes precedence over noResultsText)
    noResultsText: string (default "No results.")
    stickyHeader: boolean — sticky table header
    onRowClick: (row: TData) => void — row click handler (excludes interactive element clicks)
    rowClassName: (row: TData) => string | undefined — conditional per-row class (the <tr> in table mode, the Card in card mode)
    bulkActions: BulkAction<TData>[] — floating action bar on selection — { label, onClick, icon?: IconInput, color?: 'accent'|'error', disabled? }
    bulkActionsPosition: 'bottom' | 'top' | 'inline' — where the bulk-actions bar renders (default 'bottom')
    toolbar: boolean — show DataTableToolbar (column visibility, density, CSV export)
    enableExport: boolean — show the toolbar's Export CSV button (default true)
    onExport: (visibleRows: TData[]) => void — replace the built-in CSV export
    editable: boolean — enable double-click cell editing
    onCellEdit: (rowIndex: number, columnId: string, value: unknown) => void — fired on cell edit commit
    virtualRows: boolean — virtualize rows for large datasets
    virtualRowHeight: number — ESTIMATED row height in px (default 48); real heights are measured after mount
    maxHeight: number — max height of the virtual scroll container in px (default 600)
    mobileView: 'card' | 'table' — stacked cards below the sm breakpoint (default 'table')
    columnPinning: { left?: string[], right?: string[] }
    density: 'compact' | 'standard' | 'comfortable'

## Defaults
    pageSize=10, noResultsText="No results.", enableExport=true, mobileView='table', virtualRowHeight=48, maxHeight=600, density='standard'

## Example
```jsx
import { DataTable } from '@devalok/shilp-sutra/ui/data-table'

<DataTable
  columns={[
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'email', header: 'Email' },
  ]}
  data={users}
  sortable
  onSort={(key, dir) => handleSort(key, dir)}
  pagination={{ page, pageSize: 20, total: totalCount, onPageChange: setPage }}
  loading={isLoading}
  emptyState={<EmptyState title="No users" />}
/>
```

## Composability
**Server vs client mode is prop-driven, not explicit.**
- Pass `onSort` → server-side sort (manual, rows stay in data order — you're responsible for re-fetching).
- Pass `pagination` object → server-side pagination (manual, pass total count).
- Omit both → client-side sort/pagination via TanStack react-table.
- Mix-and-match: `onSort` + no pagination = server sort + client pagination.

**Companion components:**
- `DataTableToolbar` — enabled via `toolbar={true}`. Provides column visibility, density switcher, CSV export. Reads table state via `DataTableContext` (internal). Rendered ABOVE the table automatically.
- `BulkActionBar` (floating) — appears when rows are selected AND `bulkActions` array is non-empty. Synced with `selectedIds`; shows count + action buttons.
- `EmptyState` from `@devalok/shilp-sutra/composed` — pass to `emptyState` prop. Takes precedence over `noResultsText` string.

**Controlled selection:**
- Pass `selectedIds` (Set<string>) + `onSelectionChange` for controlled row selection.
- Provide `getRowId: (row) => row.id` so selection survives data refetches (otherwise TanStack uses array index, which breaks on sort/filter).
- `selectableFilter: (row) => boolean` disables selection on specific rows (e.g. archived items).

**Row click model:**
- `onRowClick` fires on row-level click BUT excludes clicks on checkboxes, buttons, links, and inputs automatically. No manual `stopPropagation` needed for standard interactive elements.

**Virtualization:** `virtualRows={true}` enables row virtualization via `@tanstack/react-virtual`. Turn it on for 1000+ row datasets; the scroll container must have a bounded height. Rows stay in normal table flow (each windowed row is its own `<tbody>` measured by the virtualizer, with spacer row groups reserving the un-rendered remainder), so column widths keep tracking `<thead>` and `virtualRowHeight` is only the pre-measurement estimate.

**Virtualization + expansion:** `virtualRows` and `expandable` compose. Because each row group is measured, an expanded detail panel of any height contributes to the total scroll size and pushes the rows below it down. The reveal is instant in virtual mode (no height animation) — an animating height would fire a resize on every frame.

**Toolbar export:** the Export button renders whenever `toolbar` is on. The built-in CSV export walks `getFilteredRowModel()`, which under server-side `pagination` is only the current page — pass `onExport` to fetch the full set yourself, or `enableExport={false}` to drop the button.

**Density integration:** density is forwarded to `Table`'s `density` prop, which sets `--table-py` (compact 4 / standard 8 / comfortable 12px → rows ≈ 29 / 37 / 45px; header tracks it). DataTableToolbar's density switcher updates this at runtime; the prop sets the initial state only.

## Gotchas
- Barrel-isolated since v0.5.0 — must use `@devalok/shilp-sutra/ui/data-table`, NOT the `ui` barrel
- Requires @tanstack/react-table and @tanstack/react-virtual as peer dependencies
- When onSort is provided, sorting is manual (server-side) — rows stay in data order
- When pagination prop is provided, pagination is manual — pass total count
- selectedIds syncs via useEffect — provide getRowId for custom row IDs
- onRowClick does NOT fire when clicking checkboxes, buttons, links, or inputs
- Use density="compact" for Karm-style h-9 rows
- `virtualRows={true}` requires a bounded scroll container — unbounded height silently disables virtualization
- `onSelectionChange` does NOT fire on mount, and does NOT fire when selection is synced from the `selectedIds` prop — only on genuine selection changes
- `filterableColumns` is ignored unless `filterable` is also set
- `rowClassName` returns are passed through `cn()` verbatim — a class that does not exist in the token set silently does nothing (use the real scale steps, e.g. `bg-error-3`, not invented names like `bg-error-subtle`)

## Changes
### Unreleased
- **Added** `bulkActions[].icon?: IconInput` — icon rendered before the label in a bulk-action button.
- **Added** `bulkActionsPosition?: 'bottom' | 'top' | 'inline'` — where the bulk-actions bar renders (default `'bottom'`, matching prior behavior).

### v0.57.0
- **Fixed** `onSelectionChange` no longer fires on mount with `[]` — first-render guard added. Root cause of the cascade reported in #213.
- **Fixed** `virtualRows + expandable` was a silent no-op — the expanded row was only rendered on the non-virtual path. Virtual rows now render one measured `<tbody>` per windowed row (with spacer row groups for the remainder) so the expanded panel renders, contributes its real height to `getTotalSize()`, and cannot overlap the row below.
- **Changed** Virtual rows are no longer absolutely positioned with a forced `virtualRowHeight`; they sit in normal table flow at their measured height, so column widths track `<thead>`. `virtualRowHeight` is now the pre-measurement ESTIMATE.
- **Fixed** `enableExport` was stranded on `DataTableToolbar` and never wired through `DataTableProps`. Now exposed with an `onExport` override. Default is unchanged (`true`) — the Export button still renders whenever `toolbar` is on.
- **Fixed** `filterable + mobileView="card"` rendered no filter inputs — they now render above the card list in `DataTableCards` (card mode renders no `<thead>` for them to live in).
- **Added** `onSelectionChange` receives `selectedIds: Set<string>` as second argument — complement of the `selectedIds` prop.
- **Added** `filterableColumns?: string[]` — restrict filter inputs to specific column IDs.
- **Added** `rowClassName?: (row: TData) => string | undefined` — conditional row classes in table and card layouts.
- **Added** `enableExport?: boolean` — hide the toolbar's Export CSV button from `DataTableProps`.
- **Added** `onExport?: (visibleRows: TData[]) => void` — override built-in CSV with a custom export handler.

### v0.45.0
- **Fixed** Expander a11y per the expando-row spec: `aria-expanded` on the toggle button, visually-hidden "Expand rows" column header; chevron rotation uses `duration-fast-02 ease-productive-standard`.
- **Added** Expanded-row content animates open/closed (height + opacity via framer, `springs.smooth`), self-guarded with `useReducedMotion` — instant swap for reduced-motion users. Virtualized tables keep the instant reveal (a height animation would fight the virtualizer's measurements).
- **Changed** Density now drives Table's `--table-py` variable (rows ≈ 29 / 37 / 45px; was 29 / 53 / 85). Per-cell `cellPadding` threading removed from context.
- **Fixed** Hover/selected states visible on cards: row/sort-button/expander hover use `surface-panel-hover` (was the invisible `surface-panel`); expanded row is a `surface-base` recess; sticky header bg is `surface-panel`; empty state uses `py-ds-07` (was raw `h-24`).
- **Changed** Mobile card view composes `<Card size="sm" variant="outline">` (was a hand-rolled 12px bordered box).

### v0.29.0
- **Fixed** Controlled selection infinite re-render loop — inline `getRowId` callback caused `onSelectionChange` effect to fire every render, creating a setState cycle with `selectedIds`. Now uses a stable ref for `getRowId`.

### v0.16.1
- **Fixed** `serverPagination` object reference in `useCallback` dependency caused stale closure — now uses stable ref for `onPageChange`
- **Fixed** `onSelectionChange` effect fired every render due to `table` in dependency array — now derives selected rows directly
- **Fixed** `selectedRows` useMemo for bulk actions had same `table` dependency issue

### v0.16.0
- **Added** `onSort` callback for server-side sorting
- **Added** `emptyState` ReactNode slot
- **Added** `loading` prop with shimmer skeleton rows
- **Added** `selectedIds` + `selectableFilter` for controlled selection
- **Added** `pagination` prop for server-side pagination
- **Added** `singleExpand` prop
- **Added** `stickyHeader` prop
- **Added** `onRowClick` handler
- **Added** `bulkActions` floating action bar

### v0.5.0
- **Changed** (BREAKING) Removed from `@devalok/shilp-sutra/ui` barrel export — must use `@devalok/shilp-sutra/ui/data-table`

### v0.1.1
- **Fixed** `useEffect` exhaustive-deps with proper dependency array

### v0.1.0
- **Added** Initial release
