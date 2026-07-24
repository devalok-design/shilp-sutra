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
 * proportional height, color coding, overlapping-event columns, a live
 * current-time indicator, and keyboard-navigable slots (when `onSlotClick` is
 * set). Presentational — drive `events`/`date`/`view` from the parent.
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
  /**
   * Called when an empty time slot is clicked. When omitted, slots render as
   * non-interactive grid lines (no keyboard/AT tab stops).
   */
  onSlotClick?: (start: Date, end: Date) => void
  /** First visible hour (default 8). */
  startHour?: number
  /** Last visible hour -- exclusive (default 18). */
  endHour?: number
  /** Slot duration in minutes (default 30). */
  slotDuration?: number
  /** Currently-selected event id — rendered with a ring. */
  selectedEventId?: string
  /** Custom event content renderer. Receives the event; return the block body. */
  renderEvent?: (event: ScheduleEvent) => React.ReactNode
  /** Optional toolbar/header rendered above the grid. */
  header?: React.ReactNode
  /** Content shown when there are no events in view. */
  emptyState?: React.ReactNode
  /** Grid body height (CSS length or px number). @default 480 */
  height?: number | string
}

/* ------------------------------------------------------------------ */
/*  Color map                                                          */
/* ------------------------------------------------------------------ */

const eventColorMap: Record<NonNullable<ScheduleEvent['color']>, string> = {
  accent: 'bg-accent-2 text-accent-11',
  success: 'bg-success-3 text-success-11',
  warning: 'bg-warning-3 text-warning-11',
  error: 'bg-error-3 text-error-11',
  info: 'bg-info-3 text-info-11',
  neutral: 'bg-surface-raised text-surface-fg-muted',
}

const eventDotMap: Record<NonNullable<ScheduleEvent['color']>, string> = {
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

interface PositionedEvent {
  event: ScheduleEvent
  top: number
  height: number
  col: number
  cols: number
}

/**
 * Position a day's events, partitioning concurrent events into side-by-side
 * columns so overlaps stay legible (greedy interval colouring per overlap
 * cluster).
 */
function layoutDayEvents(
  events: ScheduleEvent[],
  startHour: number,
  endHour: number,
): PositionedEvent[] {
  const totalMinutes = (endHour - startHour) * 60
  const sorted = [...events].sort((a, b) => a.start.getTime() - b.start.getTime())

  const result: PositionedEvent[] = []
  let cluster: PositionedEvent[] = []
  let clusterEnd = -Infinity

  const flush = () => {
    const cols = cluster.reduce((m, e) => Math.max(m, e.col + 1), 0)
    for (const e of cluster) e.cols = cols
    result.push(...cluster)
    cluster = []
    clusterEnd = -Infinity
  }

  for (const event of sorted) {
    const startM = (getHours(event.start) - startHour) * 60 + getMinutes(event.start)
    const durationM = Math.max(differenceInMinutes(event.end, event.start), 1)
    const startMs = event.start.getTime()

    // New cluster when this event starts after everything so far has ended.
    if (startMs >= clusterEnd && cluster.length > 0) flush()

    // First free column within the cluster.
    const taken = new Set(cluster.filter((c) => c.event.end.getTime() > startMs).map((c) => c.col))
    let col = 0
    while (taken.has(col)) col++

    cluster.push({
      event,
      top: (startM / totalMinutes) * 100,
      height: (durationM / totalMinutes) * 100,
      col,
      cols: 1,
    })
    clusterEnd = Math.max(clusterEnd, event.end.getTime())
  }
  if (cluster.length > 0) flush()

  return result
}

/* ------------------------------------------------------------------ */
/*  Time column                                                        */
/* ------------------------------------------------------------------ */

function TimeColumn({ startHour, endHour }: { startHour: number; endHour: number }) {
  const hours: number[] = []
  for (let h = startHour; h < endHour; h++) hours.push(h)
  const slotHeight = 100 / (endHour - startHour)

  return (
    <div className="relative w-ds-11 shrink-0 border-e border-surface-border-strong" aria-hidden="true">
      {hours.map((hour) => (
        <div
          key={hour}
          className="pe-ds-02 text-end text-caption text-surface-fg-muted"
          style={{ height: `${slotHeight}%` }}
        >
          {formatHourLabel(hour)}
        </div>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Day column                                                         */
/* ------------------------------------------------------------------ */

interface DayColumnProps {
  dayIndex: number
  date: Date
  events: ScheduleEvent[]
  startHour: number
  endHour: number
  slotDuration: number
  now: Date
  active: { day: number; slot: number }
  interactive: boolean
  onSlotKeyDown?: (e: React.KeyboardEvent<HTMLButtonElement>) => void
  selectedEventId?: string
  renderEvent?: (event: ScheduleEvent) => React.ReactNode
  onEventClick?: (event: ScheduleEvent) => void
  onSlotClick?: (start: Date, end: Date) => void
  showHeader?: boolean
  nowLineRef?: React.Ref<HTMLDivElement>
}

function DayColumn({
  dayIndex,
  date,
  events,
  startHour,
  endHour,
  slotDuration,
  now,
  active,
  interactive,
  onSlotKeyDown,
  selectedEventId,
  renderEvent,
  onEventClick,
  onSlotClick,
  showHeader,
  nowLineRef,
}: DayColumnProps) {
  const dayEvents = React.useMemo(
    () => layoutDayEvents(events.filter((e) => isSameDay(e.start, date)), startHour, endHour),
    [events, date, startHour, endHour],
  )
  const totalMinutes = (endHour - startHour) * 60
  const slotCount = totalMinutes / slotDuration

  const slots = React.useMemo(() => {
    const out: { start: Date; end: Date }[] = []
    for (let i = 0; i < slotCount; i++) {
      const slotStart = new Date(date)
      slotStart.setHours(startHour, i * slotDuration, 0, 0)
      const slotEnd = new Date(slotStart)
      slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration)
      out.push({ start: slotStart, end: slotEnd })
    }
    return out
  }, [date, startHour, slotDuration, slotCount])

  const todayInView = isToday(date)
  let nowIndicatorTop: number | null = null
  if (todayInView) {
    const nowHour = getHours(now)
    if (nowHour >= startHour && nowHour < endHour) {
      const nowMinutes = (nowHour - startHour) * 60 + getMinutes(now)
      nowIndicatorTop = (nowMinutes / totalMinutes) * 100
    }
  }

  return (
    <div className="flex min-w-ds-11 flex-1 flex-col">
      {showHeader && (
        <div
          className={cn(
            'border-b border-surface-border-strong py-ds-02 text-center text-body-sm font-semibold',
            todayInView ? 'bg-accent-2 text-accent-11' : 'bg-surface-2 text-surface-fg',
          )}
        >
          {format(date, 'EEE d')}
        </div>
      )}
      <div className="relative flex-1">
        {/* Slot lines — interactive buttons only when onSlotClick is set,
            otherwise inert grid lines (no tab stops, hidden from AT). */}
        {slots.map((slot, i) =>
          interactive ? (
            <button
              key={i}
              type="button"
              data-day={dayIndex}
              data-slot={i}
              tabIndex={dayIndex === active.day && i === active.slot ? 0 : -1}
              className={cn(
                'block w-full min-h-ds-06 border-b transition-colors ease-productive-standard duration-fast-02',
                'hover:bg-surface-raised-hover',
                'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-9',
                i % 2 === 0 ? 'border-surface-border-strong' : 'border-surface-border-subtle',
              )}
              style={{ height: `${100 / slotCount}%` }}
              onClick={() => onSlotClick?.(slot.start, slot.end)}
              onKeyDown={onSlotKeyDown}
              aria-label={`${format(slot.start, 'EEE h:mm a')} to ${format(slot.end, 'h:mm a')}`}
            />
          ) : (
            <div
              key={i}
              aria-hidden="true"
              className={cn(
                'w-full border-b',
                i % 2 === 0 ? 'border-surface-border-strong' : 'border-surface-border-subtle',
              )}
              style={{ height: `${100 / slotCount}%` }}
            />
          ),
        )}

        {/* Events — column-partitioned so overlaps sit side by side */}
        {dayEvents.map(({ event, top, height, col, cols }) => {
          const eventColor = event.color ?? 'accent'
          const colWidth = 100 / cols
          const selected = event.id === selectedEventId
          return (
            <button
              key={event.id}
              type="button"
              aria-pressed={selected || undefined}
              className={cn(
                'absolute overflow-hidden rounded-control-inner px-ds-02 py-ds-01',
                'cursor-pointer text-start text-body-xs font-medium',
                'transition-[box-shadow] ease-productive-standard duration-fast-02 hover:shadow-raised',
                'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-9',
                'motion-safe:active:scale-[0.98]',
                selected && 'ring-2 ring-accent-9',
                eventColorMap[eventColor],
              )}
              style={{
                top: `${top}%`,
                height: `${height}%`,
                insetInlineStart: `calc(${col * colWidth}% + 2px)`,
                width: `calc(${colWidth}% - 4px)`,
              }}
              onClick={(e) => {
                e.stopPropagation()
                onEventClick?.(event)
              }}
              aria-label={`${event.title}, ${format(event.start, 'h:mm a')} to ${format(event.end, 'h:mm a')}`}
            >
              {renderEvent ? (
                renderEvent(event)
              ) : (
                <span className="flex items-start gap-ds-02">
                  <span
                    className={cn('mt-0.5 h-ds-03 w-ds-03 shrink-0 rounded-pill', eventDotMap[eventColor])}
                    aria-hidden="true"
                  />
                  <span className="line-clamp-2">{event.title}</span>
                </span>
              )}
            </button>
          )
        })}

        {/* Live current-time indicator */}
        {nowIndicatorTop != null && (
          <div
            ref={nowLineRef}
            className="pointer-events-none absolute inset-x-0 z-raised h-ds-01 bg-error-9"
            style={{ top: `${nowIndicatorTop}%` }}
            aria-hidden="true"
          >
            <Dot color="error" size="lg" pulse className="absolute -translate-x-1/2 -translate-y-1/2" />
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
      selectedEventId,
      renderEvent,
      header,
      emptyState,
      height = 480,
      className,
      ...props
    },
    ref,
  ) => {
    const days = React.useMemo<Date[]>(() => {
      if (view === 'day') return [date]
      const weekStart = startOfWeek(date, { weekStartsOn: 1 })
      return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
    }, [view, date])

    const interactive = !!onSlotClick
    const slotCount = ((endHour - startHour) * 60) / slotDuration

    // Live now-line: re-render each minute so the indicator actually ticks.
    const [now, setNow] = React.useState(() => new Date())
    React.useEffect(() => {
      const id = setInterval(() => setNow(new Date()), 60_000)
      return () => clearInterval(id)
    }, [])

    // Roving-tabindex slot navigation (only meaningful when interactive).
    const gridRef = React.useRef<HTMLDivElement>(null)
    const nowLineRef = React.useRef<HTMLDivElement>(null)
    const [active, setActive] = React.useState<{ day: number; slot: number }>({ day: 0, slot: 0 })

    // Scroll the now-line into view on mount.
    React.useEffect(() => {
      nowLineRef.current?.scrollIntoView({ block: 'center' })
    }, [])

    const handleSlotKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (!interactive) return
      const target = e.target as HTMLElement
      const dayAttr = target.getAttribute('data-day')
      const slotAttr = target.getAttribute('data-slot')
      if (dayAttr == null || slotAttr == null) return
      const day = Number(dayAttr)
      const slot = Number(slotAttr)
      const rtl = getComputedStyle(gridRef.current ?? target).direction === 'rtl'
      let nextDay = day
      let nextSlot = slot
      switch (e.key) {
        case 'ArrowDown': nextSlot = Math.min(slot + 1, slotCount - 1); break
        case 'ArrowUp': nextSlot = Math.max(slot - 1, 0); break
        case 'ArrowRight': nextDay = rtl ? Math.max(day - 1, 0) : Math.min(day + 1, days.length - 1); break
        case 'ArrowLeft': nextDay = rtl ? Math.min(day + 1, days.length - 1) : Math.max(day - 1, 0); break
        case 'Home': nextSlot = 0; break
        case 'End': nextSlot = slotCount - 1; break
        default: return
      }
      e.preventDefault()
      setActive({ day: nextDay, slot: nextSlot })
      // Focus the target cell now — focus() works regardless of the tabIndex
      // the re-render is about to move onto it.
      gridRef.current
        ?.querySelector<HTMLButtonElement>(`[data-day="${nextDay}"][data-slot="${nextSlot}"]`)
        ?.focus()
    }

    const isEmpty = events.length === 0

    return (
      <div ref={ref} className={cn('flex flex-col', className)} {...props}>
        {header}
        <div
          ref={gridRef}
          role="region"
          aria-label={
            view === 'day'
              ? `Schedule for ${format(date, 'EEEE, MMMM d, yyyy')}`
              : `Week schedule starting ${format(days[0], 'MMMM d, yyyy')}`
          }
          className="flex overflow-hidden rounded-surface border border-surface-border-strong bg-surface-2"
          style={{ height: typeof height === 'number' ? `${height}px` : height }}
        >
          <TimeColumn startHour={startHour} endHour={endHour} />
          <div className="relative flex flex-1 divide-x divide-surface-border overflow-x-auto overflow-y-auto">
            {days.map((day, i) => (
              <DayColumn
                key={day.toISOString()}
                dayIndex={i}
                date={day}
                events={events}
                startHour={startHour}
                endHour={endHour}
                slotDuration={slotDuration}
                now={now}
                active={active}
                interactive={interactive}
                onSlotKeyDown={handleSlotKeyDown}
                selectedEventId={selectedEventId}
                renderEvent={renderEvent}
                onEventClick={onEventClick}
                onSlotClick={onSlotClick}
                showHeader={view === 'week'}
                nowLineRef={i === 0 || isSameDay(day, now) ? nowLineRef : undefined}
              />
            ))}
            {isEmpty && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-ds-05 text-center text-body-sm text-surface-fg-muted">
                {emptyState ?? 'No events scheduled.'}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  },
)
ScheduleView.displayName = 'ScheduleView'

export { ScheduleView }
