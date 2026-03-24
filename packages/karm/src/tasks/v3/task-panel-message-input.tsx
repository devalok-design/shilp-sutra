'use client'

import * as React from 'react'
import { IconPaperclip, IconMoodSmile, IconSend, IconLock, IconEye } from '@tabler/icons-react'
import { Icon } from '@/ui/icon'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/ui/tooltip'
import { cn } from '@/ui/lib/utils'
import { Button } from '@/ui/button'
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
  const [visibility, setVisibility] = React.useState<'INTERNAL' | 'CLIENT'>('INTERNAL')
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const showVisibilityToggle = !clientMode && task.visibility === 'EVERYONE'

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
    onPostComment(trimmed, clientMode ? 'CLIENT' : visibility)
    setText('')
    setVisibility('INTERNAL')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [text, onPostComment])

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

  return (
    <div
      className={cn(
        'border-t border-surface-border-subtle px-ds-06 py-ds-04',
        className,
      )}
      {...props}
    >
      {/* Visibility warning */}
      {showVisibilityToggle && visibility === 'CLIENT' && (
        <div className="mb-ds-02 flex items-center gap-ds-02 text-ds-xs text-warning-11">
          <Icon icon={IconEye} size="xs" className="shrink-0" />
          <span>This message will be visible to clients</span>
        </div>
      )}

      <div className="flex items-end gap-ds-02 rounded-ds-xl border border-surface-border bg-surface-base p-ds-03">
        {/* Per-message visibility toggle */}
        {showVisibilityToggle && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                color={visibility === 'CLIENT' ? 'warning' : 'accent'}
                size="icon-xs"
                onClick={() => setVisibility(v => v === 'INTERNAL' ? 'CLIENT' : 'INTERNAL')}
                className="mb-px shrink-0"
                aria-label={
                  visibility === 'INTERNAL'
                    ? 'Team only — click to make visible to client'
                    : 'Visible to client — click to make team only'
                }
              >
                {visibility === 'INTERNAL' ? (
                  <Icon icon={IconLock} size="xs" />
                ) : (
                  <Icon icon={IconEye} size="xs" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {visibility === 'INTERNAL'
                ? 'Team only — click to make visible to client'
                : 'Visible to client — click to make team only'}
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
              : visibility === 'CLIENT'
                ? 'Write a message (visible to client)...'
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
                <Icon icon={IconPaperclip} size="sm" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Add emoji"
                type="button"
              >
                <Icon icon={IconMoodSmile} size="sm" />
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
            <Icon icon={IconSend} size="sm" />
          </Button>
        </div>
      </div>
    </div>
  )
}

TaskPanelMessageInput.displayName = 'TaskPanelMessageInput'
