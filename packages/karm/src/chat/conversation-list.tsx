'use client'

import * as React from 'react'
import { IconMessage, IconArchive, IconTrash, IconMessagePlus } from '@tabler/icons-react'
import { cn } from '@/ui/lib/utils'

// ============================================================
// Types
// ============================================================

export interface Conversation {
  id: string
  title: string | null
  updatedAt: string
}

export interface ConversationListProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
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

export const ConversationList = React.forwardRef<HTMLDivElement, ConversationListProps>(
  function ConversationList({
  conversations,
  activeConversationId,
  isLoading = false,
  onSelect,
  onNewChat,
  onArchive,
  onDelete,
  className,
  ...props
}, ref) {
  return (
    <div ref={ref} className={cn("flex flex-1 flex-col overflow-hidden", className)} {...props}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-ds-05 py-ds-04">
        <h3 className="text-ds-md font-semibold text-text-primary">
          Conversations
        </h3>
        <button
          onClick={onNewChat}
          className="flex items-center gap-ds-02b rounded-ds-lg px-ds-03 py-ds-02b text-text-secondary transition-colors hover:bg-layer-02"
        >
          <IconMessagePlus className="h-ico-sm w-ico-sm" />
          <span className="text-ds-sm">New Chat</span>
        </button>
      </div>

      {/* List */}
      <div className="no-scrollbar flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-ico-md w-ico-md animate-spin rounded-ds-full border-2 border-text-secondary border-t-transparent" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-ds-03 py-12">
            <IconMessage className="h-ds-sm w-ds-sm text-text-placeholder" />
            <p className="text-ds-md text-text-placeholder">
              No conversations yet
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {conversations.map((convo) => (
              <div
                key={convo.id}
                className={cn(
                  'group flex items-center gap-ds-04 border-b border-border-subtle px-ds-05 py-ds-04 transition-colors hover:bg-layer-02',
                  activeConversationId === convo.id && 'bg-layer-02',
                )}
              >
                <button
                  onClick={() => onSelect(convo.id)}
                  className="flex min-w-0 flex-1 flex-col gap-ds-01 text-left"
                >
                  <p className="text-ds-md truncate text-text-primary">
                    {convo.title || 'Untitled conversation'}
                  </p>
                  <p className="text-ds-sm text-text-placeholder">
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
                      className="flex h-ds-xs-plus w-ds-xs-plus items-center justify-center rounded-ds-md text-text-placeholder transition-colors hover:bg-field hover:text-text-secondary"
                      aria-label="Archive conversation"
                    >
                      <IconArchive className="h-ico-sm w-ico-sm" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(convo.id)
                      }}
                      className="flex h-ds-xs-plus w-ds-xs-plus items-center justify-center rounded-ds-md text-text-placeholder transition-colors hover:bg-error-surface hover:text-text-error"
                      aria-label="Delete conversation"
                    >
                      <IconTrash className="h-ico-sm w-ico-sm" />
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
},
)

ConversationList.displayName = 'ConversationList'
