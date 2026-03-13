'use client'

import * as React from 'react'
import { format, isBefore, isAfter, setMonth, setYear, addMonths } from 'date-fns'
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
import { Presets } from './presets'
import type { PresetKey } from './presets'

type CalendarView = 'days' | 'months' | 'years'

export interface DateRangePickerProps extends Omit<React.ComponentPropsWithoutRef<'button'>, 'onChange'> {
  startDate?: Date | null
  endDate?: Date | null
  onChange?: (range: { start: Date | null; end: Date | null }) => void
  placeholder?: string
  className?: string
  formatStr?: string
  minDate?: Date
  maxDate?: Date
  disabledDates?: (date: Date) => boolean
  /** Show a presets sidebar with quick date range selections */
  presets?: PresetKey[]
  /** Number of calendar months to display side by side (default: 1) */
  numberOfMonths?: number
}

const DateRangePicker = React.forwardRef<HTMLButtonElement, DateRangePickerProps>(
  function DateRangePicker(
    {
      startDate,
      endDate,
      onChange,
      placeholder = 'Pick a date range',
      className,
      formatStr = 'MMM d, yyyy',
      minDate,
      maxDate,
      disabledDates,
      presets,
      numberOfMonths = 1,
      ...props
    },
    ref,
  ) {
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

  const monthCount = Math.max(1, numberOfMonths)

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

  const handlePresetSelect = (start: Date, end: Date) => {
    setRangeStart(start)
    setRangeEnd(end)
    onChange?.({ start, end })
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

  const displayText = () => {
    if (rangeStart && rangeEnd) {
      return `${format(rangeStart, formatStr)} - ${format(rangeEnd, formatStr)}`
    }
    return placeholder
  }

  const renderCalendarGrids = () => {
    if (monthCount === 1) {
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

    return (
      <div className="flex flex-row gap-ds-04">
        {Array.from({ length: monthCount }, (_, i) => (
          <CalendarGrid
            key={i}
            currentMonth={addMonths(currentMonth, i)}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            hoverDate={hoverDate}
            onSelect={handleSelect}
            onHover={setHoverDate}
            onMonthChange={(date) => {
              // Adjust so the first grid stays in sync
              setCurrentMonth(addMonths(date, -i))
            }}
            onHeaderClick={handleHeaderClick}
            disabledDates={disabledDates}
            minDate={minDate}
            maxDate={maxDate}
            hidePrevNav={i > 0}
            hideNextNav={i < monthCount - 1}
          />
        ))}
      </div>
    )
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
        return renderCalendarGrids()
    }
  }

  const hasPresets = presets && presets.length > 0

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          ref={ref}
          type="button"
          {...props}
          className={cn(
            'inline-flex h-ds-sm-plus items-center gap-ds-03 rounded-ds-lg border border-surface-border-strong bg-surface-1 px-ds-04 text-left transition-colors duration-fast-01 ease-productive-standard',
            'hover:border-surface-border-strong',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-9 focus-visible:ring-offset-2',
            className,
          )}
        >
          <IconCalendarEvent
            className="h-ico-sm w-ico-sm text-surface-fg-subtle"
            stroke={1.5}
          />
          <span
            className={cn(
              'text-ds-md',
              rangeStart && rangeEnd
                ? 'text-surface-fg'
                : 'text-surface-fg-subtle',
            )}
          >
            {displayText()}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto border-surface-border-strong bg-surface-1 p-ds-04"
        align="start"
        sideOffset={4}
      >
        {hasPresets ? (
          <div className="flex flex-row gap-ds-04">
            <div className="min-w-[140px] border-r border-surface-border-strong pr-ds-04">
              <Presets presets={presets} onSelect={handlePresetSelect} />
            </div>
            <div>{renderView()}</div>
          </div>
        ) : (
          renderView()
        )}
      </PopoverContent>
    </Popover>
  )
  },
)

DateRangePicker.displayName = 'DateRangePicker'

export { DateRangePicker }
