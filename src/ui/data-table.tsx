'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
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
} from '@tabler/icons-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table'
import { Checkbox } from './checkbox'
import { cn } from './lib/utils'
import { DataTableToolbar, type Density } from './data-table-toolbar'

const densityPaddingMap: Record<Density, string> = {
  compact: 'py-ds-02',
  standard: 'py-ds-05',
  comfortable: 'py-ds-07',
}

/** Editing state: which cell is currently in edit mode */
type EditingCell = { rowIndex: number; columnId: string } | null

interface DataTableProps<TData, TValue> {
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
        'h-7 w-full rounded-ds-md',
        'border border-border-interactive bg-field',
        'px-ds-02 text-ds-sm',
        'text-text-primary placeholder:text-text-placeholder',
        'outline-none focus:border-[var(--color-border-focus)]',
      )}
      aria-label="Edit cell value"
    />
  )
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
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilterValue, setGlobalFilterValue] = useState('')
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize ?? 10,
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
        className="flex items-center justify-center p-ds-01 rounded hover:bg-layer-02 transition-colors"
      >
        <IconChevronRight
          size={16}
          className={cn(
            'transition-transform duration-200',
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
  if (paginated) tableState.pagination = pagination
  if (selectable) tableState.rowSelection = rowSelection
  if (expandable) tableState.expanded = expanded

  const table = useReactTable({
    data,
    columns: allColumns,
    state: tableState,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnPinningChange: setColumnPinningState,
    getCoreRowModel: getCoreRowModel(),
    ...(sortable && {
      onSortingChange: setSorting,
      getSortedRowModel: getSortedRowModel(),
    }),
    ...((filterable || globalFilter) && {
      onColumnFiltersChange: setColumnFilters,
      onGlobalFilterChange: setGlobalFilterValue,
      getFilteredRowModel: getFilteredRowModel(),
    }),
    ...(paginated && {
      onPaginationChange: setPagination,
      getPaginationRowModel: getPaginationRowModel(),
    }),
    ...(selectable && {
      onRowSelectionChange: setRowSelection,
      enableRowSelection: true,
    }),
    ...(expandable && {
      onExpandedChange: setExpanded,
      getExpandedRowModel: getExpandedRowModel(),
    }),
  })

  // Fire selection callback when row selection changes
  useEffect(() => {
    if (onSelectionChange) {
      const selected = table
        .getFilteredSelectedRowModel()
        .rows.map((r) => r.original)
      onSelectionChange(selected)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowSelection])

  /** Compute sticky positioning styles for pinned columns */
  function getPinnedCellStyle(columnId: string) {
    const { left = [], right = [] } = columnPinningState
    const leftIndex = left.indexOf(columnId)
    const rightIndex = right.indexOf(columnId)

    if (leftIndex !== -1) {
      return {
        className: 'sticky bg-layer-01 z-10',
        style: { left: 0 } as React.CSSProperties,
      }
    }
    if (rightIndex !== -1) {
      return {
        className: 'sticky bg-layer-01 z-10',
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
        className={virtualRows ? 'absolute w-full flex' : undefined}
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

  /** Render the table body — virtual or standard */
  function renderTableBody() {
    if (!rows.length) {
      return (
        <TableBody>
          <TableRow>
            <TableCell
              colSpan={allColumns.length}
              className="h-24 text-center text-text-tertiary"
            >
              {noResultsText || 'No results.'}
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

  // Determine if we need a scroll wrapper for virtualization
  const tableContent = (
    <Table>
      <TableHeader>
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
                        '-ml-ds-01 rounded px-ds-01 py-ds-01',
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
                          className="size-4 text-text-secondary"
                          aria-hidden="true"
                        />
                      ) : sorted === 'desc' ? (
                        <IconArrowDown
                          className="size-4 text-text-secondary"
                          aria-hidden="true"
                        />
                      ) : (
                        <IconArrowsSort
                          className="size-4 text-text-tertiary"
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
                        'h-7 w-full rounded-ds-md',
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
      {paginated && (
        <div className="flex items-center justify-between px-ds-03 py-ds-04 border-t border-border-subtle">
          <span className="text-ds-sm text-text-secondary">
            {table.getFilteredRowModel().rows.length} total rows
          </span>
          <div className="flex items-center gap-ds-03">
            {/* Page size selector */}
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value))
              }}
              aria-label="Rows per page"
              className={cn(
                'h-8 rounded-ds-md',
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

            {/* Previous page button */}
            <button
              type="button"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
              aria-label="Previous page"
              className={cn(
                'h-8 w-8 flex items-center justify-center',
                'rounded-ds-md border border-border',
                'enabled:hover:bg-layer-02',
                'disabled:opacity-40 disabled:cursor-not-allowed',
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
                'h-8 w-8 flex items-center justify-center',
                'rounded-ds-md border border-border',
                'enabled:hover:bg-layer-02',
                'disabled:opacity-40 disabled:cursor-not-allowed',
                'transition-colors',
              )}
            >
              <IconChevronRight size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
