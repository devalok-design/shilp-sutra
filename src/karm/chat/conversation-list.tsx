'use client'

import { IconMessage, IconArchive, IconTrash, IconMessagePlus } from '@tabler/icons-react'

// ============================================================
// Types
// ============================================================

export interface Conversation {
  id: string
  title: string | null
  updatedAt: string
}

interface ConversationListProps {
  conversations: Conversation[]
  activeConversationId?: string | null
  isLoading?: boolean
  onSelect: (id: string) => void
  onNewChat: () => void
  onArchive?: (id: string) => void
  onDelete?: (id: string) => void
}

// ============================================================
// Helpers
// ============================================================

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  })
}

// ============================================================
// Component
// ============================================================

export function ConversationList({
  conversations,
  activeConversationId,
  isLoading = false,
  onSelect,
  onNewChat,
  onArchive,
  onDelete,
}: ConversationListProps) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-border-default)] px-ds-05 py-ds-04">
        <h3 className="text-ds-base text-[var(--color-text-primary)]">
          Conversations
        </h3>
        <button
          onClick={onNewChat}
          className="flex items-center gap-ds-02b rounded-[var(--radius-lg)] px-2.5 py-ds-02b text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-layer-02)]"
        >
          <IconMessagePlus className="h-[var(--icon-sm)] w-[var(--icon-sm)]" />
          <span className="text-ds-sm">New Chat</span>
        </button>
      </div>

      {/* List */}
      <div className="no-scrollbar flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-[var(--icon-md)] w-[var(--icon-md)] animate-spin rounded-[var(--radius-full)] border-2 border-[var(--color-text-secondary)] border-t-transparent" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-ds-03 py-12">
            <IconMessage className="h-8 w-8 text-[var(--color-text-placeholder)]" />
            <p className="text-ds-md text-[var(--color-text-placeholder)]">
              No conversations yet
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {conversations.map((convo) => (
              <div
                key={convo.id}
                className={`group flex items-center gap-ds-04 border-b border-[var(--color-border-subtle)] px-ds-05 py-ds-04 transition-colors hover:bg-[var(--color-layer-02)] ${
                  activeConversationId === convo.id
                    ? 'bg-[var(--color-layer-02)]'
                    : ''
                }`}
              >
                <button
                  onClick={() => onSelect(convo.id)}
                  className="flex min-w-0 flex-1 flex-col gap-0.5 text-left"
                >
                  <p className="text-ds-md truncate text-[var(--color-text-primary)]">
                    {convo.title || 'Untitled conversation'}
                  </p>
                  <p className="text-ds-sm text-[var(--color-text-placeholder)]">
                    {formatRelativeTime(convo.updatedAt)}
                  </p>
                </button>

                {/* Context actions -- visible on hover */}
                <div className="flex shrink-0 items-center gap-ds-02 opacity-0 transition-opacity group-hover:opacity-100">
                  {onArchive && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onArchive(convo.id)
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-placeholder)] transition-colors hover:bg-[var(--color-field)] hover:text-[var(--color-text-secondary)]"
                      aria-label="Archive conversation"
                    >
                      <IconArchive className="h-[var(--icon-sm)] w-[var(--icon-sm)]" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(convo.id)
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-placeholder)] transition-colors hover:bg-[var(--color-error-surface)] hover:text-[var(--color-text-error)]"
                      aria-label="Delete conversation"
                    >
                      <IconTrash className="h-[var(--icon-sm)] w-[var(--icon-sm)]" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
