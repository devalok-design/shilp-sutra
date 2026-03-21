'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
import { Button } from '@/ui/button'
import { MotionCollapse } from '@/motion/primitives'
import { useTaskPanel } from './task-panel-context'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function timeAgo(timestamp: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(timestamp).getTime()) / 1000,
  )
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const COLLAPSE_THRESHOLD = 100

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TaskPanelDescriptionProps
  extends React.HTMLAttributes<HTMLDivElement> {}

// ---------------------------------------------------------------------------
// TaskPanelDescription
// ---------------------------------------------------------------------------

export function TaskPanelDescription({
  className,
  ...props
}: TaskPanelDescriptionProps) {
  const { task, clientMode, onUpdateDescription } = useTaskPanel()
  const [isEditing, setIsEditing] = React.useState(false)
  const [draft, setDraft] = React.useState(task.description)
  const [expanded, setExpanded] = React.useState(false)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  // Sync draft when task.description changes externally
  React.useEffect(() => {
    if (!isEditing) setDraft(task.description)
  }, [task.description, isEditing])

  // Auto-focus textarea when entering edit mode
  React.useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.selectionStart = textareaRef.current.value.length
    }
  }, [isEditing])

  const isLong = task.description.length > COLLAPSE_THRESHOLD
  const isEmpty = !task.description.trim()

  const handleSave = React.useCallback(() => {
    setIsEditing(false)
    if (draft !== task.description) {
      onUpdateDescription(draft)
    }
  }, [draft, task.description, onUpdateDescription])

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        handleSave()
      }
    },
    [handleSave],
  )

  // Empty state
  if (isEmpty && clientMode) return null

  if (isEmpty && !clientMode) {
    return (
      <div className={cn('px-ds-05 py-ds-03', className)} {...props}>
        <button
          type="button"
          className="text-ds-sm text-surface-fg-subtle italic hover:text-surface-fg transition-colors"
          onClick={() => setIsEditing(true)}
        >
          Add a description...
        </button>
        <MotionCollapse show={isEditing}>
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="mt-ds-02 w-full resize-none rounded-ds-md border border-surface-border bg-surface-2 p-ds-03 text-ds-sm text-surface-fg outline-none focus:border-accent-8 focus:ring-1 focus:ring-accent-8"
            rows={3}
            placeholder="Write a description..."
          />
        </MotionCollapse>
      </div>
    )
  }

  return (
    <div className={cn('px-ds-05 py-ds-03', className)} {...props}>
      {isEditing && !clientMode ? (
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="w-full resize-none rounded-ds-md border border-surface-border bg-surface-2 p-ds-03 text-ds-sm text-surface-fg outline-none focus:border-accent-8 focus:ring-1 focus:ring-accent-8"
          rows={4}
        />
      ) : (
        <>
          <div
            role={clientMode ? undefined : 'button'}
            tabIndex={clientMode ? undefined : 0}
            className={cn(
              'text-ds-sm text-surface-fg whitespace-pre-wrap',
              !clientMode && 'cursor-pointer rounded-ds-md hover:bg-surface-3 p-ds-02 -m-ds-02 transition-colors',
              isLong && !expanded && 'line-clamp-4',
            )}
            onClick={clientMode ? undefined : () => setIsEditing(true)}
            onKeyDown={
              clientMode
                ? undefined
                : (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setIsEditing(true)
                    }
                  }
            }
          >
            {task.description}
          </div>

          {isLong && (
            <Button
              variant="link"
              size="sm"
              className="mt-ds-01 px-0 text-ds-xs"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? 'Show less' : 'Show more'}
            </Button>
          )}
        </>
      )}

      {!clientMode && task.descriptionUpdatedBy && (
        <p className="mt-ds-02 text-ds-xs text-surface-fg-subtle">
          Last edited by {task.descriptionUpdatedBy.name} &middot;{' '}
          {timeAgo(task.descriptionUpdatedBy.timestamp)}
        </p>
      )}
    </div>
  )
}

TaskPanelDescription.displayName = 'TaskPanelDescription'
