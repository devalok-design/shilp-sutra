'use client'

import * as React from 'react'
import { IconChevronDown } from '@tabler/icons-react'
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
// TaskPanelSubtasks — compact progress strip, expand on click
// ---------------------------------------------------------------------------

export function TaskPanelSubtasks({
  className,
  ...props
}: TaskPanelSubtasksProps) {
  const { task, mode, clientMode, onToggleSubtask, onAddSubtask } =
    useTaskPanel()
  const [expanded, setExpanded] = React.useState(false)
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
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

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

  React.useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isAdding])

  // Empty state — compact add prompt
  if (totalCount === 0) {
    if (clientMode) return null
    return (
      <div className={cn('px-ds-05', className)} {...props}>
        <button
          type="button"
          className="w-full rounded-ds-md border border-dashed border-surface-border px-ds-04 py-ds-03 text-left text-ds-sm text-surface-fg-subtle transition-colors hover:border-surface-border-strong hover:text-accent-11"
          onClick={() => {
            setExpanded(true)
            setIsAdding(true)
          }}
        >
          + Break this into subtasks
        </button>
        <MotionCollapse show={isAdding}>
          <div className="mt-ds-02">
            <input
              ref={inputRef}
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onBlur={handleAdd}
              onKeyDown={handleKeyDown}
              className="w-full rounded-ds-md border border-surface-border bg-surface-raised px-ds-04 py-ds-03 text-ds-sm text-surface-fg outline-none focus:border-accent-8 focus:ring-1 focus:ring-accent-8"
              placeholder="Subtask title..."
            />
          </div>
        </MotionCollapse>
      </div>
    )
  }

  // Has subtasks — compact progress strip, expandable
  return (
    <div className={cn('px-ds-05', className)} {...props}>
      {/* Compact strip — always visible */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-ds-03 rounded-ds-md px-ds-04 py-ds-03 text-left transition-colors hover:bg-surface-raised-hover -mx-ds-04"
      >
        <IconChevronDown
          className={cn(
            'h-3.5 w-3.5 shrink-0 text-surface-fg-subtle transition-transform',
            expanded && 'rotate-180',
          )}
        />
        <span className="text-ds-xs font-medium text-surface-fg-muted uppercase tracking-wider">
          Subtasks
        </span>
        <Badge size="xs" variant="outline">
          {completedCount}/{totalCount}
        </Badge>

        {/* Progress bar */}
        <div className="flex-1 h-1.5 rounded-full bg-surface-raised-hover overflow-hidden">
          <div
            className="h-full rounded-full bg-accent-9 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </button>

      {/* Expanded checklist */}
      <MotionCollapse show={expanded}>
        <div className="px-ds-04 pb-ds-03">
          <div className="flex flex-col gap-ds-01 mt-ds-02">
            {subtasks.map((subtask) => {
              const isComplete = !!subtask.column?.isTerminal
              return (
                <label
                  key={subtask.id}
                  className={cn(
                    'flex items-center gap-ds-03 rounded-ds-md px-ds-03 py-ds-02',
                    !clientMode && 'hover:bg-surface-raised-hover transition-colors cursor-pointer',
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

          {/* Add subtask */}
          {!clientMode && (
            <>
              {!isAdding && (
                <button
                  type="button"
                  className="mt-ds-02 text-ds-sm text-accent-11 hover:text-accent-12 transition-colors"
                  onClick={() => setIsAdding(true)}
                >
                  + Add subtask
                </button>
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
                    className="w-full rounded-ds-md border border-surface-border bg-surface-raised px-ds-04 py-ds-03 text-ds-sm text-surface-fg outline-none focus:border-accent-8 focus:ring-1 focus:ring-accent-8"
                    placeholder="Subtask title..."
                  />
                </div>
              </MotionCollapse>
            </>
          )}
        </div>
      </MotionCollapse>
    </div>
  )
}

TaskPanelSubtasks.displayName = 'TaskPanelSubtasks'
