'use client'

import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  lastDayOfMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import * as React from 'react'

import { Icon } from '../../ui/icon'
import { cn } from '../../ui/lib/utils'

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export interface CalendarEvent {
  date: Date
  color?: string
  label?: string
}

export interface CalendarGridProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'onSelect'> {
  currentMonth: Date
  selected?: Date | null
  rangeStart?: Date | null
  rangeEnd?: Date | null
  hoverDate?: Date | null
  onSelect: (date: Date) => void
  onHover?: (date: Date | null) => void
  onMonthChange: (date: Date) => void
  onHeaderClick?: () => void
  disabledDates?: (date: Date) => boolean
  minDate?: Date
  maxDate?: Date
  /** Hide the previous-month navigation arrow */
  hidePrevNav?: boolean
  /** Hide the next-month navigation arrow */
  hideNextNav?: boolean
  /** Events to display as dot indicators on dates */
  events?: CalendarEvent[]
}

export const CalendarGrid = React.forwardRef<HTMLDivElement, CalendarGridProps>(
  function CalendarGrid({
  currentMonth,
  selected,
  rangeStart,
  rangeEnd,
  hoverDate,
  onSelect,
  onHover,
  onMonthChange,
  onHeaderClick,
  disabledDates,
  minDate,
  maxDate,
  hidePrevNav,
  hideNextNav,
  events,
  className,
  ...props
}, forwardedRef) {
  const gridRef = React.useRef<HTMLDivElement>(null)

  const eventsByDate = React.useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    if (!events) return map
    for (const evt of events) {
      const key = format(evt.date, 'yyyy-MM-dd')
      const arr = map.get(key) ?? []
      arr.push(evt)
      map.set(key, arr)
    }
    return map
  }, [events])

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

  const isDateDisabled = (date: Date): boolean => {
    if (disabledDates?.(date)) return true
    if (minDate && isBefore(date, startOfDay(minDate))) return true
    if (maxDate && isAfter(date, startOfDay(maxDate))) return true
    return false
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

  const focusDate = (target: Date) => {
    if (!gridRef.current) return
    const dateStr = format(target, 'yyyy-MM-dd')
    const btn = gridRef.current.querySelector<HTMLButtonElement>(
      `[data-date="${dateStr}"]`,
    )
    if (btn) {
      btn.focus()
    } else {
      // Date is in a different month — navigate there and focus after render
      onMonthChange(startOfMonth(target))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    const dateStr = target.getAttribute('data-date')
    if (!dateStr) return

    const current = new Date(dateStr + 'T00:00:00')
    let next: Date | null = null

    switch (e.key) {
      case 'ArrowLeft':
        next = addDays(current, -1)
        break
      case 'ArrowRight':
        next = addDays(current, 1)
        break
      case 'ArrowUp':
        next = addDays(current, -7)
        break
      case 'ArrowDown':
        next = addDays(current, 7)
        break
      case 'Home':
        next = startOfMonth(current)
        break
      case 'End':
        next = lastDayOfMonth(current)
        break
      case 'Enter':
      case ' ': {
        e.preventDefault()
        if (!isDateDisabled(current) && isSameMonth(current, currentMonth)) {
          onSelect(current)
        }
        return
      }
      default:
        return
    }

    if (next) {
      e.preventDefault()
      focusDate(next)
    }
  }

  return (
    <div ref={forwardedRef} {...props} className={cn("w-[252px]", className)}>
      <div className="flex items-center justify-between px-ds-02 pb-ds-04">
        {hidePrevNav ? (
          <span className="h-ds-xs-plus w-ds-xs-plus" />
        ) : (
          <button
            type="button"
            onClick={() => onMonthChange(subMonths(currentMonth, 1))}
            className="inline-flex h-ds-xs-plus w-ds-xs-plus items-center justify-center rounded-control text-surface-fg-subtle transition-colors duration-fast-01 ease-productive-standard hover:bg-surface-panel-hover hover:text-surface-fg-muted focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-9"
            aria-label="Previous month"
          >
            <Icon icon={IconChevronLeft} size="sm" stroke="light" />
          </button>
        )}
        <button
          type="button"
          onClick={onHeaderClick}
          className={cn(
            'text-body-md font-semibold text-surface-fg',
            onHeaderClick &&
              'cursor-pointer rounded-control px-ds-02 transition-colors duration-fast-01 ease-productive-standard hover:bg-surface-panel-hover',
          )}
          aria-label="Switch to month/year view"
        >
          {format(currentMonth, 'MMMM yyyy')}
        </button>
        {hideNextNav ? (
          <span className="h-ds-xs-plus w-ds-xs-plus" />
        ) : (
          <button
            type="button"
            onClick={() => onMonthChange(addMonths(currentMonth, 1))}
            className="inline-flex h-ds-xs-plus w-ds-xs-plus items-center justify-center rounded-control text-surface-fg-subtle transition-colors duration-fast-01 ease-productive-standard hover:bg-surface-panel-hover hover:text-surface-fg-muted focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-9"
            aria-label="Next month"
          >
            <Icon icon={IconChevronRight} size="sm" stroke="light" />
          </button>
        )}
      </div>

      <div
        ref={gridRef}
        className="grid grid-cols-7 gap-0"
        role="grid"
        tabIndex={0}
        aria-label="Calendar"
        onKeyDown={handleKeyDown}
      >
        {WEEKDAYS.map((wd) => (
          <div
            key={wd}
            role="columnheader"
            className="flex h-ds-sm items-center justify-center text-label-xs font-semibold uppercase tracking-wider text-surface-fg-subtle"
          >
            {wd}
          </div>
        ))}

        {days.map((d, i) => {
          const inMonth = isSameMonth(d, currentMonth)
          const disabled = isDateDisabled(d)
          const isSelected = selected && isSameDay(d, selected)
          const inRange = isInRange(d)
          const edge = isRangeEdge(d)
          const isToday = isSameDay(d, new Date())
          const dateKey = format(d, 'yyyy-MM-dd')
          const dayEvents = eventsByDate.get(dateKey) ?? []

          return (
            <button
              key={i}
              type="button"
              role="gridcell"
              data-date={dateKey}
              tabIndex={inMonth && !disabled ? 0 : -1}
              disabled={!inMonth || disabled}
              onClick={() => {
                if (inMonth && !disabled) onSelect(d)
              }}
              onMouseEnter={() => onHover?.(d)}
              onMouseLeave={() => onHover?.(null)}
              aria-label={format(d, 'EEEE, MMMM d, yyyy')}
              aria-selected={isSelected || edge || undefined}
              aria-disabled={!inMonth || disabled || undefined}
              className={cn(
                'relative flex h-ds-sm w-ds-sm-plus items-center justify-center rounded-control text-body-md font-body transition-colors duration-fast-01 ease-productive-standard',
                !inMonth && 'pointer-events-none opacity-0',
                inMonth && disabled && 'opacity-action-disabled pointer-events-none cursor-not-allowed',
                inMonth && !disabled && !isSelected && !edge && !inRange &&
                  'text-surface-fg hover:bg-surface-panel-hover',
                inRange && !edge &&
                  'rounded-none bg-surface-panel-hover text-surface-fg',
                (isSelected || edge) &&
                  'bg-accent-9 text-accent-fg hover:bg-accent-10',
                isToday && !isSelected && !edge && !disabled &&
                  'font-semibold text-accent-11',
              )}
            >
              {format(d, 'd')}
              {dayEvents.length > 0 && (
                <span className="flex gap-px justify-center absolute bottom-[2px] left-0 right-0">
                  {dayEvents.slice(0, 3).map((evt, idx) => (
                    <span
                      key={idx}
                      data-event-dot
                      className="h-ds-02 w-ds-02 rounded-pill"
                      style={{ backgroundColor: evt.color ?? 'var(--color-accent-9)' }}
                    />
                  ))}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
},
)

CalendarGrid.displayName = 'CalendarGrid'
