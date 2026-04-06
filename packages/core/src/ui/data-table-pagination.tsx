'use client'

import React from 'react'
import { type Table } from '@tanstack/react-table'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'

import { Icon } from './icon'
import { cn } from './lib/utils'

/**
 * Pagination controls: page size selector, prev/next buttons, page info.
 * Internal — not exported to consumers.
 */
export function DataTablePagination<TData>({
  table,
  totalRowCount,
  useServerPagination,
  pageSizeOptions,
}: {
  table: Table<TData>
  totalRowCount: number
  useServerPagination: boolean
  pageSizeOptions?: number[]
}) {
  return (
    <div className="flex items-center justify-between px-ds-03 py-ds-04 border-t border-surface-border">
      <span className="text-ds-sm text-surface-fg-muted">
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
              'border border-surface-border-strong bg-surface-raised-hover',
              'px-ds-03 text-ds-sm',
              'text-surface-fg',
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
            'rounded-ds-md border border-surface-border-strong',
            'enabled:hover:bg-surface-raised',
            'disabled:opacity-action-disabled disabled:cursor-not-allowed',
            'transition-colors',
          )}
        >
          <Icon icon={IconChevronLeft} size="sm" />
        </button>

        {/* Page info */}
        <span className="text-ds-sm text-surface-fg-muted">
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
            'rounded-ds-md border border-surface-border-strong',
            'enabled:hover:bg-surface-raised',
            'disabled:opacity-action-disabled disabled:cursor-not-allowed',
            'transition-colors',
          )}
        >
          <Icon icon={IconChevronRight} size="sm" />
        </button>
      </div>
    </div>
  )
}
