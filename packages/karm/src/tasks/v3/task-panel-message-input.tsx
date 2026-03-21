'use client'

import * as React from 'react'
import { IconPaperclip, IconMoodSmile, IconSend, IconLock, IconEye } from '@tabler/icons-react'
import { cn } from '@/ui/lib/utils'
import { Button } from '@/ui/button'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/ui/tooltip'
import { useTaskPanel } from './task-panel-context'

// TODO: Replace textarea with RichTextEditor once integration is ready.
// RichTextEditor is heavy and needs careful lazy-loading + toolbar config.

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

  const showVisibilityToggle =
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
      // Enter to send (no modifier)
      if (e.key === 'Enter' && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        handleSend()
        return
      }
      // Shift+Enter is a newline (default behavior, no preventDefault)
    },
    [handleSend],
  )

  const toggleVisibility = React.useCallback(() => {
    setAuthorType((prev) => (prev === 'INTERNAL' ? 'CLIENT' : 'INTERNAL'))
  }, [])

  return (
    <div
      className={cn(
        'border-t border-surface-border-subtle px-ds-06 py-ds-04',
        className,
      )}
      {...props}
    >
      <div className="flex items-end gap-ds-02 rounded-ds-xl border border-surface-border bg-surface-base p-ds-03">
        {/* Visibility toggle icon — inside the input bar */}
        {showVisibilityToggle && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={toggleVisibility}
                className={cn(
                  'shrink-0 rounded-ds-md p-ds-01 transition-colors',
                  authorType === 'CLIENT'
                    ? 'text-warning-11 hover:bg-warning-3'
                    : 'text-surface-fg-subtle hover:bg-surface-raised-hover',
                )}
                aria-label={
                  authorType === 'INTERNAL'
                    ? 'Team only — click to make visible to client'
                    : 'Visible to client — click to make team only'
                }
              >
                {authorType === 'INTERNAL' ? (
                  <IconLock className="h-ico-sm w-ico-sm" />
                ) : (
                  <IconEye className="h-ico-sm w-ico-sm" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              {authorType === 'INTERNAL'
                ? 'Team only \u2014 click to make visible to client'
                : 'Visible to client \u2014 click to make team only'}
            </TooltipContent>
          </Tooltip>
        )}

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
    </div>
  )
}

TaskPanelMessageInput.displayName = 'TaskPanelMessageInput'
