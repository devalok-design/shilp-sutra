import * as React from 'react'

import { cn } from '../lib/utils'

export interface DateSeparatorProps {
  date: Date | string
  format?: (date: Date) => string
  className?: string
  /** BCP 47 locale for the default label's month name. @default 'en-US' */
  locale?: string
  /**
   * IANA time zone used for the "Today"/"Yesterday" day-boundary comparison
   * and for formatting. Defaults to the browser's local time zone.
   */
  timeZone?: string
}

/** Year/month/day of `date` as seen in `timeZone` (or the local zone when omitted). */
function datePartsIn(date: Date, timeZone?: string): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value)
  return { year: get('year'), month: get('month'), day: get('day') }
}

function defaultFormat(date: Date, locale: string, timeZone?: string): string {
  const now = new Date()
  const today = datePartsIn(now, timeZone)
  const target = datePartsIn(date, timeZone)
  const todayUTC = Date.UTC(today.year, today.month - 1, today.day)
  const targetUTC = Date.UTC(target.year, target.month - 1, target.day)
  const diffDays = Math.round((todayUTC - targetUTC) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'

  const month = date.toLocaleString(locale, { month: 'short', timeZone })

  if (target.year !== today.year) {
    return `${month} ${target.day}, ${target.year}`
  }

  return `${month} ${target.day}`
}

function DateSeparator({ date, format, className, locale = 'en-US', timeZone }: DateSeparatorProps) {
  const d = typeof date === 'string' ? new Date(date) : date
  const label = format ? format(d) : defaultFormat(d, locale, timeZone)

  return (
    <div className={cn('flex items-center gap-ds-03 py-ds-03', className)}>
      <div className="flex-1 border-t border-surface-border-subtle" />
      <span className="text-label-xs font-medium text-surface-fg-subtle/50 uppercase tracking-wider">
        {label}
      </span>
      <div className="flex-1 border-t border-surface-border-subtle" />
    </div>
  )
}
DateSeparator.displayName = 'DateSeparator'

export { DateSeparator }
