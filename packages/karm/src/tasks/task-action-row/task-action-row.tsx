'use client'

import * as React from 'react'
import { TaskActionRowRoot, type TaskActionRowRootProps } from './task-action-row-root'
import { TaskActionRowCheckbox, type TaskActionRowCheckboxProps } from './task-action-row-checkbox'
import { TaskActionRowPriority } from './task-action-row-priority'
import { TaskActionRowTitle, type TaskActionRowTitleProps } from './task-action-row-title'
import { TaskActionRowLabels, type TaskActionRowLabelsProps } from './task-action-row-labels'
import { TaskActionRowProjectBadge, type TaskActionRowProjectBadgeProps } from './task-action-row-project-badge'
import { TaskActionRowDueDate } from './task-action-row-due-date'
import { TaskActionRowStatusBadge } from './task-action-row-status-badge'
import { TaskActionRowNavigate, type TaskActionRowNavigateProps } from './task-action-row-navigate'
import type { TaskActionRowTask } from './task-action-row-context'

// ============================================================
// Props shorthand
// ============================================================

export interface TaskActionRowProps {
  task: TaskActionRowTask
  onClick?: () => void
  onComplete?: (taskId: string) => void | Promise<void>
  onContextMenu?: (e: React.MouseEvent) => void
  showCheckbox?: boolean
  showPriority?: boolean
  showLabels?: boolean
  showProject?: boolean
  showDueDate?: boolean
  showNavigate?: boolean
  showStatusBadge?: boolean
  truncateTitle?: boolean
  showSeparator?: boolean
  maxLabels?: number
  navigateHref?: string
  onProjectClick?: (e: React.MouseEvent) => void
  onNavigateClick?: (e: React.MouseEvent) => void
  className?: string
}

const TaskActionRowShorthand = React.forwardRef<HTMLDivElement, TaskActionRowProps>(
  (
    {
      task,
      onClick,
      onComplete,
      onContextMenu,
      showCheckbox,
      showPriority,
      showLabels,
      showProject,
      showDueDate,
      showNavigate,
      showStatusBadge,
      truncateTitle,
      showSeparator,
      maxLabels = 2,
      navigateHref,
      onProjectClick,
      onNavigateClick,
      className,
    },
    ref,
  ) => {
    return (
      <TaskActionRowRoot
        ref={ref}
        task={task}
        onClick={onClick}
        onContextMenu={onContextMenu}
        showSeparator={showSeparator}
        className={className}
      >
        {showCheckbox && <TaskActionRowCheckbox onComplete={onComplete} />}
        {showPriority && <TaskActionRowPriority />}
        <TaskActionRowTitle truncate={truncateTitle} />
        {showLabels && <TaskActionRowLabels max={maxLabels} />}
        {showProject && <TaskActionRowProjectBadge onClick={onProjectClick} />}
        {showDueDate && <TaskActionRowDueDate />}
        {showStatusBadge && <TaskActionRowStatusBadge />}
        {showNavigate && <TaskActionRowNavigate href={navigateHref} onClick={onNavigateClick} />}
      </TaskActionRowRoot>
    )
  },
)
TaskActionRowShorthand.displayName = 'TaskActionRow'

// ============================================================
// Compound component namespace
// ============================================================

export const TaskActionRow = Object.assign(TaskActionRowShorthand, {
  Root: TaskActionRowRoot,
  Checkbox: TaskActionRowCheckbox,
  Priority: TaskActionRowPriority,
  Title: TaskActionRowTitle,
  Labels: TaskActionRowLabels,
  ProjectBadge: TaskActionRowProjectBadge,
  DueDate: TaskActionRowDueDate,
  StatusBadge: TaskActionRowStatusBadge,
  Navigate: TaskActionRowNavigate,
})

// Re-export types
export type {
  TaskActionRowTask,
  TaskActionRowContextValue,
} from './task-action-row-context'
export type { TaskActionRowRootProps }
export type { TaskActionRowCheckboxProps }
export type { TaskActionRowTitleProps }
export type { TaskActionRowLabelsProps }
export type { TaskActionRowProjectBadgeProps }
export type { TaskActionRowNavigateProps }
