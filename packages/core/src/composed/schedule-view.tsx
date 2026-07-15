'use client'

import {
  addDays,
  differenceInMinutes,
  format,
  getHours,
  getMinutes,
  isSameDay,
  isToday,
  startOfWeek,
} from 'date-fns'
import * as React from 'react'

import { Dot } from '../ui/dot'
import { cn } from '../ui/lib/utils'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ScheduleEvent {
  id: string
  title: string
  start: Date
  end: Date
  color?: 'accent' | 'success' | 'warning' | 'error' | 'info' | 'neutral'
}

/**
 * A day/week calendar schedule grid. Renders time-slotted events with
 * proportional height, color coding, click handlers, and a current-time indicator.
 */
export interface ScheduleViewProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Display mode: single-day column or full-week (7 columns). */
  view: 'day' | 'week'
  /** Current day (day view) or any date within the target week (week view). */
  date: Date
  /** Events to display on the calendar grid. */
  events: ScheduleEvent[]
  /** Called when an event block is clicked. */
  onEventClick?: (event: ScheduleEvent) => void
  /** Called when an empty time slot is clicked, with the slot's start and end times. */
  onSlotClick?: (start: Date, end: Date) => void
  /** First visible hour (default 8). */
  startHour?: number
  /** Last visible hour -- exclusive (default 18). */
  endHour?: number
  /** Slot duration in minutes (default 30). */
  slotDuration?: number
}

/* ------------------------------------------------------------------ */
/*  Color map                                                          */
/* ------------------------------------------------------------------ */

const eventColorMap: Record<
  NonNullable<ScheduleEvent['color']>,
  string
> = {
  accent: 'bg-accent-2 text-accent-11',
  success: 'bg-success-3 text-success-11',
  warning: 'bg-warning-3 text-warning-11',
  error: 'bg-error-3 text-error-11',
  info: 'bg-info-3 text-info-11',
  neutral: 'bg-surface-raised text-surface-fg-muted',
}

// Solid category dot — the color-blind-safe, shape-based signal that replaces the
// former left accent rail (the AI tell). Tint above carries the ambient color.
const eventDotMap: Record<
  NonNullable<ScheduleEvent['color']>,
  string
> = {
  accent: 'bg-accent-9',
  success: 'bg-success-9',
  warning: 'bg-warning-9',
  error: 'bg-error-9',
  info: 'bg-info-9',
  neutral: 'bg-surface-fg-subtle',
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatHourLabel(hour: number): string {
  if (hour === 0) return '12 AM'
  if (hour < 12) return `${hour} AM`
  if (hour === 12) return '12 PM'
  return `${hour - 12} PM`
}

function getEventStyle(
  event: ScheduleEvent,
  startHour: number,
  endHour: number,
) {
  const totalMinutes = (endHour - startHour) * 60
  const eventStartMinutes =
    (getHours(event.start) - startHour) * 60 + getMinutes(event.start)
  const durationMinutes = differenceInMinutes(event.end, event.start)

  const top = (eventStartMinutes / totalMinutes) * 100
  const height = (durationMinutes / totalMinutes) * 100

  return {
    top: `${top}%`,
    height: `${height}%`,
  }
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

interface TimeColumnProps {
  startHour: number
  endHour: number
}

function TimeColumn({ startHour, endHour }: TimeColumnProps) {
  const hours: number[] = []
  for (let h = startHour; h < endHour; h++) {
    hours.push(h)
  }
  const slotHeight = 100 / (endHour - startHour)

  return (
    <div
      className="relative shrink-0 w-[60px] border-r border-surface-border-strong"
      aria-hidden="true"
    >
      {hours.map((hour) => (
        <div
          key={hour}
          className="text-ds-xs text-surface-fg-muted pr-ds-02 text-right"
          style={{ height: `${slotHeight}%` }}
        >
          {formatHourLabel(hour)}
        </div>
      ))}
    </div>
  )
}

interface DayColumnProps {
  date: Date
  events: ScheduleEvent[]
  startHour: number
  endHour: number
  slotDuration: number
  onEventClick?: (event: ScheduleEvent) => void
  onSlotClick?: (start: Date, end: Date) => void
  showHeader?: boolean
}

function DayColumn({
  date,
  events,
  startHour,
  endHour,
  slotDuration,
  onEventClick,
  onSlotClick,
  showHeader,
}: DayColumnProps) {
  const dayEvents = events.filter((e) => isSameDay(e.start, date))
  const totalMinutes = (endHour - startHour) * 60
  const slotCount = totalMinutes / slotDuration

  const slots: { start: Date; end: Date }[] = []
  for (let i = 0; i < slotCount; i++) {
    const slotStart = new Date(date)
    slotStart.setHours(startHour, i * slotDuration, 0, 0)
    const slotEnd = new Date(slotStart)
    slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration)
    slots.push({ start: slotStart, end: slotEnd })
  }

  const todayInView = isToday(date)

  // Current time indicator position
  let nowIndicatorTop: number | null = null
  if (todayInView) {
    const now = new Date()
    const nowHour = getHours(now)
    const nowMin = getMinutes(now)
    if (nowHour >= startHour && nowHour < endHour) {
      const nowMinutes = (nowHour - startHour) * 60 + nowMin
      nowIndicatorTop = (nowMinutes / totalMinutes) * 100
    }
  }

  return (
    <div className="flex flex-1 flex-col min-w-ds-11">
      {showHeader && (
        <div
          className={cn(
            'text-center text-ds-sm font-semibold py-ds-02 border-b border-surface-border-strong',
            todayInView
              ? 'text-accent-11 bg-accent-2'
              : 'text-surface-fg bg-surface-raised',
          )}
        >
          {format(date, 'EEE d')}
        </div>
      )}
      <div className="relative flex-1">
        {/* Slot grid lines */}
        {slots.map((slot, i) => (
          <button
            key={i}
            type="button"
            className={cn(
              'block w-full border-b border-surface-border hover:bg-surface-raised-hover transition-colors ease-productive-standard',
              'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-9',
              i % 2 === 0 ? 'border-surface-border-strong' : 'border-surface-border-subtle',
            )}
            style={{ height: `${100 / slotCount}%` }}
            onClick={() => onSlotClick?.(slot.start, slot.end)}
            aria-label={`${format(slot.start, 'h:mm a')} to ${format(slot.end, 'h:mm a')}`}
          />
        ))}

        {/* Events */}
        {dayEvents.map((event) => {
          const style = getEventStyle(event, startHour, endHour)
          const eventColor = event.color ?? 'accent'
          const colorClass = eventColorMap[eventColor]
          const dotClass = eventDotMap[eventColor]
          return (
            <button
              key={event.id}
              type="button"
              className={cn(
                'absolute left-ds-01 right-ds-01 rounded-control-inner px-ds-02 py-ds-01',
                'text-left text-ds-xs font-medium overflow-hidden cursor-pointer',
                'hover:shadow-raised transition-[box-shadow] duration-fast-02 ease-productive-standard',
                'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-9',
                colorClass,
              )}
              style={style}
              onClick={(e) => {
                e.stopPropagation()
                onEventClick?.(event)
              }}
              aria-label={`${event.title}, ${format(event.start, 'h:mm a')} to ${format(event.end, 'h:mm a')}`}
            >
              <span className="flex items-start gap-ds-02">
                <span
                  className={cn('mt-[3px] h-ds-03 w-ds-03 shrink-0 rounded-pill', dotClass)}
                  aria-hidden="true"
                />
                <span className="line-clamp-2">{event.title}</span>
              </span>
            </button>
          )
        })}

        {/* Current time indicator */}
        {nowIndicatorTop != null && (
          <div
            className="absolute left-0 right-0 h-ds-01 bg-error-9 z-10 pointer-events-none"
            style={{ top: `${nowIndicatorTop}%` }}
            aria-hidden="true"
          >
            <Dot color="error" size="lg" pulse className="absolute -left-[5px] -top-[4px]" />
          </div>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  ScheduleView                                                       */
/* ------------------------------------------------------------------ */

const ScheduleView = React.forwardRef<HTMLDivElement, ScheduleViewProps>(
  (
    {
      view,
      date,
      events,
      onEventClick,
      onSlotClick,
      startHour = 8,
      endHour = 18,
      slotDuration = 30,
      className,
      ...props
    },
    ref,
  ) => {
    const days: Date[] = React.useMemo(() => {
      if (view === 'day') return [date]
      const weekStart = startOfWeek(date, { weekStartsOn: 1 }) // Monday
      return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
    }, [view, date])

    return (
      <div
        ref={ref}
        role="region"
        aria-label={
          view === 'day'
            ? `Schedule for ${format(date, 'EEEE, MMMM d, yyyy')}`
            : `Week schedule starting ${format(days[0], 'MMMM d, yyyy')}`
        }
        className={cn(
          'flex rounded-control border border-surface-border-strong bg-surface-raised overflow-hidden',
          'h-[480px]',
          className,
        )}
        {...props}
      >
        <TimeColumn startHour={startHour} endHour={endHour} />
        <div className="flex flex-1 divide-x divide-surface-border overflow-x-auto">
          {days.map((day) => (
            <DayColumn
              key={day.toISOString()}
              date={day}
              events={events}
              startHour={startHour}
              endHour={endHour}
              slotDuration={slotDuration}
              onEventClick={onEventClick}
              onSlotClick={onSlotClick}
              showHeader={view === 'week'}
            />
          ))}
        </div>
      </div>
    )
  },
)
ScheduleView.displayName = 'ScheduleView'

export { ScheduleView }
