'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@/ui/avatar'
import { getInitials } from '@/composed/lib/string-utils'
import { formatTimestamp } from '../task-utils'
import type { Comment, CommentAuthor } from '../task-types'

// ============================================================
// Helpers
// ============================================================

function getAuthorInfo(comment: Comment): CommentAuthor {
  if (comment.authorType === 'INTERNAL' && comment.internalAuthor) {
    return comment.internalAuthor
  }
  if (comment.authorType === 'CLIENT' && comment.clientAuthor) {
    return {
      id: comment.clientAuthor.id,
      name: comment.clientAuthor.name,
      email: comment.clientAuthor.email,
      image: null,
    }
  }
  return { id: comment.authorId, name: 'Unknown', image: null }
}

/**
 * Strip HTML tags for plain text display (default viewer).
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}

// ============================================================
// Types
// ============================================================

export interface MessageBubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  comment: Comment
  clientMode?: boolean
  renderViewer?: (props: { content: string; className?: string }) => React.ReactNode
}

// ============================================================
// MessageBubble
// ============================================================

const MessageBubble = React.forwardRef<HTMLDivElement, MessageBubbleProps>(
  function MessageBubble({ comment, clientMode = false, renderViewer, className, ...props }, ref) {
    const author = getAuthorInfo(comment)
    const isClient = comment.authorType === 'CLIENT'

    return (
      <div ref={ref} className={cn('flex gap-ds-03', className)} {...props}>
        {/* Avatar */}
        <Avatar className="h-ds-xs-plus w-ds-xs-plus shrink-0 mt-ds-01">
          {author.image && (
            <AvatarImage src={author.image} alt={author.name} />
          )}
          <AvatarFallback
            className={cn(
              'text-ds-xs font-semibold',
              isClient
                ? 'bg-warning-3 text-warning-11'
                : 'bg-surface-3 text-accent-fg',
            )}
          >
            {getInitials(author.name)}
          </AvatarFallback>
        </Avatar>

        {/* Comment body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-ds-03">
            <span className="text-ds-md font-medium text-surface-fg">
              {author.name}
            </span>
            {/* Badge: staff sees "Client" on client comments; client sees "Team" on staff comments */}
            {clientMode ? (
              !isClient && (
                <span className="rounded bg-surface-3 px-ds-02 py-px text-ds-xs font-semibold uppercase tracking-wider text-accent-fg">
                  Team
                </span>
              )
            ) : (
              isClient && (
                <span className="rounded bg-warning-3 px-ds-02 py-px text-ds-xs font-semibold uppercase tracking-wider text-warning-11">
                  Client
                </span>
              )
            )}
            <span className="text-ds-sm text-surface-fg-subtle">
              {formatTimestamp(comment.createdAt)}
            </span>
          </div>

          <div className="mt-ds-02">
            {renderViewer ? (
              renderViewer({
                content: comment.content,
                className: '[&_.ProseMirror]:!min-h-0 [&_.ProseMirror]:!p-0',
              })
            ) : (
              <p className="text-ds-md text-surface-fg-muted whitespace-pre-wrap">
                {stripHtml(comment.content)}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  },
)

MessageBubble.displayName = 'MessageBubble'

export { MessageBubble }
