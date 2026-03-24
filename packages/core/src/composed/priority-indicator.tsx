'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion } from 'framer-motion'
import { cn } from '../ui/lib/utils'
import {
  IconArrowDown,
  IconMinus,
  IconArrowUp,
  IconAlertTriangle,
} from '@tabler/icons-react'
import type { Icon as TablerIcon } from '@tabler/icons-react'
import { Icon, type IconProps } from '../ui/icon'

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | 'low' | 'medium' | 'high' | 'urgent'

const priorityConfig: Record<
  Uppercase<Priority>,
  { icon: TablerIcon; color: string; bgColor: string; label: string }
> = {
  LOW: {
    icon: IconArrowDown,
    color: 'text-category-slate-11',
    bgColor: 'bg-category-slate-3',
    label: 'Low',
  },
  MEDIUM: {
    icon: IconMinus,
    color: 'text-warning-11',
    bgColor: 'bg-warning-3',
    label: 'Medium',
  },
  HIGH: {
    icon: IconArrowUp,
    color: 'text-error-11',
    bgColor: 'bg-error-3',
    label: 'High',
  },
  URGENT: {
    icon: IconAlertTriangle,
    color: 'text-error-11',
    bgColor: 'bg-error-3',
    label: 'Urgent',
  },
}

const priorityVariants = cva(
  'inline-flex items-center gap-ds-02b font-body',
  {
    variants: {
      display: {
        compact: '',
        full: '',
      },
    },
    defaultVariants: {
      display: 'full',
    },
  },
)

export interface PriorityIndicatorProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
    VariantProps<typeof priorityVariants> {
  priority: Priority
}

const PriorityIndicator = React.forwardRef<HTMLDivElement, PriorityIndicatorProps>(
  ({ priority, display, className, ...props }, ref) => {
    const normalizedPriority = priority.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    const config = priorityConfig[normalizedPriority]
    const PriorityIcon = config.icon as IconProps['icon']

    const isUrgent = normalizedPriority === 'URGENT'

    if (display === 'compact') {
      const iconWrapper = (
        <div
          ref={ref}
          className={cn(
            'inline-flex items-center justify-center rounded-ds-md p-ds-02',
            config.bgColor,
            className,
          )}
          title={config.label}
          {...props}
        >
          <Icon icon={PriorityIcon} size="sm" className={config.color} />
        </div>
      )

      if (isUrgent) {
        return (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="inline-flex"
          >
            {iconWrapper}
          </motion.div>
        )
      }

      return iconWrapper
    }

    return (
      <div
        ref={ref}
        className={cn(priorityVariants({ display }), className)}
        {...props}
      >
        {isUrgent ? (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className={cn(
              'inline-flex items-center justify-center rounded-ds-md p-ds-01',
              config.bgColor,
            )}
          >
            <Icon icon={PriorityIcon} size="sm" className={config.color} />
          </motion.div>
        ) : (
          <div
            className={cn(
              'inline-flex items-center justify-center rounded-ds-md p-ds-01',
              config.bgColor,
            )}
          >
            <Icon icon={PriorityIcon} size="sm" className={config.color} />
          </div>
        )}
        <span className="text-ds-sm text-surface-fg-muted">
          {config.label}
        </span>
      </div>
    )
  },
)
PriorityIndicator.displayName = 'PriorityIndicator'

export { PriorityIndicator }
