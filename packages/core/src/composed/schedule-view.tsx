'use client'

import * as React from 'react'
import {
  startOfWeek,
  addDays,
  format,
  isSameDay,
  getHours,
  getMinutes,
  differenceInMinutes,
  isToday,
} from 'date-fns'
import { cn } from '../ui/lib/utils'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ScheduleEvent {
  id: string
  title: string
  start: Date
  end: Date
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral'
}

export interface ScheduleViewProps extends React.HTMLAttributes<HTMLDivElement> {
  view: 'day' | 'week'
  /** Current day (day view) or any date within the target week (week view). */
  date: Date
  events: ScheduleEvent[]
  onEventClick?: (event: ScheduleEvent) => void
  onSlotClick?: (start: Date, end: Date) => void
  /** First visible hour (default 8). */
  startHour?: number
  /** Last visible hour — exclusive (default 18). */
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
  primary: 'bg-accent-2 border-accent-7 text-accent-11',
  success: 'bg-success-3 border-success-7 text-success-11',
  warning: 'bg-warning-3 border-warning-7 text-warning-11',
  error: 'bg-error-3 border-error-7 text-error-11',
  info: 'bg-info-3 border-info-7 text-info-11',
  neutral: 'bg-surface-2 border-surface-border-strong text-surface-fg-muted',
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
    <div className="flex flex-1 flex-col min-w-[80px]">
      {showHeader && (
        <div
          className={cn(
            'text-center text-ds-sm font-semibold py-ds-02 border-b border-surface-border-strong',
            todayInView
              ? 'text-accent-11 bg-accent-2'
              : 'text-surface-fg bg-surface-1',
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
              'block w-full border-b border-surface-border hover:bg-surface-2 transition-colors',
              i % 2 === 0 ? 'border-surface-border-strong' : 'border-surface-3',
            )}
            style={{ height: `${100 / slotCount}%` }}
            onClick={() => onSlotClick?.(slot.start, slot.end)}
            aria-label={`${format(slot.start, 'h:mm a')} to ${format(slot.end, 'h:mm a')}`}
          />
        ))}

        {/* Events */}
        {dayEvents.map((event) => {
          const style = getEventStyle(event, startHour, endHour)
          const colorClass =
            eventColorMap[event.color ?? 'primary']
          return (
            <button
              key={event.id}
              type="button"
              className={cn(
                'absolute left-ds-01 right-ds-01 rounded-ds-sm border-l-[3px] px-ds-02 py-ds-01',
                'text-left text-ds-xs font-medium overflow-hidden cursor-pointer',
                'hover:opacity-90 transition-opacity',
                colorClass,
              )}
              style={style}
              onClick={(e) => {
                e.stopPropagation()
                onEventClick?.(event)
              }}
              aria-label={`${event.title}, ${format(event.start, 'h:mm a')} to ${format(event.end, 'h:mm a')}`}
            >
              <span className="line-clamp-2">{event.title}</span>
            </button>
          )
        })}

        {/* Current time indicator */}
        {nowIndicatorTop != null && (
          <div
            className="absolute left-0 right-0 h-[2px] bg-error-9 z-10 pointer-events-none"
            style={{ top: `${nowIndicatorTop}%` }}
            aria-hidden="true"
          >
            <span className="absolute -left-[5px] -top-[4px] h-[10px] w-[10px] rounded-ds-full bg-error-9" />
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
          'flex rounded-ds-md border border-surface-border-strong bg-surface-1 overflow-hidden',
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
