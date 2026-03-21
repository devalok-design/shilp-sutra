'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
import { Checkbox } from '@/ui/checkbox'
import { Badge } from '@/ui/badge'
import { MotionCollapse } from '@/motion/primitives'
import { useTaskPanel } from './task-panel-context'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TaskPanelSubtasksProps
  extends React.HTMLAttributes<HTMLDivElement> {}

// ---------------------------------------------------------------------------
// TaskPanelSubtasks
// ---------------------------------------------------------------------------

export function TaskPanelSubtasks({
  className,
  ...props
}: TaskPanelSubtasksProps) {
  const { task, mode, clientMode, onToggleSubtask, onAddSubtask } =
    useTaskPanel()
  const [isAdding, setIsAdding] = React.useState(false)
  const [newTitle, setNewTitle] = React.useState('')
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Hidden in peek mode
  if (mode === 'peek') return null

  const subtasks = task.subtasks
  const completedCount = subtasks.filter(
    (s) => s.column?.isTerminal,
  ).length
  const totalCount = subtasks.length

  const handleAdd = () => {
    const trimmed = newTitle.trim()
    if (trimmed) {
      onAddSubtask(trimmed)
      setNewTitle('')
    }
    setIsAdding(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setNewTitle('')
      setIsAdding(false)
    }
  }

  // Focus input when entering add mode
  React.useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isAdding])

  return (
    <div className={cn('px-ds-05 py-ds-04', className)} {...props}>
      {/* Header */}
      <div className="flex items-center gap-ds-02 mb-ds-03">
        <span className="text-ds-sm font-semibold text-surface-fg">
          Subtasks
        </span>
        <Badge size="sm" variant="outline">
          {completedCount}/{totalCount}
        </Badge>
      </div>

      {/* Empty state */}
      {totalCount === 0 && (
        <div className="text-ds-sm text-surface-fg-subtle">
          {clientMode ? (
            'No subtasks'
          ) : (
            <button
              type="button"
              className="text-accent-11 hover:text-accent-12 transition-colors"
              onClick={() => setIsAdding(true)}
            >
              + Break this into steps
            </button>
          )}
        </div>
      )}

      {/* Subtask list */}
      {totalCount > 0 && (
        <div className="flex flex-col gap-ds-01">
          {subtasks.map((subtask) => {
            const isComplete = !!subtask.column?.isTerminal
            return (
              <label
                key={subtask.id}
                className={cn(
                  'flex items-center gap-ds-03 rounded-ds-md px-ds-02 py-ds-01b',
                  !clientMode && 'hover:bg-surface-3 transition-colors',
                )}
              >
                <Checkbox
                  checked={isComplete}
                  disabled={clientMode}
                  onCheckedChange={() => onToggleSubtask(subtask.id)}
                  aria-label={`Toggle ${subtask.title}`}
                />
                <span
                  className={cn(
                    'text-ds-sm',
                    isComplete
                      ? 'text-surface-fg-subtle line-through'
                      : 'text-surface-fg',
                  )}
                >
                  {subtask.title}
                </span>
              </label>
            )
          })}
        </div>
      )}

      {/* Add subtask */}
      {!clientMode && totalCount > 0 && (
        <MotionCollapse show={!isAdding}>
          <button
            type="button"
            className="mt-ds-02 text-ds-sm text-accent-11 hover:text-accent-12 transition-colors"
            onClick={() => setIsAdding(true)}
          >
            + Add subtask
          </button>
        </MotionCollapse>
      )}

      <MotionCollapse show={isAdding}>
        <div className="mt-ds-02">
          <input
            ref={inputRef}
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onBlur={handleAdd}
            onKeyDown={handleKeyDown}
            className="w-full rounded-ds-md border border-surface-border bg-surface-2 px-ds-03 py-ds-02 text-ds-sm text-surface-fg outline-none focus:border-accent-8 focus:ring-1 focus:ring-accent-8"
            placeholder="Subtask title..."
          />
        </div>
      </MotionCollapse>
    </div>
  )
}

TaskPanelSubtasks.displayName = 'TaskPanelSubtasks'
