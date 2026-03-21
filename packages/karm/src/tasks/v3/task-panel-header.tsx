'use client'

import * as React from 'react'
import { IconX, IconArrowsMaximize } from '@tabler/icons-react'
import { cn } from '@/ui/lib/utils'
import { Button } from '@/ui/button'
import { InlineEdit } from '@/composed/inline-edit'
import { useTaskPanel } from './task-panel-context'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TaskPanelHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

// ---------------------------------------------------------------------------
// TaskPanelHeader
// ---------------------------------------------------------------------------

export function TaskPanelHeader({ className, ...props }: TaskPanelHeaderProps) {
  const { task, mode, clientMode, onUpdateTitle, onClose, onExpand } =
    useTaskPanel()

  return (
    <div
      className={cn(
        'flex flex-col gap-ds-02 px-ds-06 py-ds-05',
        className,
      )}
      {...props}
    >
      {/* Task ID */}
      <span className="text-ds-xs font-mono text-surface-fg-subtle">
        {task.taskId}
      </span>

      {/* Title + actions row */}
      <div className="flex items-start justify-between gap-ds-03">
        <InlineEdit
          value={task.title}
          onSave={onUpdateTitle}
          readOnly={clientMode}
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
              <IconArrowsMaximize className="h-ico-sm w-ico-sm" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close"
          >
            <IconX className="h-ico-sm w-ico-sm" />
          </Button>
        </div>
      </div>
    </div>
  )
}

TaskPanelHeader.displayName = 'TaskPanelHeader'
