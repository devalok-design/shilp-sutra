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

type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

const priorityConfig: Record<
  Priority,
  { icon: TablerIcon; color: string; bgColor: string; label: string }
> = {
  LOW: {
    icon: IconArrowDown,
    color: 'text-[var(--blue-300)]',
    bgColor: 'bg-[var(--blue-100)]',
    label: 'Low',
  },
  MEDIUM: {
    icon: IconMinus,
    color: 'text-[var(--yellow-500)]',
    bgColor: 'bg-[var(--yellow-100)]',
    label: 'Medium',
  },
  HIGH: {
    icon: IconArrowUp,
    color: 'text-[var(--red-300)]',
    bgColor: 'bg-[var(--red-100)]',
    label: 'High',
  },
  URGENT: {
    icon: IconAlertTriangle,
    color: 'text-[var(--red-600)]',
    bgColor: 'bg-[var(--red-100)]',
    label: 'Urgent',
  },
}

const priorityVariants = cva(
  'inline-flex items-center gap-1.5 font-body',
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

interface PriorityIndicatorProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
    VariantProps<typeof priorityVariants> {
  priority: Priority
}

function PriorityIndicator({
  priority,
  display,
  className,
  ...props
}: PriorityIndicatorProps) {
  const config = priorityConfig[priority]
  const Icon = config.icon

  if (display === 'compact') {
    return (
      <div
        className={cn(
          'inline-flex items-center justify-center rounded-[var(--radius-md)] p-1',
          config.bgColor,
          className,
        )}
        title={config.label}
        {...props}
      >
        <Icon className={cn('h-3.5 w-3.5', config.color)} stroke={2} />
      </div>
    )
  }

  return (
    <div
      className={cn(priorityVariants({ display }), className)}
      {...props}
    >
      <div
        className={cn(
          'inline-flex items-center justify-center rounded-[var(--radius-md)] p-0.5',
          config.bgColor,
        )}
      >
        <Icon className={cn('h-3.5 w-3.5', config.color)} stroke={2} />
      </div>
      <span className="B3-Reg text-[var(--color-text-secondary)]">
        {config.label}
      </span>
    </div>
  )
}

PriorityIndicator.displayName = 'PriorityIndicator'

export { PriorityIndicator }
export type { PriorityIndicatorProps, Priority }
