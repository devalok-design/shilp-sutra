'use client'

import * as React from 'react'
import { IconMoodSmile } from '@tabler/icons-react'
import { cn } from '@/ui/lib/utils'
import { Avatar, AvatarImage, AvatarFallback } from '@/ui/avatar'
import { Badge } from '@/ui/badge'
import type { Comment, Reaction } from '../task-panel-types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function getAuthorInfo(comment: Comment): {
  name: string
  image: string | null | undefined
  type: 'INTERNAL' | 'CLIENT'
} {
  if (comment.authorType === 'CLIENT' && comment.clientAuthor) {
    return {
      name: comment.clientAuthor.name,
      image: undefined,
      type: 'CLIENT',
    }
  }
  return {
    name: comment.internalAuthor?.name ?? 'Unknown',
    image: comment.internalAuthor?.image,
    type: 'INTERNAL',
  }
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface TimelineCommentProps {
  entry: Extract<
    import('../task-panel-types').TimelineEntry,
    { type: 'comment' }
  >
  currentUserId: string | null
  onReact: (entryId: string, emoji: string) => void
}

// ---------------------------------------------------------------------------
// TimelineComment
// ---------------------------------------------------------------------------

export function TimelineComment({
  entry,
  currentUserId,
  onReact,
}: TimelineCommentProps) {
  const { comment, reactions } = entry
  const author = getAuthorInfo(comment)

  // Check if the current user is @mentioned in the content
  const isMentioned =
    currentUserId !== null &&
    comment.content.includes(`@${currentUserId}`)

  return (
    <div
      className={cn(
        'group relative flex gap-ds-03',
        isMentioned &&
          'border-l-2 border-l-accent-9 bg-accent-2 pl-ds-03 rounded-ds-sm',
      )}
      data-testid="timeline-comment"
    >
      {/* Avatar */}
      <Avatar size="sm" className="shrink-0">
        {author.image && <AvatarImage src={author.image} alt={author.name} />}
        <AvatarFallback>{getInitials(author.name)}</AvatarFallback>
      </Avatar>

      {/* Body */}
      <div className="min-w-0 flex-1">
        {/* Header row */}
        <div className="flex items-center gap-ds-02 text-ds-sm">
          <span className="font-semibold text-surface-fg" data-testid="comment-author">
            {author.name}
          </span>
          <Badge
            variant="subtle"
            color={author.type === 'CLIENT' ? 'success' : 'brand'}
            size="xs"
            data-testid="comment-badge"
          >
            {author.type === 'CLIENT' ? 'Client' : 'Team'}
          </Badge>
          <span className="text-ds-xs text-surface-fg-subtle">
            {formatTimestamp(comment.createdAt)}
          </span>
        </div>

        {/* Content — rendered as text; consumer should sanitize if passing HTML */}
        <div
          className="mt-ds-01 text-ds-sm text-surface-fg"
          data-testid="comment-content"
        >
          {comment.content}
        </div>

        {/* Reactions row */}
        {reactions && reactions.length > 0 && (
          <div className="mt-ds-02 flex flex-wrap gap-ds-01" data-testid="reactions-row">
            {reactions.map((reaction) => (
              <button
                key={reaction.emoji}
                type="button"
                onClick={() => onReact(comment.id, reaction.emoji)}
                className={cn(
                  'inline-flex items-center gap-ds-01 rounded-full px-ds-02 py-ds-01 text-ds-xs transition-colors',
                  'bg-surface-raised-hover hover:bg-surface-3',
                  reaction.reacted && 'border border-accent-7',
                )}
                data-testid="reaction-button"
              >
                <span>{reaction.emoji}</span>
                <span>{reaction.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Hover action bar */}
      <div className="absolute right-0 top-0 hidden group-hover:flex items-center gap-ds-01">
        <button
          type="button"
          className="rounded-ds-md p-ds-01 text-surface-fg-subtle hover:bg-surface-3 hover:text-surface-fg transition-colors"
          aria-label="Add reaction"
          onClick={() => onReact(comment.id, '')}
          data-testid="react-trigger"
        >
          <IconMoodSmile className="h-ico-sm w-ico-sm" />
        </button>
      </div>
    </div>
  )
}

TimelineComment.displayName = 'TimelineComment'
