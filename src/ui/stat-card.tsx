import { Minus, TrendingDown, TrendingUp } from 'lucide-react'
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
          'rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-layer-01)] shadow-[var(--shadow-01)] p-5',
          className,
        )}
        {...props}
      >
        <div className="h-3.5 w-24 rounded-[var(--radius-sm)] bg-[var(--color-skeleton-base)] animate-pulse mb-4" />
        <div className="h-8 w-32 rounded-[var(--radius-md)] bg-[var(--color-skeleton-base)] animate-pulse mb-2" />
        <div className="h-3 w-16 rounded-[var(--radius-sm)] bg-[var(--color-skeleton-base)] animate-pulse" />
      </div>
    )
  }

  const DeltaIcon =
    delta?.direction === 'up'
      ? TrendingUp
      : delta?.direction === 'down'
        ? TrendingDown
        : Minus

  const deltaColour =
    delta?.direction === 'up'
      ? 'text-[var(--color-success)]'
      : delta?.direction === 'down'
        ? 'text-[var(--color-error)]'
        : 'text-[var(--color-text-secondary)]'

  return (
    <div
      className={cn(
        'rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-layer-01)] shadow-[var(--shadow-01)] p-5',
        className,
      )}
      {...props}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-[var(--color-text-secondary)]">{label}</p>
        {icon && (
          <span className="text-[var(--color-text-secondary)]" aria-hidden="true">
            {icon}
          </span>
        )}
      </div>
      <p className="text-3xl font-semibold text-[var(--color-text-primary)] tabular-nums">
        {value}
      </p>
      {delta && (
        <div className={cn('mt-2 flex items-center gap-1 text-xs font-medium', deltaColour)}>
          <DeltaIcon className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{delta.value}</span>
        </div>
      )}
    </div>
  )
}

export { StatCard }
