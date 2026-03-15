'use client'

import * as React from 'react'
import { Checkbox } from '@/ui/checkbox'
import { useTaskActionRow } from './task-action-row-context'

export interface TaskActionRowCheckboxProps {
  onComplete?: (taskId: string) => void | Promise<void>
}

const TaskActionRowCheckbox = React.forwardRef<HTMLButtonElement, TaskActionRowCheckboxProps>(
  ({ onComplete }, ref) => {
    const { task } = useTaskActionRow()
    const [checked, setChecked] = React.useState(false)

    const handleClick = React.useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation()
      },
      [],
    )

    const handleCheckedChange = React.useCallback(
      (value: boolean | 'indeterminate') => {
        if (value === true) {
          setChecked(true)
          onComplete?.(task.id)
        } else {
          setChecked(false)
        }
      },
      [onComplete, task.id],
    )

    return (
      <div onClick={handleClick} role="presentation">
        <Checkbox
          ref={ref}
          checked={checked}
          onCheckedChange={handleCheckedChange}
          aria-label={`Complete task: ${task.title}`}
          className="h-4 w-4"
        />
      </div>
    )
  },
)
TaskActionRowCheckbox.displayName = 'TaskActionRowCheckbox'

export { TaskActionRowCheckbox }
