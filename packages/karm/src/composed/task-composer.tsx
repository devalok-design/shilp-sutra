'use client'

import * as React from 'react'
import { IconPaperclip, IconSend, IconLock, IconEye } from '@tabler/icons-react'
import { Icon } from '@/ui/icon'
import { cn } from '@/ui/lib/utils'
import { Button } from '@/ui/button'

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
      {/* Visibility tabs — staff on client-visible tasks only */}
      {showVisibility && (
        <div className="mb-ds-02 flex items-center gap-ds-01">
          <button
            type="button"
            onClick={() => setVisibility('INTERNAL')}
            className={cn(
              'inline-flex items-center gap-ds-02 rounded-ds-md px-ds-03 py-ds-01 text-ds-xs font-medium transition-colors',
              !isClient
                ? 'bg-surface-raised-hover text-surface-fg'
                : 'text-surface-fg-subtle hover:text-surface-fg',
            )}
          >
            <Icon icon={IconLock} size="xs" />
            Team
          </button>
          <button
            type="button"
            onClick={() => setVisibility('CLIENT')}
            className={cn(
              'inline-flex items-center gap-ds-02 rounded-ds-md px-ds-03 py-ds-01 text-ds-xs font-medium transition-colors',
              isClient
                ? 'bg-warning-3 text-warning-11'
                : 'text-surface-fg-subtle hover:text-surface-fg',
            )}
          >
            <Icon icon={IconEye} size="xs" />
            Client
          </button>
        </div>
      )}

      <div
        className={cn(
          'flex items-end gap-ds-02 rounded-ds-xl border p-ds-03 transition-colors',
          isClient && showVisibility
            ? 'border-warning-7 bg-warning-2'
            : 'border-surface-border bg-surface-1',
        )}
      >
        {/* Client mode warning inline */}
        {showVisibility && isClient && (
          <div className="mb-px flex shrink-0 items-center">
            <Icon icon={IconEye} size="xs" className="text-warning-11" />
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
          className={cn(
            'max-h-[160px] min-h-[24px] flex-1 resize-none bg-transparent text-ds-sm text-surface-fg placeholder:text-surface-fg-subtle focus:outline-none',
            isClient && showVisibility && 'placeholder:text-warning-11/50',
          )}
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
