'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/ui/popover'
import { IconCalendarEvent, IconX } from '@tabler/icons-react'

// ============================================================
// Helpers
// ============================================================

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function toDateInputValue(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getNextMonday(): Date {
  const now = new Date()
  const day = now.getDay()
  const daysUntilMonday = day === 0 ? 1 : 8 - day
  const next = new Date(now)
  next.setDate(now.getDate() + daysUntilMonday)
  return next
}

function addDays(days: number): Date {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d
}

// ============================================================
// Types
// ============================================================

export interface TaskDatePickerProps {
  value: Date | string | null
  onChange: (date: Date | null) => void
  presets?: boolean
  readOnly?: boolean
  className?: string
}

// ============================================================
// TaskDatePicker
// ============================================================

const TaskDatePicker = React.forwardRef<HTMLButtonElement, TaskDatePickerProps>(
  function TaskDatePicker(
    { value, onChange, presets = true, readOnly, className },
    ref,
  ) {
    const [open, setOpen] = React.useState(false)

    const dateValue = React.useMemo(() => {
      if (!value) return null
      if (value instanceof Date) return value
      return new Date(value)
    }, [value])

    const displayText = dateValue ? formatDate(dateValue) : 'No date'

    const handlePreset = (date: Date | null) => {
      onChange(date)
      setOpen(false)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value ? new Date(e.target.value) : null)
    }

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation()
      onChange(null)
    }

    if (readOnly) {
      return (
        <span className={cn('px-ds-03 py-ds-02 text-ds-md text-surface-fg', className)}>
          {displayText}
        </span>
      )
    }

    return (
      <div className={cn('inline-flex items-center gap-ds-02', className)}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              ref={ref}
              type="button"
              className="inline-flex items-center gap-ds-02b rounded-ds-md px-ds-03 py-ds-02 text-ds-md transition-colors hover:bg-surface-3"
            >
              <IconCalendarEvent className="h-ico-sm w-ico-sm text-surface-fg-subtle" stroke={1.5} />
              <span className={dateValue ? 'text-surface-fg' : 'text-surface-fg-subtle'}>
                {displayText}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[220px] border-surface-border-strong bg-surface-1 p-ds-03"
            align="start"
            sideOffset={4}
          >
            <div className="space-y-ds-03">
              {/* Native date input as the primary selector */}
              <input
                type="date"
                value={dateValue ? toDateInputValue(dateValue) : ''}
                onChange={handleInputChange}
                aria-label="Select date"
                className="w-full rounded-ds-md border border-surface-border-strong bg-transparent px-ds-03 py-ds-02 text-ds-md text-surface-fg outline-none focus:border-accent-7"
              />

              {/* Preset buttons */}
              {presets && (
                <div className="space-y-ds-01">
                  <p className="text-ds-xs font-semibold uppercase tracking-wider text-surface-fg-subtle">
                    Quick select
                  </p>
                  <div className="grid grid-cols-2 gap-ds-02">
                    <button
                      type="button"
                      onClick={() => handlePreset(new Date())}
                      className="rounded-ds-md px-ds-03 py-ds-02 text-left text-ds-sm text-surface-fg transition-colors hover:bg-surface-3"
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePreset(addDays(1))}
                      className="rounded-ds-md px-ds-03 py-ds-02 text-left text-ds-sm text-surface-fg transition-colors hover:bg-surface-3"
                    >
                      Tomorrow
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePreset(getNextMonday())}
                      className="rounded-ds-md px-ds-03 py-ds-02 text-left text-ds-sm text-surface-fg transition-colors hover:bg-surface-3"
                    >
                      Next Monday
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePreset(addDays(7))}
                      className="rounded-ds-md px-ds-03 py-ds-02 text-left text-ds-sm text-surface-fg transition-colors hover:bg-surface-3"
                    >
                      +7 days
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePreset(addDays(14))}
                      className="rounded-ds-md px-ds-03 py-ds-02 text-left text-ds-sm text-surface-fg transition-colors hover:bg-surface-3"
                    >
                      +14 days
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePreset(null)}
                      className="rounded-ds-md px-ds-03 py-ds-02 text-left text-ds-sm text-surface-fg-subtle transition-colors hover:bg-surface-3"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Inline clear button when a date is set */}
        {dateValue && (
          <button
            type="button"
            onClick={handleClear}
            className="rounded-ds-md p-ds-02 transition-colors hover:bg-surface-3"
            aria-label="Clear due date"
          >
            <IconX className="h-3 w-3 text-surface-fg-subtle" />
          </button>
        )}
      </div>
    )
  },
)

TaskDatePicker.displayName = 'TaskDatePicker'

export { TaskDatePicker }
