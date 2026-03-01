'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { DraggableAttributes } from '@dnd-kit/core'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import { cn } from '../../ui/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar'
import { Calendar, GripVertical } from 'lucide-react'
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

  if (diffDays < 0) return { label: 'Overdue', className: 'text-[var(--color-text-error)]' }
  if (diffDays === 0) return { label: 'Today', className: 'text-[var(--color-warning)]' }
  if (diffDays === 1) return { label: 'Tomorrow', className: 'text-[var(--color-text-warning)]' }

  return {
    label: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    className: 'text-[var(--color-text-tertiary)]',
  }
}

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
      className={cn(
        'group/card relative rounded-[var(--radius-lg)] border border-[var(--color-border-default)]/60 bg-[var(--color-layer-01)] p-3 shadow-[var(--shadow-01)]',
        'transition-[color,background-color,border-color,box-shadow] duration-[var(--duration-moderate)]',
        'hover:shadow-[var(--shadow-02)] hover:border-[var(--color-border-default)]',
        'cursor-pointer',
        isDragging && !isDragOverlay && 'opacity-40',
        isDragOverlay &&
          'rotate-[2deg] shadow-[var(--shadow-03)] border-[var(--color-border-interactive)]/60 ring-1 ring-[var(--color-interactive)]/40',
        task.isBlocked && 'border-l-2 border-l-[var(--color-danger)]',
      )}
      onClick={() => onClickTask?.(task.id)}
    >
      {/* Drag handle + Title row */}
      <div className="flex items-start gap-1.5">
        <button
          className={cn(
            'mt-0.5 flex-shrink-0 cursor-grab rounded p-0.5 opacity-0 transition-opacity',
            'group-hover/card:opacity-40 hover:!opacity-100',
            'active:cursor-grabbing',
            isDragOverlay && 'opacity-40',
          )}
          {...(dragHandleProps?.attributes ?? {})}
          {...(dragHandleProps?.listeners ?? {})}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-3.5 w-3.5 text-[var(--color-icon-secondary)]" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-snug text-[var(--color-text-primary)] line-clamp-2">
            {task.title}
          </p>
        </div>
      </div>

      {/* Metadata row */}
      <div className="mt-2 flex items-center gap-2">
        {/* Priority dot */}
        <div
          className={cn(
            'h-2 w-2 rounded-[var(--radius-full)] flex-shrink-0',
            PRIORITY_DOT_COLORS[task.priority],
          )}
          title={PRIORITY_LABELS[task.priority]}
        />

        {/* Labels */}
        {task.labels.length > 0 && (
          <div className="flex items-center gap-1 overflow-hidden">
            {task.labels.slice(0, 2).map((label) => (
              <span
                key={label}
                className="inline-flex max-w-[80px] truncate rounded-[var(--radius-sm)] bg-[var(--color-field)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-text-tertiary)]"
              >
                {label}
              </span>
            ))}
            {task.labels.length > 2 && (
              <span className="text-[10px] text-[var(--color-text-tertiary)]">
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
              'flex items-center gap-0.5 text-[11px]',
              dueInfo.className,
            )}
          >
            <Calendar className="h-3 w-3" />
            <span>{dueInfo.label}</span>
          </div>
        )}

        {/* Assignee avatars */}
        {displayAssignees.length > 0 && (
          <div className="flex -space-x-1.5">
            {displayAssignees.map((assignee) => (
              <Avatar key={assignee.id} className="h-5 w-5 border border-[var(--color-layer-01)]">
                <AvatarImage
                  src={assignee.image || undefined}
                  alt={assignee.name}
                />
                <AvatarFallback className="text-[8px] bg-[var(--color-field)]">
                  {getInitials(assignee.name)}
                </AvatarFallback>
              </Avatar>
            ))}
            {extraCount > 0 && (
              <div className="flex h-5 w-5 items-center justify-center rounded-[var(--radius-full)] border border-[var(--color-layer-01)] bg-[var(--color-field)] text-[8px] font-medium text-[var(--color-text-tertiary)]">
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

interface TaskCardProps {
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

interface TaskCardOverlayProps {
  task: BoardTask
}

export function TaskCardOverlay({ task }: TaskCardOverlayProps) {
  return <TaskCardVisual task={task} isDragOverlay />
}
