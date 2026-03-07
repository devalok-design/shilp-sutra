'use client'

import { IconMinus, IconTrendingDown, IconTrendingUp } from '@tabler/icons-react'
import * as React from 'react'
import { cn } from './lib/utils'

/**
 * Props for StatCard — a dashboard metric tile displaying a label, a large numeric value,
 * an optional trend delta (with directional arrow icon), and an optional header icon.
 *
 * **Delta direction:** `'up'` renders a green trending-up arrow, `'down'` renders a red
 * trending-down arrow, `'neutral'` renders a grey dash. The `delta.value` is a formatted
 * string (e.g. `"+8%"` or `"−120"`).
 *
 * **Loading state:** Pass `loading={true}` to render a pulse-skeleton placeholder instead of data.
 *
 * @example
 * // Revenue metric with a positive trend:
 * <StatCard
 *   label="Monthly Revenue"
 *   value="$48,200"
 *   delta={{ value: "+12%", direction: "up" }}
 *   icon={<IconCurrencyDollar />}
 * />
 *
 * @example
 * // Open ticket count with a downward trend (good for support queues):
 * <StatCard
 *   label="Open Tickets"
 *   value={142}
 *   delta={{ value: "−18", direction: "down" }}
 * />
 *
 * @example
 * // Loading skeleton while data is fetching:
 * <StatCard label="Users" value={0} loading={isFetching} />
 *
 * @example
 * // Simple metric with no trend (stable, neutral):
 * <StatCard
 *   label="Storage Used"
 *   value="4.2 GB"
 *   delta={{ value: "No change", direction: "neutral" }}
 * />
 * // These are just a few ways — feel free to combine props creatively!
 */
export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Heading text for the metric. `title` is an alias for `label`. */
  label?: string
  /** Alias for `label` — use whichever feels natural. */
  title?: string
  value: string | number
  delta?: {
    value: string
    direction: 'up' | 'down' | 'neutral'
  }
  icon?: React.ReactNode | React.ComponentType<{ className?: string }>
  loading?: boolean
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ className, label, title, value, delta, icon, loading, ...props }, ref) => {
    const resolvedLabel = title ?? label ?? ''
    if (loading) {
      return (
        <div
          ref={ref}
          className={cn(
            'rounded-ds-lg border border-border-subtle bg-layer-01 shadow-01 p-ds-05b',
            className,
          )}
          {...props}
        >
          <div className="h-ds-04 w-24 rounded-ds-sm bg-skeleton-base animate-pulse mb-ds-05" />
          <div className="h-ds-sm w-32 rounded-ds-md bg-skeleton-base animate-pulse mb-ds-03" />
          <div className="h-3 w-16 rounded-ds-sm bg-skeleton-base animate-pulse" />
        </div>
      )
    }

    const DeltaIcon =
      delta?.direction === 'up'
        ? IconTrendingUp
        : delta?.direction === 'down'
          ? IconTrendingDown
          : IconMinus

    const deltaColour =
      delta?.direction === 'up'
        ? 'text-success'
        : delta?.direction === 'down'
          ? 'text-error'
          : 'text-text-secondary'

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-ds-lg border border-border-subtle bg-layer-01 shadow-01 p-ds-05b',
          className,
        )}
        {...props}
      >
        <div className="flex items-center justify-between mb-ds-04">
          <p className="text-ds-md font-medium text-text-secondary">{resolvedLabel}</p>
          {icon && (
            <span className="text-text-secondary" aria-hidden="true">
              {typeof icon === 'function'
                ? React.createElement(icon as React.ComponentType<{ className?: string }>, { className: 'h-ico-lg w-ico-lg' })
                : icon}
            </span>
          )}
        </div>
        <p className="text-ds-3xl font-semibold text-text-primary tabular-nums">
          {value}
        </p>
        {delta && (
          <div className={cn('mt-ds-03 flex items-center gap-ds-02 text-ds-sm font-medium', deltaColour)}>
            <DeltaIcon className="h-ico-sm w-ico-sm" aria-hidden="true" />
            <span>{delta.value}</span>
          </div>
        )}
      </div>
    )
  },
)

StatCard.displayName = 'StatCard'

export { StatCard }
