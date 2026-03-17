'use client'

import * as React from 'react'
import { cn } from './lib/utils'

type Status = 'healthy' | 'warning' | 'critical' | 'neutral' | 'inactive'

const dotColorMap: Record<Status, string> = {
  healthy: 'bg-success-9',
  warning: 'bg-warning-9',
  critical: 'bg-error-9',
  neutral: 'bg-neutral-8',
  inactive: 'bg-neutral-6',
}

const textColorMap: Record<Status, string> = {
  healthy: 'text-success-11',
  warning: 'text-warning-11',
  critical: 'text-error-11',
  neutral: 'text-surface-fg-muted',
  inactive: 'text-surface-fg-subtle',
}

const ringBorderColorMap: Record<Status, string> = {
  healthy: 'border-success-9',
  warning: 'border-warning-9',
  critical: 'border-error-9',
  neutral: 'border-neutral-8',
  inactive: 'border-neutral-6',
}

const pulseColorMap: Record<Status, string> = {
  healthy: 'bg-success-9/40',
  warning: 'bg-warning-9/40',
  critical: 'bg-error-9/40',
  neutral: 'bg-neutral-8/40',
  inactive: 'bg-neutral-6/40',
}

const sizeMap = {
  sm: { dot: 'h-1.5 w-1.5', pulse: 'h-1.5 w-1.5', text: 'text-ds-xs' },
  md: { dot: 'h-2 w-2', pulse: 'h-2 w-2', text: 'text-ds-sm' },
  lg: { dot: 'h-2.5 w-2.5', pulse: 'h-2.5 w-2.5', text: 'text-ds-sm' },
} as const

/**
 * A semantic health/presence indicator dot with optional pulse animation and inline label.
 *
 * @example
 * <StatusDot status="healthy" />
 * <StatusDot status="critical" label="Service down" pulse />
 * <StatusDot status="warning" size="lg" label="Elevated load" />
 */
export interface StatusDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: Status
  /** @default 'md' */
  size?: 'sm' | 'md' | 'lg'
  /** @default 'filled' */
  variant?: 'filled' | 'ring'
  /** Pulse animation. Defaults to true for 'healthy', false for others. */
  pulse?: boolean
  /** Inline label text rendered after the dot */
  label?: string
  labelClassName?: string
}

const StatusDot = React.forwardRef<HTMLSpanElement, StatusDotProps>(
  ({ status, size = 'md', variant = 'filled', pulse, label, labelClassName, className, 'aria-label': ariaLabelProp, ...props }, ref) => {
    const shouldPulse = pulse ?? status === 'healthy'
    const s = sizeMap[size]
    const autoAriaLabel = label ? `${label} \u2014 ${status}` : `Status: ${status}`

    const dotClasses = variant === 'ring'
      ? cn('relative inline-flex rounded-full border-[1.5px]', s.dot, ringBorderColorMap[status], 'bg-transparent')
      : cn('relative inline-flex rounded-full', s.dot, dotColorMap[status])

    return (
      <span
        ref={ref}
        role="status"
        aria-label={ariaLabelProp ?? autoAriaLabel}
        className={cn('inline-flex items-center gap-ds-02', className)}
        {...props}
      >
        <span className="relative inline-flex shrink-0">
          {shouldPulse && (
            <span
              data-pulse=""
              className={cn('absolute inline-flex rounded-full animate-ping', s.pulse, pulseColorMap[status])}
            />
          )}
          <span className={dotClasses} />
        </span>
        {label && (
          <span className={cn(s.text, textColorMap[status], 'font-sans', labelClassName)}>
            {label}
          </span>
        )}
      </span>
    )
  },
)
StatusDot.displayName = 'StatusDot'

export { StatusDot }
export type { Status as StatusDotStatus }
