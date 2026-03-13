import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion, AnimatePresence } from 'framer-motion'

import { motionProps } from '../ui/lib/motion'
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

interface StatusBadgeBaseProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children' | 'color'> {
  label?: string
  hideDot?: boolean
  size?: VariantProps<typeof statusBadgeVariants>['size']
}

interface StatusBadgeWithStatus extends StatusBadgeBaseProps {
  status?: VariantProps<typeof statusBadgeVariants>['status']
  color?: never
}

interface StatusBadgeWithColor extends StatusBadgeBaseProps {
  status?: never
  color: 'success' | 'warning' | 'error' | 'info' | 'neutral'
}

export type StatusBadgeProps = StatusBadgeWithStatus | StatusBadgeWithColor

const statusMorphTransition = { duration: 0.3, ease: 'easeOut' as const }

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, color, size, label, hideDot = false, className, ...props }, ref) => {
    if (color != null) {
      // Color branch — color is the styling key
      const displayLabel = label ?? (color.charAt(0).toUpperCase() + color.slice(1))
      const dotColor = colorDotMap[color]

      return (
        <AnimatePresence mode="wait">
          <motion.span
            key={color}
            ref={ref}
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.6 }}
            transition={statusMorphTransition}
            className={cn(
              statusBadgeVariants({ color, size }),
              className,
            )}
            {...motionProps(props)}
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
          </motion.span>
        </AnimatePresence>
      )
    }

    // Status branch — derive styling from status (default: 'pending')
    const statusKey = status ?? 'pending'
    const displayLabel = label ?? (statusKey.charAt(0).toUpperCase() + statusKey.slice(1))
    const dotColor = dotColorMap[statusKey]

    return (
      <AnimatePresence mode="wait">
        <motion.span
          key={statusKey}
          ref={ref}
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0.6 }}
          transition={statusMorphTransition}
          className={cn(
            statusBadgeVariants({ status: statusKey, size }),
            className,
          )}
          {...motionProps(props)}
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
        </motion.span>
      </AnimatePresence>
    )
  },
)
StatusBadge.displayName = 'StatusBadge'

export { StatusBadge, statusBadgeVariants }
