'use client'

import * as React from 'react'
import { IconPaperclip, IconMoodSmile, IconSend } from '@tabler/icons-react'
import { cn } from '@/ui/lib/utils'
import { Button } from '@/ui/button'
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
  const { onPostComment, clientMode, mode } = useTaskPanel()
  const [text, setText] = React.useState('')
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  // Hidden in peek mode
  if (mode === 'peek') return null

  const adjustHeight = React.useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }, [])

  const handleSend = React.useCallback(() => {
    const trimmed = text.trim()
    if (!trimmed) return
    onPostComment(trimmed)
    setText('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [text, onPostComment])

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
        'border-t border-surface-border-subtle px-ds-04 py-ds-03',
        className,
      )}
      {...props}
    >
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
            clientMode ? 'Post a comment...' : 'Write a message...'
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
