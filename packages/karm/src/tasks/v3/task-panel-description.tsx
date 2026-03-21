'use client'

import * as React from 'react'
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react'
import { cn } from '@/ui/lib/utils'
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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TaskPanelDescriptionProps
  extends React.HTMLAttributes<HTMLDivElement> {}

// ---------------------------------------------------------------------------
// TaskPanelDescription — collapsed by default, expand on click
// ---------------------------------------------------------------------------

export function TaskPanelDescription({
  className,
  ...props
}: TaskPanelDescriptionProps) {
  const { task, clientMode, onUpdateDescription } = useTaskPanel()
  const [expanded, setExpanded] = React.useState(false)
  const [isEditing, setIsEditing] = React.useState(false)
  const [draft, setDraft] = React.useState(task.description)
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

  // Empty + client: nothing
  if (isEmpty && clientMode) return null

  // Empty + staff: compact add prompt
  if (isEmpty && !clientMode) {
    return (
      <div className={cn('px-ds-05', className)} {...props}>
        <button
          type="button"
          className="w-full rounded-ds-md border border-dashed border-surface-border px-ds-04 py-ds-03 text-left text-ds-sm text-surface-fg-subtle italic transition-colors hover:border-surface-border-strong hover:text-surface-fg"
          onClick={() => {
            setExpanded(true)
            setIsEditing(true)
          }}
        >
          + Add a description...
        </button>
        <MotionCollapse show={isEditing}>
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="mt-ds-02 w-full resize-none rounded-ds-md border border-surface-border bg-surface-raised p-ds-04 text-ds-sm text-surface-fg outline-none focus:border-accent-8 focus:ring-1 focus:ring-accent-8"
            rows={3}
            placeholder="Write a description..."
          />
        </MotionCollapse>
      </div>
    )
  }

  // Has content — collapsed by default (2-line preview), expandable
  return (
    <div className={cn('px-ds-05', className)} {...props}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start gap-ds-03 rounded-ds-md px-ds-04 py-ds-03 text-left transition-colors hover:bg-surface-raised-hover -mx-ds-04"
      >
        <IconChevronDown
          className={cn(
            'mt-0.5 h-3.5 w-3.5 shrink-0 text-surface-fg-subtle transition-transform',
            expanded && 'rotate-180',
          )}
        />
        <div className="min-w-0 flex-1">
          <span className="text-ds-xs font-medium text-surface-fg-muted uppercase tracking-wider">
            Description
          </span>
          {!expanded && (
            <p className="mt-ds-01 text-ds-sm text-surface-fg-muted line-clamp-2">
              {task.description}
            </p>
          )}
        </div>
      </button>

      <MotionCollapse show={expanded}>
        <div className="px-ds-04 pb-ds-03">
          {isEditing && !clientMode ? (
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className="w-full resize-none rounded-ds-md border border-surface-border bg-surface-raised p-ds-04 text-ds-sm text-surface-fg outline-none focus:border-accent-8 focus:ring-1 focus:ring-accent-8"
              rows={4}
            />
          ) : (
            <div
              role={clientMode ? undefined : 'button'}
              tabIndex={clientMode ? undefined : 0}
              className={cn(
                'text-ds-sm text-surface-fg whitespace-pre-wrap',
                !clientMode && 'cursor-pointer rounded-ds-md hover:bg-surface-raised-hover p-ds-03 -m-ds-03 transition-colors',
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
          )}

          {!clientMode && task.descriptionUpdatedBy && (
            <p className="mt-ds-03 text-ds-xs text-surface-fg-subtle">
              Last edited by {task.descriptionUpdatedBy.name} &middot;{' '}
              {timeAgo(task.descriptionUpdatedBy.timestamp)}
            </p>
          )}
        </div>
      </MotionCollapse>
    </div>
  )
}

TaskPanelDescription.displayName = 'TaskPanelDescription'
