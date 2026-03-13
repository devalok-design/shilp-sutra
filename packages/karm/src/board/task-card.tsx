'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useComposedRef } from '../utils/use-composed-ref'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cva } from 'class-variance-authority'
import { cn } from '@/ui/lib/utils'
import { springs } from '@/ui/lib/motion'
import { Checkbox } from '@/ui'
import { Avatar, AvatarImage, AvatarFallback } from '@/ui/avatar'
import {
  IconArrowDown,
  IconArrowUp,
  IconArrowRight,
  IconAlertTriangle,
  IconGripVertical,
  IconCalendar,
  IconEye,
  IconLock,
  IconSubtask,
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

  if (diffDays < 0) return { label: 'Overdue', className: 'text-error-11' }
  if (diffDays === 0) return { label: 'Today', className: 'text-warning-11' }
  if (diffDays === 1) return { label: 'Tomorrow', className: 'text-warning-11' }

  return {
    label: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    className: 'text-surface-fg-subtle',
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
  'group/card relative rounded-ds-lg border border-transparent bg-surface-3 pl-3 pr-ds-03 py-ds-03 transition-all duration-100 ease-out cursor-pointer',
  {
    variants: {
      state: {
        default: 'shadow-01 hover:shadow-02 hover:-translate-y-px hover:border-surface-border-strong',
        dragging: 'opacity-action-disabled',
        overlay: 'rotate-[2deg] shadow-03 backdrop-blur-sm ring-1 ring-accent-7',
      },
      blocked: {
        true: 'border-l-2 border-l-error-9',
        false: '',
      },
      selected: {
        true: 'ring-1 ring-accent-6 shadow-[0_0_6px_rgba(var(--accent-rgb,99,102,241),0.15)] ',
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    attributes: Record<string, any>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    listeners: Record<string, Function> | undefined
  }
}

function getInitials(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return ''
  const parts = trimmed.split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return trimmed.slice(0, 2).toUpperCase()
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

  const isDimmed =
    highlightMyTasks &&
    currentUserId != null &&
    task.owner?.id !== currentUserId &&
    !task.assignees.some((a) => a.id === currentUserId)

  // Build avatar stack: owner first (with glow), then assignees
  const avatarUsers: { name: string; image: string | null; isOwner: boolean }[] = []
  if (task.owner) {
    avatarUsers.push({ name: task.owner.name, image: task.owner.image, isOwner: true })
  }
  for (const a of task.assignees) {
    // Skip if same as owner
    if (task.owner && a.id === task.owner.id) continue
    avatarUsers.push({ name: a.name, image: a.image, isOwner: false })
  }

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- role="group" groups task content for screen readers; click/key handlers are intentional
    <div
      role="group"
      tabIndex={0}
      data-task-id={task.id}
      aria-label={`Task ${task.taskId}: ${task.title}`}
      className={cn(
        taskCardVariants({
          state: isDragOverlay ? 'overlay' : isDragging ? 'dragging' : 'default',
          blocked: task.isBlocked,
          selected: isSelected,
          dimmed: isDimmed,
        }),
        isDragOverlay && 'scale-[1.03] rotate-[1.5deg] shadow-03',
        isDragging && 'opacity-40',
        isFocused && 'ring-1 ring-accent-9',
      )}
      onClick={() => onClickTask(task.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClickTask(task.id)
        }
      }}
    >
      {/* Selection checkbox — absolute overlay, top-left corner */}
      <motion.div
        className={cn(
          'absolute -top-2 -left-2 z-10 transition-opacity',
          anySelected || isSelected
            ? 'opacity-100'
            : 'opacity-0 group-hover/card:opacity-100',
        )}
        initial={anySelected || isSelected ? { scale: 0.85 } : false}
        animate={{ scale: 1 }}
        transition={springs.bouncy}
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => toggleTaskSelection(task.id)}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          aria-label={`Select task ${task.taskId}`}
          className="rounded-full bg-surface-1 shadow-01"
        />
      </motion.div>

      {/* Row 1 — Header: TaskID + Priority + drag handle */}
      <div className="flex items-center gap-ds-02">
        <span className="text-ds-xs font-mono leading-none text-surface-fg-subtle">{task.taskId}</span>
        <PriorityIcon className={cn('h-3 w-3 flex-shrink-0', priorityColor)} title={`Priority: ${task.priority}`} />

        <div className="flex-1" />

        {/* Drag handle */}
        <button
          className={cn(
            'flex-shrink-0 cursor-grab rounded p-ds-01 opacity-0 transition-opacity',
            'group-hover/card:opacity-action-disabled hover:!opacity-100',
            'active:cursor-grabbing',
            isDragOverlay && 'opacity-action-disabled',
          )}
          {...(dragHandleProps?.attributes ?? {})}
          {...(dragHandleProps?.listeners ?? {})}
          aria-label={`Drag handle for task: ${task.title}`}
          aria-roledescription="sortable"
          onClick={(e) => e.stopPropagation()}
        >
          <IconGripVertical className="h-ico-sm w-ico-sm text-surface-fg-subtle" />
        </button>
      </div>

      {/* Row 2 — Title */}
      <p className="mt-ds-02 text-ds-sm font-medium text-surface-fg line-clamp-2">
        {task.title}
      </p>

      {/* Row 3 — Bottom metadata: due date, subtasks, badges, avatars */}
      <div className="mt-ds-03 flex items-center gap-ds-02">
        {/* Due date */}
        {dueInfo && (
          <div
            className={cn(
              'flex items-center gap-ds-01 text-ds-xs leading-tight',
              dueInfo.className,
            )}
            title={`Due: ${dueInfo.label}`}
          >
            <IconCalendar className="h-3 w-3" />
            <span>{dueInfo.label}</span>
          </div>
        )}

        {/* Subtask count */}
        {task.subtaskCount > 0 && (
          <div
            className="flex items-center gap-ds-01 text-ds-xs text-surface-fg-subtle"
            title={`Subtasks: ${task.subtasksDone} of ${task.subtaskCount} done`}
          >
            <IconSubtask className="h-3 w-3" />
            <span>{task.subtasksDone}/{task.subtaskCount}</span>
          </div>
        )}

        {/* Visibility badge */}
        {task.visibility === 'EVERYONE' && (
          <span className="flex items-center text-surface-fg-subtle" aria-label="Client visible" title="Visible to client">
            <IconEye className="h-3 w-3" />
          </span>
        )}

        {/* Blocked badge */}
        {task.isBlocked && (
          <span className="flex items-center text-error-11" aria-label="Blocked" title="Blocked">
            <IconLock className="h-3 w-3" />
          </span>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Avatar stack: owner (with glow) + assignees */}
        {avatarUsers.length > 0 && (
          <div className="flex items-center flex-shrink-0">
            {avatarUsers.slice(0, 3).map((user, i) => (
              <Avatar
                key={i}
                size="xs"
                className={cn(
                  'text-ds-xs border-2 border-surface-1',
                  i > 0 && '-ml-ds-02b',
                  user.isOwner && 'shadow-[0_0_0_1.5px_rgba(var(--accent-rgb,99,102,241),0.35),0_0_6px_rgba(var(--accent-rgb,99,102,241),0.2)]',
                )}
                style={{ zIndex: avatarUsers.length - i }}
                title={user.name}
              >
                {user.image && <AvatarImage src={user.image} alt={user.name} />}
                <AvatarFallback className="font-body font-semibold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
            ))}
            {avatarUsers.length > 3 && (
              <span className="ml-ds-01 text-ds-xs text-surface-fg-subtle">
                +{avatarUsers.length - 3}
              </span>
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

export interface TaskCardProps extends React.HTMLAttributes<HTMLDivElement> {
  task: BoardTask
}

const TaskCard = React.forwardRef<HTMLDivElement, TaskCardProps>(
  function TaskCard({ task, className, ...props }, ref) {
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
      <div ref={composedRef} style={style} className={className} {...props}>
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
  'group/card flex items-center gap-ds-02 py-2 pl-3 pr-ds-03 border border-transparent rounded-ds-lg bg-surface-3 transition-all duration-100 ease-out cursor-pointer hover:bg-surface-4 hover:shadow-02 hover:-translate-y-px',
  {
    variants: {
      selected: {
        true: 'ring-1 ring-accent-6 shadow-[0_0_6px_rgba(var(--accent-rgb,99,102,241),0.15)] ',
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

  // Owner avatar for compact — just the first person (owner or first assignee)
  const leadUser = task.owner ?? task.assignees[0] ?? null

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- role="group" groups task content for screen readers; click/key handlers are intentional
    <div
      role="group"
      tabIndex={0}
      data-task-id={task.id}
      aria-label={`Task ${task.taskId}: ${task.title}`}
      className={cn(
        'relative',
        taskCardCompactVariants({
          selected: isSelected,
          dimmed: isDimmed,
        }),
        isDragging && 'opacity-40',
        isDragOverlay && 'scale-[1.03] rotate-[1.5deg] shadow-03',
        isFocused && 'ring-1 ring-accent-9',
      )}
      onClick={() => onClickTask(task.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClickTask(task.id)
        }
      }}
    >
      {/* Selection checkbox — absolute overlay */}
      <motion.div
        className={cn(
          'absolute -top-1.5 -left-1.5 z-10 transition-opacity',
          anySelected || isSelected
            ? 'opacity-100'
            : 'opacity-0 group-hover/card:opacity-100',
        )}
        initial={anySelected || isSelected ? { scale: 0.85 } : false}
        animate={{ scale: 1 }}
        transition={springs.bouncy}
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => toggleTaskSelection(task.id)}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          aria-label={`Select task ${task.taskId}`}
          className="rounded-full bg-surface-1 shadow-01"
        />
      </motion.div>

      {/* Priority icon */}
      <PriorityIcon className={cn('h-3.5 w-3.5 flex-shrink-0', priorityColor)} title={`Priority: ${task.priority}`} />

      {/* Task ID */}
      <span className="text-ds-xs font-mono text-surface-fg-subtle flex-shrink-0">
        {task.taskId}
      </span>

      {/* Title */}
      <span className="text-ds-sm text-surface-fg line-clamp-1 flex-1 min-w-0">
        {task.title}
      </span>

      {/* Subtask count */}
      {task.subtaskCount > 0 && (
        <span className="text-ds-xs text-surface-fg-subtle flex-shrink-0">
          {task.subtasksDone}/{task.subtaskCount}
        </span>
      )}

      {/* Lead avatar — tiny for compact */}
      {leadUser && (
        <div
          className={cn(
            'flex h-[14px] w-[14px] shrink-0 items-center justify-center rounded-full border border-surface-1 bg-accent-2 text-[6px] font-semibold leading-none text-accent-11 overflow-hidden',
            task.owner && 'shadow-[0_0_0_1px_rgba(var(--accent-rgb,99,102,241),0.35),0_0_4px_rgba(var(--accent-rgb,99,102,241),0.2)]',
          )}
          title={leadUser.name}
        >
          {leadUser.image ? (
            <img src={leadUser.image} alt={leadUser.name} className="h-full w-full object-cover" />
          ) : (
            getInitials(leadUser.name)
          )}
        </div>
      )}
    </div>
  )
}

// ============================================================
// Sortable Compact Task Card
// ============================================================

export interface TaskCardCompactProps extends React.HTMLAttributes<HTMLDivElement> {
  task: BoardTask
}

const TaskCardCompact = React.forwardRef<HTMLDivElement, TaskCardCompactProps>(
  function TaskCardCompact({ task, className, ...props }, ref) {
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
      <div ref={composedRef} style={style} className={className} {...props}>
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

export interface TaskCardCompactOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  task: BoardTask
}

const TaskCardCompactOverlay = React.forwardRef<
  HTMLDivElement,
  TaskCardCompactOverlayProps
>(function TaskCardCompactOverlay({ task, className, ...props }, ref) {
  return (
    <div ref={ref} className={className} {...props}>
      <TaskCardCompactVisual task={task} isDragOverlay />
    </div>
  )
})

TaskCardCompactOverlay.displayName = 'TaskCardCompactOverlay'

// ============================================================
// Overlay Task Card (used inside DragOverlay, no sortable hooks)
// ============================================================

export interface TaskCardOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  task: BoardTask
}

const TaskCardOverlay = React.forwardRef<HTMLDivElement, TaskCardOverlayProps>(
  function TaskCardOverlay({ task, className, ...props }, ref) {
    return (
      <div ref={ref} className={className} {...props}>
        <TaskCardVisual task={task} isDragOverlay />
      </div>
    )
  },
)

TaskCardOverlay.displayName = 'TaskCardOverlay'

export { TaskCard, TaskCardOverlay, TaskCardCompact, TaskCardCompactOverlay }
