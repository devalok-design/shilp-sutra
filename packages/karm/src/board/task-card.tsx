'use client'

import * as React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { DraggableAttributes } from '@dnd-kit/core'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import { cva } from 'class-variance-authority'
import { cn } from '@/ui/lib/utils'
import { Badge } from '@/ui'
import { AvatarGroup } from '@/composed/avatar-group'
import { IconCalendar, IconGripVertical } from '@tabler/icons-react'
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
  'group/card relative rounded-ds-lg border border-border/60 bg-layer-01 p-ds-04 shadow-01 transition-[color,background-color,border-color,box-shadow] duration-fast-02 ease-productive-standard hover:shadow-02 hover:border-border cursor-pointer',
  {
    variants: {
      state: {
        default: '',
        dragging: 'opacity-[0.38]',
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

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
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
            'mt-ds-01 flex-shrink-0 cursor-grab rounded p-ds-01 opacity-0 transition-opacity',
            'group-hover/card:opacity-[0.38] hover:!opacity-100',
            'active:cursor-grabbing',
            isDragOverlay && 'opacity-[0.38]',
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
              'flex items-center gap-ds-01 text-ds-xs leading-tight',
              dueInfo.className,
            )}
          >
            <IconCalendar className="h-2.5 w-2.5" />
            <span>{dueInfo.label}</span>
          </div>
        )}

        {/* Assignee avatars */}
        {task.assignees.length > 0 && (
          <AvatarGroup
            users={task.assignees}
            size="sm"
            max={2}
            showTooltip={false}
          />
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

const TaskCard = React.forwardRef<HTMLDivElement, TaskCardProps>(
  function TaskCard({ task, onClickTask }, ref) {
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

    const composedRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        setNodeRef(node)
        if (typeof ref === 'function') {
          ref(node)
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLDivElement | null>).current = node
        }
      },
      [ref, setNodeRef],
    )

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    }

    return (
      <div ref={composedRef} style={style}>
        <TaskCardVisual
          task={task}
          isDragging={isDragging}
          dragHandleProps={{ attributes, listeners }}
          onClickTask={onClickTask}
        />
      </div>
    )
  },
)

TaskCard.displayName = 'TaskCard'

export { TaskCard }

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
