'use client'

import * as React from 'react'
import { useComposedRef } from '../utils/use-composed-ref'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cva } from 'class-variance-authority'
import { cn } from '@/ui/lib/utils'
import { Checkbox } from '@/ui'
import { Progress } from '@/ui'
import { AvatarGroup } from '@/composed/avatar-group'
import {
  IconArrowDown,
  IconArrowUp,
  IconArrowRight,
  IconAlertTriangle,
  IconGripVertical,
  IconCalendar,
  IconEye,
  IconLock,
} from '@tabler/icons-react'
import { useBoardContext } from './board-context'
import type { BoardTask } from './board-types'
import { PRIORITY_COLORS } from './board-constants'

// ============================================================
// Helpers
// ============================================================

function formatDueDate(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return { label: 'Overdue', className: 'text-error' }
  if (diffDays === 0) return { label: 'Today', className: 'text-warning' }
  if (diffDays === 1) return { label: 'Tomorrow', className: 'text-warning' }

  return {
    label: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    className: 'text-text-tertiary',
  }
}

const PRIORITY_ICON_MAP = {
  LOW: IconArrowDown,
  MEDIUM: IconArrowRight,
  HIGH: IconArrowUp,
  URGENT: IconAlertTriangle,
} as const

// ============================================================
// Card variants
// ============================================================

const taskCardVariants = cva(
  'group/card relative rounded-ds-lg border border-border-subtle bg-layer-01 p-ds-03 transition-all duration-fast-02 ease-productive-standard cursor-pointer',
  {
    variants: {
      state: {
        default: 'shadow-01 hover:shadow-02 hover:border-border',
        dragging: 'opacity-[0.38]',
        overlay: 'rotate-[2deg] shadow-03 backdrop-blur-sm ring-1 ring-interactive/40',
      },
      blocked: {
        true: 'border-l-2 border-l-error',
        false: '',
      },
      selected: {
        true: 'ring-2 ring-accent bg-interactive-subtle/30',
        false: '',
      },
      dimmed: {
        true: 'opacity-40',
        false: '',
      },
    },
    defaultVariants: {
      state: 'default',
      blocked: false,
      selected: false,
      dimmed: false,
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
    attributes: Record<string, unknown>
    listeners: Record<string, Function> | undefined
  }
}

function TaskCardVisual({
  task,
  isDragging,
  isDragOverlay,
  dragHandleProps,
}: TaskCardVisualProps) {
  const {
    selectedTaskIds,
    toggleTaskSelection,
    focusedTaskId,
    currentUserId,
    highlightMyTasks,
    onClickTask,
  } = useBoardContext()

  const isSelected = selectedTaskIds.has(task.id)
  const anySelected = selectedTaskIds.size > 0
  const isFocused = focusedTaskId === task.id
  const dueInfo = task.dueDate ? formatDueDate(task.dueDate) : null
  const PriorityIcon = PRIORITY_ICON_MAP[task.priority]
  const priorityColor = PRIORITY_COLORS[task.priority]

  // Dimmed logic: if highlightMyTasks and currentUserId is set,
  // dim if user is NOT owner AND NOT in assignees
  const isDimmed =
    highlightMyTasks &&
    currentUserId != null &&
    task.owner?.id !== currentUserId &&
    !task.assignees.some((a) => a.id === currentUserId)

  const subtaskPercent =
    task.subtaskCount > 0 ? (task.subtasksDone / task.subtaskCount) * 100 : 0

  return (
    <div
      role="group"
      tabIndex={0}
      aria-label={`Task ${task.taskId}: ${task.title}`}
      className={cn(
        taskCardVariants({
          state: isDragOverlay ? 'overlay' : isDragging ? 'dragging' : 'default',
          blocked: task.isBlocked,
          selected: isSelected,
          dimmed: isDimmed,
        }),
        isFocused && 'ring-2 ring-focus',
      )}
      onClick={() => onClickTask(task.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClickTask(task.id)
        }
      }}
    >
      {/* Row 1 — Header */}
      <div className="flex items-center gap-ds-02">
        {/* Selection checkbox — visible on hover OR when any card selected */}
        <div
          className={cn(
            'flex-shrink-0 transition-opacity',
            anySelected ? 'opacity-100' : 'opacity-0 group-hover/card:opacity-100',
          )}
        >
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => toggleTaskSelection(task.id)}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            aria-label={`Select task ${task.taskId}`}
            className="h-3.5 w-3.5"
          />
        </div>

        {/* Task ID badge */}
        <span className="text-ds-xs font-mono text-text-tertiary">{task.taskId}</span>

        {/* Priority icon */}
        <PriorityIcon className={cn('h-3.5 w-3.5 flex-shrink-0', priorityColor)} />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Drag handle */}
        <button
          className={cn(
            'flex-shrink-0 cursor-grab rounded p-ds-01 opacity-0 transition-opacity',
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
      </div>

      {/* Row 2 — Title */}
      <p className="mt-ds-02 text-ds-sm font-medium text-text-primary line-clamp-2">
        {task.title}
      </p>

      {/* Row 3 — Labels */}
      {task.labels.length > 0 && (
        <div className="mt-ds-02 flex items-center gap-ds-02 overflow-hidden">
          {task.labels.slice(0, 3).map((label) => (
            <span
              key={label}
              className="text-ds-xs bg-layer-02 text-text-secondary rounded-full px-ds-02 py-[2px] truncate max-w-[80px]"
            >
              {label}
            </span>
          ))}
          {task.labels.length > 3 && (
            <span className="text-ds-xs text-text-tertiary">
              +{task.labels.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Row 4 — Subtask progress */}
      {task.subtaskCount > 0 && (
        <div className="mt-ds-02 flex items-center gap-ds-02">
          <Progress size="sm" value={subtaskPercent} className="flex-1" aria-label={`Subtask progress: ${task.subtasksDone} of ${task.subtaskCount}`} />
          <span className="text-ds-xs text-text-tertiary">
            {task.subtasksDone}/{task.subtaskCount}
          </span>
        </div>
      )}

      {/* Row 5 — Bottom metadata */}
      <div className="mt-ds-02 flex items-center gap-ds-02">
        {/* Due date */}
        {dueInfo && (
          <div
            className={cn(
              'flex items-center gap-ds-01 text-ds-xs leading-tight',
              dueInfo.className,
            )}
          >
            <IconCalendar className="h-3 w-3" />
            <span>{dueInfo.label}</span>
          </div>
        )}

        {/* Visibility badge */}
        {task.visibility === 'EVERYONE' && (
          <span className="flex items-center text-text-tertiary" aria-label="Client visible">
            <IconEye className="h-3 w-3" />
          </span>
        )}

        {/* Blocked badge */}
        {task.isBlocked && (
          <span className="flex items-center text-error" aria-label="Blocked">
            <IconLock className="h-3 w-3" />
          </span>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Owner avatar */}
        {task.owner && (
          <div
            className="flex-shrink-0 ring-2 ring-accent/40 rounded-full h-ds-xs w-ds-xs flex items-center justify-center bg-layer-02 text-ds-xs text-text-secondary overflow-hidden"
            title={task.owner.name}
          >
            {task.owner.image ? (
              <img
                src={task.owner.image}
                alt={task.owner.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span>{task.owner.name.charAt(0).toUpperCase()}</span>
            )}
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
}

const TaskCard = React.forwardRef<HTMLDivElement, TaskCardProps>(
  function TaskCard({ task }, ref) {
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

    const composedRef = useComposedRef(setNodeRef, ref)

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
        />
      </div>
    )
  },
)

TaskCard.displayName = 'TaskCard'

// ============================================================
// Compact Card variants
// ============================================================

const taskCardCompactVariants = cva(
  'group/card flex items-center gap-ds-02 py-ds-02 px-ds-03 border-b border-border-subtle bg-layer-01 transition-all duration-fast-02 ease-productive-standard cursor-pointer hover:bg-layer-active',
  {
    variants: {
      selected: {
        true: 'ring-2 ring-accent bg-interactive-subtle/30',
        false: '',
      },
      dimmed: {
        true: 'opacity-40',
        false: '',
      },
    },
    defaultVariants: {
      selected: false,
      dimmed: false,
    },
  },
)

// ============================================================
// Compact Visual Card
// ============================================================

function TaskCardCompactVisual({
  task,
  isDragging,
  isDragOverlay,
  dragHandleProps,
}: TaskCardVisualProps) {
  const {
    selectedTaskIds,
    toggleTaskSelection,
    focusedTaskId,
    currentUserId,
    highlightMyTasks,
    onClickTask,
  } = useBoardContext()

  const isSelected = selectedTaskIds.has(task.id)
  const anySelected = selectedTaskIds.size > 0
  const isFocused = focusedTaskId === task.id
  const PriorityIcon = PRIORITY_ICON_MAP[task.priority]
  const priorityColor = PRIORITY_COLORS[task.priority]

  const isDimmed =
    highlightMyTasks &&
    currentUserId != null &&
    task.owner?.id !== currentUserId &&
    !task.assignees.some((a) => a.id === currentUserId)

  return (
    <div
      role="group"
      tabIndex={0}
      aria-label={`Task ${task.taskId}: ${task.title}`}
      className={cn(
        taskCardCompactVariants({
          selected: isSelected,
          dimmed: isDimmed,
        }),
        isDragging && 'opacity-[0.38]',
        isDragOverlay && 'shadow-03 backdrop-blur-sm ring-1 ring-interactive/40',
        isFocused && 'ring-2 ring-focus',
      )}
      onClick={() => onClickTask(task.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClickTask(task.id)
        }
      }}
    >
      {/* Checkbox */}
      <div
        className={cn(
          'flex-shrink-0 transition-opacity',
          anySelected ? 'opacity-100' : 'opacity-0 group-hover/card:opacity-100',
        )}
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => toggleTaskSelection(task.id)}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          aria-label={`Select task ${task.taskId}`}
          className="h-3.5 w-3.5"
        />
      </div>

      {/* Priority icon */}
      <PriorityIcon className={cn('h-3.5 w-3.5 flex-shrink-0', priorityColor)} />

      {/* Task ID */}
      <span className="text-ds-xs font-mono text-text-tertiary flex-shrink-0">
        {task.taskId}
      </span>

      {/* Title */}
      <span className="text-ds-sm text-text-primary line-clamp-1 flex-1 min-w-0">
        {task.title}
      </span>

      {/* Subtask count (text only, no bar) */}
      {task.subtaskCount > 0 && (
        <span className="text-ds-xs text-text-tertiary flex-shrink-0">
          {task.subtasksDone}/{task.subtaskCount}
        </span>
      )}

      {/* Owner avatar */}
      {task.owner && (
        <div
          className="flex-shrink-0 ring-2 ring-accent/40 rounded-full h-5 w-5 flex items-center justify-center bg-layer-02 text-ds-xs text-text-secondary overflow-hidden"
          title={task.owner.name}
        >
          {task.owner.image ? (
            <img
              src={task.owner.image}
              alt={task.owner.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span>{task.owner.name.charAt(0).toUpperCase()}</span>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================================
// Sortable Compact Task Card
// ============================================================

export interface TaskCardCompactProps {
  task: BoardTask
}

const TaskCardCompact = React.forwardRef<HTMLDivElement, TaskCardCompactProps>(
  function TaskCardCompact({ task }, ref) {
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

    const composedRef = useComposedRef(setNodeRef, ref)

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    }

    return (
      <div ref={composedRef} style={style}>
        <TaskCardCompactVisual
          task={task}
          isDragging={isDragging}
          dragHandleProps={{ attributes, listeners }}
        />
      </div>
    )
  },
)

TaskCardCompact.displayName = 'TaskCardCompact'

// ============================================================
// Compact Overlay Task Card
// ============================================================

export interface TaskCardCompactOverlayProps {
  task: BoardTask
}

const TaskCardCompactOverlay = React.forwardRef<
  HTMLDivElement,
  TaskCardCompactOverlayProps
>(function TaskCardCompactOverlay({ task }, ref) {
  return (
    <div ref={ref}>
      <TaskCardCompactVisual task={task} isDragOverlay />
    </div>
  )
})

TaskCardCompactOverlay.displayName = 'TaskCardCompactOverlay'

// ============================================================
// Overlay Task Card (used inside DragOverlay, no sortable hooks)
// ============================================================

export interface TaskCardOverlayProps {
  task: BoardTask
}

const TaskCardOverlay = React.forwardRef<HTMLDivElement, TaskCardOverlayProps>(
  function TaskCardOverlay({ task }, ref) {
    return (
      <div ref={ref}>
        <TaskCardVisual task={task} isDragOverlay />
      </div>
    )
  },
)

TaskCardOverlay.displayName = 'TaskCardOverlay'

export { TaskCard }
export type { TaskCardProps }
export { TaskCardOverlay }
export type { TaskCardOverlayProps }
export { TaskCardCompact }
export type { TaskCardCompactProps }
export { TaskCardCompactOverlay }
export type { TaskCardCompactOverlayProps }
