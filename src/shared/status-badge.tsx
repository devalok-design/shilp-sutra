import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../ui/lib/utils'

const statusBadgeVariants = cva(
  'inline-flex items-center gap-ds-02b rounded-ds-full font-body',
  {
    variants: {
      status: {
        active: 'bg-success-surface text-text-success',
        pending: 'bg-warning-surface text-text-warning',
        approved: 'bg-success-surface text-text-success',
        rejected: 'bg-error-surface text-text-error',
        completed: 'bg-success-surface text-text-success',
        blocked: 'bg-error-surface text-text-error',
        cancelled: 'bg-layer-02 text-text-placeholder',
        draft: 'bg-layer-02 text-text-tertiary',
      },
      size: {
        sm: 'px-ds-03 py-ds-01 text-ds-xs font-semibold',
        md: 'px-ds-04 py-ds-02 text-ds-sm font-medium',
      },
    },
    defaultVariants: {
      status: 'pending',
      size: 'md',
    },
  },
)

const dotColorMap: Record<string, string> = {
  active: 'bg-success',
  pending: 'bg-warning',
  approved: 'bg-success',
  rejected: 'bg-error',
  completed: 'bg-success',
  blocked: 'bg-error',
  cancelled: 'bg-icon-disabled',
  draft: 'bg-icon-secondary',
}

export interface StatusBadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'>,
    VariantProps<typeof statusBadgeVariants> {
  label?: string
  hideDot?: boolean
}

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, size, label, hideDot = false, className, ...props }, ref) => {
    const statusKey = status ?? 'pending'
    const displayLabel =
      label ?? statusKey.charAt(0).toUpperCase() + statusKey.slice(1)

    return (
      <span
        ref={ref}
        className={cn(statusBadgeVariants({ status, size }), className)}
        {...props}
      >
        {!hideDot && (
          <span
            className={cn(
              'shrink-0 rounded-ds-full',
              size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2',
              dotColorMap[statusKey],
            )}
            aria-hidden="true"
          />
        )}
        {displayLabel}
      </span>
    )
  },
)
StatusBadge.displayName = 'StatusBadge'

export { StatusBadge, statusBadgeVariants }
