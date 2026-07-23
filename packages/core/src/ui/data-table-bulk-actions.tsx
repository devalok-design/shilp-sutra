'use client'

import { IconX } from '@tabler/icons-react'
import { type Table } from '@tanstack/react-table'
import React from 'react'

import { Button } from './button'
import { Icon } from './icon'
import { cn } from './lib/utils'

/** Bulk action definition for the floating action bar */
export interface BulkAction<TData> {
  label: string
  onClick: (selectedRows: TData[]) => void
  color?: 'accent' | 'error'
  disabled?: boolean
}

/**
 * Floating action bar shown when rows are selected.
 * Internal — not exported to consumers.
 */
export function DataTableBulkActions<TData>({
  table,
  selectedRows,
  bulkActions,
}: {
  table: Table<TData>
  selectedRows: TData[]
  bulkActions: BulkAction<TData>[]
}) {
  return (
    <div
      className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-sticky',
        'flex items-center gap-ds-04 px-ds-05 py-ds-03',
        'rounded-overlay bg-surface-overlay shadow-floating',
        'animate-in slide-in-from-bottom-2',
      )}
      role="toolbar"
      aria-label="Bulk actions"
    >
      <span className="text-body-sm font-medium text-surface-fg whitespace-nowrap">
        {selectedRows.length} selected
      </span>
      <div className="h-5 w-px bg-surface-border" aria-hidden="true" />
      {bulkActions.map((action) => (
        <Button
          key={action.label}
          size="sm"
          variant={action.color === 'error' ? 'solid' : 'outline'}
          color={action.color === 'error' ? 'error' : undefined}
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
          'rounded-control-inner hover:bg-surface-raised transition-colors',
          'text-surface-fg-muted hover:text-surface-fg',
        )}
      >
        <Icon icon={IconX} size="sm" />
      </button>
    </div>
  )
}
