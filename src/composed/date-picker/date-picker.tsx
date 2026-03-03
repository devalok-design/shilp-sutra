'use client'

import * as React from 'react'
import { format, setMonth, setYear } from 'date-fns'
import { IconCalendarEvent } from '@tabler/icons-react'
import { cn } from '../../ui/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../ui/popover'
import { CalendarGrid } from './calendar-grid'
import { YearPicker } from './year-picker'
import { MonthPicker } from './month-picker'

type CalendarView = 'days' | 'months' | 'years'

export interface DatePickerProps {
  value?: Date | null
  onChange?: (date: Date | null) => void
  placeholder?: string
  className?: string
  formatStr?: string
  minDate?: Date
  maxDate?: Date
  disabledDates?: (date: Date) => boolean
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
          className={cn(
            'inline-flex h-ds-sm-plus items-center gap-ds-03 rounded-ds-lg border border-border bg-layer-01 px-ds-04 text-left transition-colors duration-fast-01 ease-productive-standard',
            'hover:border-border-strong',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2',
            className,
          )}
        >
          <IconCalendarEvent
            className="h-ico-sm w-ico-sm text-text-placeholder"
            stroke={1.5}
          />
          <span
            className={cn(
              'text-ds-md',
              value
                ? 'text-text-primary'
                : 'text-text-placeholder',
            )}
          >
            {value ? format(value, formatStr) : placeholder}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto border-border bg-layer-01 p-ds-04"
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
