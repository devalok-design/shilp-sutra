import { IconMinus, IconTrendingDown, IconTrendingUp } from '@tabler/icons-react'
import * as React from 'react'
import { cn } from './lib/utils'

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  value: string | number
  delta?: {
    value: string
    direction: 'up' | 'down' | 'neutral'
  }
  icon?: React.ReactNode
  loading?: boolean
}

function StatCard({ className, label, value, delta, icon, loading, ...props }: StatCardProps) {
  if (loading) {
    return (
      <div
        className={cn(
          'rounded-ds-lg border border-border-subtle bg-layer-01 shadow-01 p-ds-05b',
          className,
        )}
        {...props}
      >
        <div className="h-3.5 w-24 rounded-ds-sm bg-skeleton-base animate-pulse mb-ds-05" />
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
      className={cn(
        'rounded-ds-lg border border-border-subtle bg-layer-01 shadow-01 p-ds-05b',
        className,
      )}
      {...props}
    >
      <div className="flex items-center justify-between mb-ds-04">
        <p className="text-ds-md font-medium text-text-secondary">{label}</p>
        {icon && (
          <span className="text-text-secondary" aria-hidden="true">
            {icon}
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
}

StatCard.displayName = 'StatCard'

export { StatCard }
