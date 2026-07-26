'use client'

import {
  IconColumns3,
  IconDownload,
  IconSearch,
  IconTextResize,
} from '@tabler/icons-react'
import { type Table } from '@tanstack/react-table'
import * as React from 'react'

import { Button } from './button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu'
import { Icon } from './icon'
import { cn } from './lib/utils'

export type Density = 'compact' | 'standard' | 'comfortable'

const densityLabels: Record<Density, string> = {
  compact: 'Compact',
  standard: 'Standard',
  comfortable: 'Comfortable',
}

const densityCycle: Record<Density, Density> = {
  compact: 'standard',
  standard: 'comfortable',
  comfortable: 'compact',
}

export interface DataTableToolbarProps<TData> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  table: Table<TData>
  globalFilter?: boolean
  globalFilterValue: string
  onGlobalFilterChange: (value: string) => void
  density: Density
  onDensityChange: (density: Density) => void
  enableExport?: boolean
  /**
   * Override the default CSV export. When provided, clicking Export calls this
   * instead of the built-in client-side CSV logic. Receives the currently visible
   * filtered rows so you can trigger a server fetch or apply custom formatting.
   */
  onExport?: () => void
}

const toolbarIconClass = 'text-surface-fg-subtle'

function exportToCsv<TData>(table: Table<TData>) {
  const headers = table
    .getAllLeafColumns()
    .filter((col) => col.getIsVisible() && col.id !== '_select')
    .map((col) => {
      const header = col.columnDef.header
      return typeof header === 'string' ? header : col.id
    })

  const rows = table.getFilteredRowModel().rows.map((row) =>
    table
      .getAllLeafColumns()
      .filter((col) => col.getIsVisible() && col.id !== '_select')
      .map((col) => {
        const value = row.getValue(col.id)
        const str = String(value ?? '')
        // Escape CSV: wrap in quotes if it contains comma, quote, or newline
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`
        }
        return str
      }),
  )

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join(
    '\n',
  )

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'table-export.csv'
  link.click()
  URL.revokeObjectURL(url)
}

export function DataTableToolbar<TData>({
  table,
  globalFilter = false,
  globalFilterValue,
  onGlobalFilterChange,
  density,
  onDensityChange,
  enableExport = true,
  onExport,
  className,
  ...props
}: DataTableToolbarProps<TData>) {
  const toggleableColumns = table
    .getAllColumns()
    .filter((col) => col.getCanHide() && col.id !== '_select')

  return (
    <div className={cn('flex items-center gap-ds-03 pb-ds-04', className)} {...props}>
      {/* Global search */}
      {globalFilter && (
        <div className="flex flex-1 items-center gap-ds-02">
          <Icon icon={IconSearch} size="sm" className={toolbarIconClass} />
          <input
            type="text"
            value={globalFilterValue}
            onChange={(e) => onGlobalFilterChange(e.target.value)}
            placeholder="Search all columns..."
            aria-label="Search all columns"
            className={cn(
              'flex-1 bg-transparent text-body-md',
              'text-surface-fg placeholder:text-surface-fg-subtle',
              'outline-hidden',
              'h-ds-sm',
            )}
          />
        </div>
      )}

      <div className="ml-auto flex items-center gap-ds-03">
        {/* Column visibility dropdown */}
        {toggleableColumns.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                color="neutral"
                size="sm"
                aria-label="Toggle column visibility"
              >
                <Icon icon={IconColumns3} size="sm" className={toolbarIconClass} />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {toggleableColumns.map((column) => {
                const headerDef = column.columnDef.header
                const label =
                  typeof headerDef === 'string' ? headerDef : column.id
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {label}
                  </DropdownMenuCheckboxItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Density toggle */}
        <Button
          variant="outline"
          color="neutral"
          size="sm"
          onClick={() => onDensityChange(densityCycle[density])}
          aria-label={`Table density: ${densityLabels[density]}. Click to change.`}
          title={`Density: ${densityLabels[density]}`}
        >
          <Icon icon={IconTextResize} size="sm" className={toolbarIconClass} />
          {densityLabels[density]}
        </Button>

        {/* CSV Export */}
        {enableExport && (
          <Button
            variant="outline"
            color="neutral"
            size="sm"
            onClick={() => (onExport ? onExport() : exportToCsv(table))}
            aria-label="Export table as CSV"
          >
            <Icon icon={IconDownload} size="sm" className={toolbarIconClass} />
            Export
          </Button>
        )}
      </div>
    </div>
  )
}
DataTableToolbar.displayName = 'DataTableToolbar'
