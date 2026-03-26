'use client'

import * as React from 'react'
import { MessageInput } from '@/ui/chat'

export interface ChatInputProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSubmit'> {
  onSubmit: (message: string) => void
  onCancel?: () => void
  isStreaming?: boolean
  placeholder?: string
  disclaimer?: string
}

export const ChatInput = React.forwardRef<HTMLDivElement, ChatInputProps>(
  function ChatInput(
    {
      onSubmit,
      onCancel,
      isStreaming = false,
      placeholder = 'Ask Karm AI...',
      disclaimer = 'AI responses may be inaccurate. Verify important information.',
      className,
      ...props
    },
    ref,
  ) {
    return (
      <MessageInput
        ref={ref}
        onSubmit={onSubmit}
        onCancel={onCancel}
        isStreaming={isStreaming}
        placeholder={placeholder}
        disclaimer={disclaimer}
        className={className}
        {...props}
      />
    )
  },
)

ChatInput.displayName = 'ChatInput'
