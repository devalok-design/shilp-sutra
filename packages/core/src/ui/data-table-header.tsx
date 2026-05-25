'use client'

import {
  IconArrowDown,
  IconArrowsSort,
  IconArrowUp,
} from '@tabler/icons-react'
import { flexRender } from '@tanstack/react-table'
import { AnimatePresence,motion } from 'framer-motion'
import React from 'react'

import {
  getColumnMetaClasses,
  getPinnedCellStyle,
  useDataTableContext,
} from './data-table-context'
import { Icon } from './icon'
import { springs } from './lib/motion'
import { cn } from './lib/utils'
import { TableHead, TableHeader, TableRow } from './table'

/**
 * Renders the `<TableHeader>` block including sortable column headers
 * and optional per-column filter inputs. Internal — not exported to consumers.
 */
function DataTableHeaderImpl({ stickyHeader }: { stickyHeader?: boolean }) {
  const { table, sortable, filterable, columnPinningState } =
    useDataTableContext()

  return (
    <TableHeader
      className={cn(
        stickyHeader && 'sticky top-0 z-10 bg-surface-base',
      )}
    >
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow key={headerGroup.id}>
          {headerGroup.headers.map((header) => {
            const canSort = sortable && header.column.getCanSort()
            const sorted = header.column.getIsSorted()
            const pinned = getPinnedCellStyle(
              header.column.id,
              columnPinningState,
            )

            return (
              <TableHead
                key={header.id}
                className={cn(
                  pinned.className,
                  getColumnMetaClasses(
                    header.column.columnDef.meta as Record<string, unknown>,
                  ),
                )}
                style={pinned.style}
                aria-sort={
                  canSort
                    ? sorted === 'asc'
                      ? 'ascending'
                      : sorted === 'desc'
                        ? 'descending'
                        : 'none'
                    : undefined
                }
              >
                {header.isPlaceholder ? null : canSort ? (
                  <button
                    type="button"
                    className={cn(
                      'flex items-center gap-ds-01 font-medium',
                      'cursor-pointer select-none',
                      '-ml-ds-01 rounded-control-inner px-ds-01 py-ds-01',
                      'hover:bg-surface-raised transition-colors',
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                    aria-label={`Sort by ${typeof header.column.columnDef.header === 'string' ? header.column.columnDef.header : header.column.id}`}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                    <AnimatePresence mode="wait" initial={false}>
                      {sorted === 'asc' ? (
                        <motion.span
                          key="asc"
                          initial={{ opacity: 0, rotate: 90 }}
                          animate={{ opacity: 1, rotate: 0 }}
                          exit={{ opacity: 0, rotate: -90 }}
                          transition={springs.snappy}
                          className="inline-flex"
                        >
                          <Icon
                            icon={IconArrowUp}
                            size="sm"
                            className="text-surface-fg-muted"
                          />
                        </motion.span>
                      ) : sorted === 'desc' ? (
                        <motion.span
                          key="desc"
                          initial={{ opacity: 0, rotate: -90 }}
                          animate={{ opacity: 1, rotate: 0 }}
                          exit={{ opacity: 0, rotate: 90 }}
                          transition={springs.snappy}
                          className="inline-flex"
                        >
                          <Icon
                            icon={IconArrowDown}
                            size="sm"
                            className="text-surface-fg-muted"
                          />
                        </motion.span>
                      ) : (
                        <motion.span
                          key="unsorted"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={springs.snappy}
                          className="inline-flex"
                        >
                          <Icon
                            icon={IconArrowsSort}
                            size="sm"
                            className="text-surface-fg-subtle"
                          />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                ) : (
                  flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )
                )}
              </TableHead>
            )
          })}
        </TableRow>
      ))}

      {/* Column filter row */}
      {filterable &&
        table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={`${headerGroup.id}-filters`}>
            {headerGroup.headers.map((header) => (
              <TableHead key={`${header.id}-filter`} className="py-ds-01">
                {header.isPlaceholder ||
                header.column.columnDef.enableColumnFilter === false ? null : (
                  <input
                    type="text"
                    value={
                      (header.column.getFilterValue() as string) ?? ''
                    }
                    onChange={(e) =>
                      header.column.setFilterValue(e.target.value)
                    }
                    placeholder={`Filter ${typeof header.column.columnDef.header === 'string' ? header.column.columnDef.header : ''}...`}
                    aria-label={`Filter ${typeof header.column.columnDef.header === 'string' ? header.column.columnDef.header : header.column.id}`}
                    className={cn(
                      'h-ds-xs-plus w-full rounded-control',
                      'border border-surface-border-strong bg-surface-raised-hover',
                      'px-ds-02 text-ds-sm',
                      'text-surface-fg placeholder:text-surface-fg-subtle',
                      'outline-hidden focus:border-accent-7',
                    )}
                  />
                )}
              </TableHead>
            ))}
          </TableRow>
        ))}
    </TableHeader>
  )
}

export { DataTableHeaderImpl as DataTableHeader }
