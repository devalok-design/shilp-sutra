'use client'

import { IconChevronDown } from '@tabler/icons-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { AnimatePresence,motion } from 'framer-motion'
import * as React from 'react'

import { Icon } from '../ui/icon'
import { motionProps } from '../ui/lib/motion'
import { cn } from '../ui/lib/utils'

const statusBadgeVariants = cva(
  'inline-flex items-center gap-ds-02b rounded-ds-full font-body',
  {
    variants: {
      status: {
        active: 'bg-success-3 text-success-11',
        pending: 'bg-warning-3 text-warning-11',
        approved: 'bg-success-3 text-success-11',
        rejected: 'bg-error-3 text-error-11',
        completed: 'bg-success-3 text-success-11',
        blocked: 'bg-error-3 text-error-11',
        'in-progress': 'bg-accent-3 text-accent-11',
        review: 'bg-info-3 text-info-11',
        cancelled: 'bg-surface-raised text-surface-fg-subtle',
        draft: 'bg-surface-raised text-surface-fg-subtle',
      },
      color: {
        success: 'bg-success-3 text-success-11',
        warning: 'bg-warning-3 text-warning-11',
        error: 'bg-error-3 text-error-11',
        info: 'bg-info-3 text-info-11',
        neutral: 'bg-surface-raised text-surface-fg-subtle',
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
  active: 'bg-success-9',
  pending: 'bg-warning-9',
  approved: 'bg-success-9',
  rejected: 'bg-error-9',
  completed: 'bg-success-9',
  blocked: 'bg-error-9',
  'in-progress': 'bg-accent-9',
  review: 'bg-info-9',
  cancelled: 'bg-disabled',
  draft: 'bg-surface-fg-subtle',
}

const colorDotMap: Record<string, string> = {
  success: 'bg-success-9',
  warning: 'bg-warning-9',
  error: 'bg-error-9',
  info: 'bg-info-9',
  neutral: 'bg-surface-fg-subtle',
}

interface StatusBadgeBaseProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children' | 'color'> {
  label?: string
  hideDot?: boolean
  size?: VariantProps<typeof statusBadgeVariants>['size']
  onClick?: () => void
  icon?: React.ReactNode
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

/* Between durations.moderate02 (0.24) and durations.slow01 (0.4) — intentional for smooth morph */
const statusMorphTransition = { duration: 0.3, ease: 'easeOut' as const }

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, color, size, label, hideDot = false, onClick, icon, className, ...props }, ref) => {
    const isClickable = onClick != null
    const Tag = isClickable ? motion.button : motion.span
    const clickableClasses = isClickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : undefined

    const trailingIcon = icon != null
      ? icon
      : isClickable
        ? <Icon icon={IconChevronDown} size="xs" className="text-current/50 -mr-0.5 shrink-0" />
        : null

    if (color != null) {
      // Color branch — color is the styling key
      const displayLabel = label ?? (color.charAt(0).toUpperCase() + color.slice(1))
      const dotColor = colorDotMap[color]

      return (
        <AnimatePresence mode="wait">
          <Tag
            key={color}
            ref={ref as any}
            {...(isClickable ? { type: 'button' as const, onClick } : {})}
            initial={{ opacity: 0.6, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0.6, scale: 0.95 }}
            transition={statusMorphTransition}
            className={cn(
              statusBadgeVariants({ color, size }),
              clickableClasses,
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
            {trailingIcon}
          </Tag>
        </AnimatePresence>
      )
    }

    // Status branch — derive styling from status (default: 'pending')
    const statusKey = status ?? 'pending'
    const displayLabel = label ?? (statusKey.charAt(0).toUpperCase() + statusKey.slice(1))
    const dotColor = dotColorMap[statusKey]

    return (
      <AnimatePresence mode="wait">
        <Tag
          key={statusKey}
          ref={ref as any}
          {...(isClickable ? { type: 'button' as const, onClick } : {})}
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0.6 }}
          transition={statusMorphTransition}
          className={cn(
            statusBadgeVariants({ status: statusKey, size }),
            clickableClasses,
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
          {trailingIcon}
        </Tag>
      </AnimatePresence>
    )
  },
)
StatusBadge.displayName = 'StatusBadge'

export { StatusBadge, statusBadgeVariants }
