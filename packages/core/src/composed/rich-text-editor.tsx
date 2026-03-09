'use client'

import * as React from 'react'
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
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
  IconUnderline,
  IconHighlight,
  IconBlockquote,
  IconListCheck,
  IconLink,
  IconPhoto,
  IconPaperclip,
  IconLineDashed,
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
  IconMoodSmile,
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
        'inline-flex h-ds-xs-plus w-ds-xs-plus items-center justify-center rounded-ds-md transition-colors',
        'hover:bg-field',
        'disabled:pointer-events-none disabled:opacity-[0.38]',
        isActive
          ? 'bg-field text-interactive'
          : 'text-text-placeholder',
      )}
    >
      {children}
    </button>
  )
}

function LinkButton({ editor }: { editor: Editor }) {
  const [showInput, setShowInput] = React.useState(false)
  const [url, setUrl] = React.useState('')
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleToggle = () => {
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run()
      return
    }
    const previousUrl = editor.getAttributes('link').href || ''
    setUrl(previousUrl)
    setShowInput(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (url.trim()) {
      editor.chain().focus().setLink({ href: url.trim() }).run()
    }
    setShowInput(false)
    setUrl('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowInput(false)
      setUrl('')
      editor.commands.focus()
    }
  }

  return (
    <div className="relative">
      <ToolbarButton onClick={handleToggle} isActive={editor.isActive('link')} title="Link">
        <IconLink className="h-ico-sm w-ico-sm" stroke={2} />
      </ToolbarButton>
      {showInput && (
        <form
          onSubmit={handleSubmit}
          className="absolute left-0 top-full z-popover mt-ds-01 flex items-center gap-ds-02 rounded-ds-md border border-border bg-layer-01 p-ds-02 shadow-02"
        >
          <input
            ref={inputRef}
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="https://..."
            className="h-ds-sm w-[240px] rounded-ds-sm border border-border bg-layer-01 px-ds-03 text-ds-sm text-text-primary focus:border-interactive focus:outline-none"
          />
          <button type="submit" className="h-ds-sm rounded-ds-sm bg-interactive px-ds-03 text-ds-sm text-text-on-color hover:bg-interactive/90">
            Apply
          </button>
        </form>
      )}
    </div>
  )
}

function ToolbarDivider() {
  return <div className="mx-ds-02 h-[16px] w-px bg-border" />
}

function Toolbar({ editor, onImageClick, onFileClick, onEmojiClick }: {
  editor: Editor
  onImageClick?: () => void
  onFileClick?: () => void
  onEmojiClick?: () => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-ds-01 border-b border-border px-ds-04 py-ds-02b">
      {/* Inline formatting */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold">
        <IconBold className="h-ico-sm w-ico-sm" stroke={2.5} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic">
        <IconItalic className="h-ico-sm w-ico-sm" stroke={2.5} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Underline">
        <IconUnderline className="h-ico-sm w-ico-sm" stroke={2.5} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Strikethrough">
        <IconStrikethrough className="h-ico-sm w-ico-sm" stroke={2.5} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight().run()} isActive={editor.isActive('highlight')} title="Highlight">
        <IconHighlight className="h-ico-sm w-ico-sm" stroke={2.5} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Block formatting */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="Heading 2">
        <IconH2 className="h-ico-sm w-ico-sm" stroke={2.5} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} title="Heading 3">
        <IconH3 className="h-ico-sm w-ico-sm" stroke={2.5} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Blockquote">
        <IconBlockquote className="h-ico-sm w-ico-sm" stroke={2.5} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Lists */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet list">
        <IconList className="h-ico-sm w-ico-sm" stroke={2.5} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Ordered list">
        <IconListNumbers className="h-ico-sm w-ico-sm" stroke={2.5} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleTaskList().run()} isActive={editor.isActive('taskList')} title="Task list">
        <IconListCheck className="h-ico-sm w-ico-sm" stroke={2.5} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')} title="Code block">
        <IconCode className="h-ico-sm w-ico-sm" stroke={2.5} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Media & Links */}
      <LinkButton editor={editor} />
      {onImageClick && (
        <ToolbarButton onClick={onImageClick} title="Insert image">
          <IconPhoto className="h-ico-sm w-ico-sm" stroke={2} />
        </ToolbarButton>
      )}
      {onFileClick && (
        <ToolbarButton onClick={onFileClick} title="Attach file">
          <IconPaperclip className="h-ico-sm w-ico-sm" stroke={2} />
        </ToolbarButton>
      )}
      <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal rule">
        <IconLineDashed className="h-ico-sm w-ico-sm" stroke={2} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Alignment */}
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Align left">
        <IconAlignLeft className="h-ico-sm w-ico-sm" stroke={2} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Align center">
        <IconAlignCenter className="h-ico-sm w-ico-sm" stroke={2} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Align right">
        <IconAlignRight className="h-ico-sm w-ico-sm" stroke={2} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Emoji */}
      {onEmojiClick && (
        <ToolbarButton onClick={onEmojiClick} title="Emoji">
          <IconMoodSmile className="h-ico-sm w-ico-sm" stroke={2} />
        </ToolbarButton>
      )}

      {/* History */}
      <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
        <IconArrowBackUp className="h-ico-sm w-ico-sm" stroke={2} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
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
      Underline,
      Highlight.configure({ multicolor: false }),
      TaskList,
      TaskItem.configure({ nested: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
        },
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
          '[&_h3]:text-ds-base [&_h3]:font-semibold [&_h3]:mb-ds-02b [&_h3]:mt-ds-04 [&_h3]:text-text-primary',
          '[&_p]:mb-ds-02b [&_p]:text-text-secondary',
          '[&_ul]:ml-ds-05 [&_ul]:list-disc [&_ol]:ml-ds-05 [&_ol]:list-decimal',
          '[&_li]:text-text-secondary',
          '[&_code]:rounded [&_code]:bg-layer-02 [&_code]:px-ds-02b [&_code]:py-ds-01 [&_code]:text-ds-md [&_code]:text-interactive',
          '[&_pre]:rounded-ds-lg [&_pre]:bg-layer-02 [&_pre]:p-ds-04',
          '[&_strong]:font-semibold [&_strong]:text-text-primary',
          '[&_blockquote]:border-l-[3px] [&_blockquote]:border-interactive/30 [&_blockquote]:pl-ds-04 [&_blockquote]:italic [&_blockquote]:text-text-placeholder',
          '[&_mark]:rounded-sm [&_mark]:bg-warning/20 [&_mark]:px-[2px]',
          '[&_ul[data-type="taskList"]]:ml-0 [&_ul[data-type="taskList"]]:list-none [&_li[data-type="taskItem"]]:flex [&_li[data-type="taskItem"]]:items-start [&_li[data-type="taskItem"]]:gap-ds-02',
          '[&_hr]:my-ds-04 [&_hr]:border-border',
          '[&_a]:text-interactive [&_a]:underline [&_a]:decoration-interactive/40 hover:[&_a]:decoration-interactive',
        ),
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange?.(ed.getHTML())
    },
  })

  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, false)
    }
  }, [editor, content])

  if (!editor) return null

  return (
    <div
      ref={ref}
      className={cn(
        'overflow-hidden rounded-ds-lg border border-border bg-layer-01',
        'transition-colors focus-within:border-border-strong',
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
      Underline,
      Highlight.configure({ multicolor: false }),
      TaskList,
      TaskItem.configure({ nested: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
        },
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
          '[&_h3]:text-ds-base [&_h3]:font-semibold [&_h3]:mb-ds-02b [&_h3]:mt-ds-04 [&_h3]:text-text-primary',
          '[&_p]:mb-ds-02b [&_p]:text-text-secondary',
          '[&_ul]:ml-ds-05 [&_ul]:list-disc [&_ol]:ml-ds-05 [&_ol]:list-decimal',
          '[&_li]:text-text-secondary',
          '[&_code]:rounded [&_code]:bg-layer-02 [&_code]:px-ds-02b [&_code]:py-ds-01 [&_code]:text-ds-md [&_code]:text-interactive',
          '[&_pre]:rounded-ds-lg [&_pre]:bg-layer-02 [&_pre]:p-ds-04',
          '[&_strong]:font-semibold [&_strong]:text-text-primary',
          '[&_blockquote]:border-l-[3px] [&_blockquote]:border-interactive/30 [&_blockquote]:pl-ds-04 [&_blockquote]:italic [&_blockquote]:text-text-placeholder',
          '[&_mark]:rounded-sm [&_mark]:bg-warning/20 [&_mark]:px-[2px]',
          '[&_ul[data-type="taskList"]]:ml-0 [&_ul[data-type="taskList"]]:list-none [&_li[data-type="taskItem"]]:flex [&_li[data-type="taskItem"]]:items-start [&_li[data-type="taskItem"]]:gap-ds-02',
          '[&_hr]:my-ds-04 [&_hr]:border-border',
          '[&_a]:text-interactive [&_a]:underline [&_a]:decoration-interactive/40 hover:[&_a]:decoration-interactive',
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
