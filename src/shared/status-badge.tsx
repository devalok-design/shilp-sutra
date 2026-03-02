import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../ui/lib/utils'

const statusBadgeVariants = cva(
  'inline-flex items-center gap-ds-02b rounded-[var(--radius-full)] font-body',
  {
    variants: {
      status: {
        active: 'bg-[var(--color-success-surface)] text-[var(--color-text-success)]',
        pending: 'bg-[var(--color-warning-surface)] text-[var(--color-text-warning)]',
        approved: 'bg-[var(--color-success-surface)] text-[var(--color-text-success)]',
        rejected: 'bg-[var(--color-error-surface)] text-[var(--color-text-error)]',
        completed: 'bg-[var(--color-success-surface)] text-[var(--color-text-success)]',
        blocked: 'bg-[var(--color-error-surface)] text-[var(--color-text-error)]',
        cancelled: 'bg-[var(--color-layer-02)] text-[var(--color-text-placeholder)]',
        draft: 'bg-[var(--color-layer-02)] text-[var(--color-text-tertiary)]',
      },
      size: {
        sm: 'px-ds-03 py-0.5 B4-Reg font-semibold',
        md: 'px-2.5 py-ds-02 B3-Reg font-medium',
      },
    },
    defaultVariants: {
      status: 'pending',
      size: 'md',
    },
  },
)

const dotColorMap: Record<string, string> = {
  active: 'bg-[var(--color-success)]',
  pending: 'bg-[var(--color-warning)]',
  approved: 'bg-[var(--color-success)]',
  rejected: 'bg-[var(--color-error)]',
  completed: 'bg-[var(--color-success)]',
  blocked: 'bg-[var(--color-error)]',
  cancelled: 'bg-[var(--color-icon-disabled)]',
  draft: 'bg-[var(--color-icon-secondary)]',
}

interface StatusBadgeProps
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
              'shrink-0 rounded-[var(--radius-full)]',
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
export type { StatusBadgeProps }
