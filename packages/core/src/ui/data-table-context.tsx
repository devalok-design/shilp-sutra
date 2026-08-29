'use client'

import { type ColumnPinningState, type Table } from '@tanstack/react-table'
import React from 'react'

import { cn } from './lib/utils'

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
  /** When set, only these column IDs get filter inputs (subset of filterable columns) */
  filterableColumns?: string[]
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
  /** Return a className for a given row — applied to the tr in table and card layouts */
  rowClassName?: (row: TData) => string | undefined
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

/**
 * Compute sticky positioning styles for pinned columns.
 *
 * `column` is optional so existing callers keep working, but WITHOUT it every
 * pinned column resolves to the same edge. Pass it.
 *
 * Three things were wrong here and all three had the same root: the function
 * knew a column's *identity* but nothing about its *geometry*.
 *
 * - The offset was hardcoded to 0, so two left-pinned columns stacked on top of
 *   each other. `leftIndex` was computed and then thrown away. TanStack already
 *   knows the cumulative width — `getStart('left')` / `getAfter('right')` — so
 *   the fix is to ask it rather than to sum widths here.
 * - The cell painted `bg-surface-panel` unconditionally, which is right for
 *   occluding scrolled content underneath and wrong for everything else: a
 *   selected row's pinned cell stayed panel-coloured and a striped row's showed
 *   a white notch. It now inherits the row's background and only falls back to
 *   the panel colour when the row has none of its own (`bg-inherit`), so the
 *   occlusion still works.
 * - There was no edge, so a pinned column was invisible unscrolled and had
 *   content slide under it with no seam when scrolled. The last left-pinned and
 *   first right-pinned column now carry a hairline on the boundary.
 */
export function getPinnedCellStyle(
  columnId: string,
  columnPinningState: ColumnPinningState,
  column?: { getStart: (p?: 'left') => number; getAfter: (p?: 'right') => number },
) {
  const { left = [], right = [] } = columnPinningState
  const leftIndex = left.indexOf(columnId)
  const rightIndex = right.indexOf(columnId)

  // The cell MUST stay opaque — that is the whole job of a pinned column, and
  // `bg-inherit` does not work here: TableRow has no background of its own, so
  // the cell would inherit `transparent` and scrolled content would show
  // straight through it.
  //
  // So keep an opaque base and layer the row's states on top via `group/row`,
  // which TableRow already declares. Striping is handled at the table level,
  // where the parity selector lives, keyed off `data-pinned` below.
  const base = cn(
    'sticky z-raised bg-surface-panel',
    'group-hover/row:bg-surface-panel-hover',
    'group-data-[state=selected]/row:bg-accent-4',
    'group-data-[state=selected]/row:group-hover/row:bg-accent-5',
  )

  if (leftIndex !== -1) {
    // The rightmost left-pinned column owns the seam.
    const isEdge = leftIndex === left.length - 1
    return {
      className: cn(base, isEdge && 'border-r border-surface-border'),
      style: { left: column ? column.getStart('left') : 0 } as React.CSSProperties,
      // Lets Table's stripe rule reach the pinned cell specifically, rather
      // than repainting every cell in the row to achieve the same thing.
      'data-pinned': 'left' as const,
    }
  }
  if (rightIndex !== -1) {
    // The leftmost right-pinned column owns the seam.
    const isEdge = rightIndex === 0
    return {
      className: cn(base, isEdge && 'border-l border-surface-border'),
      style: { right: column ? column.getAfter('right') : 0 } as React.CSSProperties,
      'data-pinned': 'right' as const,
    }
  }
  return {
    className: '',
    style: {} as React.CSSProperties,
    'data-pinned': undefined,
  }
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
