'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../ui/lib/utils'
import {
  IconArrowDown,
  IconMinus,
  IconArrowUp,
  IconAlertTriangle,
} from '@tabler/icons-react'
import type { Icon as TablerIcon } from '@tabler/icons-react'

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

const priorityConfig: Record<
  Priority,
  { icon: TablerIcon; color: string; bgColor: string; label: string }
> = {
  LOW: {
    icon: IconArrowDown,
    color: 'text-category-slate-text',
    bgColor: 'bg-category-slate-surface',
    label: 'Low',
  },
  MEDIUM: {
    icon: IconMinus,
    color: 'text-warning-text',
    bgColor: 'bg-warning-surface',
    label: 'Medium',
  },
  HIGH: {
    icon: IconArrowUp,
    color: 'text-error-text',
    bgColor: 'bg-error-surface',
    label: 'High',
  },
  URGENT: {
    icon: IconAlertTriangle,
    color: 'text-error-text',
    bgColor: 'bg-error-surface',
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
    const config = priorityConfig[priority]
    const Icon = config.icon

    if (display === 'compact') {
      return (
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
          <Icon className={cn('h-ico-sm w-ico-sm', config.color)} stroke={2} />
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(priorityVariants({ display }), className)}
        {...props}
      >
        <div
          className={cn(
            'inline-flex items-center justify-center rounded-ds-md p-ds-01',
            config.bgColor,
          )}
        >
          <Icon className={cn('h-ico-sm w-ico-sm', config.color)} stroke={2} />
        </div>
        <span className="text-ds-sm text-text-secondary">
          {config.label}
        </span>
      </div>
    )
  },
)
PriorityIndicator.displayName = 'PriorityIndicator'

export { PriorityIndicator }
