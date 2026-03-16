'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
import { TaskActionRowContext, type TaskActionRowTask } from './task-action-row-context'

export interface TaskActionRowRootProps {
  task: TaskActionRowTask
  children: React.ReactNode
  onClick?: () => void
  onContextMenu?: (e: React.MouseEvent) => void
  showSeparator?: boolean
  className?: string
}

const TaskActionRowRoot = React.forwardRef<HTMLDivElement, TaskActionRowRootProps>(
  ({ task, children, onClick, onContextMenu, showSeparator = true, className }, ref) => {
    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onClick()
        }
      },
      [onClick],
    )

    return (
      <TaskActionRowContext.Provider value={{ task }}>
        <div
          ref={ref}
          role={onClick ? 'button' : undefined}
          tabIndex={onClick ? 0 : undefined}
          onClick={onClick}
          onKeyDown={onClick ? handleKeyDown : undefined}
          onContextMenu={onContextMenu}
          className={cn(
            'group flex items-center gap-ds-03 px-ds-04 py-ds-03 rounded-ds-md',
            onClick && 'hover:bg-surface-raised-hover active:bg-surface-raised-active transition-colors duration-150',
            showSeparator && 'border-b border-surface-border',
            className,
          )}
        >
          {children}
        </div>
      </TaskActionRowContext.Provider>
    )
  },
)
TaskActionRowRoot.displayName = 'TaskActionRowRoot'

export { TaskActionRowRoot }
