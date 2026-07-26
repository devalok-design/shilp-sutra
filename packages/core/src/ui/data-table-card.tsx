'use client'

import { flexRender } from '@tanstack/react-table'
import React from 'react'

import { Card, CardContent } from './card'
import { Checkbox } from './checkbox'
import { useDataTableContext } from './data-table-context'
import { cn } from './lib/utils'
import { Skeleton } from './skeleton'

// ── DataTableCards ─────────────────────────────────────────────
// Renders rows as vertically stacked cards for small (< sm) viewports.
// Consumes the same TanStack Table instance from context — sorting,
// filtering, pagination, and selection all work identically.

export function DataTableCards<TData>({
  loading,
  skeletonRowCount,
  noResultsText,
  emptyState,
}: {
  loading?: boolean
  skeletonRowCount: number
  noResultsText?: string
  emptyState?: React.ReactNode
}) {
  const { table, selectable, filterable, filterableColumns, rowClassName } = useDataTableContext<TData>()
  const rows = table.getRowModel().rows

  // Loading skeleton
  if (loading) {
    return (
      <div className="flex flex-col gap-ds-03">
        {Array.from({ length: skeletonRowCount }, (_, i) => (
          <Card key={`card-skeleton-${i}`} size="sm" variant="outline">
            <CardContent>
              <Skeleton variant="text" className="mb-ds-03 h-5 w-2/3" animation="pulse" />
              <div className="flex flex-col gap-ds-02">
                <Skeleton variant="text" className="h-4 w-full" animation="pulse" />
                <Skeleton variant="text" className="h-4 w-3/4" animation="pulse" />
                <Skeleton variant="text" className="h-4 w-1/2" animation="pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Empty state
  if (!rows.length) {
    return (
      <div className={cn('py-ds-07 text-center', !emptyState && 'text-surface-fg-subtle')}>
        {emptyState || noResultsText || 'No results.'}
      </div>
    )
  }

  // Filterable columns that should show an input in card mode.
  // Lives above the card list since there's no <thead> in card layout.
  const filterableCols = filterable
    ? table.getAllLeafColumns().filter((col) => {
        if (col.id === '_select' || col.id === '_expand') return false
        if (filterableColumns) return filterableColumns.includes(col.id)
        return col.columnDef.enableColumnFilter !== false
      })
    : []

  return (
    <div className="flex flex-col gap-ds-03">
      {/* Filter inputs — rendered above the card list, one per filterable column */}
      {filterableCols.length > 0 && (
        <div className="flex flex-col gap-ds-02">
          {filterableCols.map((col) => {
            const headerLabel =
              typeof col.columnDef.header === 'string' ? col.columnDef.header : col.id
            return (
              <input
                key={col.id}
                type="text"
                value={(col.getFilterValue() as string) ?? ''}
                onChange={(e) => col.setFilterValue(e.target.value)}
                placeholder={`Filter ${headerLabel}...`}
                aria-label={`Filter ${headerLabel}`}
                className={cn(
                  'h-ds-xs-plus w-full rounded-control',
                  'border border-card-strong bg-surface-raised-hover',
                  'px-ds-02 text-body-sm',
                  'text-surface-fg placeholder:text-surface-fg-subtle',
                  'outline-hidden focus:border-accent-7',
                )}
              />
            )
          })}
        </div>
      )}

      <div className="flex flex-col gap-ds-03" role="list">
      {rows.map((row) => {
        const cells = row.getVisibleCells()
        // Skip internal columns (_select, _expand) for card content
        const contentCells = cells.filter(
          (cell) => cell.column.id !== '_select' && cell.column.id !== '_expand',
        )
        const primaryCell = contentCells[0]
        const restCells = contentCells.slice(1)
        const isSelected = row.getIsSelected()

        return (
          <Card
            key={row.id}
            role="listitem"
            size="sm"
            // outline, not default — a phone screen of stacked shadow cards
            // accumulates lift (make-kit dense-list rule).
            variant="outline"
            className={cn(isSelected && 'ring-2 ring-accent-9', rowClassName?.(row.original))}
          >
            {/* Header row: primary field + optional selection checkbox */}
            <CardContent className="flex items-start justify-between gap-ds-03">
              <div className="min-w-0 flex-1 font-medium text-surface-fg">
                {primaryCell &&
                  flexRender(primaryCell.column.columnDef.cell, primaryCell.getContext())}
              </div>
              {selectable && (
                <Checkbox
                  size="sm"
                  checked={isSelected}
                  disabled={!row.getCanSelect()}
                  onCheckedChange={(v) => row.toggleSelected(!!v)}
                  aria-label="Select row"
                  className="shrink-0"
                />
              )}
            </CardContent>

            {/* Label-value pairs for remaining columns, behind a full-width rule */}
            {restCells.length > 0 && (
              <>
              <div aria-hidden="true" className="h-px w-full bg-surface-border-subtle" />
              <CardContent className="flex flex-col gap-ds-01">
                {restCells.map((cell) => {
                  // Respect hideBelow column meta — skip hidden columns
                  const meta = cell.column.columnDef.meta as
                    | { hideBelow?: string }
                    | undefined
                  // In card mode on mobile, hideBelow='sm' columns are still useful
                  // since we're showing all data in a card layout. Only skip if
                  // the column is explicitly hidden via visibility toggle.
                  if (meta?.hideBelow === 'md' || meta?.hideBelow === 'lg') {
                    // These would normally be hidden at this breakpoint in table
                    // mode too, so skip them in cards for consistency
                  }

                  // Derive header label text
                  const header =
                    typeof cell.column.columnDef.header === 'string'
                      ? cell.column.columnDef.header
                      : cell.column.id

                  return (
                    <div key={cell.id} className="flex justify-between gap-ds-03 text-body-sm">
                      <span className="shrink-0 text-surface-fg-muted">{header}</span>
                      <span className="min-w-0 text-right text-surface-fg">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </span>
                    </div>
                  )
                })}
              </CardContent>
              </>
            )}
          </Card>
        )
      })}
      </div>
    </div>
  )
}
