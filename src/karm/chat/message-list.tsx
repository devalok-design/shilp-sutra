'use client'

import { useRef, useEffect } from 'react'
import { StreamingText } from './streaming-text'
import { IconRobot, IconUser, IconAlertCircle } from '@tabler/icons-react'
import ReactMarkdown from 'react-markdown'

// ============================================================
// Types
// ============================================================

export interface ChatMessage {
  id: string
  role: 'USER' | 'ASSISTANT' | 'SYSTEM'
  content: string
}

interface MessageListProps {
  messages: ChatMessage[]
  isStreaming?: boolean
  streamingText?: string
  isLoadingMessages?: boolean
  emptyTitle?: string
  emptyDescription?: string
}

// ============================================================
// Markdown components
// ============================================================

const markdownComponents = {
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="mb-ds-03 last:mb-0">{children}</p>
  ),
  code: ({
    children,
    className,
  }: {
    children?: React.ReactNode
    className?: string
  }) => {
    const isBlock = className?.includes('language-')
    if (isBlock) {
      return <code className={className}>{children}</code>
    }
    return (
      <code className="rounded bg-field px-ds-02 py-0.5 text-ds-md">
        {children}
      </code>
    )
  },
  pre: ({ children }: { children?: React.ReactNode }) => (
    <pre className="mb-ds-03 overflow-x-auto rounded-ds-lg bg-field p-ds-04 text-ds-md">
      {children}
    </pre>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="mb-ds-03 list-disc pl-ds-05">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="mb-ds-03 list-decimal pl-ds-05">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="mb-ds-02">{children}</li>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold">{children}</strong>
  ),
}

// ============================================================
// Component
// ============================================================

export function MessageList({
  messages,
  isStreaming = false,
  streamingText = '',
  isLoadingMessages = false,
  emptyTitle = 'Karm AI',
  emptyDescription = 'Ask me about tasks, projects, attendance, or anything else.',
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, streamingText])

  if (isLoadingMessages) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-ds-03">
          <div className="h-6 w-6 animate-spin rounded-ds-full border-2 border-text-secondary border-t-transparent" />
          <p className="text-ds-sm text-text-placeholder">
            Loading messages...
          </p>
        </div>
      </div>
    )
  }

  // Empty state
  if (messages.length === 0 && !isStreaming) {
    return (
      <div className="flex flex-1 items-center justify-center p-ds-06">
        <div className="flex flex-col items-center gap-ds-04 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-ds-full bg-field">
            <IconRobot className="h-6 w-6 text-text-secondary" />
          </div>
          <h3 className="text-ds-base text-text-primary">
            {emptyTitle}
          </h3>
          <p className="text-ds-sm max-w-[280px] text-text-placeholder">
            {emptyDescription}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div ref={scrollRef} className="no-scrollbar flex-1 overflow-y-auto p-ds-05">
      <div className="flex flex-col gap-ds-05" role="log">
        {messages.map((msg) => {
          if (msg.role === 'SYSTEM') {
            return (
              <div key={msg.id} className="flex justify-center">
                <div className="flex items-center gap-ds-03 rounded-ds-lg bg-error-surface px-ds-04 py-ds-03">
                  <IconAlertCircle className="h-ico-sm w-ico-sm shrink-0 text-text-error" />
                  <p className="text-ds-sm text-text-error">
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
                  <div className="rounded-ds-2xl rounded-br-ds-sm bg-interactive px-3.5 py-2.5 text-text-on-color">
                    <p className="text-ds-md whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-ds-full bg-field">
                    <IconUser className="h-ico-sm w-ico-sm text-text-secondary" />
                  </div>
                </div>
              </div>
            )
          }

          // ASSISTANT
          return (
            <div key={msg.id} className="flex justify-start">
              <div className="flex max-w-[85%] items-start gap-ds-03">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-ds-full bg-field">
                  <IconRobot className="h-ico-sm w-ico-sm text-text-secondary" />
                </div>
                <div className="rounded-ds-2xl rounded-bl-ds-sm bg-field px-3.5 py-2.5">
                  <div className="text-ds-md text-text-primary">
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
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-ds-full bg-field">
                <IconRobot className="h-ico-sm w-ico-sm text-text-secondary" />
              </div>
              <div className="rounded-ds-2xl rounded-bl-ds-sm bg-field px-3.5 py-2.5">
                <div className="text-ds-md text-text-primary">
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
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-ds-full bg-field">
                <IconRobot className="h-ico-sm w-ico-sm text-text-secondary" />
              </div>
              <div className="rounded-ds-2xl rounded-bl-ds-sm bg-field px-3.5 py-2.5">
                <div className="flex items-center gap-ds-02b py-ds-02">
                  <div className="h-2 w-2 animate-bounce rounded-ds-full bg-text-placeholder [animation-delay:0ms]" />
                  <div className="h-2 w-2 animate-bounce rounded-ds-full bg-text-placeholder [animation-delay:150ms]" />
                  <div className="h-2 w-2 animate-bounce rounded-ds-full bg-text-placeholder [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
