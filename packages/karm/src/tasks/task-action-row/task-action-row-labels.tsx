'use client'

import * as React from 'react'
import { Badge } from '@/ui/badge'
import { useTaskActionRow } from './task-action-row-context'

export interface TaskActionRowLabelsProps {
  max?: number
}

const TaskActionRowLabels = React.forwardRef<HTMLDivElement, TaskActionRowLabelsProps>(
  ({ max }, ref) => {
    const { task } = useTaskActionRow()

    if (!task.labels || task.labels.length === 0) return null

    const visibleLabels = max != null ? task.labels.slice(0, max) : task.labels
    const overflow = max != null ? task.labels.length - max : 0

    return (
      <div ref={ref} className="flex items-center gap-ds-02">
        {visibleLabels.map((label) => (
          <Badge key={label} size="xs" variant="subtle" color="default">
            {label}
          </Badge>
        ))}
        {overflow > 0 && (
          <Badge size="xs" variant="subtle" color="default">
            +{overflow}
          </Badge>
        )}
      </div>
    )
  },
)
TaskActionRowLabels.displayName = 'TaskActionRowLabels'

export { TaskActionRowLabels }
