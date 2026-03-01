'use client'

import * as React from 'react'
import { cn } from '../ui/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isWithinInterval,
  isBefore,
  isAfter,
} from 'date-fns'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

interface CalendarGridProps {
  currentMonth: Date
  selected?: Date | null
  rangeStart?: Date | null
  rangeEnd?: Date | null
  hoverDate?: Date | null
  onSelect: (date: Date) => void
  onHover?: (date: Date | null) => void
  onMonthChange: (date: Date) => void
}

function CalendarGrid({
  currentMonth,
  selected,
  rangeStart,
  rangeEnd,
  hoverDate,
  onSelect,
  onHover,
  onMonthChange,
}: CalendarGridProps) {
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)

  const days: Date[] = []
  let day = calendarStart
  while (day <= calendarEnd) {
    days.push(day)
    day = addDays(day, 1)
  }

  const isInRange = (date: Date) => {
    if (rangeStart && rangeEnd) {
      const start = isBefore(rangeStart, rangeEnd) ? rangeStart : rangeEnd
      const end = isAfter(rangeEnd, rangeStart) ? rangeEnd : rangeStart
      return isWithinInterval(date, { start, end })
    }
    if (rangeStart && hoverDate) {
      const start = isBefore(rangeStart, hoverDate) ? rangeStart : hoverDate
      const end = isAfter(hoverDate, rangeStart) ? hoverDate : rangeStart
      return isWithinInterval(date, { start, end })
    }
    return false
  }

  const isRangeEdge = (date: Date) => {
    if (rangeStart && isSameDay(date, rangeStart)) return true
    if (rangeEnd && isSameDay(date, rangeEnd)) return true
    return false
  }

  return (
    <div className="w-[252px]">
      <div className="flex items-center justify-between px-1 pb-3">
        <button
          type="button"
          onClick={() => onMonthChange(subMonths(currentMonth, 1))}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-text-placeholder)] transition-colors hover:bg-[var(--color-field)] hover:text-[var(--color-text-secondary)]"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <span className="B2-Reg semibold text-[var(--color-text-primary)]">
          {format(currentMonth, 'MMMM yyyy')}
        </span>
        <button
          type="button"
          onClick={() => onMonthChange(addMonths(currentMonth, 1))}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-text-placeholder)] transition-colors hover:bg-[var(--color-field)] hover:text-[var(--color-text-secondary)]"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0">
        {WEEKDAYS.map((wd) => (
          <div
            key={wd}
            className="flex h-8 items-center justify-center text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-placeholder)]"
          >
            {wd}
          </div>
        ))}

        {days.map((d, i) => {
          const inMonth = isSameMonth(d, currentMonth)
          const isSelected = selected && isSameDay(d, selected)
          const inRange = isInRange(d)
          const edge = isRangeEdge(d)
          const isToday = isSameDay(d, new Date())

          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(d)}
              onMouseEnter={() => onHover?.(d)}
              onMouseLeave={() => onHover?.(null)}
              className={cn(
                'flex h-8 w-9 items-center justify-center rounded-md text-[13px] font-[Ranade] transition-colors',
                !inMonth && 'pointer-events-none opacity-0',
                inMonth && !isSelected && !edge && !inRange &&
                  'text-[var(--color-text-primary)] hover:bg-[var(--color-field)]',
                inRange && !edge &&
                  'rounded-none bg-[var(--color-field)] text-[var(--color-text-primary)]',
                (isSelected || edge) &&
                  'bg-[var(--color-interactive)] text-[var(--color-text-on-color)] hover:bg-[var(--color-interactive-hover)]',
                isToday && !isSelected && !edge &&
                  'font-semibold text-[var(--color-interactive)]',
              )}
            >
              {format(d, 'd')}
            </button>
          )
        })}
      </div>
    </div>
  )
}

interface DatePickerProps {
  value?: Date | null
  onChange?: (date: Date | null) => void
  placeholder?: string
  className?: string
  formatStr?: string
}

function DatePicker({
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
            'inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-layer-01)] px-3 text-left transition-colors',
            'hover:border-[var(--border-secondary)]',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--border-tertiary)]',
            className,
          )}
        >
          <CalendarDays
            className="h-4 w-4 text-[var(--color-text-placeholder)]"
            strokeWidth={1.5}
          />
          <span
            className={cn(
              'B2-Reg',
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
        className="w-auto border-[var(--color-border-default)] bg-[var(--color-layer-01)] p-3"
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

interface DateRangePickerProps {
  startDate?: Date | null
  endDate?: Date | null
  onChange?: (range: { start: Date | null; end: Date | null }) => void
  placeholder?: string
  className?: string
  formatStr?: string
}

function DateRangePicker({
  startDate,
  endDate,
  onChange,
  placeholder = 'Pick a date range',
  className,
  formatStr = 'MMM d',
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

  React.useEffect(() => {
    setRangeStart(startDate ?? null)
    setRangeEnd(endDate ?? null)
  }, [startDate, endDate])

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

  const displayText = () => {
    if (rangeStart && rangeEnd) {
      return `${format(rangeStart, formatStr)} - ${format(rangeEnd, formatStr)}`
    }
    return placeholder
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-layer-01)] px-3 text-left transition-colors',
            'hover:border-[var(--border-secondary)]',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--border-tertiary)]',
            className,
          )}
        >
          <CalendarDays
            className="h-4 w-4 text-[var(--color-text-placeholder)]"
            strokeWidth={1.5}
          />
          <span
            className={cn(
              'B2-Reg',
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
        className="w-auto border-[var(--color-border-default)] bg-[var(--color-layer-01)] p-3"
        align="start"
        sideOffset={4}
      >
        <CalendarGrid
          currentMonth={currentMonth}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          hoverDate={hoverDate}
          onSelect={handleSelect}
          onHover={setHoverDate}
          onMonthChange={setCurrentMonth}
        />
      </PopoverContent>
    </Popover>
  )
}

DateRangePicker.displayName = 'DateRangePicker'

export { DatePicker, DateRangePicker, CalendarGrid }
export type { DatePickerProps, DateRangePickerProps }
