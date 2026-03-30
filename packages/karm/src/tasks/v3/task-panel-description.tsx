'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
import { RichTextEditor, RichTextViewer } from '@/composed/rich-text-editor'
import type { ToolbarItem } from '@/composed/rich-text-editor'
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
// Constants
// ---------------------------------------------------------------------------

const DESCRIPTION_TOOLBAR: ToolbarItem[] = [
  'bold',
  'italic',
  'bulletList',
  'orderedList',
  'taskList',
  'link',
  'codeBlock',
]

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
  const wrapperRef = React.useRef<HTMLDivElement>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)
  const [isOverflowing, setIsOverflowing] = React.useState(false)

  // Sync draft from external task changes when not editing
  React.useEffect(() => {
    if (!isEditing) setDraft(task.description)
  }, [task.description, isEditing])

  // Overflow detection for collapsed view mode
  React.useEffect(() => {
    const el = contentRef.current
    if (!el) return
    const observer = new ResizeObserver(() => {
      setIsOverflowing(el.scrollHeight > el.clientHeight)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [task.description])

  const isEmpty = !task.description?.trim()

  const handleSave = React.useCallback(() => {
    setIsEditing(false)
    if (draft !== task.description) {
      onUpdateDescription(draft)
    }
  }, [draft, task.description, onUpdateDescription])

  const handleWrapperBlur = React.useCallback(
    (e: React.FocusEvent) => {
      // If focus moved to another element inside our wrapper, don't save
      if (wrapperRef.current?.contains(e.relatedTarget as Node)) return
      // Focus truly left — save
      handleSave()
    },
    [handleSave],
  )

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

  // Empty + read-only client: explain view-only access
  if (isEmpty && !canEdit) {
    if (clientMode === 'VIEW_ONLY') {
      return (
        <div className={cn('border-b border-surface-border-subtle px-ds-06 pb-ds-04', className)} {...props}>
          <p className="text-ds-xs text-surface-fg-subtle italic">No description added yet.</p>
        </div>
      )
    }
    return null
  }

  // Empty + editable (staff or collaborator): compact add prompt
  if (isEmpty && canEdit) {
    return (
      <div className={cn('border-b border-surface-border-subtle px-ds-06 pb-ds-04', className)} {...props}>
        {isEditing ? (
          <div
            ref={wrapperRef}
            onBlur={handleWrapperBlur}
            onKeyDown={handleKeyDown}
          >
            <RichTextEditor
              content={draft}
              placeholder="Write a description..."
              onChange={setDraft}
              toolbar={DESCRIPTION_TOOLBAR}
              className="rounded-ds-md border border-surface-border"
            />
          </div>
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

  // Has content — show inline
  return (
    <div className={cn('border-b border-surface-border-subtle px-ds-06 pb-ds-04', className)} {...props}>
      {isEditing && canEdit ? (
        /* Editing mode */
        <div
          ref={wrapperRef}
          onBlur={handleWrapperBlur}
          onKeyDown={handleKeyDown}
        >
          <RichTextEditor
            content={draft}
            onChange={setDraft}
            toolbar={DESCRIPTION_TOOLBAR}
            className="rounded-ds-md border border-surface-border"
          />
        </div>
      ) : expanded ? (
        /* Expanded mode */
        <div>
          <div
            role={canEdit ? 'button' : undefined}
            tabIndex={canEdit ? 0 : undefined}
            className={cn(
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
            <RichTextViewer content={task.description} />
          </div>

          {!clientMode && task.descriptionUpdatedBy && (
            <p className="mt-ds-02 text-ds-xs text-surface-fg-subtle">
              Last edited by {task.descriptionUpdatedBy.name} &middot;{' '}
              {timeAgo(task.descriptionUpdatedBy.timestamp)}
            </p>
          )}

          <button
            type="button"
            aria-expanded={true}
            onClick={() => setExpanded(false)}
            className="mt-ds-02 text-ds-xs font-medium text-accent-11 hover:text-accent-12 transition-colors"
          >
            Show less
          </button>
        </div>
      ) : (
        /* Collapsed mode — ~3 lines with overflow detection */
        <div>
          <div
            ref={contentRef}
            role={canEdit ? 'button' : undefined}
            tabIndex={canEdit ? 0 : undefined}
            style={{ maxHeight: '4.5rem', overflow: 'hidden' }}
            className={cn(
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
            <RichTextViewer content={task.description} />
          </div>
          {isOverflowing && (
            <button
              type="button"
              aria-expanded={false}
              onClick={() => setExpanded(true)}
              className="mt-ds-02 text-ds-xs font-medium text-accent-11 hover:text-accent-12 transition-colors"
            >
              Show more
            </button>
          )}
        </div>
      )}
    </div>
  )
}

TaskPanelDescription.displayName = 'TaskPanelDescription'
