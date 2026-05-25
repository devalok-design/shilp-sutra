'use client'

import { IconCalendarEvent } from '@tabler/icons-react'
import { format, setMonth, setYear } from 'date-fns'
import * as React from 'react'

import { Icon } from '../../ui/icon'
import { cn } from '../../ui/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../ui/popover'
import { CalendarGrid } from './calendar-grid'
import { MonthPicker } from './month-picker'
import { YearPicker } from './year-picker'

type CalendarView = 'days' | 'months' | 'years'

/**
 * A popover-based date picker with day/month/year drill-down views.
 * Supports min/max date constraints and arbitrary date disabling.
 */
export interface DatePickerProps extends Omit<React.ComponentPropsWithoutRef<'button'>, 'onChange' | 'value'> {
  /** Currently selected date (controlled). */
  value?: Date | null
  /** Called when a date is selected. Receives null if cleared. */
  onChange?: (date: Date | null) => void
  placeholder?: string
  /** date-fns format string for the trigger display. @default 'MMM d, yyyy' */
  formatStr?: string
  /** Earliest selectable date. */
  minDate?: Date
  /** Latest selectable date. */
  maxDate?: Date
  /** Predicate to disable specific dates (return true to disable). */
  disabledDates?: (date: Date) => boolean
  className?: string
}

const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  function DatePicker(
    {
      value,
      onChange,
      placeholder = 'Pick a date',
      className,
      formatStr = 'MMM d, yyyy',
      minDate,
      maxDate,
      disabledDates,
      ...props
    },
    ref,
  ) {
  const [open, setOpen] = React.useState(false)
  const [currentMonth, setCurrentMonth] = React.useState(
    value ?? new Date(),
  )
  const [view, setView] = React.useState<CalendarView>('days')

  // Reset view when popover closes
  React.useEffect(() => {
    if (!open) setView('days')
  }, [open])

  const handleSelect = (date: Date) => {
    onChange?.(date)
    setOpen(false)
  }

  const handleHeaderClick = () => {
    setView((prev) => (prev === 'days' ? 'months' : 'years'))
  }

  const handleMonthSelect = (month: number) => {
    setCurrentMonth((prev) => setMonth(prev, month))
    setView('days')
  }

  const handleYearSelect = (year: number) => {
    setCurrentMonth((prev) => setYear(prev, year))
    setView('months')
  }

  const renderView = () => {
    switch (view) {
      case 'years':
        return (
          <YearPicker
            currentYear={currentMonth.getFullYear()}
            selectedYear={value?.getFullYear()}
            onYearSelect={handleYearSelect}
            minDate={minDate}
            maxDate={maxDate}
          />
        )
      case 'months':
        return (
          <MonthPicker
            currentYear={currentMonth.getFullYear()}
            selectedMonth={value?.getMonth()}
            onMonthSelect={handleMonthSelect}
            minDate={minDate}
            maxDate={maxDate}
          />
        )
      default:
        return (
          <CalendarGrid
            currentMonth={currentMonth}
            selected={value}
            onSelect={handleSelect}
            onMonthChange={setCurrentMonth}
            onHeaderClick={handleHeaderClick}
            disabledDates={disabledDates}
            minDate={minDate}
            maxDate={maxDate}
          />
        )
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          ref={ref}
          type="button"
          aria-label={value ? `Change date, ${format(value, formatStr)}` : placeholder}
          {...props}
          className={cn(
            'inline-flex h-ds-sm-plus items-center gap-ds-03 rounded-surface border border-surface-border-strong bg-surface-overlay px-ds-04 text-left transition-colors duration-fast-01 ease-productive-standard',
            'hover:border-surface-border-strong',
            'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-9 focus-visible:ring-offset-2',
            className,
          )}
        >
          <Icon icon={IconCalendarEvent} size="sm" stroke="light" className="text-surface-fg-subtle" />
          <span
            className={cn(
              'text-ds-md',
              value
                ? 'text-surface-fg'
                : 'text-surface-fg-subtle',
            )}
          >
            {value ? format(value, formatStr) : placeholder}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto border-surface-border-strong bg-surface-overlay p-ds-04"
        align="start"
        sideOffset={4}
      >
        {renderView()}
      </PopoverContent>
    </Popover>
  )
  },
)

DatePicker.displayName = 'DatePicker'

export { DatePicker }
