'use client'

import * as React from 'react'
import {
  IconX,
  IconArrowsMaximize,
  IconDots,
  IconLink,
  IconCopy,
  IconTrash,
} from '@tabler/icons-react'
import { Icon } from '@/ui/icon'
import { cn } from '@/ui/lib/utils'
import { Button } from '@/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/ui/dropdown-menu'
import { InlineEdit } from '@/composed/inline-edit'
import { useTaskPanel } from './task-panel-context'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TaskPanelHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Slot for a custom dropdown menu triggered by the three-dot button. Receives the trigger as children. */
  menuSlot?: React.ReactNode
}

// ---------------------------------------------------------------------------
// TaskPanelHeader
// ---------------------------------------------------------------------------

export function TaskPanelHeader({ className, menuSlot, ...props }: TaskPanelHeaderProps) {
  const {
    task,
    mode,
    clientMode,
    onUpdateTitle,
    onClose,
    onExpand,
    onCopyLink,
    onDuplicateTask,
    onDeleteTask,
  } = useTaskPanel()

  return (
    <div
      className={cn(
        'flex flex-col gap-ds-02 px-ds-06 py-ds-05',
        className,
      )}
      {...props}
    >
      {/* Task ID + Project */}
      <div className="flex items-center gap-0">
        <span className="text-ds-xs font-mono text-surface-fg-subtle">
          {task.taskId}
        </span>
        {task.project && (
          <span className="text-ds-xs text-surface-fg-subtle/60">
            {' · '}{task.project}
          </span>
        )}
      </div>

      {/* Title + actions row */}
      <div className="flex items-start justify-between gap-ds-03">
        <InlineEdit
          value={task.title}
          onSave={onUpdateTitle}
          readOnly={!!clientMode}
          textClassName="text-ds-lg font-semibold"
          className="min-w-0 flex-1"
        />

        {/* Action buttons */}
        <div className="flex shrink-0 items-center gap-ds-01">
          {mode !== 'full' && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onExpand}
              aria-label="Expand"
            >
              <Icon icon={IconArrowsMaximize} size="sm" />
            </Button>
          )}
          {/* Actions menu — composable slot with built-in default */}
          {menuSlot ?? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label="Task actions">
                  <Icon icon={IconDots} size="sm" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={onCopyLink}>
                  <Icon icon={IconLink} size="sm" className="mr-ds-03" />
                  Copy link
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    const ref = `${task.taskId}: ${task.title}`
                    navigator.clipboard.writeText(ref)
                  }}
                >
                  <Icon icon={IconCopy} size="sm" className="mr-ds-03" />
                  Copy reference
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDuplicateTask}>
                  <Icon icon={IconCopy} size="sm" className="mr-ds-03" />
                  Duplicate
                </DropdownMenuItem>
                {!clientMode && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={onDeleteTask}
                      className="text-error-11 focus:text-error-11"
                    >
                      <Icon icon={IconTrash} size="sm" className="mr-ds-03" />
                      Delete task
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close"
          >
            <Icon icon={IconX} size="sm" />
          </Button>
        </div>
      </div>
    </div>
  )
}

TaskPanelHeader.displayName = 'TaskPanelHeader'
