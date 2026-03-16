'use client'

import * as React from 'react'
import { Badge } from '@/ui/badge'
import { cn } from '@/ui/lib/utils'
import { useTaskActionRow } from './task-action-row-context'

export interface TaskActionRowProjectBadgeProps {
  onClick?: (e: React.MouseEvent) => void
}

const TaskActionRowProjectBadge = React.forwardRef<HTMLSpanElement, TaskActionRowProjectBadgeProps>(
  ({ onClick }, ref) => {
    const { task } = useTaskActionRow()

    const handleClick = React.useCallback(
      (e: React.MouseEvent) => {
        if (onClick) {
          e.stopPropagation()
          onClick(e)
        }
      },
      [onClick],
    )

    if (!task.projectName) return null

    return (
      <Badge
        ref={ref}
        variant="subtle"
        color="default"
        size="xs"
        onClick={handleClick}
        className={cn(onClick && 'cursor-pointer hover:bg-surface-raised-active transition-colors duration-150')}
      >
        {task.projectName}
      </Badge>
    )
  },
)
TaskActionRowProjectBadge.displayName = 'TaskActionRowProjectBadge'

export { TaskActionRowProjectBadge }
