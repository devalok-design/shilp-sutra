'use client'

import * as React from 'react'
import { cn } from '../../ui/lib/utils'
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '../../ui/avatar'
import { EmptyState } from '../../shared/empty-state'
import { MessageCircle, Send } from 'lucide-react'

// ============================================================
// Types
// ============================================================

interface CommentAuthor {
  id: string
  name: string
  email?: string
  image?: string | null
}

export interface Comment {
  id: string
  taskId: string
  authorType: 'INTERNAL' | 'CLIENT'
  authorId: string
  content: string
  createdAt: string
  updatedAt: string
  internalAuthor?: CommentAuthor | null
  clientAuthor?: { id: string; name: string; email: string } | null
}

interface ConversationTabProps {
  comments: Comment[]
  taskVisibility: 'INTERNAL' | 'EVERYONE'
  onPostComment: (content: string, authorType: 'INTERNAL' | 'CLIENT') => void
  className?: string
  /** When true, the viewer is a client -- adjusts warnings, labels, and author type */
  clientMode?: boolean
  /** Optional rich text editor component. Falls back to plain textarea. */
  renderEditor?: (props: {
    content: string
    onChange: (content: string) => void
    placeholder: string
  }) => React.ReactNode
  /** Optional rich text viewer component. Falls back to plain text display. */
  renderViewer?: (props: { content: string; className?: string }) => React.ReactNode
}

// ============================================================
// Helpers
// ============================================================

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function formatTimestamp(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

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
 * For rich HTML rendering, pass a `renderViewer` prop that uses
 * a sanitizer like DOMPurify before rendering.
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}

// ============================================================
// Conversation Tab
// ============================================================

function ConversationTab({
  comments,
  taskVisibility,
  onPostComment,
  className,
  clientMode = false,
  renderEditor,
  renderViewer,
}: ConversationTabProps) {
  const [editorContent, setEditorContent] = React.useState('')
  const scrollRef = React.useRef<HTMLDivElement>(null)

  const handlePost = () => {
    const trimmed = editorContent.trim()
    // Check that content is not just empty HTML tags
    const textOnly = trimmed.replace(/<[^>]*>/g, '').trim()
    if (!textOnly) return

    onPostComment(trimmed, clientMode ? 'CLIENT' : 'INTERNAL')
    setEditorContent('')
  }

  // Auto-scroll to bottom when new comments arrive
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [comments.length])

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Comments list */}
      {comments.length > 0 ? (
        <div
          ref={scrollRef}
          className="flex-1 space-y-4 overflow-y-auto"
        >
          {comments.map((comment) => {
            const author = getAuthorInfo(comment)
            const isClient = comment.authorType === 'CLIENT'

            return (
              <div key={comment.id} className="flex gap-2.5">
                {/* Avatar */}
                <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                  {author.image && (
                    <AvatarImage src={author.image} alt={author.name} />
                  )}
                  <AvatarFallback
                    className={cn(
                      'text-[9px] font-semibold',
                      isClient
                        ? 'bg-[var(--color-warning-surface)] text-[var(--color-text-warning)]'
                        : 'bg-[var(--color-layer-03)] text-[var(--color-text-on-color)]',
                    )}
                  >
                    {getInitials(author.name)}
                  </AvatarFallback>
                </Avatar>

                {/* Comment body */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[13px] font-body font-medium text-[var(--color-text-primary)]">
                      {author.name}
                    </span>
                    {/* Badge: staff sees "Client" on client comments; client sees "Team" on staff comments */}
                    {clientMode ? (
                      !isClient && (
                        <span className="rounded bg-[var(--color-layer-03)] px-1 py-px text-[9px] font-semibold uppercase tracking-wider text-[var(--color-text-on-color)]">
                          Team
                        </span>
                      )
                    ) : (
                      isClient && (
                        <span className="rounded bg-[var(--color-warning-surface)] px-1 py-px text-[9px] font-semibold uppercase tracking-wider text-[var(--color-text-warning)]">
                          Client
                        </span>
                      )
                    )}
                    <span className="text-[11px] font-body text-[var(--color-text-placeholder)]">
                      {formatTimestamp(comment.createdAt)}
                    </span>
                  </div>

                  <div className="mt-1">
                    {renderViewer ? (
                      renderViewer({
                        content: comment.content,
                        className: '[&_.ProseMirror]:!min-h-0 [&_.ProseMirror]:!p-0',
                      })
                    ) : (
                      <p className="text-[13px] font-body text-[var(--color-text-secondary)] whitespace-pre-wrap">
                        {stripHtml(comment.content)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <EmptyState
          icon={MessageCircle}
          title="No comments yet"
          description="Start a conversation about this task"
          compact
        />
      )}

      {/* Comment input */}
      <div className="mt-4 space-y-2">
        {taskVisibility === 'EVERYONE' && !clientMode && (
          <p className="text-[10px] font-body text-[var(--color-text-warning)]">
            This task is visible to clients. Comments may be seen by external users.
          </p>
        )}
        {renderEditor ? (
          renderEditor({
            content: editorContent,
            onChange: setEditorContent,
            placeholder: 'Write a comment...',
          })
        ) : (
          <textarea
            value={editorContent}
            onChange={(e) => setEditorContent(e.target.value)}
            placeholder="Write a comment..."
            rows={3}
            className="w-full resize-none rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-transparent px-3 py-2 text-[13px] font-body text-[var(--color-text-primary)] placeholder:text-[var(--color-text-placeholder)] outline-none focus:border-[var(--color-border-subtle)]"
          />
        )}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handlePost}
            disabled={!editorContent.replace(/<[^>]*>/g, '').trim()}
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-lg)] bg-[var(--color-interactive)] px-3.5 py-1.5 text-[12px] font-body font-semibold text-[var(--color-text-on-color)] transition-colors hover:bg-[var(--color-interactive-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-3.5 w-3.5" strokeWidth={2} />
            Comment
          </button>
        </div>
      </div>
    </div>
  )
}

ConversationTab.displayName = 'ConversationTab'

export { ConversationTab }
export type { ConversationTabProps }
