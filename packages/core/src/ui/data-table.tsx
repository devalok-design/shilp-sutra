'use client'

import { IconChevronRight, IconSearch } from '@tabler/icons-react'
import {
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnPinningState,
  type ExpandedState,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type Row,
  type RowData,
  type RowSelectionState,
  type SortingState,
  type TableState,
  type Updater,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Checkbox } from './checkbox'
import { DataTableBody } from './data-table-body'
import { type BulkAction,DataTableBulkActions } from './data-table-bulk-actions'
import { DataTableCards } from './data-table-card'
import {
  DataTableProvider,
  type EditingCell,
} from './data-table-context'
import { DataTableHeader } from './data-table-header'
import { DataTablePagination } from './data-table-pagination'
import { DataTableToolbar, type Density } from './data-table-toolbar'
import { Icon } from './icon'
import { cn } from './lib/utils'
import { Table } from './table'

// Re-export public types so consumers' imports don't break
export type { BulkAction } from './data-table-bulk-actions'

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    align?: 'left' | 'center' | 'right'
    hideBelow?: 'sm' | 'md' | 'lg'
  }
}

/**
 * Props for DataTable — a feature-rich TanStack Table wrapper supporting sorting, filtering,
 * pagination, row selection, inline editing, row expansion, column pinning, and virtualization.
 *
 * All features are opt-in via boolean flags. The component manages its own internal state for
 * sorting, filtering, pagination, and selection — just pass `columns` and `data`.
 *
 * **Feature flags:** `sortable` | `filterable` | `globalFilter` | `paginated` | `selectable` |
 * `toolbar` | `editable` | `expandable` | `virtualRows`
 *
 * **Columns:** Use TanStack Table's `ColumnDef<TData, TValue>` type. Set
 * `meta: { enableEditing: false }` on a column to disable cell editing for that column.
 *
 * @example
 * // Minimal read-only table:
 * const columns: ColumnDef<User, string>[] = [
 *   { accessorKey: 'name', header: 'Name' },
 *   { accessorKey: 'email', header: 'Email' },
 * ]
 * <DataTable columns={columns} data={users} />
 *
 * @example
 * // Full-featured admin table with sorting, pagination, and selection:
 * <DataTable
 *   columns={projectColumns}
 *   data={projects}
 *   sortable
 *   paginated
 *   pageSize={20}
 *   selectable
 *   onSelectionChange={(rows) => setSelectedProjects(rows)}
 *   toolbar
 * />
 *
 * @example
 * // Virtualized table for large datasets (10k+ rows):
 * <DataTable
 *   columns={logColumns}
 *   data={allLogs}
 *   virtualRows
 *   virtualRowHeight={40}
 *   maxHeight={500}
 * />
 *
 * @example
 * // Table with expandable rows for nested detail:
 * <DataTable
 *   columns={orderColumns}
 *   data={orders}
 *   expandable
 *   renderExpanded={(order) => <OrderLineItems items={order.lineItems} />}
 * />
 * // These are just a few ways — feel free to combine props creatively!
 */
/**
 * A full-featured data table built on TanStack Table with sorting, filtering,
 * pagination, row selection, inline cell editing, expandable rows, column pinning,
 * a toolbar with density/export controls, and optional row virtualization.
 */
export interface DataTableProps<TData, TValue> {
  /** Column definitions passed to TanStack Table. */
  columns: ColumnDef<TData, TValue>[]
  /** Row data */
  data: TData[]
  /** Additional class name for the wrapper div */
  className?: string
  /** Text shown when the table has no rows */
  noResultsText?: string
  /** Enable column sorting (click headers to sort) */
  sortable?: boolean
  /** Enable per-column filter inputs below headers */
  filterable?: boolean
  /** Enable a global search input above the table */
  globalFilter?: boolean
  /** Enable pagination controls below the table */
  paginated?: boolean
  /** Number of rows per page when paginated (default 10) */
  pageSize?: number
  /** Options for the page size selector dropdown (default [10, 20, 50, 100]) */
  pageSizeOptions?: number[]
  /** Enable row selection with checkboxes */
  selectable?: boolean
  /** Callback when row selection changes */
  onSelectionChange?: (selectedRows: TData[]) => void
  /** Show toolbar above the table with column visibility, density, and export controls */
  toolbar?: boolean
  /** Row density — controls cell vertical padding */
  density?: Density
  /** Initial column pinning configuration */
  columnPinning?: { left?: string[]; right?: string[] }

  // --- Cell Editing ---
  /** Enable inline cell editing (double-click to edit) */
  editable?: boolean
  /** Callback when a cell value is edited */
  onCellEdit?: (rowIndex: number, columnId: string, value: unknown) => void

  // --- Row Expansion ---
  /** Enable expandable rows with detail panels */
  expandable?: boolean
  /** Render function for expanded row content */
  renderExpanded?: (row: TData) => React.ReactNode

  // --- Virtualization ---
  /** Enable row virtualization for large datasets */
  virtualRows?: boolean
  /** Height of each virtual row in pixels (default 48) */
  virtualRowHeight?: number
  /** Maximum height of the scrollable container in pixels (default 600) */
  maxHeight?: number

  // --- Server-side sorting ---
  /** Callback for server-side sorting. When provided, sorting is manual (no client-side sort). */
  onSort?: (key: string, direction: 'asc' | 'desc' | false) => void

  // --- Empty state ---
  /** Custom ReactNode to render when data is empty (replaces noResultsText) */
  emptyState?: React.ReactNode

  // --- Loading ---
  /** Show shimmer skeleton rows instead of data */
  loading?: boolean

  // --- Controlled selection ---
  /** Controlled set of selected row IDs — syncs internal selection state */
  selectedIds?: Set<string>
  /** Per-row filter to determine if a row is selectable */
  selectableFilter?: (row: TData) => boolean
  /** Custom row ID getter */
  getRowId?: (row: TData) => string

  // --- Server-side pagination ---
  /** Server-side pagination config. When provided, pagination is manual. */
  pagination?: {
    page: number
    pageSize: number
    total: number
    onPageChange: (page: number) => void
  }

  // --- Single-expand mode ---
  /** When true, only one row can be expanded at a time */
  singleExpand?: boolean

  // --- Sticky header ---
  /** When true, the table header sticks to the top on scroll */
  stickyHeader?: boolean

  // --- Row click ---
  /** Callback when a row is clicked (not fired from interactive elements) */
  onRowClick?: (row: TData) => void

  // --- Bulk actions ---
  /** Actions shown in a floating bar when rows are selected */
  bulkActions?: BulkAction<TData>[]

  // --- Mobile view ---
  /** Render rows as stacked cards on small screens (below sm breakpoint). Default 'table'. */
  mobileView?: 'card' | 'table'
}

export function DataTable<TData, TValue>({
  columns,
  data,
  className,
  noResultsText,
  sortable = false,
  filterable = false,
  globalFilter = false,
  paginated = false,
  pageSize: initialPageSize,
  pageSizeOptions,
  selectable = false,
  onSelectionChange,
  toolbar = false,
  density: initialDensity = 'standard',
  columnPinning: initialColumnPinning,
  editable = false,
  onCellEdit,
  expandable = false,
  renderExpanded,
  virtualRows = false,
  virtualRowHeight = 48,
  maxHeight = 600,
  onSort,
  emptyState,
  loading = false,
  selectedIds,
  selectableFilter,
  getRowId: getRowIdProp,
  pagination: serverPagination,
  singleExpand = false,
  stickyHeader = false,
  onRowClick,
  bulkActions,
  mobileView = 'table',
}: DataTableProps<TData, TValue>) {
  // Detect below-sm viewport (640px) for card mode — separate from useIsMobile (768px)
  const [isBelowSm, setIsBelowSm] = useState(false)
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 639px)')
    const onChange = () => setIsBelowSm(mql.matches)
    mql.addEventListener('change', onChange)
    setIsBelowSm(mql.matches)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  const showCards = mobileView === 'card' && isBelowSm

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilterValue, setGlobalFilterValue] = useState('')
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: serverPagination ? serverPagination.page - 1 : 0,
    pageSize: serverPagination?.pageSize ?? initialPageSize ?? 10,
  })
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnPinningState, setColumnPinningState] =
    useState<ColumnPinningState>({
      left: initialColumnPinning?.left ?? [],
      right: initialColumnPinning?.right ?? [],
    })
  const [density, setDensity] = useState<Density>(initialDensity)
  const [editingCell, setEditingCell] = useState<EditingCell>(null)
  const [expanded, setExpanded] = useState<ExpandedState>({})

  // Ref for the virtual scroll container
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Guard to prevent onSelectionChange firing when syncing from selectedIds prop
  const isSyncingFromPropRef = useRef(false)

  // Sync controlled selectedIds to internal rowSelection
  useEffect(() => {
    if (selectedIds) {
      isSyncingFromPropRef.current = true
      const newSelection: RowSelectionState = {}
      selectedIds.forEach((id) => {
        newSelection[id] = true
      })
      setRowSelection(newSelection)
    }
  }, [selectedIds])

  // Sync server pagination page to internal state
  useEffect(() => {
    if (serverPagination) {
      setPaginationState((prev) => ({
        ...prev,
        pageIndex: serverPagination.page - 1,
        pageSize: serverPagination.pageSize,
      }))
    }
  }, [serverPagination?.page, serverPagination?.pageSize]) // eslint-disable-line react-hooks/exhaustive-deps

  // Server-side sorting handler
  const handleSortingChange = useCallback(
    (updater: Updater<SortingState>) => {
      setSorting((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater
        if (onSort) {
          if (next.length === 0 && prev.length > 0) {
            // Sorting cleared
            onSort(prev[0].id, false)
          } else if (next.length > 0) {
            onSort(next[0].id, next[0].desc ? 'desc' : 'asc')
          }
        }
        return next
      })
    },
    [onSort],
  )

  // Single-expand handler
  const handleExpandedChange = useCallback(
    (updater: Updater<ExpandedState>) => {
      setExpanded((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater
        if (!singleExpand) return next
        // If next is boolean true (expand all), just use it
        if (next === true) return next
        if (typeof next !== 'object') return next
        // Determine which row was just toggled on
        const prevKeys = typeof prev === 'object' ? Object.keys(prev).filter((k) => (prev as Record<string, boolean>)[k]) : []
        const nextKeys = Object.keys(next).filter((k) => (next as Record<string, boolean>)[k])
        // Find newly expanded row
        const newlyExpanded = nextKeys.filter((k) => !prevKeys.includes(k))
        if (newlyExpanded.length > 0) {
          // Keep only the most recently expanded row
          return { [newlyExpanded[newlyExpanded.length - 1]]: true } as ExpandedState
        }
        // If no new rows, means a row was collapsed — return as-is
        return next
      })
    },
    [singleExpand],
  )

  // Stable ref for server pagination callback to avoid useCallback invalidation
  const onPageChangeRef = useRef(serverPagination?.onPageChange)
  useEffect(() => {
    onPageChangeRef.current = serverPagination?.onPageChange
  }, [serverPagination?.onPageChange])

  // Server-side pagination handler
  const handlePaginationChange = useCallback(
    (updater: Updater<PaginationState>) => {
      setPaginationState((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater
        if (onPageChangeRef.current) {
          // Only call onPageChange if the page actually changed
          if (next.pageIndex !== prev.pageIndex) {
            onPageChangeRef.current(next.pageIndex + 1)
          }
        }
        return next
      })
    },
    [],
  )

  // Checkbox column prepended when selectable is enabled
  const selectColumn: ColumnDef<TData, unknown> = {
    id: '_select',
    header: ({ table: t }) => (
      <Checkbox
        size="sm"
        checked={t.getIsAllPageRowsSelected()}
        indeterminate={t.getIsSomePageRowsSelected()}
        onCheckedChange={(v) => t.toggleAllPageRowsSelected(!!v)}
        aria-label="Select all rows"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        size="sm"
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onCheckedChange={(v) => row.toggleSelected(!!v)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableColumnFilter: false,
    enableHiding: false,
  }

  // Expand toggle column
  const expandColumn: ColumnDef<TData, unknown> = {
    id: '_expand',
    header: () => null,
    cell: ({ row }) => (
      <button
        type="button"
        onClick={() => row.toggleExpanded()}
        aria-label={row.getIsExpanded() ? 'Collapse row' : 'Expand row'}
        className="flex items-center justify-center p-ds-01 rounded-control-inner hover:bg-surface-raised-hover transition-colors"
      >
        <Icon
          icon={IconChevronRight}
          size="sm"
          className={cn(
            'transition-transform duration-moderate-02',
            row.getIsExpanded() && 'rotate-90',
          )}
        />
      </button>
    ),
    enableSorting: false,
    enableColumnFilter: false,
    enableHiding: false,
  }

  // Assemble all columns in order: select?, expand?, ...user columns
  const allColumns = [
    ...(selectable ? [selectColumn] : []),
    ...(expandable ? [expandColumn] : []),
    ...columns,
  ]

  // Determine if using server-side pagination
  const useServerPagination = !!serverPagination
  const showPagination = paginated || useServerPagination

  // Build state object once — sorting and filtering contribute independently
  const tableState: Partial<TableState> = {
    columnVisibility,
    columnPinning: columnPinningState,
  }
  if (sortable) tableState.sorting = sorting
  if (filterable || globalFilter) {
    tableState.columnFilters = columnFilters
    tableState.globalFilter = globalFilterValue
  }
  if (showPagination) tableState.pagination = paginationState
  if (selectable) tableState.rowSelection = rowSelection
  if (expandable) tableState.expanded = expanded

  // Determine server-side sort mode
  const isServerSort = sortable && !!onSort

  const table = useReactTable({
    data,
    columns: allColumns,
    state: tableState,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnPinningChange: setColumnPinningState,
    getCoreRowModel: getCoreRowModel(),
    ...(sortable && {
      onSortingChange: isServerSort ? handleSortingChange : setSorting,
      ...(isServerSort
        ? { manualSorting: true }
        : { getSortedRowModel: getSortedRowModel() }),
    }),
    ...((filterable || globalFilter) && {
      onColumnFiltersChange: setColumnFilters,
      onGlobalFilterChange: setGlobalFilterValue,
      getFilteredRowModel: getFilteredRowModel(),
    }),
    ...(showPagination && {
      onPaginationChange: useServerPagination
        ? handlePaginationChange
        : setPaginationState,
      ...(useServerPagination
        ? {
            manualPagination: true,
            pageCount: Math.ceil(
              serverPagination!.total / serverPagination!.pageSize,
            ),
          }
        : { getPaginationRowModel: getPaginationRowModel() }),
    }),
    ...(selectable && {
      onRowSelectionChange: setRowSelection,
      enableRowSelection: selectableFilter
        ? (row: Row<TData>) => selectableFilter(row.original)
        : true,
    }),
    ...(expandable && {
      onExpandedChange: singleExpand ? handleExpandedChange : setExpanded,
      getExpandedRowModel: getExpandedRowModel(),
    }),
    ...(getRowIdProp && {
      getRowId: (row: TData) => getRowIdProp(row),
    }),
  })

  // Stable refs to avoid effect re-fires from inline callbacks
  const onSelectionChangeRef = useRef(onSelectionChange)
  const getRowIdRef = useRef(getRowIdProp)
  useEffect(() => {
    onSelectionChangeRef.current = onSelectionChange
    getRowIdRef.current = getRowIdProp
  }, [onSelectionChange, getRowIdProp])

  // Fire selection callback when row selection changes (skip when syncing from prop)
  useEffect(() => {
    if (isSyncingFromPropRef.current) {
      isSyncingFromPropRef.current = false
      return
    }
    if (!onSelectionChangeRef.current) return
    const selectedRowIds = Object.keys(rowSelection).filter((k) => rowSelection[k])
    const selected = data.filter((_, i) => {
      const id = getRowIdRef.current ? getRowIdRef.current(data[i]) : String(i)
      return selectedRowIds.includes(id)
    })
    onSelectionChangeRef.current(selected)
  }, [rowSelection, data])

  const rows = table.getRowModel().rows

  // Virtualizer — always called but only active when virtualRows is true
  const virtualizer = useVirtualizer({
    count: virtualRows ? rows.length : 0,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => virtualRowHeight,
    overscan: 10,
  })

  // Number of skeleton rows for loading state
  const skeletonRowCount = serverPagination?.pageSize ?? initialPageSize ?? 5

  // Get selected rows for bulk actions (derived from rowSelection + data, not table instance)
  const selectedRows = useMemo(() => {
    if (!bulkActions || !selectable) return []
    const selectedRowIds = Object.keys(rowSelection).filter((k) => rowSelection[k])
    return data.filter((_, i) => {
      const id = getRowIdProp ? getRowIdProp(data[i]) : String(i)
      return selectedRowIds.includes(id)
    })
  }, [bulkActions, selectable, rowSelection, data, getRowIdProp])

  const hasSelectedRows = selectedRows.length > 0

  // Total rows for pagination display
  const totalRowCount = useServerPagination
    ? serverPagination!.total
    : table.getFilteredRowModel().rows.length

  // Build context value for sub-components
  const contextValue = useMemo(
    () => ({
      table,
      allColumns: allColumns.map((col) => ({
        id: (col as { id?: string }).id,
        header: (col as { header?: unknown }).header,
      })),
      columnPinningState,
      sortable,
      filterable,
      editable,
      expandable,
      virtualRows,
      selectable,
      mobileView,
      editingCell,
      setEditingCell,
      onCellEdit,
      renderExpanded,
      onRowClick,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      table,
      allColumns.length,
      columnPinningState,
      sortable,
      filterable,
      editable,
      expandable,
      virtualRows,
      selectable,
      mobileView,
      editingCell,
      onCellEdit,
      renderExpanded,
      onRowClick,
    ],
  )

  // Virtual items for body
  const virtualItems = virtualRows ? virtualizer.getVirtualItems() : undefined
  const totalVirtualSize = virtualRows ? virtualizer.getTotalSize() : undefined

  // Determine if we need a scroll wrapper for virtualization
  const tableContent = (
    <Table density={density} aria-busy={loading || undefined}>
      <DataTableHeader stickyHeader={stickyHeader} />
      <DataTableBody
        loading={loading}
        skeletonRowCount={skeletonRowCount}
        noResultsText={noResultsText}
        emptyState={emptyState}
        virtualItems={virtualItems}
        totalVirtualSize={totalVirtualSize}
      />
    </Table>
  )

  return (
    <DataTableProvider value={contextValue}>
      <div className={cn(className)}>
        {/* Toolbar */}
        {toolbar && (
          <DataTableToolbar
            table={table}
            globalFilter={globalFilter}
            globalFilterValue={globalFilterValue}
            onGlobalFilterChange={setGlobalFilterValue}
            density={density}
            onDensityChange={setDensity}
          />
        )}

        {/* Global search input — only show standalone when toolbar is disabled */}
        {globalFilter && !toolbar && (
          <div className="flex items-center gap-ds-03 pb-ds-04 border-b border-surface-border mb-ds-04">
            <Icon icon={IconSearch} size="sm" className="text-surface-fg-subtle" />
            <input
              type="text"
              value={globalFilterValue}
              onChange={(e) => setGlobalFilterValue(e.target.value)}
              placeholder="Search all columns..."
              aria-label="Search all columns"
              className={cn(
                'flex-1 bg-transparent text-ds-md',
                'text-surface-fg placeholder:text-surface-fg-subtle',
                'outline-hidden',
              )}
            />
          </div>
        )}

        {/* Card view on small screens, or standard table */}
        {showCards ? (
          <DataTableCards
            loading={loading}
            skeletonRowCount={skeletonRowCount}
            noResultsText={noResultsText}
            emptyState={emptyState}
          />
        ) : virtualRows ? (
          <div
            ref={scrollContainerRef}
            style={{ maxHeight: `${maxHeight}px`, overflowY: 'auto' }}
          >
            {tableContent}
          </div>
        ) : (
          tableContent
        )}

        {/* Pagination controls */}
        {showPagination && (
          <DataTablePagination
            table={table}
            totalRowCount={totalRowCount}
            useServerPagination={useServerPagination}
            pageSizeOptions={pageSizeOptions}
          />
        )}

        {/* Bulk action bar */}
        {bulkActions && selectable && hasSelectedRows && (
          <DataTableBulkActions
            table={table}
            selectedRows={selectedRows}
            bulkActions={bulkActions}
          />
        )}
      </div>
    </DataTableProvider>
  )
}
DataTable.displayName = 'DataTable'
