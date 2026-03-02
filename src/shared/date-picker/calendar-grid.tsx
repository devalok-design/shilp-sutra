'use client'

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
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { cn } from '../../ui/lib/utils'

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export interface CalendarGridProps {
  currentMonth: Date
  selected?: Date | null
  rangeStart?: Date | null
  rangeEnd?: Date | null
  hoverDate?: Date | null
  onSelect: (date: Date) => void
  onHover?: (date: Date | null) => void
  onMonthChange: (date: Date) => void
}

export function CalendarGrid({
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
      <div className="flex items-center justify-between px-ds-02 pb-ds-04">
        <button
          type="button"
          onClick={() => onMonthChange(subMonths(currentMonth, 1))}
          className="inline-flex h-7 w-7 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-placeholder)] transition-colors hover:bg-[var(--color-field)] hover:text-[var(--color-text-secondary)]"
        >
          <IconChevronLeft className="h-[var(--icon-sm)] w-[var(--icon-sm)]" stroke={1.5} />
        </button>
        <span className="text-ds-md semibold text-[var(--color-text-primary)]">
          {format(currentMonth, 'MMMM yyyy')}
        </span>
        <button
          type="button"
          onClick={() => onMonthChange(addMonths(currentMonth, 1))}
          className="inline-flex h-7 w-7 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-placeholder)] transition-colors hover:bg-[var(--color-field)] hover:text-[var(--color-text-secondary)]"
        >
          <IconChevronRight className="h-[var(--icon-sm)] w-[var(--icon-sm)]" stroke={1.5} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0">
        {WEEKDAYS.map((wd) => (
          <div
            key={wd}
            className="flex h-8 items-center justify-center text-ds-xs font-semibold uppercase tracking-wider text-[var(--color-text-placeholder)]"
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
                'flex h-8 w-9 items-center justify-center rounded-[var(--radius-md)] text-ds-md font-body transition-colors',
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
