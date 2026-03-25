'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TaskPanelDescriptionProps
  extends React.HTMLAttributes<HTMLDivElement> {}

// ---------------------------------------------------------------------------
// TaskPanelDescription — inline under heading, no section label
// ---------------------------------------------------------------------------

export function TaskPanelDescription({
  className,
  ...props
}: TaskPanelDescriptionProps) {
  const { task, clientMode, onUpdateDescription } = useTaskPanel()
  const canEdit = !clientMode || clientMode === 'COLLABORATOR'
  const [expanded, setExpanded] = React.useState(false)
  const [isEditing, setIsEditing] = React.useState(false)
  const [draft, setDraft] = React.useState(task.description ?? '')
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  React.useEffect(() => {
    if (!isEditing) setDraft(task.description)
  }, [task.description, isEditing])

  React.useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.selectionStart = textareaRef.current.value.length
    }
  }, [isEditing])

  const isEmpty = !task.description?.trim()

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
        // Cancel — revert to original, don't save
        setDraft(task.description ?? '')
        setIsEditing(false)
      }
    },
    [task.description],
  )

  // Empty + read-only client: nothing
  if (isEmpty && !canEdit) return null

  // Empty + editable (staff or collaborator): compact add prompt
  if (isEmpty && canEdit) {
    return (
      <div className={cn('border-b border-surface-border-subtle px-ds-06 pb-ds-04', className)} {...props}>
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="w-full resize-none rounded-ds-md border border-surface-border bg-surface-raised p-ds-04 text-ds-sm text-surface-fg outline-none focus:border-accent-8 focus:ring-1 focus:ring-accent-8"
            rows={3}
            placeholder="Write a description..."
          />
        ) : (
          <button
            type="button"
            className="w-full rounded-ds-md border border-dashed border-surface-border px-ds-04 py-ds-03 text-left text-ds-sm text-surface-fg-subtle italic transition-colors hover:border-surface-border-strong hover:text-surface-fg"
            onClick={() => {
              setIsEditing(true)
            }}
          >
            + Add a description...
          </button>
        )}
      </div>
    )
  }

  // Has content — show inline, 2-line clamp by default
  return (
    <div className={cn('border-b border-surface-border-subtle px-ds-06 pb-ds-04', className)} {...props}>
      {isEditing && canEdit ? (
        /* Editing mode */
        <div>
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="w-full resize-none rounded-ds-md border border-surface-border bg-surface-raised p-ds-04 text-ds-sm text-surface-fg outline-none focus:border-accent-8 focus:ring-1 focus:ring-accent-8"
            rows={4}
          />
        </div>
      ) : expanded ? (
        /* Expanded mode */
        <div>
          <div
            role={canEdit ? 'button' : undefined}
            tabIndex={canEdit ? 0 : undefined}
            className={cn(
              'text-ds-sm text-surface-fg-muted whitespace-pre-wrap',
              canEdit && 'cursor-pointer rounded-ds-md hover:bg-surface-raised-hover p-ds-03 -m-ds-03 transition-colors',
            )}
            onClick={canEdit ? () => setIsEditing(true) : undefined}
            onKeyDown={
              canEdit
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setIsEditing(true)
                    }
                  }
                : undefined
            }
          >
            {task.description}
          </div>

          {!clientMode && task.descriptionUpdatedBy && (
            <p className="mt-ds-02 text-ds-xs text-surface-fg-subtle">
              Last edited by {task.descriptionUpdatedBy.name} &middot;{' '}
              {timeAgo(task.descriptionUpdatedBy.timestamp)}
            </p>
          )}

          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="mt-ds-02 text-ds-xs font-medium text-accent-11 hover:text-accent-12 transition-colors"
          >
            Show less
          </button>
        </div>
      ) : (
        /* Collapsed mode — 2-line clamp */
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="w-full text-left"
        >
          <p className="text-ds-sm text-surface-fg-muted line-clamp-2">
            {task.description}
          </p>
        </button>
      )}
    </div>
  )
}

TaskPanelDescription.displayName = 'TaskPanelDescription'
