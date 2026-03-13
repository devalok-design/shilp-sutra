'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@/ui/avatar'
import { EmptyState } from '@/composed/empty-state'
import {
  RichTextEditor,
  RichTextViewer,
} from '@/composed/rich-text-editor'
import { IconMessageCircle, IconSend } from '@tabler/icons-react'
import { getInitials } from '@/composed/lib/string-utils'
import { formatTimestamp } from './task-utils'

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

interface ConversationTabProps extends React.HTMLAttributes<HTMLDivElement> {
  comments: Comment[]
  taskVisibility: 'INTERNAL' | 'EVERYONE'
  onPostComment: (content: string, authorType: 'INTERNAL' | 'CLIENT') => void
  /** When true, the viewer is a client -- adjusts warnings, labels, and author type */
  clientMode?: boolean
  /** Enable built-in RichTextEditor/Viewer. Defaults to true. Set false for plain textarea fallback. */
  richText?: boolean
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

const ConversationTab = React.forwardRef<HTMLDivElement, ConversationTabProps>(
  function ConversationTab({
  comments,
  taskVisibility,
  onPostComment,
  className,
  clientMode = false,
  richText = true,
  renderEditor: renderEditorProp,
  renderViewer: renderViewerProp,
  ...props
}, ref) {
  const [editorContent, setEditorContent] = React.useState('')
  const scrollRef = React.useRef<HTMLDivElement>(null)

  // Resolve editor/viewer: explicit render props take priority, then richText mode, then plain fallback
  const renderEditor = renderEditorProp ?? (richText
    ? (props: { content: string; onChange: (c: string) => void; placeholder: string }) => (
        <RichTextEditor
          content={props.content}
          onChange={props.onChange}
          placeholder={props.placeholder}
          editable
          className="min-h-[80px]"
        />
      )
    : undefined)

  const renderViewer = renderViewerProp ?? (richText
    ? (props: { content: string; className?: string }) => (
        <RichTextViewer content={props.content} className={props.className} />
      )
    : undefined)

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
    <div ref={ref} className={cn('flex flex-col', className)} {...props}>
      {/* Comments list */}
      {comments.length > 0 ? (
        <div
          ref={scrollRef}
          className="flex-1 space-y-ds-05 overflow-y-auto"
        >
          {comments.map((comment) => {
            const author = getAuthorInfo(comment)
            const isClient = comment.authorType === 'CLIENT'

            return (
              <div key={comment.id} className="flex gap-ds-03">
                {/* Avatar */}
                <Avatar className="h-ds-xs-plus w-ds-xs-plus shrink-0 mt-ds-01">
                  {author.image && (
                    <AvatarImage src={author.image} alt={author.name} />
                  )}
                  <AvatarFallback
                    className={cn(
                      'text-ds-xs font-semibold',  /* avatar initials — below scale, leave as-is */
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
          })}
        </div>
      ) : (
        <EmptyState
          icon={<IconMessageCircle />}
          title="No comments yet"
          description="Start a conversation about this task"
          compact
        />
      )}

      {/* Comment input */}
      <div className="mt-ds-05 space-y-ds-03">
        {taskVisibility === 'EVERYONE' && !clientMode && (
          <p className="text-ds-xs text-warning-11">
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
            className="w-full resize-none rounded-ds-md border border-surface-border-strong bg-transparent px-ds-04 py-ds-03 text-ds-md text-surface-fg placeholder:text-surface-fg-subtle outline-none focus:border-surface-border"
          />
        )}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handlePost}
            disabled={!editorContent.replace(/<[^>]*>/g, '').trim()}
            className="inline-flex items-center gap-ds-02b rounded-ds-lg bg-accent-9 px-ds-04 py-ds-02b text-ds-sm font-semibold text-accent-fg transition-colors hover:bg-accent-10 disabled:opacity-action-disabled disabled:cursor-not-allowed"
          >
            <IconSend className="h-ico-sm w-ico-sm" stroke={2} />
            Comment
          </button>
        </div>
      </div>
    </div>
  )
},
)

ConversationTab.displayName = 'ConversationTab'

export { ConversationTab }
export type { ConversationTabProps }
