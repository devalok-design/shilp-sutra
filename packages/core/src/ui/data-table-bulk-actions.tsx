'use client'

import { type Table } from '@tanstack/react-table'
import React from 'react'

import { BulkActionBar,type BulkActionBarAction } from './bulk-action-bar'
import type { IconInput } from './lib/icon-input'

/** Where the floating bulk-action bar renders. @default 'bottom' */
export type BulkActionsPosition = 'bottom' | 'top' | 'inline'

/** Bulk action definition for the floating action bar */
export interface BulkAction<TData> {
  label: string
  onClick: (selectedRows: TData[]) => void
  /** Icon rendered before the label — useful for compact/mobile bars. */
  icon?: IconInput
  color?: 'accent' | 'error'
  disabled?: boolean
  /** Show an inline "Are you sure?" step before running. */
  requiresConfirmation?: boolean
  /** Overrides the default "Are you sure?" prompt. */
  confirmMessage?: string
  /** Spinner on this action while its work is in flight. */
  loading?: boolean
}

/**
 * DataTable's bulk-action bar. An adapter over the shared `BulkActionBar`
 * rather than a second implementation.
 *
 * It used to be a parallel, thinner copy — and the copy drifted in four ways
 * inside one release cycle (raw `bottom-6` instead of the spacing token, a
 * non-RTL `left-1/2`, `outline` against the repo's documented soft-over-outline
 * preference, and a bare `<button>` where `Button` belonged). Worse, it
 * declared `role="toolbar"` while implementing plain tab stops, so it told
 * screen-reader users to expect arrow-key navigation and one tab stop, and
 * delivered neither. That is the class of bug a single implementation cannot
 * have, and it was sitting on the higher-traffic path.
 *
 * The adapter is deliberately thin. Everything DataTable-specific stays here:
 *
 * - `onClick(selectedRows)` keeps its row payload, closed over per render. The
 *   shared bar's actions take no argument, and changing DataTable's signature
 *   to match would have broken every consumer for no benefit.
 * - Clearing still calls `table.resetRowSelection()` itself, so consumers do
 *   not have to wire it.
 *
 * Internal — not exported to consumers.
 */
export function DataTableBulkActions<TData>({
  table,
  selectedRows,
  bulkActions,
  position = 'bottom',
}: {
  table: Table<TData>
  selectedRows: TData[]
  bulkActions: BulkAction<TData>[]
  position?: BulkActionsPosition
}) {
  const actions = React.useMemo<BulkActionBarAction[]>(
    () =>
      bulkActions.map((a) => ({
        label: a.label,
        icon: a.icon,
        color: a.color,
        disabled: a.disabled,
        loading: a.loading,
        requiresConfirmation: a.requiresConfirmation,
        confirmMessage: a.confirmMessage,
        onClick: () => a.onClick(selectedRows),
      })),
    [bulkActions, selectedRows],
  )

  return (
    <BulkActionBar
      show
      count={selectedRows.length}
      actions={actions}
      placement={position}
      onClearSelection={() => table.resetRowSelection()}
    />
  )
}
