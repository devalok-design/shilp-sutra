'use client'

import * as React from 'react'
import {
  format,
  setHours,
  setMinutes,
  setMonth,
  setYear,
} from 'date-fns'
import { IconCalendarClock } from '@tabler/icons-react'
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

export interface DateTimePickerProps extends Omit<React.ComponentPropsWithoutRef<'button'>, 'onChange' | 'value'> {
  /** The currently selected date and time. */
  value?: Date | null
  /** Callback fired when the date/time changes. */
  onChange?: (date: Date | null) => void
  /** Earliest selectable date. */
  minDate?: Date
  /** Latest selectable date. */
  maxDate?: Date
  /** Function to disable specific dates. */
  disabledDates?: (date: Date) => boolean
  /** Display format for the time portion: 12-hour with AM/PM or 24-hour. */
  timeFormat?: '12h' | '24h'
  /** Step interval for the minute selector. */
  minuteStep?: number
  /** Placeholder text when no value is set. */
  placeholder?: string
  /** Additional class names for the trigger button. */
  className?: string
}

function padTwo(n: number): string {
  return n.toString().padStart(2, '0')
}

function generateRange(start: number, end: number, step: number): number[] {
  const result: number[] = []
  for (let i = start; i <= end; i += step) {
    result.push(i)
  }
  return result
}

const DateTimePicker = React.forwardRef<HTMLButtonElement, DateTimePickerProps>(
  function DateTimePicker(
    {
      value,
      onChange,
      minDate,
      maxDate,
      disabledDates,
      timeFormat = '12h',
      minuteStep = 1,
      placeholder = 'Pick date & time',
      className,
      ...props
    },
    ref,
  ) {
  const [open, setOpen] = React.useState(false)
  const [currentMonth, setCurrentMonth] = React.useState(value ?? new Date())
  const [view, setView] = React.useState<CalendarView>('days')

  // Reset view when popover closes
  React.useEffect(() => {
    if (!open) setView('days')
  }, [open])

  // Derive time parts
  const hours24 = value ? value.getHours() : 0
  const minutes = value ? value.getMinutes() : 0
  const ampm: 'AM' | 'PM' = hours24 >= 12 ? 'PM' : 'AM'
  const hours12 = hours24 === 0 ? 12 : hours24 > 12 ? hours24 - 12 : hours24

  const hoursRange =
    timeFormat === '12h' ? generateRange(1, 12, 1) : generateRange(0, 23, 1)
  const minutesRange = generateRange(0, 59, minuteStep)

  const selectedHour = timeFormat === '12h' ? hours12 : hours24

  // --- Calendar view handlers ---

  const handleDateSelect = (date: Date) => {
    // Merge with existing time part (or default to current time parts)
    let merged = setHours(date, value ? value.getHours() : hours24)
    merged = setMinutes(merged, value ? value.getMinutes() : minutes)
    onChange?.(merged)
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

  // --- Time handlers ---

  const handleHourChange = (hour: number) => {
    const base = value ? new Date(value) : new Date()
    let h = hour

    if (timeFormat === '12h') {
      const currentAmPm = value ? ampm : 'AM'
      if (currentAmPm === 'AM') {
        h = hour === 12 ? 0 : hour
      } else {
        h = hour === 12 ? 12 : hour + 12
      }
    }

    const updated = setHours(base, h)
    onChange?.(updated)
  }

  const handleMinuteChange = (minute: number) => {
    const base = value ? new Date(value) : new Date()
    const updated = setMinutes(base, minute)
    onChange?.(updated)
  }

  const handleAmPmToggle = (period: 'AM' | 'PM') => {
    const base = value ? new Date(value) : new Date()
    const currentH = base.getHours()
    let newH: number

    if (period === 'AM') {
      newH = currentH >= 12 ? currentH - 12 : currentH
    } else {
      newH = currentH < 12 ? currentH + 12 : currentH
    }

    onChange?.(setHours(base, newH))
  }

  // --- Display text ---

  const displayText = React.useMemo(() => {
    if (!value) return null
    const fmt =
      timeFormat === '12h' ? 'MMM d, yyyy h:mm a' : 'MMM d, yyyy HH:mm'
    return format(value, fmt)
  }, [value, timeFormat])

  // --- Render calendar view ---

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
            onSelect={handleDateSelect}
            onMonthChange={setCurrentMonth}
            onHeaderClick={handleHeaderClick}
            disabledDates={disabledDates}
            minDate={minDate}
            maxDate={maxDate}
          />
        )
    }
  }

  // Compact time selector styles
  const selectBase =
    'h-ds-sm rounded-ds-md border border-surface-border-strong bg-surface-1 px-ds-02 text-ds-md text-surface-fg transition-colors duration-fast-01 ease-productive-standard hover:border-surface-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-9 cursor-pointer appearance-none'

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
          aria-label={displayText ? `Selected: ${displayText}` : placeholder}
        >
          <IconCalendarClock
            className="h-ico-sm w-ico-sm text-surface-fg-subtle"
            stroke={1.5}
          />
          <span
            className={cn(
              'text-ds-md',
              displayText
                ? 'text-surface-fg'
                : 'text-surface-fg-subtle',
            )}
          >
            {displayText ?? placeholder}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto border-surface-border-strong bg-surface-1 p-ds-04"
        align="start"
        sideOffset={4}
      >
        <div className="flex flex-col gap-ds-04">
          {/* Calendar portion */}
          {renderView()}

          {/* Time selection row */}
          {view === 'days' && (
            <div className="flex items-center gap-ds-02 border-t border-surface-border-strong pt-ds-04">
              <span className="text-ds-xs font-semibold uppercase tracking-wider text-surface-fg-subtle">
                Time
              </span>

              {/* Hour select */}
              <select
                value={selectedHour ?? ''}
                onChange={(e) => handleHourChange(Number(e.target.value))}
                className={selectBase}
                aria-label="Hour"
              >
                {!value && <option value="">--</option>}
                {hoursRange.map((h) => (
                  <option key={h} value={h}>
                    {timeFormat === '24h' ? padTwo(h) : h}
                  </option>
                ))}
              </select>

              <span className="text-ds-md font-semibold text-surface-fg-subtle">
                :
              </span>

              {/* Minute select */}
              <select
                value={value ? minutes : ''}
                onChange={(e) => handleMinuteChange(Number(e.target.value))}
                className={selectBase}
                aria-label="Minute"
              >
                {!value && <option value="">--</option>}
                {minutesRange.map((m) => (
                  <option key={m} value={m}>
                    {padTwo(m)}
                  </option>
                ))}
              </select>

              {/* AM/PM toggle for 12h */}
              {timeFormat === '12h' && (
                <select
                  value={value ? ampm : ''}
                  onChange={(e) =>
                    handleAmPmToggle(e.target.value as 'AM' | 'PM')
                  }
                  className={selectBase}
                  aria-label="AM or PM"
                >
                  {!value && <option value="">--</option>}
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
  },
)

DateTimePicker.displayName = 'DateTimePicker'

export { DateTimePicker }
