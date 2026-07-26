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
function DataTableRow<TData>({
  row,
  style,
}: {
  row: Row<TData>
  style?: React.CSSProperties
}) {
  const {
    table,
    columnPinningState,
    editable,
    editingCell,
    setEditingCell,
    onCellEdit,
    virtualRows,
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
      style={style}
      className={cn(
        virtualRows ? 'absolute w-full flex' : undefined,
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
              virtualRows && 'flex-1',
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
function DataTableExpandedRow<TData>({
  row,
  style,
}: {
  row: Row<TData>
  style?: React.CSSProperties
}) {
  const { allColumns, expandable, renderExpanded, virtualRows } =
    useDataTableContext<TData>()
  // Self-guarded (StatFlash pattern) — reveal collapses to an instant swap
  // without relying on a consumer MotionProvider.
  const prefersReduced = useReducedMotion()

  if (!expandable || !renderExpanded) return null

  const expanded = row.getIsExpanded()

  // Virtual rows are absolutely positioned with measured heights — a height
  // animation would fight the virtualizer, so the reveal is instant there.
  if (virtualRows) {
    if (!expanded) return null
    return (
      <TableRow style={style} className="absolute w-full flex">
        <TableCell
          colSpan={allColumns.length}
          className="bg-surface-base p-ds-05 flex-1"
        >
          {renderExpanded(row.original)}
        </TableCell>
      </TableRow>
    )
  }

  return (
    <AnimatePresence initial={false}>
      {expanded && (
        <TableRow style={style}>
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
}: {
  loading?: boolean
  skeletonRowCount: number
  noResultsText?: string
  emptyState?: React.ReactNode
  virtualItems?: VirtualItem[]
  totalVirtualSize?: number
}) {
  const { table, allColumns, virtualRows, expandable } = useDataTableContext<TData>()
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
    // DEV warning: virtualRows + expandable is supported but expanded rows use a
    // fixed height equal to virtualRowHeight — the virtualizer cannot measure
    // dynamic content. Pass a virtualRowHeight large enough to contain your
    // renderExpanded content, or switch to non-virtual mode for expandable tables.
    if (process.env.NODE_ENV !== 'production' && expandable) {
      console.warn(
        '[DataTable] virtualRows + expandable: expanded row content renders at a ' +
        'fixed height (virtualRowHeight prop, default 48px). If your expanded content ' +
        'is taller, increase virtualRowHeight to match or use non-virtual mode.',
      )
    }
    return (
      <TableBody
        style={{
          height: `${totalVirtualSize}px`,
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualRow) => {
          const row = rows[virtualRow.index]
          return (
            <React.Fragment key={row.id}>
              <DataTableRow
                row={row}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              />
              {/* Expanded content renders immediately after the data row.
                  It is absolutely positioned offset by the row's own height so it
                  sits below rather than on top of the row. The virtualizer total
                  size does not account for this extra height — keep renderExpanded
                  content short or use non-virtual mode for tall expansions. */}
              <DataTableExpandedRow
                row={row}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(calc(${virtualRow.start}px + ${virtualRow.size}px))`,
                }}
              />
            </React.Fragment>
          )
        })}
      </TableBody>
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
