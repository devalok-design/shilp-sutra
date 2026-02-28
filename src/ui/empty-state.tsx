import * as React from 'react'
import { cn } from './lib/utils'

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  illustration?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

function EmptyState({
  className,
  illustration,
  title,
  description,
  action,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center px-6 py-12 gap-4',
        className,
      )}
      {...props}
    >
      {illustration && (
        <div className="mb-2 text-[var(--color-text-secondary)]" aria-hidden="true">
          {illustration}
        </div>
      )}
      <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-[var(--color-text-secondary)] max-w-sm">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export { EmptyState }
