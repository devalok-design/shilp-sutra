'use client'

import * as React from 'react'
import { IconMoodSmile, IconArrowBackUp, IconPencil, IconTrash, IconLock } from '@tabler/icons-react'
import { Icon } from '@/ui/icon'
import { Message } from '@/ui/chat'
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

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
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
  onEditComment?: (commentId: string, newContent: string) => void
  onDeleteComment?: (commentId: string) => void
  /** When true, this comment is a continuation of the previous message from
   *  the same author — avatar and name are hidden, spacing is tighter. */
  isGrouped?: boolean
  /** When true, the task has client visibility — internal comments get a
   *  visual tint + lock icon to distinguish them from client-visible ones. */
  isClientTask?: boolean
}

// ---------------------------------------------------------------------------
// TimelineComment
// ---------------------------------------------------------------------------

export function TimelineComment({
  entry,
  currentUserId,
  onReact,
  onEditComment,
  onDeleteComment,
  isGrouped = false,
  isClientTask = false,
}: TimelineCommentProps) {
  const { comment, reactions } = entry
  const author = getAuthorInfo(comment)

  const isOwnComment = currentUserId !== null && comment.authorId === currentUserId
  const canEdit = isOwnComment && !!onEditComment
  const canDelete = isOwnComment && !!onDeleteComment

  // Check if the current user is @mentioned in the content
  const isMentioned =
    currentUserId !== null &&
    comment.content.includes(`@${currentUserId}`)

  // Internal note on a client-visible task — Intercom-style amber tint
  const isInternalNote = isClientTask && author.type === 'INTERNAL'

  const highlight = isMentioned
    ? ('mention' as const)
    : isInternalNote
      ? ('internal' as const)
      : undefined

  // Build the client badge or internal-note lock icon for the author row
  const authorBadge = (
    <>
      {isInternalNote && (
        <Icon icon={IconLock} size="xs" className="text-warning-11/60" />
      )}
      {author.type === 'CLIENT' && (
        <Badge
          variant="subtle"
          color="success"
          size="xs"
          className="text-[10px]"
          data-testid="comment-badge"
        >
          Client
        </Badge>
      )}
    </>
  )

  return (
    <Message
      grouped={isGrouped}
      deleted={entry.deleted}
      highlight={highlight}
      data-testid="timeline-comment"
    >
      <Message.Avatar
        src={author.image}
        fallback={getInitials(author.name)}
        size="md"
      />
      <Message.Content>
        <Message.Author
          name={author.name}
          formattedTimestamp={formatTime(comment.createdAt)}
          badge={authorBadge}
        />
        <Message.EditableBody
          content={comment.content}
          canEdit={canEdit}
          onSave={(newContent) => onEditComment?.(comment.id, newContent)}
          renderContent={(content) => (
            <div
              className="max-w-[65ch]"
              data-testid="comment-content"
              // Consumer is responsible for sanitizing HTML content before
              // passing it into the timeline. The raw HTML render is
              // intentional — see task-panel-types.Comment.content.
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}
        />
        {reactions && reactions.length > 0 && (
          <Message.Reactions
            reactions={reactions}
            onReact={(emoji) => onReact(comment.id, emoji)}
          />
        )}
      </Message.Content>

      {/* Hover action bar */}
      <Message.Actions>
        <Message.Action
          icon={IconMoodSmile}
          label="Add reaction"
          onClick={() => onReact(comment.id, '')}
        />
        <Message.Action
          icon={IconArrowBackUp}
          label="Reply"
          onClick={() => {}}
        />
        {canEdit && (
          <Message.Action
            icon={IconPencil}
            label="Edit comment"
            onClick={() => {
              // EditableBody handles its own click-to-edit interaction;
              // this toolbar button is kept for discoverability parity
              // with the previous implementation.
            }}
          />
        )}
        {canDelete && (
          <Message.Action
            icon={IconTrash}
            label="Delete comment"
            onClick={() => onDeleteComment!(comment.id)}
            variant="danger"
          />
        )}
      </Message.Actions>
    </Message>
  )
}

TimelineComment.displayName = 'TimelineComment'
