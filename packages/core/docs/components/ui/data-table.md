# DataTable

- Import: @devalok/shilp-sutra/ui/data-table
- Server-safe: No
- Category: ui

## Props
    columns: ColumnDef<TData>[] (TanStack column definitions)
    data: TData[]
    sortable: boolean — enable column sorting
    onSort: (key: string, dir: 'asc' | 'desc' | false) => void — server-side sort callback (enables manualSorting)
    filterable: boolean — enable per-column filters
    globalFilter: boolean — enable global search
    paginated: boolean — enable client-side pagination
    pagination: { page: number, pageSize: number, total: number, onPageChange: (page: number) => void } — server-side pagination (1-based page)
    pageSize: number (default 10)
    selectable: boolean — enable row selection with checkboxes
    selectedIds: Set<string> — controlled selection state
    selectableFilter: (row: TData) => boolean — disable selection on certain rows
    getRowId: (row: TData) => string — custom row ID accessor
    onSelectionChange: (selectedRows: TData[]) => void
    expandable: boolean — enable row expansion
    renderExpanded: (row: TData) => ReactNode — expanded row content
    singleExpand: boolean — only one row expanded at a time
    loading: boolean — show skeleton shimmer rows
    emptyState: ReactNode — custom empty state (takes precedence over noResultsText)
    noResultsText: string (default "No results.")
    stickyHeader: boolean — sticky table header
    onRowClick: (row: TData) => void — row click handler (excludes interactive element clicks)
    bulkActions: BulkAction<TData>[] — floating action bar on selection — { label, onClick, color?: 'default'|'error', disabled? }
    toolbar: boolean — show DataTableToolbar (column visibility, density, CSV export)
    editable: boolean — enable double-click cell editing
    virtualRows: boolean — virtualize rows for large datasets
    columnPinning: { left?: string[], right?: string[] }
    density: 'compact' | 'standard' | 'comfortable'

## Defaults
    pageSize=10, noResultsText="No results."

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

**Virtualization:** `virtualRows={true}` enables row virtualization via `@tanstack/react-virtual`. Turn it on for 1000+ row datasets; the scroll container must have a bounded height.

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

## Changes
### v0.45.0
- **Fixed** Expander a11y per the expando-row spec: `aria-expanded` on the toggle button, visually-hidden "Expand rows" column header; chevron rotation uses `duration-fast-02 ease-productive-standard`.
- **Added** Expanded-row content animates open/closed (height + opacity via framer, `springs.smooth`), self-guarded with `useReducedMotion` — instant swap for reduced-motion users. Virtualized tables keep the instant reveal (a height animation would fight the virtualizer's measurements).
- **Changed** Density now drives Table's `--table-py` variable (rows ≈ 29 / 37 / 45px; was 29 / 53 / 85). Per-cell `cellPadding` threading removed from context.
- **Fixed** Hover/selected states visible on cards: row/sort-button/expander hover use `surface-raised-hover` (was the invisible `surface-raised`); expanded row is a `surface-base` recess; sticky header bg is `surface-raised`; empty state uses `py-ds-07` (was raw `h-24`).
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
