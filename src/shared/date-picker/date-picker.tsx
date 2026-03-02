'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { IconCalendarEvent } from '@tabler/icons-react'
import { cn } from '../../ui/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../ui/popover'
import { CalendarGrid } from './calendar-grid'

export interface DatePickerProps {
  value?: Date | null
  onChange?: (date: Date | null) => void
  placeholder?: string
  className?: string
  formatStr?: string
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
  className,
  formatStr = 'MMM d, yyyy',
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [currentMonth, setCurrentMonth] = React.useState(
    value ?? new Date(),
  )

  const handleSelect = (date: Date) => {
    onChange?.(date)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex h-9 items-center gap-ds-03 rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-layer-01)] px-ds-04 text-left transition-colors',
            'hover:border-[var(--border-secondary)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2',
            className,
          )}
        >
          <IconCalendarEvent
            className="h-[var(--icon-sm)] w-[var(--icon-sm)] text-[var(--color-text-placeholder)]"
            stroke={1.5}
          />
          <span
            className={cn(
              'text-ds-md',
              value
                ? 'text-[var(--color-text-primary)]'
                : 'text-[var(--color-text-placeholder)]',
            )}
          >
            {value ? format(value, formatStr) : placeholder}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto border-[var(--color-border-default)] bg-[var(--color-layer-01)] p-ds-04"
        align="start"
        sideOffset={4}
      >
        <CalendarGrid
          currentMonth={currentMonth}
          selected={value}
          onSelect={handleSelect}
          onMonthChange={setCurrentMonth}
        />
      </PopoverContent>
    </Popover>
  )
}

DatePicker.displayName = 'DatePicker'
