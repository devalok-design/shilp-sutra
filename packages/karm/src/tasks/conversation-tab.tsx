'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
import { EmptyState } from '@/composed/empty-state'
import {
  RichTextEditor,
  RichTextViewer,
} from '@/composed/rich-text-editor'
import { IconMessageCircle } from '@tabler/icons-react'
import {
  MessageList,
  MessageBubble,
  MessageInput,
  VisibilityWarning,
} from './tabs'

import type { Comment } from './task-types'
export type { Comment }

// ============================================================
// Types
// ============================================================

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

  return (
    <div ref={ref} className={cn('flex flex-col', className)} {...props}>
      {/* Comments list */}
      {comments.length > 0 ? (
        <MessageList>
          {comments.map((comment) => (
            <MessageBubble
              key={comment.id}
              comment={comment}
              clientMode={clientMode}
              renderViewer={renderViewer}
            />
          ))}
        </MessageList>
      ) : (
        <EmptyState
          icon={<IconMessageCircle />}
          title="No comments yet"
          description="Start a conversation about this task"
          compact
        />
      )}

      {/* Comment input */}
      <div className="mt-ds-05">
        {taskVisibility === 'EVERYONE' && !clientMode && (
          <VisibilityWarning className="mb-ds-03" />
        )}
        <MessageInput
          onSubmit={onPostComment}
          renderEditor={renderEditor}
          clientMode={clientMode}
        />
      </div>
    </div>
  )
},
)

ConversationTab.displayName = 'ConversationTab'

export { ConversationTab }
export type { ConversationTabProps }
