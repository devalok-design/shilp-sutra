'use client'

import * as React from 'react'
import {
  MessageList as CoreMessageList,
  Message,
  SystemMessage,
  TypingIndicator,
} from '@/ui/chat'
import { Icon } from '@/ui/icon'
import { IconRobot } from '@tabler/icons-react'
import { LazyMarkdown } from './lazy-markdown'
import { StreamingText } from './streaming-text'

// ============================================================
// Types (backward-compat — consumed by ChatPanel)
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
// Helpers
// ============================================================

const robotAvatar = (
  <Icon icon={IconRobot} size="sm" className="text-surface-fg-muted" />
)

function EmptyState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="flex flex-1 items-center justify-center p-ds-06">
      <div className="flex flex-col items-center gap-ds-04 text-center">
        <div className="flex h-ds-lg w-ds-lg items-center justify-center rounded-ds-full bg-surface-raised-hover">
          <Icon icon={IconRobot} size="lg" className="text-surface-fg-muted" />
        </div>
        <h3 className="text-ds-base text-surface-fg">{title}</h3>
        <p className="text-ds-sm max-w-[280px] text-surface-fg-subtle">
          {description}
        </p>
      </div>
    </div>
  )
}

// ============================================================
// Component
// ============================================================

export const MessageList = React.forwardRef<HTMLDivElement, MessageListProps>(
  function MessageList(
    {
      messages,
      isStreaming = false,
      streamingText = '',
      isLoadingMessages = false,
      emptyTitle = 'Karm AI',
      emptyDescription = 'Ask me about tasks, projects, attendance, or anything else.',
      className,
      ...props
    },
    ref,
  ) {
    // Loading guard — spinner instead of message list
    if (isLoadingMessages) {
      return (
        <div
          ref={ref}
          className="flex flex-1 items-center justify-center"
          {...props}
        >
          <div className="flex flex-col items-center gap-ds-03">
            <div className="h-ds-xs w-ds-xs animate-spin rounded-ds-full border-2 border-surface-border border-t-transparent" />
            <p className="text-ds-sm text-surface-fg-subtle">
              Loading messages...
            </p>
          </div>
        </div>
      )
    }

    // Build children array — avoid passing `false` from conditional
    // expressions, which React.Children.count treats as real children
    // and breaks the core MessageList's isEmpty detection.
    const children: React.ReactNode[] = messages.map((msg) => {
      if (msg.role === 'SYSTEM') {
        return (
          <SystemMessage key={msg.id} variant="alert">
            {msg.content}
          </SystemMessage>
        )
      }

      if (msg.role === 'USER') {
        return (
          <Message
            key={msg.id}
            variant="bubble"
            placement="end"
            data-author-id="user"
          >
            <Message.Body>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </Message.Body>
          </Message>
        )
      }

      // ASSISTANT
      return (
        <Message
          key={msg.id}
          variant="bubble"
          placement="start"
          data-author-id="assistant"
        >
          <Message.Avatar icon={robotAvatar} />
          <Message.Body>
            <LazyMarkdown>{msg.content}</LazyMarkdown>
          </Message.Body>
        </Message>
      )
    })

    if (isStreaming && streamingText) {
      children.push(
        <Message
          key="streaming-text"
          variant="bubble"
          placement="start"
          data-author-id="assistant"
        >
          <Message.Avatar icon={robotAvatar} />
          <Message.Body>
            <StreamingText text={streamingText} />
          </Message.Body>
        </Message>,
      )
    }

    if (isStreaming && !streamingText) {
      children.push(
        <TypingIndicator key="streaming-dots" users={[{ name: 'AI' }]} />,
      )
    }

    return (
      <CoreMessageList
        ref={ref}
        className={className}
        emptySlot={
          <EmptyState title={emptyTitle} description={emptyDescription} />
        }
        {...props}
      >
        {children}
      </CoreMessageList>
    )
  },
)

MessageList.displayName = 'MessageList'
