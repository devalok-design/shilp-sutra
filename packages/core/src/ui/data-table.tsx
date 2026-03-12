'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnPinningState,
  type ExpandedState,
  type PaginationState,
  type Row,
  type RowSelectionState,
  type SortingState,
  type TableState,
  type Updater,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import {
  IconArrowDown,
  IconArrowUp,
  IconArrowsSort,
  IconChevronLeft,
  IconChevronRight,
  IconSearch,
  IconX,
} from '@tabler/icons-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table'
import { Button } from './button'
import { Checkbox } from './checkbox'
import { Skeleton } from './skeleton'
import { cn } from './lib/utils'
import { DataTableToolbar, type Density } from './data-table-toolbar'

const densityPaddingMap: Record<Density, string> = {
  compact: 'py-ds-02',
  standard: 'py-ds-05',
  comfortable: 'py-ds-07',
}

/** Editing state: which cell is currently in edit mode */
type EditingCell = { rowIndex: number; columnId: string } | null

/** Bulk action definition for the floating action bar */
export interface BulkAction<TData> {
  label: string
  onClick: (selectedRows: TData[]) => void
  color?: 'default' | 'error'
  disabled?: boolean
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
export interface DataTableProps<TData, TValue> {
  /** Column definitions passed to TanStack Table */
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
}

/**
 * Inline edit input rendered inside a table cell.
 * Auto-focuses, saves on Enter/blur, cancels on Escape.
 */
function CellEditInput({
  initialValue,
  onSave,
  onCancel,
}: {
  initialValue: string
  onSave: (value: string) => void
  onCancel: () => void
}) {
  const [value, setValue] = useState(initialValue)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  const handleSave = useCallback(() => {
    onSave(value)
  }, [onSave, value])

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={handleSave}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          handleSave()
        } else if (e.key === 'Escape') {
          e.preventDefault()
          onCancel()
        }
      }}
      className={cn(
        'h-ds-xs-plus w-full rounded-ds-md',
        'border border-border-interactive bg-field',
        'px-ds-02 text-ds-sm',
        'text-text-primary placeholder:text-text-placeholder',
        'outline-none focus:border-[var(--color-border-focus)]',
      )}
      aria-label="Edit cell value"
    />
  )
}

/** Interactive element selectors for row click filtering */
const INTERACTIVE_SELECTOR =
  'button, a, input, select, textarea, [role="checkbox"]'

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
}: DataTableProps<TData, TValue>) {
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
        checked={t.getIsAllPageRowsSelected()}
        indeterminate={t.getIsSomePageRowsSelected()}
        onCheckedChange={(v) => t.toggleAllPageRowsSelected(!!v)}
        aria-label="Select all rows"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
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
        className="flex items-center justify-center p-ds-01 rounded-ds-sm hover:bg-layer-02 transition-colors"
      >
        <IconChevronRight
          size={16}
          className={cn(
            'transition-transform duration-moderate-02',
            row.getIsExpanded() && 'rotate-90',
          )}
          aria-hidden="true"
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

  // Stable ref for onSelectionChange to avoid effect re-fires
  const onSelectionChangeRef = useRef(onSelectionChange)
  useEffect(() => {
    onSelectionChangeRef.current = onSelectionChange
  }, [onSelectionChange])

  // Fire selection callback when row selection changes (skip when syncing from prop)
  useEffect(() => {
    if (isSyncingFromPropRef.current) {
      isSyncingFromPropRef.current = false
      return
    }
    if (!onSelectionChangeRef.current) return
    const selectedRowIds = Object.keys(rowSelection).filter((k) => rowSelection[k])
    const selected = data.filter((_, i) => {
      const id = getRowIdProp ? getRowIdProp(data[i]) : String(i)
      return selectedRowIds.includes(id)
    })
    onSelectionChangeRef.current(selected)
  }, [rowSelection, data, getRowIdProp]) // eslint-disable-line react-hooks/exhaustive-deps

  /** Compute sticky positioning styles for pinned columns */
  function getPinnedCellStyle(columnId: string) {
    const { left = [], right = [] } = columnPinningState
    const leftIndex = left.indexOf(columnId)
    const rightIndex = right.indexOf(columnId)

    if (leftIndex !== -1) {
      return {
        className: 'sticky bg-layer-01 z-raised',
        style: { left: 0 } as React.CSSProperties,
      }
    }
    if (rightIndex !== -1) {
      return {
        className: 'sticky bg-layer-01 z-raised',
        style: { right: 0 } as React.CSSProperties,
      }
    }
    return { className: '', style: {} as React.CSSProperties }
  }

  /** Check if a column allows editing */
  function isColumnEditable(columnId: string): boolean {
    if (!editable) return false
    // Internal columns are never editable
    if (columnId === '_select' || columnId === '_expand') return false
    const col = table.getColumn(columnId)
    if (!col) return false
    const meta = col.columnDef.meta as
      | { enableEditing?: boolean }
      | undefined
    // Editable by default unless explicitly disabled
    if (meta?.enableEditing === false) return false
    return true
  }

  const cellPadding = densityPaddingMap[density]

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
  // Number of visible columns for skeleton
  const visibleColumnCount = allColumns.length

  /** Handle row click, filtering out interactive element origins */
  const handleRowClick = useCallback(
    (row: TData, e: React.MouseEvent<HTMLTableRowElement>) => {
      if (!onRowClick) return
      const target = e.target as HTMLElement
      if (target.closest(INTERACTIVE_SELECTOR)) return
      onRowClick(row)
    },
    [onRowClick],
  )

  /** Render a single data row (shared between virtual and non-virtual paths) */
  function renderDataRow(
    row: Row<TData>,
    style?: React.CSSProperties,
  ) {
    const visibleCells = row.getVisibleCells()
    return (
      <TableRow
        key={row.id}
        data-state={row.getIsSelected() && 'selected'}
        style={style}
        className={cn(
          virtualRows ? 'absolute w-full flex' : undefined,
          onRowClick && 'cursor-pointer',
        )}
        onClick={
          onRowClick
            ? (e: React.MouseEvent<HTMLTableRowElement>) =>
                handleRowClick(row.original, e)
            : undefined
        }
      >
        {visibleCells.map((cell) => {
          const pinned = getPinnedCellStyle(cell.column.id)
          const isEditing =
            editingCell?.rowIndex === row.index &&
            editingCell?.columnId === cell.column.id

          return (
            <TableCell
              key={cell.id}
              className={cn(
                cellPadding,
                pinned.className,
                virtualRows && 'flex-1',
              )}
              style={pinned.style}
              onDoubleClick={() => {
                if (isColumnEditable(cell.column.id)) {
                  setEditingCell({
                    rowIndex: row.index,
                    columnId: cell.column.id,
                  })
                }
              }}
            >
              {isEditing ? (
                <CellEditInput
                  initialValue={String(cell.getValue() ?? '')}
                  onSave={(value) => {
                    onCellEdit?.(row.index, cell.column.id, value)
                    setEditingCell(null)
                  }}
                  onCancel={() => setEditingCell(null)}
                />
              ) : (
                flexRender(cell.column.columnDef.cell, cell.getContext())
              )}
            </TableCell>
          )
        })}
      </TableRow>
    )
  }

  /** Render expanded content row below the data row */
  function renderExpandedRow(row: Row<TData>, style?: React.CSSProperties) {
    if (!expandable || !row.getIsExpanded() || !renderExpanded) return null
    return (
      <TableRow
        key={`${row.id}-expanded`}
        style={style}
        className={virtualRows ? 'absolute w-full flex' : undefined}
      >
        <TableCell
          colSpan={allColumns.length}
          className={cn(
            'bg-layer-02 p-ds-05',
            virtualRows && 'flex-1',
          )}
        >
          {renderExpanded(row.original)}
        </TableCell>
      </TableRow>
    )
  }

  /** Render skeleton loading rows */
  function renderSkeletonRows() {
    const skeletonWidths = ['w-3/4', 'w-1/2', 'w-2/3', 'w-full']
    return (
      <TableBody>
        {Array.from({ length: skeletonRowCount }, (_, rowIdx) => (
          <TableRow key={`skeleton-${rowIdx}`}>
            {Array.from({ length: visibleColumnCount }, (_, colIdx) => {
              const colId = allColumns[colIdx]?.id ?? allColumns[colIdx]?.header
              const isSelect = colId === '_select'
              return (
                <TableCell
                  key={`skeleton-${rowIdx}-${colIdx}`}
                  className={cellPadding}
                >
                  {isSelect ? (
                    <Skeleton variant="text" className="h-4 w-4" animation="pulse" />
                  ) : (
                    <Skeleton variant="text" className={cn('h-4', skeletonWidths[colIdx % skeletonWidths.length])} animation="pulse" />
                  )}
                </TableCell>
              )
            })}
          </TableRow>
        ))}
      </TableBody>
    )
  }

  /** Render the table body — virtual or standard */
  function renderTableBody() {
    // Loading state: show skeleton rows
    if (loading) {
      return renderSkeletonRows()
    }

    if (!rows.length) {
      return (
        <TableBody>
          <TableRow>
            <TableCell
              colSpan={allColumns.length}
              className={cn(
                'h-24 text-center',
                !emptyState && 'text-text-tertiary',
              )}
            >
              {emptyState || noResultsText || 'No results.'}
            </TableCell>
          </TableRow>
        </TableBody>
      )
    }

    if (virtualRows) {
      const virtualItems = virtualizer.getVirtualItems()
      const totalSize = virtualizer.getTotalSize()

      return (
        <TableBody
          style={{
            height: `${totalSize}px`,
            position: 'relative',
          }}
        >
          {virtualItems.map((virtualRow) => {
            const row = rows[virtualRow.index]
            return renderDataRow(row, {
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            })
          })}
        </TableBody>
      )
    }

    // Standard (non-virtual) rendering
    return (
      <TableBody>
        {rows.map((row) => (
          <React.Fragment key={row.id}>
            {renderDataRow(row)}
            {renderExpandedRow(row)}
          </React.Fragment>
        ))}
      </TableBody>
    )
  }

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

  // Determine if we need a scroll wrapper for virtualization
  const tableContent = (
    <Table>
      <TableHeader
        className={cn(
          stickyHeader && 'sticky top-0 z-10 bg-surface',
        )}
      >
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              const canSort = sortable && header.column.getCanSort()
              const sorted = header.column.getIsSorted()
              const pinned = getPinnedCellStyle(header.column.id)

              return (
                <TableHead
                  key={header.id}
                  className={pinned.className}
                  style={pinned.style}
                >
                  {header.isPlaceholder ? null : canSort ? (
                    <button
                      type="button"
                      className={cn(
                        'flex items-center gap-ds-01 font-medium',
                        'cursor-pointer select-none',
                        '-ml-ds-01 rounded-ds-sm px-ds-01 py-ds-01',
                        'hover:bg-layer-02 transition-colors',
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                      aria-label={`Sort by ${typeof header.column.columnDef.header === 'string' ? header.column.columnDef.header : header.column.id}`}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {sorted === 'asc' ? (
                        <IconArrowUp
                          className="h-ico-sm w-ico-sm text-text-secondary"
                          aria-hidden="true"
                        />
                      ) : sorted === 'desc' ? (
                        <IconArrowDown
                          className="h-ico-sm w-ico-sm text-text-secondary"
                          aria-hidden="true"
                        />
                      ) : (
                        <IconArrowsSort
                          className="h-ico-sm w-ico-sm text-text-tertiary"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  ) : (
                    flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )
                  )}
                </TableHead>
              )
            })}
          </TableRow>
        ))}

        {/* Column filter row */}
        {filterable &&
          table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={`${headerGroup.id}-filters`}>
              {headerGroup.headers.map((header) => (
                <TableHead key={`${header.id}-filter`} className="py-ds-01">
                  {header.isPlaceholder ||
                  header.column.columnDef.enableColumnFilter === false ? null : (
                    <input
                      type="text"
                      value={
                        (header.column.getFilterValue() as string) ?? ''
                      }
                      onChange={(e) =>
                        header.column.setFilterValue(e.target.value)
                      }
                      placeholder={`Filter ${typeof header.column.columnDef.header === 'string' ? header.column.columnDef.header : ''}...`}
                      aria-label={`Filter ${typeof header.column.columnDef.header === 'string' ? header.column.columnDef.header : header.column.id}`}
                      className={cn(
                        'h-ds-xs-plus w-full rounded-ds-md',
                        'border border-border bg-field',
                        'px-ds-02 text-ds-sm',
                        'text-text-primary placeholder:text-text-placeholder',
                        'outline-none focus:border-[var(--color-border-focus)]',
                      )}
                    />
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
      </TableHeader>
      {renderTableBody()}
    </Table>
  )

  return (
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
        <div className="flex items-center gap-ds-03 pb-ds-04 border-b border-border-subtle mb-ds-04">
          <IconSearch
            size={16}
            className="text-icon-secondary"
            aria-hidden="true"
          />
          <input
            type="text"
            value={globalFilterValue}
            onChange={(e) => setGlobalFilterValue(e.target.value)}
            placeholder="Search all columns..."
            aria-label="Search all columns"
            className={cn(
              'flex-1 bg-transparent text-ds-md',
              'text-text-primary placeholder:text-text-placeholder',
              'outline-none',
            )}
          />
        </div>
      )}

      {/* Virtualized scroll container or plain table */}
      {virtualRows ? (
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
        <div className="flex items-center justify-between px-ds-03 py-ds-04 border-t border-border-subtle">
          <span className="text-ds-sm text-text-secondary">
            {totalRowCount} total rows
          </span>
          <div className="flex items-center gap-ds-03">
            {/* Page size selector */}
            {!useServerPagination && (
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => {
                  table.setPageSize(Number(e.target.value))
                }}
                aria-label="Rows per page"
                className={cn(
                  'h-ds-sm rounded-ds-md',
                  'border border-border bg-field',
                  'px-ds-03 text-ds-sm',
                  'text-text-primary',
                )}
              >
                {(pageSizeOptions ?? [10, 20, 50, 100]).map((size) => (
                  <option key={size} value={size}>
                    {size} rows
                  </option>
                ))}
              </select>
            )}

            {/* Previous page button */}
            <button
              type="button"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
              aria-label="Previous page"
              className={cn(
                'h-ds-sm w-ds-sm flex items-center justify-center',
                'rounded-ds-md border border-border',
                'enabled:hover:bg-layer-02',
                'disabled:opacity-[0.38] disabled:cursor-not-allowed',
                'transition-colors',
              )}
            >
              <IconChevronLeft size={16} aria-hidden="true" />
            </button>

            {/* Page info */}
            <span className="text-ds-sm text-text-secondary">
              Page {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount()}
            </span>

            {/* Next page button */}
            <button
              type="button"
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
              aria-label="Next page"
              className={cn(
                'h-ds-sm w-ds-sm flex items-center justify-center',
                'rounded-ds-md border border-border',
                'enabled:hover:bg-layer-02',
                'disabled:opacity-[0.38] disabled:cursor-not-allowed',
                'transition-colors',
              )}
            >
              <IconChevronRight size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* Bulk action bar */}
      {bulkActions && selectable && hasSelectedRows && (
        <div
          className={cn(
            'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
            'flex items-center gap-ds-04 px-ds-05 py-ds-03',
            'rounded-ds-lg border border-border bg-surface shadow-lg',
            'animate-in slide-in-from-bottom-2',
          )}
          role="toolbar"
          aria-label="Bulk actions"
        >
          <span className="text-ds-sm font-medium text-text-primary whitespace-nowrap">
            {selectedRows.length} selected
          </span>
          <div className="h-5 w-px bg-border" aria-hidden="true" />
          {bulkActions.map((action) => (
            <Button
              key={action.label}
              size="sm"
              variant={action.color === 'error' ? 'destructive' : 'outline'}
              disabled={action.disabled}
              onClick={() => action.onClick(selectedRows)}
            >
              {action.label}
            </Button>
          ))}
          <button
            type="button"
            onClick={() => table.resetRowSelection()}
            aria-label="Clear selection"
            className={cn(
              'flex items-center justify-center p-ds-01',
              'rounded-ds-sm hover:bg-layer-02 transition-colors',
              'text-text-secondary hover:text-text-primary',
            )}
          >
            <IconX size={16} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  )
}
DataTable.displayName = 'DataTable'
