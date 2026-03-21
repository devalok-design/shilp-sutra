'use client'

import * as React from 'react'
import { IconPaperclip, IconMoodSmile, IconSend, IconAlertTriangle } from '@tabler/icons-react'
import { cn } from '@/ui/lib/utils'
import { Button } from '@/ui/button'
import { useTaskPanel } from './task-panel-context'

// ---------------------------------------------------------------------------
// AuthorTypeToggle
// ---------------------------------------------------------------------------

function VisibilityToggle({
  value,
  onChange,
}: {
  value: 'INTERNAL' | 'CLIENT'
  onChange: (v: 'INTERNAL' | 'CLIENT') => void
}) {
  return (
    <div className="inline-flex items-center rounded-ds-md bg-surface-sunken p-ds-01">
      <button
        type="button"
        onClick={() => onChange('INTERNAL')}
        className={cn(
          'rounded-ds-sm px-ds-03 py-ds-01 text-ds-xs font-medium transition-colors',
          value === 'INTERNAL'
            ? 'bg-surface-raised text-surface-fg shadow-sm'
            : 'text-surface-fg-subtle hover:text-surface-fg',
        )}
      >
        Team only
      </button>
      <button
        type="button"
        onClick={() => onChange('CLIENT')}
        className={cn(
          'rounded-ds-sm px-ds-03 py-ds-01 text-ds-xs font-medium transition-colors',
          value === 'CLIENT'
            ? 'bg-warning-3 text-warning-11 shadow-sm'
            : 'text-surface-fg-subtle hover:text-surface-fg',
        )}
      >
        Visible to client
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// TaskPanelMessageInput
// ---------------------------------------------------------------------------

export interface TaskPanelMessageInputProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function TaskPanelMessageInput({
  className,
  ...props
}: TaskPanelMessageInputProps) {
  const { onPostComment, clientMode, mode, task } = useTaskPanel()
  const [text, setText] = React.useState('')
  const [authorType, setAuthorType] = React.useState<'INTERNAL' | 'CLIENT'>(
    clientMode ? 'CLIENT' : 'INTERNAL',
  )
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  // Hidden in peek mode
  if (mode === 'peek') return null

  const showAuthorToggle =
    !clientMode && task.visibility === 'EVERYONE'

  const showVisibilityWarning =
    !clientMode && task.visibility === 'EVERYONE'

  const adjustHeight = React.useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }, [])

  const handleSend = React.useCallback(() => {
    const trimmed = text.trim()
    if (!trimmed) return
    onPostComment(trimmed, clientMode ? 'CLIENT' : authorType)
    setText('')
    setAuthorType(clientMode ? 'CLIENT' : 'INTERNAL')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [text, onPostComment, authorType, clientMode])

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Cmd+Enter or Ctrl+Enter to send
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        handleSend()
        return
      }
      // Shift+Enter is a newline (default behavior, no preventDefault)
      // Plain Enter is also a newline (we use Cmd+Enter to send)
    },
    [handleSend],
  )

  return (
    <div
      className={cn(
        'border-t border-surface-border-subtle px-ds-06 py-ds-04',
        className,
      )}
      {...props}
    >
      {/* Visibility warning */}
      {showVisibilityWarning && (
        <div className="mb-ds-02 flex items-center gap-ds-02 text-ds-xs text-warning-11">
          <IconAlertTriangle className="h-3 w-3 shrink-0" />
          <span>This task is visible to clients.</span>
        </div>
      )}

      {/* Comment visibility toggle */}
      {showAuthorToggle && (
        <div className="mb-ds-02">
          <VisibilityToggle value={authorType} onChange={setAuthorType} />
        </div>
      )}

      <div className="flex items-end gap-ds-02 rounded-ds-xl border border-surface-border bg-surface-base p-ds-03">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            adjustHeight()
          }}
          onKeyDown={handleKeyDown}
          placeholder={
            clientMode
              ? 'Post a comment...'
              : authorType === 'CLIENT'
                ? 'Write a comment (visible to client)...'
                : 'Write a message...'
          }
          aria-label="Message input"
          rows={1}
          className="max-h-[160px] min-h-[24px] flex-1 resize-none bg-transparent text-ds-sm text-surface-fg placeholder:text-surface-fg-subtle focus:outline-none"
        />

        {/* Action buttons */}
        <div className="flex shrink-0 items-center gap-ds-01">
          {!clientMode && (
            <>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Attach file"
                type="button"
              >
                <IconPaperclip className="h-ico-sm w-ico-sm" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Add emoji"
                type="button"
              >
                <IconMoodSmile className="h-ico-sm w-ico-sm" />
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleSend}
            disabled={!text.trim()}
            aria-label="Send message"
            type="button"
          >
            <IconSend className="h-ico-sm w-ico-sm" />
          </Button>
        </div>
      </div>
      {!clientMode && (
        <p className="mt-ds-01 text-ds-xs text-surface-fg-subtle">
          {typeof navigator !== 'undefined' &&
          navigator.platform?.includes('Mac')
            ? 'Cmd'
            : 'Ctrl'}
          +Enter to send
        </p>
      )}
    </div>
  )
}

TaskPanelMessageInput.displayName = 'TaskPanelMessageInput'
