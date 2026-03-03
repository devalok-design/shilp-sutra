'use client'

import * as React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { DraggableAttributes } from '@dnd-kit/core'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import { cva } from 'class-variance-authority'
import { cn } from '../../ui/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar'
import { Badge } from '../../ui'
import { IconCalendar, IconGripVertical } from '@tabler/icons-react'
import { getInitials } from '../../shared/lib/string-utils'
import { PRIORITY_LABELS, PRIORITY_DOT_COLORS } from '../tasks/task-constants'

// ============================================================
// Types
// ============================================================

export interface BoardTask {
  id: string
  title: string
  priority: string
  labels: string[]
  dueDate: string | null
  isBlocked: boolean
  assignees: { id: string; name: string; image: string | null }[]
}

// ============================================================
// Helpers
// ============================================================

function formatDueDate(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return { label: 'Overdue', className: 'text-text-error' }
  if (diffDays === 0) return { label: 'Today', className: 'text-warning' }
  if (diffDays === 1) return { label: 'Tomorrow', className: 'text-text-warning' }

  return {
    label: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    className: 'text-text-tertiary',
  }
}

// ============================================================
// Card variants
// ============================================================

const taskCardVariants = cva(
  'group/card relative rounded-ds-lg border border-border/60 bg-layer-01 p-ds-04 shadow-01 transition-[color,background-color,border-color,box-shadow] duration-moderate hover:shadow-02 hover:border-border cursor-pointer',
  {
    variants: {
      state: {
        default: '',
        dragging: 'opacity-40',
        overlay: 'rotate-[2deg] shadow-03 border-border-interactive/60 ring-1 ring-interactive/40',
      },
      blocked: {
        true: 'border-l-2 border-l-error',
        false: '',
      },
    },
    defaultVariants: {
      state: 'default',
      blocked: false,
    },
  },
)

// ============================================================
// Visual Card (shared between sortable and overlay)
// ============================================================

interface TaskCardVisualProps {
  task: BoardTask
  isDragging?: boolean
  isDragOverlay?: boolean
  dragHandleProps?: {
    attributes: DraggableAttributes
    listeners: SyntheticListenerMap | undefined
  }
  onClickTask?: (taskId: string) => void
}

function TaskCardVisual({
  task,
  isDragging,
  isDragOverlay,
  dragHandleProps,
  onClickTask,
}: TaskCardVisualProps) {
  const dueInfo = task.dueDate ? formatDueDate(task.dueDate) : null
  const displayAssignees = task.assignees.slice(0, 2)
  const extraCount = task.assignees.length - 2

  return (
    <div
      className={taskCardVariants({
        state: isDragOverlay ? 'overlay' : isDragging ? 'dragging' : 'default',
        blocked: task.isBlocked,
      })}
      onClick={() => onClickTask?.(task.id)}
    >
      {/* Drag handle + Title row */}
      <div className="flex items-start gap-ds-02b">
        <button
          className={cn(
            'mt-0.5 flex-shrink-0 cursor-grab rounded p-0.5 opacity-0 transition-opacity',
            'group-hover/card:opacity-40 hover:!opacity-100',
            'active:cursor-grabbing',
            isDragOverlay && 'opacity-40',
          )}
          {...(dragHandleProps?.attributes ?? {})}
          {...(dragHandleProps?.listeners ?? {})}
          aria-label={`Drag handle for task: ${task.title}`}
          aria-roledescription="sortable"
          onClick={(e) => e.stopPropagation()}
        >
          <IconGripVertical className="h-ico-sm w-ico-sm text-icon-secondary" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-ds-md font-medium text-text-primary line-clamp-2">
            {task.title}
          </p>
        </div>
      </div>

      {/* Metadata row */}
      <div className="mt-ds-03 flex items-center gap-ds-03">
        {/* Priority dot */}
        <div
          className={cn(
            'h-2 w-2 rounded-ds-full flex-shrink-0',
            PRIORITY_DOT_COLORS[task.priority],
          )}
          title={PRIORITY_LABELS[task.priority]}
        />

        {/* Labels */}
        {task.labels.length > 0 && (
          <div className="flex items-center gap-ds-02 overflow-hidden">
            {task.labels.slice(0, 2).map((label) => (
              <Badge key={label} size="sm" variant="neutral" className="max-w-[80px] truncate">
                {label}
              </Badge>
            ))}
            {task.labels.length > 2 && (
              <span className="text-ds-xs text-text-tertiary">
                +{task.labels.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Due date */}
        {dueInfo && (
          <div
            className={cn(
              'flex items-center gap-0.5 text-ds-sm',
              dueInfo.className,
            )}
          >
            <IconCalendar className="h-3 w-3" />
            <span>{dueInfo.label}</span>
          </div>
        )}

        {/* Assignee avatars */}
        {displayAssignees.length > 0 && (
          <div className="flex -space-x-ds-02b">
            {displayAssignees.map((assignee) => (
              <Avatar key={assignee.id} className="h-ico-md w-ico-md border border-layer-01">
                <AvatarImage
                  src={assignee.image || undefined}
                  alt={assignee.name}
                />
                <AvatarFallback className="text-ds-xs bg-field">
                  {getInitials(assignee.name)}
                </AvatarFallback>
              </Avatar>
            ))}
            {extraCount > 0 && (
              <div className="flex h-ico-md w-ico-md items-center justify-center rounded-ds-full border border-layer-01 bg-field text-ds-xs font-medium text-text-tertiary">
                +{extraCount}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================
// Sortable Task Card (used inside SortableContext)
// ============================================================

export interface TaskCardProps {
  task: BoardTask
  onClickTask?: (taskId: string) => void
}

export function TaskCard({ task, onClickTask }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <TaskCardVisual
        task={task}
        isDragging={isDragging}
        dragHandleProps={{ attributes, listeners }}
        onClickTask={onClickTask}
      />
    </div>
  )
}

// ============================================================
// Overlay Task Card (used inside DragOverlay, no sortable hooks)
// ============================================================

export interface TaskCardOverlayProps {
  task: BoardTask
}

export const TaskCardOverlay = React.forwardRef<HTMLDivElement, TaskCardOverlayProps>(
  function TaskCardOverlay({ task }, ref) {
  return (
    <div ref={ref}>
      <TaskCardVisual task={task} isDragOverlay />
    </div>
  )
},
)

TaskCardOverlay.displayName = 'TaskCardOverlay'
