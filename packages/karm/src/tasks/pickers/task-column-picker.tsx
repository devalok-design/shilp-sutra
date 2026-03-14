'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/ui/popover'
import { IconCheck, IconChevronDown } from '@tabler/icons-react'
import type { Column } from '../task-types'

// ============================================================
// Types
// ============================================================

export interface TaskColumnPickerProps {
  columns: Column[]
  value: string
  onChange: (columnId: string) => void
  readOnly?: boolean
  className?: string
}

// ============================================================
// TaskColumnPicker
// ============================================================

const TaskColumnPicker = React.forwardRef<HTMLButtonElement, TaskColumnPickerProps>(
  function TaskColumnPicker({ columns, value, onChange, readOnly, className }, ref) {
    const [open, setOpen] = React.useState(false)

    const selectedColumn = columns.find((c) => c.id === value)
    const displayName = selectedColumn?.name ?? 'Select column'

    if (readOnly) {
      return (
        <span className={cn('px-ds-03 py-ds-02 text-ds-md text-surface-fg', className)}>
          {displayName}
        </span>
      )
    }

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            ref={ref}
            type="button"
            className={cn(
              'inline-flex items-center gap-ds-02b rounded-ds-md px-ds-03 py-ds-02 text-ds-md text-surface-fg transition-colors hover:bg-surface-3',
              className,
            )}
          >
            <span>{displayName}</span>
            <IconChevronDown className="h-3 w-3 text-surface-fg-subtle" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[180px] border-surface-border-strong bg-surface-1 p-ds-02"
          align="start"
          sideOffset={4}
        >
          {columns.map((col) => (
            <button
              key={col.id}
              type="button"
              onClick={() => {
                onChange(col.id)
                setOpen(false)
              }}
              className={cn(
                'flex w-full items-center gap-ds-03 rounded-ds-md px-ds-03 py-ds-02b text-left text-ds-md transition-colors',
                'hover:bg-surface-3',
                col.id === value ? 'text-accent-11' : 'text-surface-fg',
              )}
            >
              {col.name}
              {col.id === value && (
                <IconCheck className="ml-auto h-ico-sm w-ico-sm" />
              )}
            </button>
          ))}
        </PopoverContent>
      </Popover>
    )
  },
)

TaskColumnPicker.displayName = 'TaskColumnPicker'

export { TaskColumnPicker }
