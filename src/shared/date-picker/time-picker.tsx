'use client'

import * as React from 'react'
import { format, setHours, setMinutes, setSeconds } from 'date-fns'
import { IconClock } from '@tabler/icons-react'
import { cn } from '../../ui/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../ui/popover'

export interface TimePickerProps {
  /** The currently selected time (as a Date object). */
  value?: Date | null
  /** Callback fired when the time changes. */
  onChange?: (date: Date) => void
  /** Display format: 12-hour with AM/PM or 24-hour. */
  format?: '12h' | '24h'
  /** Step interval for minutes column. */
  minuteStep?: number
  /** Step interval for seconds column. */
  secondStep?: number
  /** Whether to show the seconds column. */
  showSeconds?: boolean
  /** Placeholder text when no value is set. */
  placeholder?: string
  /** Additional class names for the trigger button. */
  className?: string
  /** Whether the picker is disabled. */
  disabled?: boolean
}

function generateRange(start: number, end: number, step: number): number[] {
  const result: number[] = []
  for (let i = start; i <= end; i += step) {
    result.push(i)
  }
  return result
}

function padTwo(n: number): string {
  return n.toString().padStart(2, '0')
}

const TimePicker = React.forwardRef<HTMLButtonElement, TimePickerProps>(
  function TimePicker(
    {
      value,
      onChange,
      format: timeFormat = '12h',
      minuteStep = 1,
      secondStep = 1,
      showSeconds = false,
      placeholder = 'Pick a time',
      className,
      disabled = false,
    },
    ref,
  ) {
  const [open, setOpen] = React.useState(false)

  // Derive display parts from value
  const hours24 = value ? value.getHours() : null
  const minutes = value ? value.getMinutes() : null
  const seconds = value ? value.getSeconds() : null
  const ampm = hours24 !== null ? (hours24 >= 12 ? 'PM' : 'AM') : null

  // For 12h display, convert 24h to 12h
  const hours12 =
    hours24 !== null
      ? hours24 === 0
        ? 12
        : hours24 > 12
          ? hours24 - 12
          : hours24
      : null

  const hoursRange =
    timeFormat === '12h' ? generateRange(1, 12, 1) : generateRange(0, 23, 1)
  const minutesRange = generateRange(0, 59, minuteStep)
  const secondsRange = generateRange(0, 59, secondStep)

  const createOrUpdateDate = (
    overrides: { hours?: number; minutes?: number; seconds?: number; ampm?: 'AM' | 'PM' },
  ): Date => {
    const base = value ? new Date(value) : new Date()

    let h = overrides.hours ?? base.getHours()
    const m = overrides.minutes ?? base.getMinutes()
    const s = overrides.seconds ?? base.getSeconds()

    // If we're in 12h mode, we need to convert the 12h value to 24h
    if (timeFormat === '12h' && overrides.hours !== undefined) {
      const currentAmPm = overrides.ampm ?? ampm ?? 'AM'
      if (currentAmPm === 'AM') {
        h = overrides.hours === 12 ? 0 : overrides.hours
      } else {
        h = overrides.hours === 12 ? 12 : overrides.hours + 12
      }
    }

    let result = setHours(base, h)
    result = setMinutes(result, m)
    result = setSeconds(result, s)
    return result
  }

  const handleHourSelect = (hour: number) => {
    const updated = createOrUpdateDate({ hours: hour })
    onChange?.(updated)
  }

  const handleMinuteSelect = (minute: number) => {
    const updated = createOrUpdateDate({ minutes: minute })
    onChange?.(updated)
  }

  const handleSecondSelect = (second: number) => {
    const updated = createOrUpdateDate({ seconds: second })
    onChange?.(updated)
  }

  const handleAmPmToggle = (period: 'AM' | 'PM') => {
    if (!value) {
      // Create a date with 12:00 in the chosen period
      const h = period === 'AM' ? 0 : 12
      let d = new Date()
      d = setHours(d, h)
      d = setMinutes(d, 0)
      d = setSeconds(d, 0)
      onChange?.(d)
      return
    }

    const currentH = value.getHours()
    let newH: number

    if (period === 'AM') {
      newH = currentH >= 12 ? currentH - 12 : currentH
    } else {
      newH = currentH < 12 ? currentH + 12 : currentH
    }

    onChange?.(setHours(new Date(value), newH))
  }

  // Format display string
  const displayText = React.useMemo(() => {
    if (!value) return null
    if (timeFormat === '12h') {
      const fmt = showSeconds ? 'h:mm:ss a' : 'h:mm a'
      return format(value, fmt)
    }
    const fmt = showSeconds ? 'HH:mm:ss' : 'HH:mm'
    return format(value, fmt)
  }, [value, timeFormat, showSeconds])

  const selectedHour = timeFormat === '12h' ? hours12 : hours24

  const columnClass =
    'flex flex-col gap-ds-01 overflow-y-auto max-h-[200px] px-ds-01 scrollbar-thin'

  const itemBase =
    'flex h-ds-sm w-full items-center justify-center rounded-ds-md text-ds-md transition-colors cursor-pointer'
  const itemSelected =
    'bg-interactive text-text-on-color'
  const itemDefault =
    'text-text-primary hover:bg-field'

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          ref={ref}
          type="button"
          disabled={disabled}
          className={cn(
            'inline-flex h-ds-sm-plus items-center gap-ds-03 rounded-ds-lg border border-border bg-layer-01 px-ds-04 text-left transition-colors',
            'hover:border-border-strong',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2',
            disabled && 'opacity-[0.38] pointer-events-none',
            className,
          )}
          aria-label={displayText ? `Selected time: ${displayText}` : placeholder}
        >
          <IconClock
            className="h-ico-sm w-ico-sm text-text-placeholder"
            stroke={1.5}
          />
          <span
            className={cn(
              'text-ds-md',
              displayText
                ? 'text-text-primary'
                : 'text-text-placeholder',
            )}
          >
            {displayText ?? placeholder}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto border-border bg-layer-01 p-ds-04"
        align="start"
        sideOffset={4}
      >
        <div className="flex gap-ds-03" role="group" aria-label="Time picker">
          {/* Hours column */}
          <div className="flex flex-col items-center gap-ds-02">
            <span className="text-ds-xs font-semibold uppercase tracking-wider text-text-placeholder">
              Hr
            </span>
            <div className={cn(columnClass, 'min-w-[48px]')}>
              {hoursRange.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => handleHourSelect(h)}
                  className={cn(
                    itemBase,
                    selectedHour === h ? itemSelected : itemDefault,
                  )}
                  aria-label={`${h} hours`}
                  aria-selected={selectedHour === h || undefined}
                >
                  {timeFormat === '24h' ? padTwo(h) : h}
                </button>
              ))}
            </div>
          </div>

          {/* Minutes column */}
          <div className="flex flex-col items-center gap-ds-02">
            <span className="text-ds-xs font-semibold uppercase tracking-wider text-text-placeholder">
              Min
            </span>
            <div className={cn(columnClass, 'min-w-[48px]')}>
              {minutesRange.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleMinuteSelect(m)}
                  className={cn(
                    itemBase,
                    minutes === m ? itemSelected : itemDefault,
                  )}
                  aria-label={`${padTwo(m)} minutes`}
                  aria-selected={minutes === m || undefined}
                >
                  {padTwo(m)}
                </button>
              ))}
            </div>
          </div>

          {/* Seconds column */}
          {showSeconds && (
            <div className="flex flex-col items-center gap-ds-02">
              <span className="text-ds-xs font-semibold uppercase tracking-wider text-text-placeholder">
                Sec
              </span>
              <div className={cn(columnClass, 'min-w-[48px]')}>
                {secondsRange.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSecondSelect(s)}
                    className={cn(
                      itemBase,
                      seconds === s ? itemSelected : itemDefault,
                    )}
                    aria-label={`${padTwo(s)} seconds`}
                    aria-selected={seconds === s || undefined}
                  >
                    {padTwo(s)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* AM/PM toggle for 12h format */}
          {timeFormat === '12h' && (
            <div className="flex flex-col items-center gap-ds-02">
              <span className="text-ds-xs font-semibold uppercase tracking-wider text-text-placeholder">
                &nbsp;
              </span>
              <div className="flex flex-col gap-ds-01 px-ds-01">
                {(['AM', 'PM'] as const).map((period) => (
                  <button
                    key={period}
                    type="button"
                    onClick={() => handleAmPmToggle(period)}
                    className={cn(
                      itemBase,
                      'min-w-[44px] font-semibold',
                      ampm === period ? itemSelected : itemDefault,
                    )}
                    aria-label={period}
                    aria-selected={ampm === period || undefined}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
  },
)

TimePicker.displayName = 'TimePicker'

export { TimePicker }
