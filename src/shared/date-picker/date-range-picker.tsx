'use client'

import * as React from 'react'
import { format, isBefore, isAfter, setMonth, setYear } from 'date-fns'
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

export interface DateRangePickerProps {
  startDate?: Date | null
  endDate?: Date | null
  onChange?: (range: { start: Date | null; end: Date | null }) => void
  placeholder?: string
  className?: string
  formatStr?: string
  minDate?: Date
  maxDate?: Date
  disabledDates?: (date: Date) => boolean
}

export function DateRangePicker({
  startDate,
  endDate,
  onChange,
  placeholder = 'Pick a date range',
  className,
  formatStr = 'MMM d',
  minDate,
  maxDate,
  disabledDates,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [currentMonth, setCurrentMonth] = React.useState(
    startDate ?? new Date(),
  )
  const [rangeStart, setRangeStart] = React.useState<Date | null>(
    startDate ?? null,
  )
  const [rangeEnd, setRangeEnd] = React.useState<Date | null>(
    endDate ?? null,
  )
  const [hoverDate, setHoverDate] = React.useState<Date | null>(null)
  const [view, setView] = React.useState<CalendarView>('days')

  React.useEffect(() => {
    setRangeStart(startDate ?? null)
    setRangeEnd(endDate ?? null)
  }, [startDate, endDate])

  // Reset view when popover closes
  React.useEffect(() => {
    if (!open) setView('days')
  }, [open])

  const handleSelect = (date: Date) => {
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(date)
      setRangeEnd(null)
    } else {
      const start = isBefore(date, rangeStart) ? date : rangeStart
      const end = isAfter(date, rangeStart) ? date : rangeStart
      setRangeStart(start)
      setRangeEnd(end)
      onChange?.({ start, end })
      setOpen(false)
    }
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

  const displayText = () => {
    if (rangeStart && rangeEnd) {
      return `${format(rangeStart, formatStr)} - ${format(rangeEnd, formatStr)}`
    }
    return placeholder
  }

  const renderView = () => {
    switch (view) {
      case 'years':
        return (
          <YearPicker
            currentYear={currentMonth.getFullYear()}
            selectedYear={rangeStart?.getFullYear()}
            onYearSelect={handleYearSelect}
            minDate={minDate}
            maxDate={maxDate}
          />
        )
      case 'months':
        return (
          <MonthPicker
            currentYear={currentMonth.getFullYear()}
            selectedMonth={rangeStart?.getMonth()}
            onMonthSelect={handleMonthSelect}
            minDate={minDate}
            maxDate={maxDate}
          />
        )
      default:
        return (
          <CalendarGrid
            currentMonth={currentMonth}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            hoverDate={hoverDate}
            onSelect={handleSelect}
            onHover={setHoverDate}
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
              rangeStart && rangeEnd
                ? 'text-[var(--color-text-primary)]'
                : 'text-[var(--color-text-placeholder)]',
            )}
          >
            {displayText()}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto border-[var(--color-border-default)] bg-[var(--color-layer-01)] p-ds-04"
        align="start"
        sideOffset={4}
      >
        {renderView()}
      </PopoverContent>
    </Popover>
  )
}

DateRangePicker.displayName = 'DateRangePicker'
