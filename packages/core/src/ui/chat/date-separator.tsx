import * as React from 'react'

import { cn } from '../lib/utils'

export interface DateSeparatorProps {
  date: Date | string
  format?: (date: Date) => string
  className?: string
}

function defaultFormat(date: Date): string {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffMs = today.getTime() - target.getTime()
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'

  const month = date.toLocaleString('en-US', { month: 'short' })
  const day = date.getDate()

  if (date.getFullYear() !== now.getFullYear()) {
    return `${month} ${day}, ${date.getFullYear()}`
  }

  return `${month} ${day}`
}

function DateSeparator({ date, format, className }: DateSeparatorProps) {
  const d = typeof date === 'string' ? new Date(date) : date
  const label = format ? format(d) : defaultFormat(d)

  return (
    <div className={cn('flex items-center gap-ds-03 py-ds-03', className)}>
      <div className="flex-1 border-t border-surface-border-subtle" />
      <span className="text-ds-xs font-medium text-surface-fg-subtle/50 uppercase tracking-wider">
        {label}
      </span>
      <div className="flex-1 border-t border-surface-border-subtle" />
    </div>
  )
}
DateSeparator.displayName = 'DateSeparator'

export { DateSeparator }
