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
          'rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-layer-01)] shadow-[var(--shadow-01)] p-ds-05b',
          className,
        )}
        {...props}
      >
        <div className="h-3.5 w-24 rounded-[var(--radius-sm)] bg-[var(--color-skeleton-base)] animate-pulse mb-ds-05" />
        <div className="h-8 w-32 rounded-[var(--radius-md)] bg-[var(--color-skeleton-base)] animate-pulse mb-ds-03" />
        <div className="h-3 w-16 rounded-[var(--radius-sm)] bg-[var(--color-skeleton-base)] animate-pulse" />
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
      ? 'text-[var(--color-success)]'
      : delta?.direction === 'down'
        ? 'text-[var(--color-error)]'
        : 'text-[var(--color-text-secondary)]'

  return (
    <div
      className={cn(
        'rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-layer-01)] shadow-[var(--shadow-01)] p-ds-05b',
        className,
      )}
      {...props}
    >
      <div className="flex items-center justify-between mb-ds-04">
        <p className="B2-Reg font-medium text-[var(--color-text-secondary)]">{label}</p>
        {icon && (
          <span className="text-[var(--color-text-secondary)]" aria-hidden="true">
            {icon}
          </span>
        )}
      </div>
      <p className="T4-Reg font-semibold text-[var(--color-text-primary)] tabular-nums">
        {value}
      </p>
      {delta && (
        <div className={cn('mt-ds-03 flex items-center gap-ds-02 B3-Reg font-medium', deltaColour)}>
          <DeltaIcon className="h-[var(--icon-sm)] w-[var(--icon-sm)]" aria-hidden="true" />
          <span>{delta.value}</span>
        </div>
      )}
    </div>
  )
}

export { StatCard }
