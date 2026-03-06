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
      color: {
        success: 'bg-success-surface text-text-success',
        warning: 'bg-warning-surface text-text-warning',
        error: 'bg-error-surface text-text-error',
        info: 'bg-info-surface text-text-info',
        neutral: 'bg-layer-02 text-text-tertiary',
      },
      size: {
        sm: 'px-ds-03 py-ds-01 text-ds-xs font-semibold',
        md: 'px-ds-04 py-ds-02 text-ds-sm font-medium',
      },
    },
    defaultVariants: {
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

const colorDotMap: Record<string, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
  info: 'bg-info',
  neutral: 'bg-icon-secondary',
}

export interface StatusBadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'>,
    VariantProps<typeof statusBadgeVariants> {
  label?: string
  hideDot?: boolean
}

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, color, size, label, hideDot = false, className, ...props }, ref) => {
    // When color is set, it takes priority over status for styling
    const useColor = color != null
    const statusKey = useColor ? undefined : (status ?? 'pending')
    const colorKey = useColor ? color : undefined

    const displayLabel =
      label ??
      (useColor
        ? color.charAt(0).toUpperCase() + color.slice(1)
        : (statusKey!.charAt(0).toUpperCase() + statusKey!.slice(1)))

    const dotColor = useColor
      ? colorDotMap[color]
      : dotColorMap[statusKey!]

    return (
      <span
        ref={ref}
        className={cn(
          statusBadgeVariants({ status: statusKey, color: colorKey, size }),
          className,
        )}
        {...props}
      >
        {!hideDot && (
          <span
            className={cn(
              'shrink-0 rounded-ds-full',
              size === 'sm' ? 'h-ds-02b w-ds-02b' : 'h-[8px] w-[8px]',
              dotColor,
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
