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
    defaultDensity: 'compact' | 'standard' | 'comfortable'

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

## Gotchas
- Barrel-isolated since v0.5.0 — must use `@devalok/shilp-sutra/ui/data-table`, NOT the `ui` barrel
- Requires @tanstack/react-table and @tanstack/react-virtual as peer dependencies
- When onSort is provided, sorting is manual (server-side) — rows stay in data order
- When pagination prop is provided, pagination is manual — pass total count
- selectedIds syncs via useEffect — provide getRowId for custom row IDs
- onRowClick does NOT fire when clicking checkboxes, buttons, links, or inputs
- Use defaultDensity="compact" for Karm-style h-9 rows

## Changes
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
