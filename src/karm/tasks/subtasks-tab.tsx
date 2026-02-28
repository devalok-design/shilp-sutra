'use client'

import * as React from 'react'
import { cn } from '../../ui/lib/utils'
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '../../ui/avatar'
import { EmptyState } from '../../ui/empty-state'
import {
  CheckSquare,
  Square,
  Plus,
  ListChecks,
} from 'lucide-react'

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
// Helpers
// ============================================================

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

const PRIORITY_DOT_COLORS: Record<string, string> = {
  LOW: 'bg-blue-400',
  MEDIUM: 'bg-yellow-400',
  HIGH: 'bg-orange-400',
  URGENT: 'bg-red-500',
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
        <div className="mb-4 flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full bg-[var(--Mapped-Surface-Dark)] overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--Mapped-Surface-Button-Primary)] transition-all duration-300"
              style={{
                width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
              }}
            />
          </div>
          <span className="shrink-0 text-[11px] font-[Ranade] font-medium text-[var(--Mapped-Text-Quaternary)]">
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
                  'group flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors',
                  'hover:bg-[var(--Mapped-Surface-Dark)] cursor-pointer',
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
                    readOnly ? 'cursor-default' : 'hover:bg-[var(--Mapped-Surface-Secondary)]',
                  )}
                >
                  {isComplete ? (
                    <CheckSquare className="h-4 w-4 text-[var(--Mapped-Text-Highlight)]" strokeWidth={1.5} />
                  ) : (
                    <Square className="h-4 w-4 text-[var(--Mapped-Text-Quaternary)]" strokeWidth={1.5} />
                  )}
                </button>

                {/* Priority dot */}
                <div
                  className={cn(
                    'h-2 w-2 shrink-0 rounded-full',
                    PRIORITY_DOT_COLORS[subtask.priority],
                  )}
                />

                {/* Title */}
                <span
                  className={cn(
                    'flex-1 truncate text-[13px] font-[Ranade]',
                    isComplete
                      ? 'text-[var(--Mapped-Text-Quaternary)] line-through'
                      : 'text-[var(--Mapped-Text-Primary)]',
                  )}
                >
                  {subtask.title}
                </span>

                {/* Assignee */}
                {firstAssignee && (
                  <Avatar className="h-5 w-5 shrink-0">
                    {firstAssignee.image && (
                      <AvatarImage src={firstAssignee.image} alt={firstAssignee.name} />
                    )}
                    <AvatarFallback className="bg-[var(--Mapped-Surface-Darker)] text-[7px] font-semibold text-[var(--Mapped-Text-On-Dark-Primary)]">
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
            icon={ListChecks}
            title="No subtasks"
            description="Break this task into smaller pieces"
            compact
          />
        )
      )}

      {/* Add subtask -- hidden in readOnly mode */}
      {!readOnly && (
        isAdding ? (
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-[var(--border-primary)] bg-[var(--Mapped-Surface-Primary)] px-3 py-2">
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
              className="flex-1 bg-transparent text-[13px] font-[Ranade] text-[var(--Mapped-Text-Primary)] placeholder:text-[var(--Mapped-Text-Quaternary)] outline-none"
            />
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!newTitle.trim()}
              className="inline-flex h-6 items-center gap-1 rounded-md bg-[var(--Mapped-Surface-Button-Primary)] px-2.5 text-[11px] font-[Ranade] font-semibold text-[var(--Text-Button-Text)] transition-colors hover:bg-[var(--Mapped-Surface-Button-Secondary)] disabled:opacity-40"
            >
              Add
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] font-[Ranade] text-[var(--Mapped-Text-Quaternary)] transition-colors hover:bg-[var(--Mapped-Surface-Dark)] hover:text-[var(--Mapped-Text-Secondary)]"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
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
