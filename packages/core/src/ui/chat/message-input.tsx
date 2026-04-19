'use client'

import { IconSend, IconSquare } from '@tabler/icons-react'
import * as React from 'react'

import { Button } from '../button'
import { Icon } from '../icon'
import { cn } from '../lib/utils'

export interface MessageInputProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSubmit'> {
  onSubmit: (text: string) => void
  placeholder?: string
  disabled?: boolean
  isStreaming?: boolean
  onCancel?: () => void
  leadingSlot?: React.ReactNode
  trailingSlot?: React.ReactNode
  disclaimer?: string
  sendIcon?: React.ReactNode
}

const MessageInput = React.forwardRef<HTMLDivElement, MessageInputProps>(
  (
    {
      onSubmit,
      placeholder = 'Type a message...',
      disabled = false,
      isStreaming = false,
      onCancel,
      leadingSlot,
      trailingSlot,
      disclaimer,
      sendIcon,
      className,
      ...props
    },
    ref,
  ) => {
    const [text, setText] = React.useState('')
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)

    const resize = React.useCallback(() => {
      const el = textareaRef.current
      if (!el) return
      el.style.height = 'auto'
      el.style.height = `${Math.min(el.scrollHeight, 160)}px`
    }, [])

    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value)
        resize()
      },
      [resize],
    )

    const handleSend = React.useCallback(() => {
      const trimmed = text.trim()
      if (!trimmed || isStreaming) return
      onSubmit(trimmed)
      setText('')
      // Reset height after clearing
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }, [text, isStreaming, onSubmit])

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault()
          if (!isStreaming) {
            handleSend()
          }
        }
      },
      [isStreaming, handleSend],
    )

    const isEmpty = text.trim().length === 0

    return (
      <div
        ref={ref}
        className={cn(
          'border-t border-surface-border-subtle px-ds-05 py-ds-04',
          className,
        )}
        {...props}
      >
        <div className="flex items-end gap-ds-02 rounded-ds-xl border border-surface-border bg-surface-base p-ds-03">
          {leadingSlot}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            aria-label={placeholder || 'Type a message'}
            disabled={disabled}
            rows={1}
            className="flex-1 resize-none bg-transparent px-ds-02 py-ds-01 text-ds-sm text-surface-fg placeholder:text-surface-fg-subtle/50 focus:outline-hidden disabled:opacity-50"
            style={{ maxHeight: 160 }}
          />
          {isStreaming ? (
            <Button
              variant="ghost"
              size="icon-sm"
              color="error"
              onClick={onCancel}
              aria-label="Stop"
            >
              <Icon icon={IconSquare} size="sm" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleSend}
              disabled={isEmpty || disabled}
              aria-label="Send"
            >
              {sendIcon ?? <Icon icon={IconSend} size="sm" />}
            </Button>
          )}
          {trailingSlot}
        </div>
        {disclaimer && (
          <p className="mt-ds-02 text-center text-ds-xs text-surface-fg-subtle/50">
            {disclaimer}
          </p>
        )}
      </div>
    )
  },
)
MessageInput.displayName = 'MessageInput'

export { MessageInput }
