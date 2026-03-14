'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
import { EmptyState } from '@/composed/empty-state'
import { IconListCheck } from '@tabler/icons-react'
import {
  SubtaskProgress,
  SubtaskList,
  SubtaskItem,
  SubtaskAddForm,
} from './tabs'

import type { Subtask } from './task-types'
export type { Subtask }

// ============================================================
// Types
// ============================================================

interface SubtasksTabProps extends React.HTMLAttributes<HTMLDivElement> {
  subtasks: Subtask[]
  terminalColumnId?: string
  projectId: string
  parentTaskId: string
  defaultColumnId: string
  onCreateSubtask: (title: string) => void
  onToggleSubtask: (taskId: string, isComplete: boolean) => void
  onClickSubtask?: (taskId: string) => void
  /** When true, hide create/toggle controls (client view) */
  readOnly?: boolean
}

// ============================================================
// Subtasks Tab
// ============================================================

const SubtasksTab = React.forwardRef<HTMLDivElement, SubtasksTabProps>(
  function SubtasksTab({
  subtasks,
  terminalColumnId,
  onCreateSubtask,
  onToggleSubtask,
  onClickSubtask,
  className,
  readOnly = false,
  ...props
}, ref) {
  const completedCount = subtasks.filter(
    (s) => s.column?.isTerminal || s.columnId === terminalColumnId,
  ).length
  const totalCount = subtasks.length

  return (
    <div ref={ref} className={cn('flex flex-col', className)} {...props}>
      {/* Progress bar */}
      {totalCount > 0 && (
        <SubtaskProgress completed={completedCount} total={totalCount} />
      )}

      {/* Subtask list */}
      {subtasks.length > 0 ? (
        <SubtaskList>
          {subtasks.map((subtask) => {
            const isComplete =
              subtask.column?.isTerminal || subtask.columnId === terminalColumnId

            return (
              <SubtaskItem
                key={subtask.id}
                subtask={subtask}
                isComplete={!!isComplete}
                onToggle={readOnly ? undefined : onToggleSubtask}
                onClick={onClickSubtask}
              />
            )
          })}
        </SubtaskList>
      ) : (
        !readOnly && (
          <EmptyState
            icon={<IconListCheck />}
            title="No subtasks"
            description="Break this task into smaller pieces"
            compact
          />
        )
      )}

      {/* Add subtask -- hidden in readOnly mode */}
      {!readOnly && (
        <SubtaskAddForm onCreate={onCreateSubtask} />
      )}
    </div>
  )
},
)

SubtasksTab.displayName = 'SubtasksTab'

export { SubtasksTab }
export type { SubtasksTabProps }
