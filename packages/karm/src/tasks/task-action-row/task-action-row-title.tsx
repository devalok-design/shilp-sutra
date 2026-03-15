'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
import { useTaskActionRow } from './task-action-row-context'

export interface TaskActionRowTitleProps {
  truncate?: boolean
  className?: string
}

const TaskActionRowTitle = React.forwardRef<HTMLSpanElement, TaskActionRowTitleProps>(
  ({ truncate, className }, ref) => {
    const { task } = useTaskActionRow()

    return (
      <span
        ref={ref}
        className={cn(
          'flex-1 text-surface-fg text-ds-md font-medium',
          truncate && 'truncate',
          className,
        )}
      >
        {task.title}
      </span>
    )
  },
)
TaskActionRowTitle.displayName = 'TaskActionRowTitle'

export { TaskActionRowTitle }
