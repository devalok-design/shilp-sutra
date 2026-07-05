'use client'

import { type ColumnPinningState, type Table } from '@tanstack/react-table'
import React from 'react'

// ── Shared types ────────────────────────────────────────────────

/** Editing state: which cell is currently in edit mode */
export type EditingCell = { rowIndex: number; columnId: string } | null

// ── Utility functions ───────────────────────────────────────────

export function getColumnMetaClasses(meta?: Record<string, unknown>): string {
  if (!meta) return ''
  const classes: string[] = []
  if (meta.align === 'right') classes.push('text-right tabular-nums')
  if (meta.align === 'center') classes.push('text-center')
  if (meta.hideBelow === 'sm') classes.push('hidden sm:table-cell')
  if (meta.hideBelow === 'md') classes.push('hidden md:table-cell')
  if (meta.hideBelow === 'lg') classes.push('hidden lg:table-cell')
  return classes.join(' ')
}

/** Interactive element selectors for row click filtering */
export const INTERACTIVE_SELECTOR =
  'button, a, input, select, textarea, [role="checkbox"]'

// ── Context ─────────────────────────────────────────────────────

export interface DataTableContextValue<TData = unknown> {
  table: Table<TData>
  /** All assembled columns (including _select, _expand) */
  allColumns: { id?: string; header?: unknown }[]
  /** Column pinning state for sticky positioning */
  columnPinningState: ColumnPinningState
  /** Whether sorting is enabled */
  sortable: boolean
  /** Whether per-column filters are enabled */
  filterable: boolean
  /** Whether inline editing is enabled */
  editable: boolean
  /** Whether row expansion is enabled */
  expandable: boolean
  /** Whether virtual rows are enabled */
  virtualRows: boolean
  /** Whether row selection is enabled */
  selectable: boolean
  /** Mobile view mode */
  mobileView: 'card' | 'table'
  /** Current editing cell */
  editingCell: EditingCell
  /** Set editing cell */
  setEditingCell: (cell: EditingCell) => void
  /** Callback when a cell value is edited */
  onCellEdit?: (rowIndex: number, columnId: string, value: unknown) => void
  /** Render function for expanded row content */
  renderExpanded?: (row: TData) => React.ReactNode
  /** Row click handler */
  onRowClick?: (row: TData) => void
}

const DataTableContext = React.createContext<DataTableContextValue | null>(null)

export function DataTableProvider<TData>({
  children,
  value,
}: {
  children: React.ReactNode
  value: DataTableContextValue<TData>
}) {
  return (
    <DataTableContext.Provider value={value as DataTableContextValue}>
      {children}
    </DataTableContext.Provider>
  )
}

export function useDataTableContext<TData = unknown>() {
  const ctx = React.useContext(DataTableContext)
  if (!ctx) throw new Error('useDataTableContext must be used within DataTableProvider')
  return ctx as DataTableContextValue<TData>
}

// ── Shared helpers ──────────────────────────────────────────────

/** Compute sticky positioning styles for pinned columns */
export function getPinnedCellStyle(
  columnId: string,
  columnPinningState: ColumnPinningState,
) {
  const { left = [], right = [] } = columnPinningState
  const leftIndex = left.indexOf(columnId)
  const rightIndex = right.indexOf(columnId)

  if (leftIndex !== -1) {
    return {
      className: 'sticky bg-surface-base z-raised',
      style: { left: 0 } as React.CSSProperties,
    }
  }
  if (rightIndex !== -1) {
    return {
      className: 'sticky bg-surface-base z-raised',
      style: { right: 0 } as React.CSSProperties,
    }
  }
  return { className: '', style: {} as React.CSSProperties }
}

/** Check if a column allows editing */
export function isColumnEditable<TData>(
  columnId: string,
  editable: boolean,
  table: Table<TData>,
): boolean {
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
