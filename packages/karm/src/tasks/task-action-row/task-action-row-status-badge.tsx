'use client'

import * as React from 'react'
import { StatusBadge } from '@/composed/status-badge'
import { useTaskActionRow } from './task-action-row-context'

const stageToStatus: Record<string, 'active' | 'pending' | 'approved' | 'rejected' | 'completed' | 'blocked' | 'cancelled' | 'draft'> = {
  active: 'active',
  pending: 'pending',
  approved: 'approved',
  rejected: 'rejected',
  completed: 'completed',
  blocked: 'blocked',
  cancelled: 'cancelled',
  draft: 'draft',
}

const TaskActionRowStatusBadge = React.forwardRef<HTMLSpanElement, Record<string, never>>(
  (_props, ref) => {
    const { task } = useTaskActionRow()

    if (!task.stage) return null

    const normalizedStage = task.stage.toLowerCase()
    const status = stageToStatus[normalizedStage]

    if (!status) return null

    return (
      <StatusBadge
        ref={ref}
        status={status}
        label={task.stage.charAt(0).toUpperCase() + task.stage.slice(1).toLowerCase()}
        size="sm"
      />
    )
  },
)
TaskActionRowStatusBadge.displayName = 'TaskActionRowStatusBadge'

export { TaskActionRowStatusBadge }
