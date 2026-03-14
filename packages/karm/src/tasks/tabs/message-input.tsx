'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
import { IconSend } from '@tabler/icons-react'
import type { CommentAuthorType } from '../task-types'

// ============================================================
// Types
// ============================================================

export interface MessageInputProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSubmit'> {
  onSubmit: (content: string, authorType: CommentAuthorType) => void
  renderEditor?: (props: {
    content: string
    onChange: (c: string) => void
    placeholder: string
  }) => React.ReactNode
  placeholder?: string
  clientMode?: boolean
}

// ============================================================
// MessageInput
// ============================================================

const MessageInput = React.forwardRef<HTMLDivElement, MessageInputProps>(
  function MessageInput({
    onSubmit,
    renderEditor,
    placeholder = 'Write a comment...',
    clientMode = false,
    className,
    ...props
  }, ref) {
    const [editorContent, setEditorContent] = React.useState('')

    const handlePost = () => {
      const trimmed = editorContent.trim()
      // Check that content is not just empty HTML tags
      const textOnly = trimmed.replace(/<[^>]*>/g, '').trim()
      if (!textOnly) return

      onSubmit(trimmed, clientMode ? 'CLIENT' : 'INTERNAL')
      setEditorContent('')
    }

    return (
      <div ref={ref} className={cn('space-y-ds-03', className)} {...props}>
        {renderEditor ? (
          renderEditor({
            content: editorContent,
            onChange: setEditorContent,
            placeholder,
          })
        ) : (
          <textarea
            value={editorContent}
            onChange={(e) => setEditorContent(e.target.value)}
            placeholder={placeholder}
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
    )
  },
)

MessageInput.displayName = 'MessageInput'

export { MessageInput }
