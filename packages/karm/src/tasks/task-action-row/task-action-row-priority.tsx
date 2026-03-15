'use client'

import * as React from 'react'
import { PriorityIndicator } from '@/composed/priority-indicator'
import { useTaskActionRow } from './task-action-row-context'

const TaskActionRowPriority = React.forwardRef<HTMLDivElement, Record<string, never>>(
  (_props, ref) => {
    const { task } = useTaskActionRow()

    return (
      <PriorityIndicator
        ref={ref}
        priority={task.priority}
        display="compact"
      />
    )
  },
)
TaskActionRowPriority.displayName = 'TaskActionRowPriority'

export { TaskActionRowPriority }
