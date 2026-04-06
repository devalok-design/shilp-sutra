'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { type Row, flexRender } from '@tanstack/react-table'
import { type VirtualItem } from '@tanstack/react-virtual'

import { TableBody, TableCell, TableRow } from './table'
import { Skeleton } from './skeleton'
import { cn } from './lib/utils'
import {
  useDataTableContext,
  getColumnMetaClasses,
  getPinnedCellStyle,
  isColumnEditable,
  INTERACTIVE_SELECTOR,
} from './data-table-context'

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
        'h-ds-xs-plus w-full rounded-ds-md',
        'border border-accent-7 bg-surface-raised-hover',
        'px-ds-02 text-ds-sm',
        'text-surface-fg placeholder:text-surface-fg-subtle',
        'outline-none focus:border-accent-7',
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
    cellPadding,
    columnPinningState,
    editable,
    editingCell,
    setEditingCell,
    onCellEdit,
    virtualRows,
    onRowClick,
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
              cellPadding,
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

  if (!expandable || !row.getIsExpanded() || !renderExpanded) return null

  return (
    <TableRow
      style={style}
      className={virtualRows ? 'absolute w-full flex' : undefined}
    >
      <TableCell
        colSpan={allColumns.length}
        className={cn(
          'bg-surface-raised p-ds-05',
          virtualRows && 'flex-1',
        )}
      >
        {renderExpanded(row.original)}
      </TableCell>
    </TableRow>
  )
}

// ── SkeletonRows ────────────────────────────────────────────────

function DataTableSkeletonRows({
  rowCount,
}: {
  rowCount: number
}) {
  const { allColumns, cellPadding } = useDataTableContext()
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
              <TableCell
                key={`skeleton-${rowIdx}-${colIdx}`}
                className={cellPadding}
              >
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
              'h-24 text-center',
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
            <DataTableRow
              key={row.id}
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
