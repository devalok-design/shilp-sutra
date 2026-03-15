'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
import { useTaskActionRow } from './task-action-row-context'

function formatShortDate(iso: string): string {
  const date = new Date(iso + 'T00:00:00')
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function isToday(iso: string): boolean {
  const today = new Date()
  const todayStr = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-')
  return iso === todayStr
}

const TaskActionRowDueDate = React.forwardRef<HTMLSpanElement, Record<string, never>>(
  (_props, ref) => {
    const { task } = useTaskActionRow()

    if (!task.dueDate) return null

    const overdue = task.isOverdue
    const today = isToday(task.dueDate)

    return (
      <span
        ref={ref}
        className={cn(
          'text-ds-sm whitespace-nowrap',
          overdue && 'text-error-11 font-medium',
          !overdue && today && 'text-warning-11',
          !overdue && !today && 'text-surface-fg-muted',
        )}
      >
        {formatShortDate(task.dueDate)}
      </span>
    )
  },
)
TaskActionRowDueDate.displayName = 'TaskActionRowDueDate'

export { TaskActionRowDueDate }
