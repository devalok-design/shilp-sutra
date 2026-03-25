'use client'

import * as React from 'react'
import { IconPaperclip, IconMoodSmile, IconSend, IconLock, IconEye } from '@tabler/icons-react'
import { Icon } from '@/ui/icon'
import { cn } from '@/ui/lib/utils'
import { Button } from '@/ui/button'
import { Switch } from '@/ui/switch'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/ui/tooltip'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TaskComposerProps {
  onSubmit: (text: string, visibility: 'INTERNAL' | 'CLIENT') => void
  placeholder?: string
  showVisibility?: boolean
  defaultVisibility?: 'INTERNAL' | 'CLIENT'
  showAttach?: boolean
  onAttach?: (file: File) => void
  disabled?: boolean
  className?: string
}

// ---------------------------------------------------------------------------
// TaskComposer
// ---------------------------------------------------------------------------

export function TaskComposer({
  onSubmit,
  placeholder,
  showVisibility = false,
  defaultVisibility = 'INTERNAL',
  showAttach = false,
  onAttach,
  disabled = false,
  className,
}: TaskComposerProps) {
  const [text, setText] = React.useState('')
  const [visibility, setVisibility] = React.useState<'INTERNAL' | 'CLIENT'>(defaultVisibility)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const isClient = visibility === 'CLIENT'
  const canSend = text.trim().length > 0 && !disabled

  // --- Auto-resize textarea ---
  const adjustHeight = React.useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }, [])

  // --- Send handler ---
  const handleSend = React.useCallback(() => {
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    onSubmit(trimmed, visibility)
    setText('')
    setVisibility(defaultVisibility)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [text, onSubmit, visibility, disabled, defaultVisibility])

  // --- Keyboard: Enter to send, Shift+Enter for newline ---
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend],
  )

  // --- File attach ---
  const handleFileChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file && onAttach) {
        onAttach(file)
      }
      // Reset so the same file can be selected again
      e.target.value = ''
    },
    [onAttach],
  )

  // --- VIEW_ONLY disabled state ---
  if (disabled) {
    return (
      <div
        className={cn(
          'border-t border-surface-border-subtle px-ds-06 py-ds-04 text-center text-ds-xs text-surface-fg-subtle',
          className,
        )}
      >
        You have view-only access to this task.
      </div>
    )
  }

  const resolvedPlaceholder =
    placeholder ??
    (isClient ? 'Write a message (visible to client)...' : 'Write a message...')

  return (
    <div
      className={cn(
        'border-t border-surface-border-subtle px-ds-06 py-ds-04',
        className,
      )}
    >
      {/* Client-visibility warning banner */}
      {showVisibility && isClient && (
        <div className="mb-ds-02 flex items-center gap-ds-02 text-ds-xs text-warning-11">
          <Icon icon={IconEye} size="xs" className="shrink-0" />
          <span>This message will be visible to clients</span>
        </div>
      )}

      <div className="flex items-end gap-ds-02 rounded-ds-xl border border-surface-border bg-surface-base p-ds-03">
        {/* Visibility toggle — Switch replaces icon-button toggle */}
        {showVisibility && (
          <div className="mb-px flex shrink-0 items-center gap-ds-02">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-ds-02">
                  <Icon
                    icon={isClient ? IconEye : IconLock}
                    size="xs"
                    className={isClient ? 'text-warning-11' : 'text-surface-fg-subtle'}
                  />
                  <Switch
                    size="sm"
                    color="success"
                    checked={isClient}
                    onCheckedChange={(checked) =>
                      setVisibility(checked ? 'CLIENT' : 'INTERNAL')
                    }
                    aria-label={
                      isClient
                        ? 'Visible to client — toggle to make team only'
                        : 'Team only — toggle to make visible to client'
                    }
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {isClient
                  ? 'Visible to client — toggle to make team only'
                  : 'Team only — toggle to make visible to client'}
              </TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            adjustHeight()
          }}
          onKeyDown={handleKeyDown}
          placeholder={resolvedPlaceholder}
          aria-label="Message input"
          rows={1}
          className="max-h-[160px] min-h-[24px] flex-1 resize-none bg-transparent text-ds-sm text-surface-fg placeholder:text-surface-fg-subtle focus:outline-none"
        />

        {/* Action buttons */}
        <div className="flex shrink-0 items-center gap-ds-01">
          {showAttach && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                tabIndex={-1}
              />
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Attach file"
                type="button"
                onClick={() => fileInputRef.current?.click()}
              >
                <Icon icon={IconPaperclip} size="sm" />
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleSend}
            disabled={!canSend}
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

TaskComposer.displayName = 'TaskComposer'
