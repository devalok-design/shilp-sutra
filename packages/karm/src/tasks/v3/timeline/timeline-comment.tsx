'use client'

import * as React from 'react'
import { IconMoodSmile, IconArrowBackUp, IconPencil, IconTrash } from '@tabler/icons-react'
import { cn } from '@/ui/lib/utils'
import { Avatar, AvatarImage, AvatarFallback } from '@/ui/avatar'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Textarea } from '@/ui/textarea'
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
}: TimelineCommentProps) {
  const { comment, reactions } = entry
  const author = getAuthorInfo(comment)

  const [isEditing, setIsEditing] = React.useState(false)
  const [editDraft, setEditDraft] = React.useState(comment.content)
  const editRef = React.useRef<HTMLTextAreaElement>(null)

  const isOwnComment = currentUserId !== null && comment.authorId === currentUserId
  const canEdit = isOwnComment && onEditComment
  const canDelete = isOwnComment && onDeleteComment

  React.useEffect(() => {
    if (isEditing && editRef.current) {
      editRef.current.focus()
      editRef.current.selectionStart = editRef.current.value.length
    }
  }, [isEditing])

  const handleEditSave = React.useCallback(() => {
    const trimmed = editDraft.trim()
    setIsEditing(false)
    if (trimmed && trimmed !== comment.content && onEditComment) {
      onEditComment(comment.id, trimmed)
    } else {
      setEditDraft(comment.content)
    }
  }, [editDraft, comment.content, comment.id, onEditComment])

  const handleEditKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setIsEditing(false)
        setEditDraft(comment.content)
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleEditSave()
      }
    },
    [handleEditSave, comment.content],
  )

  // ---- Deleted placeholder ----
  if (entry.deleted) {
    return (
      <div
        className="flex items-center gap-ds-02 py-ds-02 text-ds-xs text-surface-fg-subtle/50 italic"
        data-testid="timeline-comment-deleted"
      >
        <IconTrash className="h-3 w-3" />
        This message was deleted
      </div>
    )
  }

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
      {/* Avatar — hidden for grouped (continuation) messages */}
      {isGrouped ? (
        <div className="w-8 shrink-0" aria-hidden />
      ) : (
        <Avatar size="sm" className="h-8 w-8 shrink-0">
          {author.image && <AvatarImage src={author.image} alt={author.name} />}
          <AvatarFallback>{getInitials(author.name)}</AvatarFallback>
        </Avatar>
      )}

      {/* Body */}
      <div className="min-w-0 flex-1">
        {/* Header row — hidden for grouped messages */}
        {!isGrouped && (
          <div className="flex items-center gap-ds-02 text-ds-sm">
            <span className="font-semibold text-surface-fg" data-testid="comment-author">
              {author.name}
            </span>
            <span className="text-ds-xs text-surface-fg-subtle/30">
              {formatTime(comment.createdAt)}
            </span>
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
          </div>
        )}

        {/* Content — editable inline or rendered HTML */}
        {isEditing ? (
          <Textarea
            ref={editRef}
            value={editDraft}
            onChange={(e) => setEditDraft(e.target.value)}
            onBlur={handleEditSave}
            onKeyDown={handleEditKeyDown}
            size="sm"
            className={cn(
              'resize-none',
              !isGrouped && 'mt-ds-01',
            )}
            rows={3}
            data-testid="comment-edit-textarea"
          />
        ) : (
          /* eslint-disable-next-line react/no-danger -- consumer responsibility to sanitize */
          <div
            className={cn(
              'max-w-[65ch] text-ds-sm leading-relaxed text-surface-fg whitespace-pre-wrap',
              !isGrouped && 'mt-ds-01',
            )}
            data-testid="comment-content"
            dangerouslySetInnerHTML={{ __html: comment.content }}
          />
        )}

        {/* Reactions row */}
        {reactions && reactions.length > 0 && (
          <div className="mt-ds-02 flex flex-wrap gap-ds-01" data-testid="reactions-row">
            {reactions.map((reaction) => (
              <Button
                key={reaction.emoji}
                variant="ghost"
                size="xs"
                shape="pill"
                onClick={() => onReact(comment.id, reaction.emoji)}
                className={cn(
                  'px-ds-02 h-auto py-px',
                  reaction.reacted && 'bg-accent-3 border border-accent-6',
                )}
                data-testid="reaction-button"
              >
                <span>{reaction.emoji}</span>
                <span className="text-ds-xs">{reaction.count}</span>
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Hover action bar */}
      <div
        className="absolute -top-2 right-0 flex items-center gap-ds-01 rounded-ds-md border border-surface-border bg-surface-raised px-ds-01 py-ds-01 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="Add reaction"
          onClick={() => onReact(comment.id, '')}
          data-testid="react-trigger"
        >
          <IconMoodSmile className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="Reply"
        >
          <IconArrowBackUp className="h-3.5 w-3.5" />
        </Button>
        {canEdit && (
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Edit comment"
            onClick={() => {
              setEditDraft(comment.content)
              setIsEditing(true)
            }}
            data-testid="edit-trigger"
          >
            <IconPencil className="h-3.5 w-3.5" />
          </Button>
        )}
        {canDelete && (
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Delete comment"
            onClick={() => onDeleteComment!(comment.id)}
            data-testid="delete-trigger"
          >
            <IconTrash className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  )
}

TimelineComment.displayName = 'TimelineComment'
