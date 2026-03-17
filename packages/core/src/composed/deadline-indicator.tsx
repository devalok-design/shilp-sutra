import * as React from 'react'
import { cn } from '../ui/lib/utils'
import { IconClock } from '@tabler/icons-react'

// ============================================================
// Types
// ============================================================

export interface DeadlineIndicatorProps extends React.HTMLAttributes<HTMLSpanElement> {
  deadline: Date | string
  /** Minutes before deadline to show warning color @default 1440 (24h) */
  warningThreshold?: number
  /** Minutes before deadline to show critical color @default 240 (4h) */
  criticalThreshold?: number
  /** @default 'relative' */
  format?: 'relative' | 'absolute'
  /** Show clock icon prefix */
  showIcon?: boolean
}

// ============================================================
// Helpers
// ============================================================

function formatRelative(minutesRemaining: number): string {
  const abs = Math.abs(minutesRemaining)
  const prefix = minutesRemaining < 0 ? 'Overdue by ' : ''
  const suffix = minutesRemaining >= 0 ? ' left' : ''

  if (abs < 1) return minutesRemaining < 0 ? 'Overdue' : 'Due now'
  if (abs < 60) return `${prefix}${Math.round(abs)}m${suffix}`
  if (abs < 1440) return `${prefix}${Math.round(abs / 60)}h${suffix}`
  return `${prefix}${Math.round(abs / 1440)}d${suffix}`
}

function formatAbsolute(date: Date): string {
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

// ============================================================
// DeadlineIndicator
// ============================================================

function DeadlineIndicator({
  deadline,
  warningThreshold = 1440,
  criticalThreshold = 240,
  format = 'relative',
  showIcon = false,
  className,
  ...props
}: DeadlineIndicatorProps) {
  const deadlineDate = React.useMemo(
    () => (deadline instanceof Date ? deadline : new Date(deadline)),
    [deadline],
  )
  const minutesRemaining = (deadlineDate.getTime() - Date.now()) / 60000

  let colorClass: string
  if (minutesRemaining <= 0) {
    colorClass = 'text-error-11 font-semibold'
  } else if (minutesRemaining <= criticalThreshold) {
    colorClass = 'text-error-11'
  } else if (minutesRemaining <= warningThreshold) {
    colorClass = 'text-warning-11'
  } else {
    colorClass = 'text-success-11'
  }

  const text = format === 'relative'
    ? formatRelative(minutesRemaining)
    : formatAbsolute(deadlineDate)

  return (
    <span
      className={cn('inline-flex items-center gap-ds-01 font-sans text-ds-sm', colorClass, className)}
      {...props}
    >
      {showIcon && <IconClock className="h-3.5 w-3.5" />}
      {text}
    </span>
  )
}

export { DeadlineIndicator }
