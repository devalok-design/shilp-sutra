'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../ui/lib/utils'
import { springs } from '../../ui/lib/motion'
import { useMotion } from '../../motion/motion-provider'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from '../../ui/table'
import { Badge } from '../../ui/badge'
import type { BlockComponentProps, BlockTableData, BlockTableColumn } from '../types'

type SortDir = 'asc' | 'desc' | null

function renderCellValue(value: unknown, column: BlockTableColumn) {
  if (column.variant === 'badge') {
    if (value && typeof value === 'object' && 'label' in value) {
      const badgeObj = value as { label: string; color: string }
      return (
        <Badge variant="subtle" size="sm" color={badgeObj.color as 'default'}>
          {badgeObj.label}
        </Badge>
      )
    }
    return (
      <Badge variant="subtle" size="sm">
        {String(value ?? '')}
      </Badge>
    )
  }

  return String(value ?? '')
}

function sortRows(
  rows: Record<string, unknown>[],
  sortKey: string | null,
  sortDir: SortDir,
): Record<string, unknown>[] {
  if (!sortKey || !sortDir) return rows
  return [...rows].sort((a, b) => {
    const aVal = a[sortKey]
    const bVal = b[sortKey]
    const aStr = String(aVal ?? '')
    const bStr = String(bVal ?? '')
    const aNum = Number(aVal)
    const bNum = Number(bVal)

    // If both are numeric, sort numerically
    if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
      return sortDir === 'asc' ? aNum - bNum : bNum - aNum
    }

    // Otherwise sort lexicographically
    const cmp = aStr.localeCompare(bStr)
    return sortDir === 'asc' ? cmp : -cmp
  })
}

const BlockTable = React.memo(function BlockTable({
  data,
  confidence,
}: BlockComponentProps<BlockTableData>) {
  const { reducedMotion } = useMotion()
  const [sortKey, setSortKey] = React.useState<string | null>(null)
  const [sortDir, setSortDir] = React.useState<SortDir>(null)

  const handleHeaderClick = React.useCallback(
    (key: string) => {
      if (!data.sortable) return
      if (sortKey !== key) {
        setSortKey(key)
        setSortDir('asc')
      } else if (sortDir === 'asc') {
        setSortDir('desc')
      } else if (sortDir === 'desc') {
        setSortKey(null)
        setSortDir(null)
      }
    },
    [data.sortable, sortKey, sortDir],
  )

  const columns = data.columns ?? []
  const sortedRows = sortRows(data.rows ?? [], sortKey, sortDir)

  return (
    <div
      className={cn(
        'overflow-x-auto',
        confidence === 'low' && 'border-l-2 border-warning-7 pl-3',
      )}
    >
      <Table>
        {data.caption && <TableCaption>{data.caption}</TableCaption>}
        <TableHeader>
          <TableRow>
            {columns.map((col) => {
              const isSorted = sortKey === col.key
              const ariaSort = data.sortable
                ? isSorted
                  ? sortDir === 'asc'
                    ? ('ascending' as const)
                    : ('descending' as const)
                  : ('none' as const)
                : undefined

              return (
                <TableHead
                  key={col.key}
                  role="columnheader"
                  className={cn(
                    col.variant === 'number' && 'text-right',
                    data.sortable && 'cursor-pointer select-none',
                  )}
                  tabIndex={data.sortable ? 0 : undefined}
                  onClick={
                    data.sortable
                      ? () => handleHeaderClick(col.key)
                      : undefined
                  }
                  onKeyDown={
                    data.sortable
                      ? (e: React.KeyboardEvent) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            handleHeaderClick(col.key)
                          }
                        }
                      : undefined
                  }
                  aria-sort={ariaSort}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {isSorted && sortDir === 'asc' && (
                      <span aria-hidden="true">&#9650;</span>
                    )}
                    {isSorted && sortDir === 'desc' && (
                      <span aria-hidden="true">&#9660;</span>
                    )}
                  </span>
                </TableHead>
              )
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedRows.map((row, rowIndex) => {
            const rowKey =
              typeof row.id === 'string' || typeof row.id === 'number'
                ? String(row.id)
                : `row-${rowIndex}`

            const RowWrapper = reducedMotion ? 'tr' : motion.tr

            const motionProps = reducedMotion
              ? {}
              : {
                  initial: { opacity: 0, y: 6 } as const,
                  animate: { opacity: 1, y: 0 } as const,
                  transition: { ...springs.responsive, delay: rowIndex * 0.03 },
                }

            return (
              <RowWrapper
                key={rowKey}
                className="hover:bg-surface-raised-hover transition-colors"
                {...motionProps}
              >
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    className={cn(
                      'text-ds-sm py-ds-02b px-ds-04',
                      col.variant === 'number' &&
                        'text-right tabular-nums font-medium',
                    )}
                  >
                    {renderCellValue(row[col.key], col)}
                  </TableCell>
                ))}
              </RowWrapper>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
})

BlockTable.displayName = 'BlockTable'

export { BlockTable }
