'use client'

import * as React from 'react'
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { cn } from '../ui/lib/utils'
import {
  IconBold,
  IconItalic,
  IconStrikethrough,
  IconH2,
  IconH3,
  IconList,
  IconListNumbers,
  IconCode,
  IconArrowBackUp,
  IconArrowForwardUp,
} from '@tabler/icons-react'

interface ToolbarButtonProps {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}

function ToolbarButton({
  onClick,
  isActive = false,
  disabled = false,
  title,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'inline-flex h-7 w-7 items-center justify-center rounded-ds-md transition-colors',
        'hover:bg-field',
        'disabled:pointer-events-none disabled:opacity-50',
        isActive
          ? 'bg-field text-interactive'
          : 'text-text-placeholder',
      )}
    >
      {children}
    </button>
  )
}

function Toolbar({ editor }: { editor: Editor }) {
  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border px-ds-04 py-ds-02b">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        title="Bold"
      >
        <IconBold className="h-ico-sm w-ico-sm" stroke={2.5} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        title="Italic"
      >
        <IconItalic className="h-ico-sm w-ico-sm" stroke={2.5} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
        title="Strikethrough"
      >
        <IconStrikethrough className="h-ico-sm w-ico-sm" stroke={2.5} />
      </ToolbarButton>

      <div className="mx-ds-02 h-4 w-px bg-border" />

      <ToolbarButton
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
        isActive={editor.isActive('heading', { level: 2 })}
        title="Heading 2"
      >
        <IconH2 className="h-ico-sm w-ico-sm" stroke={2.5} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        }
        isActive={editor.isActive('heading', { level: 3 })}
        title="Heading 3"
      >
        <IconH3 className="h-ico-sm w-ico-sm" stroke={2.5} />
      </ToolbarButton>

      <div className="mx-ds-02 h-4 w-px bg-border" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        title="Bullet list"
      >
        <IconList className="h-ico-sm w-ico-sm" stroke={2.5} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        title="Ordered list"
      >
        <IconListNumbers className="h-ico-sm w-ico-sm" stroke={2.5} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive('codeBlock')}
        title="Code block"
      >
        <IconCode className="h-ico-sm w-ico-sm" stroke={2.5} />
      </ToolbarButton>

      <div className="mx-ds-02 h-4 w-px bg-border" />

      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo"
      >
        <IconArrowBackUp className="h-ico-sm w-ico-sm" stroke={2} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo"
      >
        <IconArrowForwardUp className="h-ico-sm w-ico-sm" stroke={2} />
      </ToolbarButton>
    </div>
  )
}

export interface RichTextEditorProps {
  content?: string
  placeholder?: string
  onChange?: (html: string) => void
  className?: string
  editable?: boolean
}

const RichTextEditor = React.forwardRef<HTMLDivElement, RichTextEditorProps>(
  function RichTextEditor({
  content = '',
  placeholder = 'Start writing...',
  onChange,
  className,
  editable = true,
}, ref) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass:
          'before:content-[attr(data-placeholder)] before:text-text-placeholder before:float-left before:h-0 before:pointer-events-none',
      }),
    ],
    content,
    editable,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm max-w-none focus:outline-none',
          'min-h-[120px] px-ds-04 py-ds-04',
          'font-body text-ds-md leading-relaxed text-text-primary',
          '[&_h2]:text-ds-xl [&_h2]:mb-ds-03 [&_h2]:mt-ds-05 [&_h2]:text-text-primary',
          '[&_h3]:text-ds-base [&_h3]:semibold [&_h3]:mb-ds-02b [&_h3]:mt-ds-04 [&_h3]:text-text-primary',
          '[&_p]:mb-ds-02b [&_p]:text-text-secondary',
          '[&_ul]:ml-ds-05 [&_ul]:list-disc [&_ol]:ml-ds-05 [&_ol]:list-decimal',
          '[&_li]:text-text-secondary',
          '[&_code]:rounded [&_code]:bg-layer-02 [&_code]:px-ds-02b [&_code]:py-0.5 [&_code]:text-ds-md [&_code]:text-interactive',
          '[&_pre]:rounded-ds-lg [&_pre]:bg-layer-02 [&_pre]:p-ds-04',
          '[&_strong]:font-semibold [&_strong]:text-text-primary',
        ),
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange?.(ed.getHTML())
    },
  })

  if (!editor) return null

  return (
    <div
      ref={ref}
      className={cn(
        'overflow-hidden rounded-ds-lg border border-border bg-layer-01',
        'transition-colors focus-within:border-[var(--border-secondary)]',
        className,
      )}
    >
      {editable && <Toolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  )
},
)

RichTextEditor.displayName = 'RichTextEditor'

export interface RichTextViewerProps {
  content: string
  className?: string
}

const RichTextViewer = React.forwardRef<HTMLDivElement, RichTextViewerProps>(
  function RichTextViewer({ content, className }, ref) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
    ],
    content,
    editable: false,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm max-w-none',
          'font-body text-ds-md leading-relaxed text-text-primary',
          '[&_h2]:text-ds-xl [&_h2]:mb-ds-03 [&_h2]:mt-ds-05 [&_h2]:text-text-primary',
          '[&_h3]:text-ds-base [&_h3]:semibold [&_h3]:mb-ds-02b [&_h3]:mt-ds-04 [&_h3]:text-text-primary',
          '[&_p]:mb-ds-02b [&_p]:text-text-secondary',
          '[&_ul]:ml-ds-05 [&_ul]:list-disc [&_ol]:ml-ds-05 [&_ol]:list-decimal',
          '[&_li]:text-text-secondary',
          '[&_code]:rounded [&_code]:bg-layer-02 [&_code]:px-ds-02b [&_code]:py-0.5 [&_code]:text-ds-md [&_code]:text-interactive',
          '[&_pre]:rounded-ds-lg [&_pre]:bg-layer-02 [&_pre]:p-ds-04',
          '[&_strong]:font-semibold [&_strong]:text-text-primary',
        ),
      },
    },
  })

  if (!editor) return null

  return (
    <div ref={ref} className={className}>
      <EditorContent editor={editor} />
    </div>
  )
},
)

RichTextViewer.displayName = 'RichTextViewer'

export { RichTextEditor, RichTextViewer }
