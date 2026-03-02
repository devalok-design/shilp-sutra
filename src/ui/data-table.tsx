'use client'

import { useEffect, useState } from 'react'
import {
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type TableState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
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
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilterValue, setGlobalFilterValue] = useState('')
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize ?? 10,
  })
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

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
  }

  const allColumns = selectable ? [selectColumn, ...columns] : columns

  // Build state object once — sorting and filtering contribute independently
  const tableState: Partial<TableState> = {}
  if (sortable) tableState.sorting = sorting
  if (filterable || globalFilter) {
    tableState.columnFilters = columnFilters
    tableState.globalFilter = globalFilterValue
  }
  if (paginated) tableState.pagination = pagination
  if (selectable) tableState.rowSelection = rowSelection

  const table = useReactTable({
    data,
    columns: allColumns,
    state: tableState,
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
  })

  // Fire selection callback when row selection changes
  useEffect(() => {
    if (onSelectionChange) {
      const selected = table.getFilteredSelectedRowModel().rows.map((r) => r.original)
      onSelectionChange(selected)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowSelection])

  return (
    <div className={cn(className)}>
      {/* Global search input */}
      {globalFilter && (
        <div className="flex items-center gap-ds-03 pb-ds-04 border-b border-[var(--color-border-subtle)] mb-ds-04">
          <IconSearch
            size={16}
            className="text-[var(--color-icon-secondary)]"
            aria-hidden="true"
          />
          <input
            type="text"
            value={globalFilterValue}
            onChange={(e) => setGlobalFilterValue(e.target.value)}
            placeholder="Search all columns…"
            aria-label="Search all columns"
            className={cn(
              'flex-1 bg-transparent text-ds-md',
              'text-[var(--color-text-primary)] placeholder:text-[var(--color-text-placeholder)]',
              'outline-none',
            )}
          />
        </div>
      )}

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const canSort = sortable && header.column.getCanSort()
                const sorted = header.column.getIsSorted()

                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : canSort ? (
                      <button
                        type="button"
                        className={cn(
                          'flex items-center gap-ds-01 font-medium',
                          'cursor-pointer select-none',
                          '-ml-ds-01 rounded px-ds-01 py-ds-01',
                          'hover:bg-[var(--color-layer-02)] transition-colors',
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
                            className="size-4 text-[var(--color-text-secondary)]"
                            aria-hidden="true"
                          />
                        ) : sorted === 'desc' ? (
                          <IconArrowDown
                            className="size-4 text-[var(--color-text-secondary)]"
                            aria-hidden="true"
                          />
                        ) : (
                          <IconArrowsSort
                            className="size-4 text-[var(--color-text-tertiary)]"
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
          {filterable && table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={`${headerGroup.id}-filters`}>
              {headerGroup.headers.map((header) => (
                <TableHead key={`${header.id}-filter`} className="py-ds-01">
                  {header.isPlaceholder || header.column.columnDef.enableColumnFilter === false ? null : (
                    <input
                      type="text"
                      value={(header.column.getFilterValue() as string) ?? ''}
                      onChange={(e) => header.column.setFilterValue(e.target.value)}
                      placeholder={`Filter ${typeof header.column.columnDef.header === 'string' ? header.column.columnDef.header : ''}…`}
                      aria-label={`Filter ${typeof header.column.columnDef.header === 'string' ? header.column.columnDef.header : header.column.id}`}
                      className={cn(
                        'h-7 w-full rounded-[var(--radius-md)]',
                        'border border-[var(--color-border-default)] bg-[var(--color-field)]',
                        'px-ds-02 text-ds-sm',
                        'text-[var(--color-text-primary)] placeholder:text-[var(--color-text-placeholder)]',
                        'outline-none focus:border-[var(--color-border-focus)]',
                      )}
                    />
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="py-ds-05">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={allColumns.length}
                className="h-24 text-center text-[var(--color-text-tertiary)]"
              >
                {noResultsText || 'No results.'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination controls */}
      {paginated && (
        <div className="flex items-center justify-between px-ds-03 py-ds-04 border-t border-[var(--color-border-subtle)]">
          <span className="text-ds-sm text-[var(--color-text-secondary)]">
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
                'h-8 rounded-[var(--radius-md)]',
                'border border-[var(--color-border-default)] bg-[var(--color-field)]',
                'px-ds-03 text-ds-sm',
                'text-[var(--color-text-primary)]',
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
                'rounded-[var(--radius-md)] border border-[var(--color-border-default)]',
                'enabled:hover:bg-[var(--color-layer-02)]',
                'disabled:opacity-40 disabled:cursor-not-allowed',
                'transition-colors',
              )}
            >
              <IconChevronLeft size={16} aria-hidden="true" />
            </button>

            {/* Page info */}
            <span className="text-ds-sm text-[var(--color-text-secondary)]">
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
                'rounded-[var(--radius-md)] border border-[var(--color-border-default)]',
                'enabled:hover:bg-[var(--color-layer-02)]',
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
