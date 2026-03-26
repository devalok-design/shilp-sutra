'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
import { TaskComposer } from '../../composed/task-composer'
import { useTaskPanel } from './task-panel-context'

// ---------------------------------------------------------------------------
// TaskPanelMessageInput
// ---------------------------------------------------------------------------

export interface TaskPanelMessageInputProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function TaskPanelMessageInput({
  className,
  ...props
}: TaskPanelMessageInputProps) {
  const { onPostComment, onUploadFile, clientMode, mode, task } = useTaskPanel()
  const canPost = !clientMode || clientMode === 'COLLABORATOR'

  // Hidden in peek mode
  if (mode === 'peek') return null

  // VIEW_ONLY clients see an explanation instead of input
  if (!canPost && clientMode === 'VIEW_ONLY') {
    return (
      <div className="px-ds-06 py-ds-04 text-center text-ds-xs text-surface-fg-subtle border-t border-surface-border-subtle">
        You have view-only access to this task.
      </div>
    )
  }

  if (!canPost) return null

  const handleSubmit = (text: string, visibility: 'INTERNAL' | 'CLIENT') => {
    onPostComment(text, clientMode ? 'CLIENT' : visibility)
  }

  return (
    <div className={cn(className)} {...props}>
      <TaskComposer
        onSubmit={handleSubmit}
        showVisibility={!clientMode && task.visibility === 'EVERYONE'}
        defaultVisibility="INTERNAL"
        showAttach={!clientMode}
        onAttach={onUploadFile}
        disabled={false}
        placeholder={clientMode ? 'Post a comment...' : 'Write a message...'}
      />
    </div>
  )
}

TaskPanelMessageInput.displayName = 'TaskPanelMessageInput'
