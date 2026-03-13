'use client'

import * as React from 'react'
import { useRef, useEffect } from 'react'
import { cn } from '@/ui/lib/utils'
import { useComposedRef } from '../utils/use-composed-ref'
import { StreamingText } from './streaming-text'
import { IconRobot, IconUser, IconAlertCircle } from '@tabler/icons-react'
import ReactMarkdown from 'react-markdown'
import { markdownComponents } from './markdown-components'

// ============================================================
// Types
// ============================================================

export interface ChatMessage {
  id: string
  role: 'USER' | 'ASSISTANT' | 'SYSTEM'
  content: string
}

export interface MessageListProps extends React.HTMLAttributes<HTMLDivElement> {
  messages: ChatMessage[]
  isStreaming?: boolean
  streamingText?: string
  isLoadingMessages?: boolean
  emptyTitle?: string
  emptyDescription?: string
}

// ============================================================
// Component
// ============================================================

export const MessageList = React.forwardRef<HTMLDivElement, MessageListProps>(
  function MessageList({
  messages,
  isStreaming = false,
  streamingText = '',
  isLoadingMessages = false,
  emptyTitle = 'Karm AI',
  emptyDescription = 'Ask me about tasks, projects, attendance, or anything else.',
  className,
  ...props
}, forwardedRef) {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const mergedRef = useComposedRef(scrollRef, forwardedRef)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, streamingText])

  if (isLoadingMessages) {
    return (
      <div ref={forwardedRef} className={cn("flex flex-1 items-center justify-center", className)} {...props}>
        <div className="flex flex-col items-center gap-ds-03">
          <div className="h-ds-xs w-ds-xs animate-spin rounded-ds-full border-2 border-surface-border border-t-transparent" />
          <p className="text-ds-sm text-surface-fg-subtle">
            Loading messages...
          </p>
        </div>
      </div>
    )
  }

  // Empty state
  if (messages.length === 0 && !isStreaming) {
    return (
      <div ref={forwardedRef} className={cn("flex flex-1 items-center justify-center p-ds-06", className)} {...props}>
        <div className="flex flex-col items-center gap-ds-04 text-center">
          <div className="flex h-ds-lg w-ds-lg items-center justify-center rounded-ds-full bg-surface-3">
            <IconRobot className="h-ico-lg w-ico-lg text-surface-fg-muted" />
          </div>
          <h3 className="text-ds-base text-surface-fg">
            {emptyTitle}
          </h3>
          <p className="text-ds-sm max-w-[280px] text-surface-fg-subtle">
            {emptyDescription}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div ref={mergedRef} className={cn("no-scrollbar flex-1 overflow-y-auto p-ds-05", className)} {...props}>
      <div className="flex flex-col gap-ds-05" role="log" aria-label="Chat messages">
        {messages.map((msg) => {
          if (msg.role === 'SYSTEM') {
            return (
              <div key={msg.id} className="flex justify-center">
                <div className="flex items-center gap-ds-03 rounded-ds-lg bg-error-3 px-ds-04 py-ds-03">
                  <IconAlertCircle className="h-ico-sm w-ico-sm shrink-0 text-error-11" />
                  <p className="text-ds-sm text-error-11">
                    {msg.content}
                  </p>
                </div>
              </div>
            )
          }

          if (msg.role === 'USER') {
            return (
              <div key={msg.id} className="flex justify-end">
                <div className="flex max-w-[85%] items-start gap-ds-03">
                  <div className="rounded-ds-2xl rounded-br-ds-sm bg-accent-9 px-ds-04 py-ds-03 text-accent-fg">
                    <p className="text-ds-md whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  <div className="flex h-ds-xs-plus w-ds-xs-plus shrink-0 items-center justify-center rounded-ds-full bg-surface-3">
                    <IconUser className="h-ico-sm w-ico-sm text-surface-fg-muted" />
                  </div>
                </div>
              </div>
            )
          }

          // ASSISTANT
          return (
            <div key={msg.id} className="flex justify-start">
              <div className="flex max-w-[85%] items-start gap-ds-03">
                <div className="flex h-ds-xs-plus w-ds-xs-plus shrink-0 items-center justify-center rounded-ds-full bg-surface-3">
                  <IconRobot className="h-ico-sm w-ico-sm text-surface-fg-muted" />
                </div>
                <div className="rounded-ds-2xl rounded-bl-ds-sm bg-surface-3 px-ds-04 py-ds-03">
                  <div className="text-ds-md text-surface-fg">
                    <ReactMarkdown components={markdownComponents}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {/* Streaming assistant message */}
        {isStreaming && streamingText && (
          <div className="flex justify-start">
            <div className="flex max-w-[85%] items-start gap-ds-03">
              <div className="flex h-ds-xs-plus w-ds-xs-plus shrink-0 items-center justify-center rounded-ds-full bg-surface-3">
                <IconRobot className="h-ico-sm w-ico-sm text-surface-fg-muted" />
              </div>
              <div className="rounded-ds-2xl rounded-bl-ds-sm bg-surface-3 px-ds-04 py-ds-03">
                <div className="text-ds-md text-surface-fg">
                  <StreamingText text={streamingText} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Streaming indicator when no text yet */}
        {isStreaming && !streamingText && (
          <div className="flex justify-start">
            <div className="flex max-w-[85%] items-start gap-ds-03">
              <div className="flex h-ds-xs-plus w-ds-xs-plus shrink-0 items-center justify-center rounded-ds-full bg-surface-3">
                <IconRobot className="h-ico-sm w-ico-sm text-surface-fg-muted" />
              </div>
              <div className="rounded-ds-2xl rounded-bl-ds-sm bg-surface-3 px-ds-04 py-ds-03">
                <div className="flex items-center gap-ds-02b py-ds-02">
                  <div className="h-2 w-2 animate-bounce rounded-ds-full bg-surface-fg-subtle [animation-delay:0ms]" />
                  <div className="h-2 w-2 animate-bounce rounded-ds-full bg-surface-fg-subtle [animation-delay:150ms]" />
                  <div className="h-2 w-2 animate-bounce rounded-ds-full bg-surface-fg-subtle [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
},
)

MessageList.displayName = 'MessageList'
