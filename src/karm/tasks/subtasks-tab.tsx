'use client'

import * as React from 'react'
import { cn } from '../../ui/lib/utils'
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '../../ui/avatar'
import { Progress } from '../../ui'
import { EmptyState } from '../../shared/empty-state'
import {
  IconSquareCheck,
  IconSquare,
  IconPlus,
  IconListCheck,
} from '@tabler/icons-react'
import { getInitials } from '../../shared/lib/string-utils'
import { PRIORITY_DOT_COLORS } from './task-constants'

// ============================================================
// Types
// ============================================================

export interface Subtask {
  id: string
  title: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  columnId: string
  column?: { id: string; name: string; isTerminal?: boolean }
  assignees: {
    user: { id: string; name: string; image?: string | null }
  }[]
}

interface SubtasksTabProps {
  subtasks: Subtask[]
  terminalColumnId?: string
  projectId: string
  parentTaskId: string
  defaultColumnId: string
  onCreateSubtask: (title: string) => void
  onToggleSubtask: (taskId: string, isComplete: boolean) => void
  onClickSubtask?: (taskId: string) => void
  className?: string
  /** When true, hide create/toggle controls (client view) */
  readOnly?: boolean
}

// ============================================================
// Subtasks Tab
// ============================================================

function SubtasksTab({
  subtasks,
  terminalColumnId,
  onCreateSubtask,
  onToggleSubtask,
  onClickSubtask,
  className,
  readOnly = false,
}: SubtasksTabProps) {
  const [newTitle, setNewTitle] = React.useState('')
  const [isAdding, setIsAdding] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const completedCount = subtasks.filter(
    (s) => s.column?.isTerminal || s.columnId === terminalColumnId,
  ).length
  const totalCount = subtasks.length

  const handleSubmit = () => {
    const trimmed = newTitle.trim()
    if (trimmed) {
      onCreateSubtask(trimmed)
      setNewTitle('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
    if (e.key === 'Escape') {
      setIsAdding(false)
      setNewTitle('')
    }
  }

  React.useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isAdding])

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="mb-ds-05 flex items-center gap-ds-04">
          <Progress value={totalCount > 0 ? (completedCount / totalCount) * 100 : 0} className="h-1.5" />
          <span className="shrink-0 text-ds-sm font-medium text-[var(--color-text-placeholder)]">
            {completedCount}/{totalCount}
          </span>
        </div>
      )}

      {/* Subtask list */}
      {subtasks.length > 0 ? (
        <div className="space-y-0.5">
          {subtasks.map((subtask) => {
            const isComplete =
              subtask.column?.isTerminal || subtask.columnId === terminalColumnId
            const firstAssignee = subtask.assignees[0]?.user

            return (
              <div
                key={subtask.id}
                className={cn(
                  'group flex items-center gap-2.5 rounded-[var(--radius-lg)] px-ds-03 py-ds-02b transition-colors',
                  'hover:bg-[var(--color-field)] cursor-pointer',
                )}
                onClick={() => onClickSubtask?.(subtask.id)}
              >
                {/* Checkbox */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (!readOnly) onToggleSubtask(subtask.id, !isComplete)
                  }}
                  className={cn(
                    'shrink-0 rounded p-0.5 transition-colors',
                    readOnly ? 'cursor-default' : 'hover:bg-[var(--color-layer-02)]',
                  )}
                >
                  {isComplete ? (
                    <IconSquareCheck className="h-[var(--icon-sm)] w-[var(--icon-sm)] text-[var(--color-interactive)]" stroke={1.5} />
                  ) : (
                    <IconSquare className="h-[var(--icon-sm)] w-[var(--icon-sm)] text-[var(--color-text-placeholder)]" stroke={1.5} />
                  )}
                </button>

                {/* Priority dot */}
                <div
                  className={cn(
                    'h-2 w-2 shrink-0 rounded-[var(--radius-full)]',
                    PRIORITY_DOT_COLORS[subtask.priority],
                  )}
                />

                {/* Title */}
                <span
                  className={cn(
                    'flex-1 truncate text-ds-md',
                    isComplete
                      ? 'text-[var(--color-text-placeholder)] line-through'
                      : 'text-[var(--color-text-primary)]',
                  )}
                >
                  {subtask.title}
                </span>

                {/* Assignee */}
                {firstAssignee && (
                  <Avatar className="h-[var(--icon-md)] w-[var(--icon-md)] shrink-0">
                    {firstAssignee.image && (
                      <AvatarImage src={firstAssignee.image} alt={firstAssignee.name} />
                    )}
                    <AvatarFallback className="bg-[var(--color-layer-03)] text-[7px] font-semibold text-[var(--color-text-on-color)]">
                      {getInitials(firstAssignee.name)}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        !isAdding && (
          <EmptyState
            icon={IconListCheck}
            title="No subtasks"
            description="Break this task into smaller pieces"
            compact
          />
        )
      )}

      {/* Add subtask -- hidden in readOnly mode */}
      {!readOnly && (
        isAdding ? (
          <div className="mt-ds-03 flex items-center gap-ds-03 rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-layer-01)] px-ds-04 py-ds-03">
            <input
              ref={inputRef}
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                if (!newTitle.trim()) setIsAdding(false)
              }}
              placeholder="Subtask title..."
              className="flex-1 bg-transparent text-ds-md text-[var(--color-text-primary)] placeholder:text-[var(--color-text-placeholder)] outline-none"
            />
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!newTitle.trim()}
              className="inline-flex h-6 items-center gap-ds-02 rounded-[var(--radius-md)] bg-[var(--color-interactive)] px-2.5 text-ds-sm font-semibold text-[var(--color-text-on-color)] transition-colors hover:bg-[var(--color-interactive-hover)] disabled:opacity-50"
            >
              Add
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="mt-ds-03 inline-flex items-center gap-ds-02b rounded-[var(--radius-lg)] px-ds-03 py-ds-02b text-ds-md text-[var(--color-text-placeholder)] transition-colors hover:bg-[var(--color-field)] hover:text-[var(--color-text-secondary)]"
          >
            <IconPlus className="h-[var(--icon-sm)] w-[var(--icon-sm)]" stroke={1.5} />
            Add subtask
          </button>
        )
      )}
    </div>
  )
}

SubtasksTab.displayName = 'SubtasksTab'

export { SubtasksTab }
export type { SubtasksTabProps }
