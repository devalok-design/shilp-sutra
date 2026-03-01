'use client'

import { useState, useRef, useCallback, type KeyboardEvent } from 'react'
import { Send, Square } from 'lucide-react'

interface ChatInputProps {
  onSubmit: (message: string) => void
  onCancel?: () => void
  isStreaming?: boolean
  placeholder?: string
  disclaimer?: string
}

export function ChatInput({
  onSubmit,
  onCancel,
  isStreaming = false,
  placeholder = 'Ask Karm AI...',
  disclaimer = 'AI responses may be inaccurate. Verify important information.',
}: ChatInputProps) {
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
    <div className="border-t border-[var(--color-border-default)] bg-[var(--color-layer-01)] p-3">
      <div className="flex items-end gap-2 rounded-[var(--radius-xl)] border border-[var(--color-border-default)] bg-[var(--color-field)] px-3 py-2">
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
          className="B2-Reg no-scrollbar max-h-[160px] min-h-[24px] flex-1 resize-none bg-transparent text-[var(--color-text-primary)] placeholder:text-[var(--color-text-placeholder)] focus:outline-none disabled:opacity-50"
        />
        {isStreaming ? (
          <button
            onClick={onCancel}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-red-500 text-white transition-colors hover:bg-red-600"
            aria-label="Stop generating"
          >
            <Square className="h-3.5 w-3.5" />
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-interactive)] text-white transition-colors hover:opacity-90 disabled:opacity-50"
            aria-label="Send message"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {disclaimer && (
        <p className="B3-Reg mt-1.5 text-center text-[var(--color-text-placeholder)]">
          {disclaimer}
        </p>
      )}
    </div>
  )
}
