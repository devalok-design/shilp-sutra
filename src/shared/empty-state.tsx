import * as React from 'react'
import { cn } from '../ui/lib/utils'
import type { Icon as TablerIcon } from '@tabler/icons-react'
import { IconInbox } from '@tabler/icons-react'

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: TablerIcon
  title: string
  description?: string
  action?: React.ReactNode
  compact?: boolean
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      icon: Icon = IconInbox,
      title,
      description,
      action,
      compact = false,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center text-center',
          compact ? 'gap-ds-04 py-ds-07' : 'gap-ds-05 py-16',
          className,
        )}
        {...props}
      >
        <div
          className={cn(
            'flex items-center justify-center rounded-[var(--radius-xl)] bg-[var(--color-layer-02)]',
            compact ? 'h-10 w-10' : 'h-12 w-12',
          )}
        >
          <Icon
            className={cn(
              'text-[var(--color-text-placeholder)]',
              compact ? 'h-[var(--icon-md)] w-[var(--icon-md)]' : 'h-6 w-6',
            )}
            stroke={1.5}
          />
        </div>

        <div className="flex max-w-[280px] flex-col gap-ds-02">
          <h3
            className={cn(
              'text-[var(--color-text-primary)]',
              compact ? 'text-ds-md semibold' : 'text-ds-base semibold',
            )}
          >
            {title}
          </h3>
          {description && (
            <p
              className={cn(
                'text-[var(--color-text-placeholder)]',
                compact ? 'text-ds-sm' : 'text-ds-md',
              )}
            >
              {description}
            </p>
          )}
        </div>

        {action && <div className="mt-ds-02">{action}</div>}
      </div>
    )
  },
)
EmptyState.displayName = 'EmptyState'

export { EmptyState }
export type { EmptyStateProps }
