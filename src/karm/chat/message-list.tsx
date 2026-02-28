'use client'

import { useRef, useEffect } from 'react'
import { StreamingText } from './streaming-text'
import { Bot, User, AlertCircle } from 'lucide-react'
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
    <p className="mb-2 last:mb-0">{children}</p>
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
      <code className="rounded bg-[var(--Mapped-Surface-Quaternary)] px-1 py-0.5 text-sm">
        {children}
      </code>
    )
  },
  pre: ({ children }: { children?: React.ReactNode }) => (
    <pre className="mb-2 overflow-x-auto rounded-lg bg-[var(--Mapped-Surface-Quaternary)] p-3 text-sm">
      {children}
    </pre>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="mb-2 list-disc pl-4">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="mb-2 list-decimal pl-4">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="mb-1">{children}</li>
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
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--Mapped-Text-Secondary)] border-t-transparent" />
          <p className="B3-Reg text-[var(--Mapped-Text-Quaternary)]">
            Loading messages...
          </p>
        </div>
      </div>
    )
  }

  // Empty state
  if (messages.length === 0 && !isStreaming) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--Mapped-Surface-Quaternary)]">
            <Bot className="h-6 w-6 text-[var(--Mapped-Text-Secondary)]" />
          </div>
          <h3 className="B1-Reg text-[var(--Mapped-Text-Primary)]">
            {emptyTitle}
          </h3>
          <p className="B3-Reg max-w-[280px] text-[var(--Mapped-Text-Quaternary)]">
            {emptyDescription}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div ref={scrollRef} className="no-scrollbar flex-1 overflow-y-auto p-4">
      <div className="flex flex-col gap-4">
        {messages.map((msg) => {
          if (msg.role === 'SYSTEM') {
            return (
              <div key={msg.id} className="flex justify-center">
                <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 dark:bg-red-950/30">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-500" />
                  <p className="B3-Reg text-red-600 dark:text-red-400">
                    {msg.content}
                  </p>
                </div>
              </div>
            )
          }

          if (msg.role === 'USER') {
            return (
              <div key={msg.id} className="flex justify-end">
                <div className="flex max-w-[85%] items-start gap-2">
                  <div className="rounded-2xl rounded-br-sm bg-[var(--Mapped-Text-Highlight)] px-3.5 py-2.5 text-white">
                    <p className="B2-Reg whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--Mapped-Surface-Quaternary)]">
                    <User className="h-3.5 w-3.5 text-[var(--Mapped-Text-Secondary)]" />
                  </div>
                </div>
              </div>
            )
          }

          // ASSISTANT
          return (
            <div key={msg.id} className="flex justify-start">
              <div className="flex max-w-[85%] items-start gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--Mapped-Surface-Quaternary)]">
                  <Bot className="h-3.5 w-3.5 text-[var(--Mapped-Text-Secondary)]" />
                </div>
                <div className="rounded-2xl rounded-bl-sm bg-[var(--Mapped-Surface-Quaternary)] px-3.5 py-2.5">
                  <div className="B2-Reg text-[var(--Mapped-Text-Primary)]">
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
            <div className="flex max-w-[85%] items-start gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--Mapped-Surface-Quaternary)]">
                <Bot className="h-3.5 w-3.5 text-[var(--Mapped-Text-Secondary)]" />
              </div>
              <div className="rounded-2xl rounded-bl-sm bg-[var(--Mapped-Surface-Quaternary)] px-3.5 py-2.5">
                <div className="B2-Reg text-[var(--Mapped-Text-Primary)]">
                  <StreamingText text={streamingText} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Streaming indicator when no text yet */}
        {isStreaming && !streamingText && (
          <div className="flex justify-start">
            <div className="flex max-w-[85%] items-start gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--Mapped-Surface-Quaternary)]">
                <Bot className="h-3.5 w-3.5 text-[var(--Mapped-Text-Secondary)]" />
              </div>
              <div className="rounded-2xl rounded-bl-sm bg-[var(--Mapped-Surface-Quaternary)] px-3.5 py-2.5">
                <div className="flex items-center gap-1.5 py-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-[var(--Mapped-Text-Quaternary)] [animation-delay:0ms]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-[var(--Mapped-Text-Quaternary)] [animation-delay:150ms]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-[var(--Mapped-Text-Quaternary)] [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
