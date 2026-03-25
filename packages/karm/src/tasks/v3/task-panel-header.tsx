'use client'

import * as React from 'react'
import {
  IconX,
  IconArrowsMaximize,
  IconDots,
  IconLink,
  IconCopy,
  IconClipboard,
  IconTrash,
  IconChevronRight,
  IconChevronUp,
  IconChevronDown,
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
import { DevalokGrain } from '@/ui/devalok-grain'
import { useTaskPanel } from './task-panel-context'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

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
    onNavigatePrev,
    onNavigateNext,
  } = useTaskPanel()

  return (
    <div
      className={cn(
        'relative overflow-hidden isolate flex flex-col gap-ds-02 px-ds-06 py-ds-05',
        className,
      )}
      {...props}
    >
      <DevalokGrain intensity="medium" surface="soft" />
      {/* Project breadcrumb + Task ID */}
      <div className="flex items-center gap-ds-01 text-ds-xs text-surface-fg-subtle">
        {task.projectName && (
          <>
            <span className="text-surface-fg-muted">{task.projectName}</span>
            <Icon icon={IconChevronRight} size="xs" />
          </>
        )}
        <span className="font-mono">{task.taskId}</span>
        <span className="text-surface-fg-subtle/40">&middot;</span>
        <span className="text-surface-fg-subtle/60">updated {timeAgo(task.updatedAt)}</span>
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
          {onNavigatePrev && (
            <Button variant="ghost" size="icon-xs" onClick={onNavigatePrev} aria-label="Previous task">
              <Icon icon={IconChevronUp} size="sm" />
            </Button>
          )}
          {onNavigateNext && (
            <Button variant="ghost" size="icon-xs" onClick={onNavigateNext} aria-label="Next task">
              <Icon icon={IconChevronDown} size="sm" />
            </Button>
          )}
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
                    navigator.clipboard?.writeText(ref).catch(() => {
                      // Fallback for non-HTTPS contexts
                      const textarea = document.createElement('textarea')
                      textarea.value = ref
                      textarea.style.position = 'fixed'
                      textarea.style.opacity = '0'
                      document.body.appendChild(textarea)
                      textarea.select()
                      document.execCommand('copy')
                      document.body.removeChild(textarea)
                    })
                  }}
                >
                  <Icon icon={IconCopy} size="sm" className="mr-ds-03" />
                  Copy reference
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    const status = task.statusOptions?.find(o => o.id === task.status)?.name ?? task.status
                    const assigneeNames = task.assignees.map(a => a.name).join(', ') || 'Unassigned'
                    const due = task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No due date'
                    const summary = `${task.taskId}: ${task.title}\nStatus: ${status} | Assigned: ${assigneeNames} | Due: ${due}`
                    navigator.clipboard?.writeText(summary).catch(() => {})
                  }}
                >
                  <Icon icon={IconClipboard} size="sm" className="mr-ds-03" />
                  Copy summary
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
