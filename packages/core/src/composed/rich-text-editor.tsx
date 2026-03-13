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
import Image from '@tiptap/extension-image'
import Mention from '@tiptap/extension-mention'
import { FileAttachment } from './extensions/file-attachment'
import { createSuggestionRenderer } from './extensions/mention-suggestion'
import { EmojiSuggestion } from './extensions/emoji-suggestion'
import { useColorMode } from '../hooks/use-color-mode'
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

const PROSE_CLASSES = [
  'prose prose-sm max-w-none',
  'font-body text-ds-md leading-relaxed text-surface-fg',
  '[&_h2]:text-ds-xl [&_h2]:mb-ds-03 [&_h2]:mt-ds-05 [&_h2]:text-surface-fg',
  '[&_h3]:text-ds-base [&_h3]:font-semibold [&_h3]:mb-ds-02b [&_h3]:mt-ds-04 [&_h3]:text-surface-fg',
  '[&_p]:mb-ds-02b [&_p]:text-surface-fg-muted',
  '[&_ul]:ml-ds-05 [&_ul]:list-disc [&_ol]:ml-ds-05 [&_ol]:list-decimal',
  '[&_li]:text-surface-fg-muted',
  '[&_code]:rounded [&_code]:bg-surface-2 [&_code]:px-ds-02b [&_code]:py-ds-01 [&_code]:text-ds-md [&_code]:text-interactive',
  '[&_pre]:rounded-ds-lg [&_pre]:bg-surface-2 [&_pre]:p-ds-04',
  '[&_strong]:font-semibold [&_strong]:text-surface-fg',
  '[&_blockquote]:border-l-[3px] [&_blockquote]:border-accent-7/30 [&_blockquote]:pl-ds-04 [&_blockquote]:italic [&_blockquote]:text-surface-fg-subtle',
  '[&_mark]:rounded-sm [&_mark]:bg-warning/20 [&_mark]:px-[2px]',
  '[&_ul[data-type="taskList"]]:ml-0 [&_ul[data-type="taskList"]]:list-none [&_li[data-type="taskItem"]]:flex [&_li[data-type="taskItem"]]:items-start [&_li[data-type="taskItem"]]:gap-ds-02',
  '[&_hr]:my-ds-04 [&_hr]:border-surface-border-strong',
  '[&_a]:text-interactive [&_a]:underline [&_a]:decoration-interactive/40 hover:[&_a]:decoration-interactive',
  '[&_img]:max-w-full [&_img]:rounded-ds-md [&_img]:my-ds-03',
  '[&_.mention]:rounded-ds-sm [&_.mention]:bg-accent-9/10 [&_.mention]:px-ds-02 [&_.mention]:py-[1px] [&_.mention]:font-medium [&_.mention]:text-interactive',
] as const

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
      aria-pressed={isActive}
      className={cn(
        'inline-flex h-ds-xs-plus w-ds-xs-plus items-center justify-center rounded-ds-md transition-colors',
        'hover:bg-surface-3',
        'disabled:pointer-events-none disabled:opacity-[0.38]',
        isActive
          ? 'bg-surface-3 text-interactive'
          : 'text-surface-fg-subtle',
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
          aria-label="Edit link URL"
          className="absolute left-0 top-full z-popover mt-ds-01 flex items-center gap-ds-02 rounded-ds-md border border-surface-border-strong bg-surface-1 p-ds-02 shadow-02"
        >
          <input
            ref={inputRef}
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="https://..."
            className="h-ds-sm w-[240px] rounded-ds-sm border border-surface-border-strong bg-surface-1 px-ds-03 text-ds-sm text-surface-fg focus:border-accent-7 focus:outline-none"
          />
          <button type="submit" className="h-ds-sm rounded-ds-sm bg-accent-9 px-ds-03 text-ds-sm text-accent-fg hover:bg-accent-9/90">
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
    <div className="flex flex-wrap items-center gap-ds-01 border-b border-surface-border-strong px-ds-04 py-ds-02b">
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

const LazyPicker = React.lazy(() => import('@emoji-mart/react'))

function EmojiPickerLazy({ onSelect }: { onSelect: (native: string) => void }) {
  const [data, setData] = React.useState<unknown>(null)
  const { colorMode } = useColorMode()

  React.useEffect(() => {
    import('@emoji-mart/data').then((mod) => setData(mod.default))
  }, [])

  const fallback = <div className="flex h-[350px] w-[352px] items-center justify-center rounded-ds-lg border border-surface-border-strong bg-surface-1 shadow-02"><span className="text-ds-sm text-surface-fg-subtle">Loading...</span></div>

  if (!data) return fallback

  return (
    <React.Suspense fallback={fallback}>
      <LazyPicker
        data={data}
        onEmojiSelect={(emoji: { native: string }) => onSelect(emoji.native)}
        theme={colorMode === 'dark' ? 'dark' : 'light'}
        previewPosition="none"
        skinTonePosition="none"
      />
    </React.Suspense>
  )
}

export interface MentionItem {
  id: string
  label: string
  avatar?: string
}

export interface RichTextEditorProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'onChange' | 'content'> {
  content?: string
  placeholder?: string
  onChange?: (html: string) => void
  className?: string
  editable?: boolean
  /** Called when an image is pasted/dropped. Return a URL. If not provided, images inline as base64. */
  onImageUpload?: (file: File) => Promise<string>
  /** Called when a non-image file is dropped/pasted. If not provided, non-image files are ignored. */
  onFileUpload?: (file: File) => Promise<{ url: string; name: string; size: number }>
  /** Static list of mentionable items */
  mentions?: MentionItem[]
  /** Async mention search. Takes precedence over static list. */
  onMentionSearch?: (query: string) => Promise<MentionItem[]>
  /** Called when a mention is selected */
  onMentionSelect?: (item: MentionItem) => void
}

const RichTextEditor = React.forwardRef<HTMLDivElement, RichTextEditorProps>(
  function RichTextEditor({
  content = '',
  placeholder = 'Start writing...',
  onChange,
  className,
  editable = true,
  onImageUpload,
  onFileUpload,
  mentions,
  onMentionSearch,
  onMentionSelect: _onMentionSelect,
  ...props
}, ref) {
  const editorRef = React.useRef<ReturnType<typeof useEditor>>(null)
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false)
  const emojiPickerRef = React.useRef<HTMLDivElement>(null)
  const imageInputRef = React.useRef<HTMLInputElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleImageInsert = async (file: File) => {
    const ed = editorRef.current
    if (!ed) return
    if (onImageUpload) {
      const url = await onImageUpload(file)
      if (url && /^https?:\/\//i.test(url)) {
        ed.chain().focus().setImage({ src: url }).run()
      }
    } else {
      const reader = new FileReader()
      reader.onload = () => {
        ed.chain().focus().setImage({ src: reader.result as string }).run()
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFileInsert = async (file: File) => {
    const ed = editorRef.current
    if (!ed || !onFileUpload) return
    const result = await onFileUpload(file)
    ed.chain().focus().insertContent({
      type: 'fileAttachment',
      attrs: { url: result.url, name: result.name, size: result.size },
    }).run()
  }

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass:
          'before:content-[attr(data-placeholder)] before:text-surface-fg-subtle before:float-left before:h-0 before:pointer-events-none',
      }),
      Underline,
      Highlight.configure({ multicolor: false }),
      TaskList,
      TaskItem.configure({ nested: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({
        openOnClick: false,
        protocols: ['http', 'https', 'mailto'],
        validate: (href: string) => /^(https?:\/\/|mailto:)/i.test(href),
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'max-w-full rounded-ds-md',
        },
      }),
      FileAttachment,
      ...(mentions || onMentionSearch ? [
        Mention.configure({
          HTMLAttributes: { class: 'mention' },
          suggestion: {
            items: async ({ query }: { query: string }) => {
              if (onMentionSearch) return await onMentionSearch(query)
              if (mentions) return mentions.filter(m => m.label.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
              return []
            },
            render: createSuggestionRenderer(),
          },
        }),
      ] : []),
      EmojiSuggestion,
    ],
    content,
    editable,
    editorProps: {
      handleDrop: (_view, event, _slice, moved) => {
        if (moved || !event.dataTransfer?.files.length) return false
        const file = event.dataTransfer.files[0]
        if (!file) return false
        if (file.type.startsWith('image/')) {
          handleImageInsert(file)
          return true
        }
        if (onFileUpload) {
          handleFileInsert(file)
          return true
        }
        return false
      },
      handlePaste: (_view, event) => {
        const file = event.clipboardData?.files[0]
        if (!file) return false
        if (file.type.startsWith('image/')) {
          handleImageInsert(file)
          return true
        }
        if (onFileUpload) {
          handleFileInsert(file)
          return true
        }
        return false
      },
      attributes: {
        class: cn(
          ...PROSE_CLASSES,
          'focus:outline-none',
          'min-h-[120px] px-ds-04 py-ds-04',
        ),
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange?.(ed.getHTML())
    },
  })

  React.useEffect(() => {
    editorRef.current = editor
  }, [editor])

  // Close emoji picker on click outside
  React.useEffect(() => {
    if (!showEmojiPicker) return
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showEmojiPicker])

  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, false)
    }
  }, [editor, content])

  if (!editor) return null

  return (
    <div ref={ref} {...props} className={cn('relative', className)}>
      {/* Emoji picker rendered outside the overflow-hidden box so it isn't clipped */}
      {showEmojiPicker && (
        <div
          ref={emojiPickerRef}
          className="absolute bottom-full right-0 z-popover mb-ds-02"
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.stopPropagation()
              setShowEmojiPicker(false)
            }
          }}
        >
          <EmojiPickerLazy
            onSelect={(native: string) => {
              editor.chain().focus().insertContent(native).run()
              setShowEmojiPicker(false)
            }}
          />
        </div>
      )}
      <div
        className={cn(
          'overflow-hidden rounded-ds-lg border border-surface-border-strong bg-surface-1',
          'transition-colors focus-within:border-surface-border-strong',
        )}
      >
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          aria-label="Upload image"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleImageInsert(file)
            e.target.value = ''
          }}
        />
        {onFileUpload && (
          <input
            ref={fileInputRef}
            type="file"
            aria-label="Upload file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFileInsert(file)
              e.target.value = ''
            }}
          />
        )}
        {editable && (
          <Toolbar
            editor={editor}
            onImageClick={() => imageInputRef.current?.click()}
            onFileClick={onFileUpload ? () => fileInputRef.current?.click() : undefined}
            onEmojiClick={() => setShowEmojiPicker((prev) => !prev)}
          />
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  )
},
)

RichTextEditor.displayName = 'RichTextEditor'

export interface RichTextViewerProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'content'> {
  content: string
  className?: string
}

const RichTextViewer = React.forwardRef<HTMLDivElement, RichTextViewerProps>(
  function RichTextViewer({ content, className, ...props }, ref) {
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
        protocols: ['http', 'https', 'mailto'],
        validate: (href: string) => /^(https?:\/\/|mailto:)/i.test(href),
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'max-w-full rounded-ds-md',
        },
      }),
      FileAttachment,
      Mention.configure({
        HTMLAttributes: { class: 'mention' },
      }),
    ],
    content,
    editable: false,
    editorProps: {
      attributes: {
        class: cn(...PROSE_CLASSES),
      },
    },
  })

  if (!editor) return null

  return (
    <div ref={ref} {...props} className={className}>
      <EditorContent editor={editor} />
    </div>
  )
},
)

RichTextViewer.displayName = 'RichTextViewer'

export { RichTextEditor, RichTextViewer }
