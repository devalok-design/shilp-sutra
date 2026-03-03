'use client'

import * as React from 'react'
import { useState, useRef, useCallback, type KeyboardEvent } from 'react'
import { IconSend, IconSquare } from '@tabler/icons-react'
import { Button } from '../../ui/button'

export interface ChatInputProps {
  onSubmit: (message: string) => void
  onCancel?: () => void
  isStreaming?: boolean
  placeholder?: string
  disclaimer?: string
}

export const ChatInput = React.forwardRef<HTMLDivElement, ChatInputProps>(
  function ChatInput({
  onSubmit,
  onCancel,
  isStreaming = false,
  placeholder = 'Ask Karm AI...',
  disclaimer = 'AI responses may be inaccurate. Verify important information.',
}, ref) {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }, [])

  const handleSend = useCallback(() => {
    const trimmed = text.trim()
    if (!trimmed || isStreaming) return
    setText('')
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    onSubmit(trimmed)
  }, [text, isStreaming, onSubmit])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend],
  )

  return (
    <div ref={ref} className="border-t border-border bg-layer-01 p-ds-04">
      <div className="flex items-end gap-ds-03 rounded-ds-xl border border-border bg-field px-ds-04 py-ds-03">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            adjustHeight()
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isStreaming}
          rows={1}
          className="text-ds-md no-scrollbar max-h-[160px] min-h-ds-xs flex-1 resize-none bg-transparent text-text-primary placeholder:text-text-placeholder focus:outline-none disabled:opacity-[0.38]"
        />
        {isStreaming ? (
          <Button variant="danger" size="icon-sm" className="h-8 w-8 shrink-0 rounded-ds-lg" onClick={onCancel} aria-label="Stop generating">
            <IconSquare className="h-ico-sm w-ico-sm" />
          </Button>
        ) : (
          <Button size="icon-sm" className="h-8 w-8 shrink-0 rounded-ds-lg" onClick={handleSend} disabled={!text.trim()} aria-label="Send message">
            <IconSend className="h-ico-sm w-ico-sm" />
          </Button>
        )}
      </div>
      {disclaimer && (
        <p className="text-ds-sm mt-ds-02b text-center text-text-placeholder">
          {disclaimer}
        </p>
      )}
    </div>
  )
},
)

ChatInput.displayName = 'ChatInput'
