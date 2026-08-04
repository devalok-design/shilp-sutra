'use client'

import { flexRender,type Row } from '@tanstack/react-table'
import { type VirtualItem } from '@tanstack/react-virtual'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import {
  getColumnMetaClasses,
  getPinnedCellStyle,
  INTERACTIVE_SELECTOR,
  isColumnEditable,
  useDataTableContext,
} from './data-table-context'
import { springs } from './lib/motion'
import { cn } from './lib/utils'
import { Skeleton } from './skeleton'
import { TableBody, TableCell, TableRow } from './table'

// ── CellEditInput ───────────────────────────────────────────────

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
        'h-ds-xs-plus w-full rounded-control',
        'border border-accent-7 bg-surface-raised-hover',
        'px-ds-02 text-body-sm',
        'text-surface-fg placeholder:text-surface-fg-subtle',
        'outline-hidden focus:border-accent-7',
      )}
      aria-label="Edit cell value"
    />
  )
}

// ── DataRow ─────────────────────────────────────────────────────

/** Render a single data row (shared between virtual and non-virtual paths) */
function DataTableRow<TData>({ row }: { row: Row<TData> }) {
  const {
    table,
    columnPinningState,
    editable,
    editingCell,
    setEditingCell,
    onCellEdit,
    onRowClick,
    rowClassName,
  } = useDataTableContext<TData>()

  const handleRowClick = useCallback(
    (e: React.MouseEvent<HTMLTableRowElement>) => {
      if (!onRowClick) return
      const target = e.target as HTMLElement
      if (target.closest(INTERACTIVE_SELECTOR)) return
      onRowClick(row.original)
    },
    [onRowClick, row.original],
  )

  const visibleCells = row.getVisibleCells()

  return (
    <TableRow
      data-state={row.getIsSelected() && 'selected'}
      className={cn(
        onRowClick && 'cursor-pointer',
        rowClassName?.(row.original),
      )}
      onClick={onRowClick ? handleRowClick : undefined}
    >
      {visibleCells.map((cell) => {
        const pinned = getPinnedCellStyle(cell.column.id, columnPinningState)
        const isEditing =
          editingCell?.rowIndex === row.index &&
          editingCell?.columnId === cell.column.id

        return (
          <TableCell
            key={cell.id}
            className={cn(
              pinned.className,
              getColumnMetaClasses(
                cell.column.columnDef.meta as Record<string, unknown>,
              ),
            )}
            style={pinned.style}
            onDoubleClick={() => {
              if (isColumnEditable(cell.column.id, editable, table)) {
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

// ── ExpandedRow ─────────────────────────────────────────────────

/** Render expanded content row below the data row */
function DataTableExpandedRow<TData>({ row }: { row: Row<TData> }) {
  const { allColumns, expandable, renderExpanded, virtualRows } =
    useDataTableContext<TData>()
  // Self-guarded (StatFlash pattern) — reveal collapses to an instant swap
  // without relying on a consumer MotionProvider.
  const prefersReduced = useReducedMotion()

  if (!expandable || !renderExpanded) return null

  const expanded = row.getIsExpanded()

  // In virtual mode the reveal is instant: the row group's height is watched by
  // the virtualizer's ResizeObserver, and an animating height would fire a
  // resize on every frame of the spring.
  if (virtualRows) {
    if (!expanded) return null
    return (
      <TableRow>
        <TableCell colSpan={allColumns.length} className="bg-surface-base p-ds-05">
          {renderExpanded(row.original)}
        </TableCell>
      </TableRow>
    )
  }

  return (
    <AnimatePresence initial={false}>
      {expanded && (
        <TableRow>
          <TableCell
            colSpan={allColumns.length}
            // A recess, not a raised layer — surface-raised would vanish on a
            // card. Padding moves to the inner div so the collapsed state has
            // zero height.
            className="bg-surface-base p-0"
          >
            <motion.div
              className="overflow-hidden"
              initial={prefersReduced ? false : { height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={prefersReduced ? undefined : { height: 0, opacity: 0 }}
              transition={
                prefersReduced ? { duration: 0 } : { ...springs.smooth }
              }
            >
              <div className="p-ds-05">{renderExpanded(row.original)}</div>
            </motion.div>
          </TableCell>
        </TableRow>
      )}
    </AnimatePresence>
  )
}

// ── SkeletonRows ────────────────────────────────────────────────

function DataTableSkeletonRows({
  rowCount,
}: {
  rowCount: number
}) {
  const { allColumns } = useDataTableContext()
  const visibleColumnCount = allColumns.length
  const skeletonWidths = ['w-3/4', 'w-1/2', 'w-2/3', 'w-full']

  return (
    <TableBody>
      {Array.from({ length: rowCount }, (_, rowIdx) => (
        <TableRow key={`skeleton-${rowIdx}`}>
          {Array.from({ length: visibleColumnCount }, (_, colIdx) => {
            const colId = allColumns[colIdx]?.id ?? allColumns[colIdx]?.header
            const isSelect = colId === '_select'
            return (
              <TableCell key={`skeleton-${rowIdx}-${colIdx}`}>
                {isSelect ? (
                  <Skeleton
                    variant="text"
                    className="h-4 w-4"
                    animation="pulse"
                  />
                ) : (
                  <Skeleton
                    variant="text"
                    className={cn(
                      'h-4',
                      skeletonWidths[colIdx % skeletonWidths.length],
                    )}
                    animation="pulse"
                  />
                )}
              </TableCell>
            )
          })}
        </TableRow>
      ))}
    </TableBody>
  )
}

// ── DataTableBody (orchestrates all body rendering) ─────────────

export function DataTableBody<TData>({
  loading,
  skeletonRowCount,
  noResultsText,
  emptyState,
  virtualItems,
  totalVirtualSize,
  measureRow,
}: {
  loading?: boolean
  skeletonRowCount: number
  noResultsText?: string
  emptyState?: React.ReactNode
  virtualItems?: VirtualItem[]
  totalVirtualSize?: number
  /** `virtualizer.measureElement` — attached to each virtual row group */
  measureRow?: (node: HTMLTableSectionElement | null) => void
}) {
  const { table, allColumns, virtualRows } = useDataTableContext<TData>()
  const rows = table.getRowModel().rows

  // Loading state: show skeleton rows
  if (loading) {
    return <DataTableSkeletonRows rowCount={skeletonRowCount} />
  }

  if (!rows.length) {
    return (
      <TableBody>
        <TableRow>
          <TableCell
            colSpan={allColumns.length}
            className={cn(
              'py-ds-07 text-center',
              !emptyState && 'text-surface-fg-subtle',
            )}
          >
            {emptyState || noResultsText || 'No results.'}
          </TableCell>
        </TableRow>
      </TableBody>
    )
  }

  if (virtualRows && virtualItems) {
    // Each windowed row gets its OWN <tbody> (valid HTML — a table may hold any
    // number of row groups) carrying `data-index` + the virtualizer's
    // `measureElement` ref. That group is what gets measured, so a row's height
    // INCLUDES its expanded detail row and `getTotalSize()` stays truthful.
    //
    // Rows stay in normal table flow; the window is positioned by spacer row
    // groups above and below instead of absolute offsets. Two consequences worth
    // knowing: an expanded panel can never paint on top of the next row (flow
    // layout forbids it), and column widths keep tracking <thead> because the
    // cells are still real table cells.
    const firstItem = virtualItems[0]
    const lastItem = virtualItems[virtualItems.length - 1]
    const padTop = firstItem ? firstItem.start : 0
    const padBottom = lastItem ? Math.max(0, (totalVirtualSize ?? 0) - lastItem.end) : 0
    const spacerCell = (height: number) => (
      <tbody aria-hidden="true">
        <tr>
          <td colSpan={allColumns.length} style={{ height, padding: 0, border: 0 }} />
        </tr>
      </tbody>
    )

    return (
      <>
        {padTop > 0 && spacerCell(padTop)}
        {virtualItems.map((virtualRow) => {
          const row = rows[virtualRow.index]
          const isLastRow = virtualRow.index === rows.length - 1
          return (
            <tbody
              key={row.id}
              ref={measureRow}
              data-index={virtualRow.index}
              className={cn(isLastRow && '[&_tr:last-child]:border-0')}
            >
              <DataTableRow row={row} />
              <DataTableExpandedRow row={row} />
            </tbody>
          )
        })}
        {padBottom > 0 && spacerCell(padBottom)}
      </>
    )
  }

  // Standard (non-virtual) rendering
  return (
    <TableBody>
      {rows.map((row) => (
        <React.Fragment key={row.id}>
          <DataTableRow row={row} />
          <DataTableExpandedRow row={row} />
        </React.Fragment>
      ))}
    </TableBody>
  )
}
