'use client'

import {
  IconAlignCenter,
  IconAlignLeft,
  IconAlignRight,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconBlockquote,
  IconBold,
  IconCode,
  IconEye,
  IconH2,
  IconH3,
  IconHighlight,
  IconItalic,
  IconLineDashed,
  IconLink,
  IconList,
  IconListCheck,
  IconListNumbers,
  IconMoodSmile,
  IconPaperclip,
  IconPhoto,
  IconStrikethrough,
  IconUnderline,
} from '@tabler/icons-react'
import Highlight from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'
import { ListKit } from '@tiptap/extension-list'
import Mention from '@tiptap/extension-mention'
import TextAlign from '@tiptap/extension-text-align'
import { Placeholder } from '@tiptap/extensions'
import { Markdown } from '@tiptap/markdown'
import { type Editor,EditorContent, useEditor, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import * as React from 'react'

import { Button } from '../ui/button'
import { Icon } from '../ui/icon'
import { MENTION_TOKEN_CLASS } from '../ui/lib/mention'
import { cn } from '../ui/lib/utils'
import type { EmojiData, EmojiSet } from './emoji-picker'
import { EmojiNode } from './extensions/emoji-node'
import { createEmojiSuggestion } from './extensions/emoji-suggestion'
import { FileAttachment } from './extensions/file-attachment'
import { createSuggestionRenderer } from './extensions/mention-suggestion'

const PROSE_CLASSES = [
  'prose prose-sm max-w-none',
  'font-body text-body-md leading-relaxed text-surface-fg',
  '[&_h2]:text-heading-sm [&_h2]:mb-ds-03 [&_h2]:mt-ds-05 [&_h2]:text-surface-fg',
  '[&_h3]:text-body-lg [&_h3]:font-semibold [&_h3]:mb-ds-02b [&_h3]:mt-ds-04 [&_h3]:text-surface-fg',
  '[&_p]:mb-ds-02b [&_p]:text-surface-fg-muted',
  '[&_ul]:ml-ds-05 [&_ul]:list-disc [&_ol]:ml-ds-05 [&_ol]:list-decimal',
  '[&_li]:text-surface-fg-muted',
  '[&_code]:rounded [&_code]:bg-surface-panel [&_code]:px-ds-02b [&_code]:py-ds-01 [&_code]:text-body-md [&_code]:text-accent-11',
  '[&_pre]:rounded-surface [&_pre]:bg-surface-panel [&_pre]:p-ds-04',
  '[&_strong]:font-semibold [&_strong]:text-surface-fg',
  // slop-allow: side-stripe — blockquote left-rule is standard typography, not a card accent-rail
  '[&_blockquote]:border-l-[3px] [&_blockquote]:border-accent-6 [&_blockquote]:pl-ds-04 [&_blockquote]:italic [&_blockquote]:text-surface-fg-subtle',
  '[&_mark]:rounded-xs [&_mark]:bg-warning-3 [&_mark]:px-[2px]',
  '[&_ul[data-type="taskList"]]:ml-0 [&_ul[data-type="taskList"]]:list-none [&_li[data-type="taskItem"]]:flex [&_li[data-type="taskItem"]]:items-start [&_li[data-type="taskItem"]]:gap-ds-02',
  '[&_hr]:my-ds-04 [&_hr]:border-surface-border-strong',
  '[&_a]:text-accent-11 [&_a]:underline [&_a]:decoration-accent-6 hover:[&_a]:decoration-accent-11',
  '[&_img]:max-w-full [&_img]:rounded-control [&_img]:my-ds-03',
  MENTION_TOKEN_CLASS,
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
      aria-label={title}
      aria-pressed={isActive}
      className={cn(
        'inline-flex h-ds-xs-plus w-ds-xs-plus items-center justify-center rounded-control transition-colors duration-fast-01 ease-productive-standard',
        'hover:bg-surface-panel-hover',
        'disabled:pointer-events-none disabled:opacity-action-disabled',
        isActive
          ? 'bg-surface-panel-hover text-accent-11'
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
  const { isLink } = useEditorState({
    editor,
    selector: ({ editor: e }) => ({ isLink: e.isActive('link') }),
  })

  const handleToggle = () => {
    if (isLink) {
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
      <ToolbarButton onClick={handleToggle} isActive={isLink} title="Link">
        <Icon icon={IconLink} size="sm" />
      </ToolbarButton>
      {showInput && (
        <form
          onSubmit={handleSubmit}
          aria-label="Edit link URL"
          className="absolute left-0 top-full z-popover mt-ds-01 flex items-center gap-ds-02 rounded-control bg-surface-overlay p-ds-02 shadow-raised-hover"
        >
          <input
            ref={inputRef}
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="https://..."
            className="h-ds-sm w-[240px] rounded-control-inner border border-surface-border-strong bg-surface-overlay px-ds-03 text-body-sm text-surface-fg focus:border-accent-7 focus:outline-hidden"
          />
          <Button type="submit" variant="solid" size="sm">
            Apply
          </Button>
        </form>
      )}
    </div>
  )
}

function ToolbarDivider() {
  return <div className="mx-ds-02 h-ds-05 w-px bg-surface-border" />
}

function Toolbar({ editor, toolbar, onImageClick, onFileClick, onEmojiClick, trailing, showControls = true }: {
  editor: Editor
  toolbar?: ToolbarItem[]
  onImageClick?: () => void
  onFileClick?: () => void
  onEmojiClick?: () => void
  /** Right-aligned content (e.g. a source-view toggle). */
  trailing?: React.ReactNode
  /** Hide the formatting controls, keeping only `trailing`. @default true */
  showControls?: boolean
}) {
  // v3: useEditorState subscribes to specific state slices so the toolbar
  // re-renders only when active-state or can-undo/redo actually changes.
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      isBold: e.isActive('bold'),
      isItalic: e.isActive('italic'),
      isUnderline: e.isActive('underline'),
      isStrike: e.isActive('strike'),
      isHighlight: e.isActive('highlight'),
      isH2: e.isActive('heading', { level: 2 }),
      isH3: e.isActive('heading', { level: 3 }),
      isBlockquote: e.isActive('blockquote'),
      isBulletList: e.isActive('bulletList'),
      isOrderedList: e.isActive('orderedList'),
      isTaskList: e.isActive('taskList'),
      isCodeBlock: e.isActive('codeBlock'),
      isLink: e.isActive('link'),
      isAlignLeft: e.isActive({ textAlign: 'left' }),
      isAlignCenter: e.isActive({ textAlign: 'center' }),
      isAlignRight: e.isActive({ textAlign: 'right' }),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  })

  const show = (item: ToolbarItem) => !toolbar || toolbar.includes(item)

  // Each group is an array of ToolbarItem names that belong to it.
  // A divider renders between two adjacent groups only if both have at least one visible item.
  const hasInline = show('bold') || show('italic') || show('underline') || show('strike') || show('highlight')
  const hasBlock = show('h2') || show('h3') || show('blockquote')
  const hasList = show('bulletList') || show('orderedList') || show('taskList') || show('codeBlock')
  const hasMedia = show('link') || (!!onImageClick && show('image')) || (!!onFileClick && show('file')) || show('hr')
  const hasAlign = show('alignLeft') || show('alignCenter') || show('alignRight')
  const hasEmojiGroup = !!onEmojiClick && show('emoji')
  const hasHistory = show('undo') || show('redo')

  return (
    <div role="toolbar" aria-label="Text formatting" className="flex min-h-[2.75rem] flex-wrap items-center gap-ds-01 border-b border-surface-border-strong px-ds-04 py-ds-02b">
      {showControls && (<>
      {/* Inline formatting */}
      {show('bold') && (
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={state.isBold} title="Bold">
          <Icon icon={IconBold} size="sm" stroke="bold" />
        </ToolbarButton>
      )}
      {show('italic') && (
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={state.isItalic} title="Italic">
          <Icon icon={IconItalic} size="sm" stroke="bold" />
        </ToolbarButton>
      )}
      {show('underline') && (
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={state.isUnderline} title="Underline">
          <Icon icon={IconUnderline} size="sm" stroke="bold" />
        </ToolbarButton>
      )}
      {show('strike') && (
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={state.isStrike} title="Strikethrough">
          <Icon icon={IconStrikethrough} size="sm" stroke="bold" />
        </ToolbarButton>
      )}
      {show('highlight') && (
        <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight().run()} isActive={state.isHighlight} title="Highlight">
          <Icon icon={IconHighlight} size="sm" stroke="bold" />
        </ToolbarButton>
      )}

      {hasInline && hasBlock && <ToolbarDivider />}

      {/* Block formatting */}
      {show('h2') && (
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={state.isH2} title="Heading 2">
          <Icon icon={IconH2} size="sm" stroke="bold" />
        </ToolbarButton>
      )}
      {show('h3') && (
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={state.isH3} title="Heading 3">
          <Icon icon={IconH3} size="sm" stroke="bold" />
        </ToolbarButton>
      )}
      {show('blockquote') && (
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={state.isBlockquote} title="Blockquote">
          <Icon icon={IconBlockquote} size="sm" stroke="bold" />
        </ToolbarButton>
      )}

      {hasBlock && hasList && <ToolbarDivider />}

      {/* Lists */}
      {show('bulletList') && (
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={state.isBulletList} title="Bullet list">
          <Icon icon={IconList} size="sm" stroke="bold" />
        </ToolbarButton>
      )}
      {show('orderedList') && (
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={state.isOrderedList} title="Ordered list">
          <Icon icon={IconListNumbers} size="sm" stroke="bold" />
        </ToolbarButton>
      )}
      {show('taskList') && (
        <ToolbarButton onClick={() => editor.chain().focus().toggleTaskList().run()} isActive={state.isTaskList} title="Task list">
          <Icon icon={IconListCheck} size="sm" stroke="bold" />
        </ToolbarButton>
      )}
      {show('codeBlock') && (
        <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={state.isCodeBlock} title="Code block">
          <Icon icon={IconCode} size="sm" stroke="bold" />
        </ToolbarButton>
      )}

      {hasList && hasMedia && <ToolbarDivider />}

      {/* Media & Links */}
      {show('link') && <LinkButton editor={editor} />}
      {onImageClick && show('image') && (
        <ToolbarButton onClick={onImageClick} title="Insert image">
          <Icon icon={IconPhoto} size="sm" />
        </ToolbarButton>
      )}
      {onFileClick && show('file') && (
        <ToolbarButton onClick={onFileClick} title="Attach file">
          <Icon icon={IconPaperclip} size="sm" />
        </ToolbarButton>
      )}
      {show('hr') && (
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal rule">
          <Icon icon={IconLineDashed} size="sm" />
        </ToolbarButton>
      )}

      {hasMedia && hasAlign && <ToolbarDivider />}

      {/* Alignment */}
      {show('alignLeft') && (
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={state.isAlignLeft} title="Align left">
          <Icon icon={IconAlignLeft} size="sm" />
        </ToolbarButton>
      )}
      {show('alignCenter') && (
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={state.isAlignCenter} title="Align center">
          <Icon icon={IconAlignCenter} size="sm" />
        </ToolbarButton>
      )}
      {show('alignRight') && (
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={state.isAlignRight} title="Align right">
          <Icon icon={IconAlignRight} size="sm" />
        </ToolbarButton>
      )}

      {hasAlign && (hasEmojiGroup || hasHistory) && <ToolbarDivider />}

      {/* Emoji */}
      {onEmojiClick && show('emoji') && (
        <ToolbarButton onClick={onEmojiClick} title="Emoji">
          <Icon icon={IconMoodSmile} size="sm" />
        </ToolbarButton>
      )}

      {/* History */}
      {show('undo') && (
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!state.canUndo} title="Undo">
          <Icon icon={IconArrowBackUp} size="sm" />
        </ToolbarButton>
      )}
      {show('redo') && (
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!state.canRedo} title="Redo">
          <Icon icon={IconArrowForwardUp} size="sm" />
        </ToolbarButton>
      )}
      </>)}
      {trailing && <div className="ml-auto flex items-center pl-ds-02">{trailing}</div>}
    </div>
  )
}

const LazyPicker = React.lazy(() =>
  import('./emoji-picker').then((m) => ({ default: m.EmojiPicker })),
)

function EmojiPickerLazy({ onSelect }: { onSelect: (emoji: EmojiData) => void }) {
  const fallback = <div className="flex h-[435px] w-[352px] items-center justify-center rounded-surface bg-surface-overlay shadow-raised-hover"><span className="text-body-sm text-surface-fg-subtle">Loading…</span></div>

  return (
    <React.Suspense fallback={fallback}>
      <LazyPicker onSelect={onSelect} />
    </React.Suspense>
  )
}

export type ToolbarItem =
  | 'bold' | 'italic' | 'underline' | 'strike' | 'highlight'
  | 'h2' | 'h3' | 'blockquote'
  | 'bulletList' | 'orderedList' | 'taskList' | 'codeBlock'
  | 'link' | 'image' | 'file' | 'hr'
  | 'alignLeft' | 'alignCenter' | 'alignRight'
  | 'emoji' | 'undo' | 'redo'

export interface MentionItem {
  id: string
  label: string
  avatar?: string
}

/**
 * A Tiptap-powered rich text editor with a configurable toolbar, @mentions,
 * emoji suggestions, file/image uploads, and task lists.
 *
 * Emits HTML by default, or Markdown when `format="markdown"`. NOTE: the HTML
 * output is the editor's raw HTML and is NOT sanitized — do not render it as
 * untrusted content without sanitizing it first. Storing Markdown (and
 * rendering via MarkdownViewer) sidesteps that risk entirely.
 */
export interface RichTextEditorProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'onChange' | 'content'> {
  /** Content format read and emitted. `markdown` for Markdown in/out; `html` uses HTML. @default 'html' */
  format?: 'html' | 'markdown'
  /** Initial content, interpreted per `format`. Updates are NOT reactive — use `onChange` for controlled state. */
  content?: string
  placeholder?: string
  /** Called with the editor content (HTML, or Markdown when `format="markdown"`) whenever it changes. */
  onChange?: (value: string) => void
  className?: string
  /** Set to false to render in read-only mode (e.g. for previewing). */
  editable?: boolean
  /** Called when an image is pasted/dropped. Return a URL. If not provided, images inline as base64. */
  onImageUpload?: (file: File) => Promise<string>
  /** Called when a non-image file is dropped/pasted. If not provided, non-image files are ignored. */
  onFileUpload?: (file: File) => Promise<{ url: string; name: string; size: number }>
  /** Whitelist of toolbar items to display. Omit to show all. */
  toolbar?: ToolbarItem[]
  /** Static list of mentionable items (shown when user types @). */
  mentions?: MentionItem[]
  /** Async mention search. Takes precedence over static `mentions` list. */
  onMentionSearch?: (query: string) => Promise<MentionItem[]>
  /** Called when a mention is selected from the suggestion dropdown. */
  onMentionSelect?: (item: MentionItem) => void
  /** Emoji art style. @default 'native' */
  emojiSet?: EmojiSet
  /** Show a source-view toggle (raw Markdown ⇄ visual) in the top-right of the default editor. @default false */
  sourceToggle?: boolean
  /** Controlled source-view state — drive it from an external button. */
  sourceMode?: boolean
  /** Uncontrolled initial source-view state. @default false */
  defaultSourceMode?: boolean
  /** Called when the source view toggles (raw Markdown ⇄ visual). */
  onSourceModeChange?: (source: boolean) => void
}

// --------------------------- compound slot context ------------------------

interface RTEContextValue {
  editor: Editor
  toolbar?: ToolbarItem[]
  editable: boolean
  onImageClick: () => void
  onFileClick?: () => void
  onEmojiClick: () => void
  /** Raw-Markdown source view active. */
  sourceMode: boolean
  setSourceMode: (source: boolean) => void
  toggleSource: () => void
  sourceText: string
  onSourceChange: (value: string) => void
}

const RTEContext = React.createContext<RTEContextValue | null>(null)

/** Access the editor + toolbar wiring inside a `<RichTextEditor.Provider>`. */
function useRichTextEditor(): RTEContextValue {
  const ctx = React.useContext(RTEContext)
  if (!ctx) throw new Error('RichTextEditor.Toolbar / .Content must be used within <RichTextEditor.Provider>')
  return ctx
}

export interface RichTextEditorProviderProps extends RichTextEditorProps {
  children?: React.ReactNode
}

/**
 * Owns the Tiptap editor + all upload/emoji/mention plumbing and provides it to
 * `RichTextEditor.Toolbar` / `RichTextEditor.Content`. Compose your own layout
 * (toolbar top/bottom/floating, or bring your own) around these slots, or use
 * `<RichTextEditor>` for the batteries-included default.
 */
const RichTextEditorProvider = React.forwardRef<HTMLDivElement, RichTextEditorProviderProps>(
  function RichTextEditorProvider({
  format = 'html',
  content = '',
  placeholder = 'Start writing...',
  onChange,
  className,
  editable = true,
  toolbar,
  onImageUpload,
  onFileUpload,
  mentions,
  onMentionSearch,
  onMentionSelect,
  sourceMode: sourceModeProp,
  defaultSourceMode = false,
  onSourceModeChange,
  // @deprecated no-op since the frimousse migration (native-only emoji). Kept
  // out of `...props` so it never leaks onto the DOM.
  emojiSet: _emojiSet = 'native',
  // Default-render-only flag; dropped here so it never leaks onto the DOM.
  sourceToggle: _sourceToggle,
  children,
  ...props
}, ref) {
  const editorRef = React.useRef<ReturnType<typeof useEditor>>(null)
  const isInternalChangeRef = React.useRef(false)
  const reduceMotion = useReducedMotion()
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false)

  // Source view (raw Markdown), controllable.
  const [uncontrolledSource, setUncontrolledSource] = React.useState(defaultSourceMode)
  const sourceMode = sourceModeProp ?? uncontrolledSource
  const setSourceMode = React.useCallback(
    (v: boolean) => {
      if (sourceModeProp === undefined) setUncontrolledSource(v)
      onSourceModeChange?.(v)
    },
    [sourceModeProp, onSourceModeChange],
  )
  const [sourceText, setSourceText] = React.useState('')
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
    immediatelyRender: false, // SSR-safe — prevents hydration mismatch in Next.js
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        // v3: Underline + Link are now included in StarterKit
        link: {
          openOnClick: false,
          protocols: ['http', 'https', 'mailto'],
          validate: (href: string) => /^(https?:\/\/|mailto:)/i.test(href),
          HTMLAttributes: {
            rel: 'noopener noreferrer',
            target: '_blank',
          },
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass:
          'before:content-[attr(data-placeholder)] before:text-surface-fg-subtle before:float-left before:h-0 before:pointer-events-none',
      }),
      Highlight.configure({ multicolor: false }),
      ListKit.configure({
        bulletList: false,  // Already in StarterKit
        orderedList: false, // Already in StarterKit
        listItem: false,    // Already in StarterKit
        listKeymap: false,  // Already in StarterKit
        taskList: {},
        taskItem: { nested: true },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'max-w-full rounded-control',
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
            render: createSuggestionRenderer(onMentionSelect),
          },
        }),
      ] : []),
      EmojiNode,
      createEmojiSuggestion(),
      Markdown,
    ],
    content,
    contentType: format === 'markdown' ? 'markdown' : undefined,
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
          'focus:outline-hidden',
          'min-h-[120px] px-ds-04 py-ds-04',
        ),
      },
    },
    onUpdate: ({ editor: ed }) => {
      isInternalChangeRef.current = true
      onChange?.(format === 'markdown' ? ed.getMarkdown() : ed.getHTML())
      queueMicrotask(() => {
        isInternalChangeRef.current = false
      })
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
    if (isInternalChangeRef.current) return
    if (!editor) return
    const current = format === 'markdown' ? editor.getMarkdown() : editor.getHTML()
    if (content !== current) {
      editor.commands.setContent(content, {
        emitUpdate: false,
        contentType: format === 'markdown' ? 'markdown' : undefined,
      })
    }
  }, [editor, content, format])

  // Entering source view: seed the textarea with the editor's current Markdown.
  React.useEffect(() => {
    if (sourceMode && editor) setSourceText(editor.getMarkdown())
    // Only re-seed on the source-mode transition, not on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceMode])

  if (!editor) return null

  const onSourceChange = (v: string) => {
    setSourceText(v)
    // Push edits back into the doc so `onChange` fires in the configured format.
    editor.commands.setContent(v, { contentType: 'markdown' })
  }

  const ctx: RTEContextValue = {
    editor,
    toolbar,
    editable,
    onImageClick: () => imageInputRef.current?.click(),
    onFileClick: onFileUpload ? () => fileInputRef.current?.click() : undefined,
    onEmojiClick: () => setShowEmojiPicker((prev) => !prev),
    sourceMode,
    setSourceMode,
    toggleSource: () => setSourceMode(!sourceMode),
    sourceText,
    onSourceChange,
  }

  return (
    <RTEContext.Provider value={ctx}>
      <div ref={ref} {...props} className={cn('relative', className)}>
        {/* Emoji picker rendered outside the overflow-hidden box so it isn't clipped */}
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div
              key="emoji-picker"
              ref={emojiPickerRef}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.96, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 4 }}
              transition={{ duration: 0.14, ease: 'easeOut' }}
              className="absolute bottom-full right-0 z-popover mb-ds-02 origin-bottom-right"
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.stopPropagation()
                  setShowEmojiPicker(false)
                }
              }}
            >
              <EmojiPickerLazy
                onSelect={({ id, native }) => {
                  editor.chain().focus().insertContent({
                    type: 'emojiNode',
                    attrs: { id, native },
                  }).run()
                  setShowEmojiPicker(false)
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
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
        {children}
      </div>
    </RTEContext.Provider>
  )
},
)

RichTextEditorProvider.displayName = 'RichTextEditor.Provider'

/**
 * The formatting toolbar. Reads the editor from `<RichTextEditor.Provider>`.
 * In source view the format controls hide but `trailing` (e.g. the source
 * toggle) stays, so the bar persists.
 */
function RichTextEditorToolbarSlot({ trailing }: { trailing?: React.ReactNode }) {
  const { editor, toolbar, editable, sourceMode, onImageClick, onFileClick, onEmojiClick } = useRichTextEditor()
  if (!editable) return null
  const showControls = !sourceMode
  if (!showControls && !trailing) return null
  return (
    <Toolbar
      editor={editor}
      toolbar={toolbar}
      showControls={showControls}
      trailing={trailing}
      onImageClick={onImageClick}
      onFileClick={onFileClick}
      onEmojiClick={onEmojiClick}
    />
  )
}
RichTextEditorToolbarSlot.displayName = 'RichTextEditor.Toolbar'

/** The content area — the visual editor, or a raw-Markdown textarea in source view. */
function RichTextEditorContentSlot() {
  const { editor, sourceMode, sourceText, onSourceChange } = useRichTextEditor()
  const reduce = useReducedMotion()
  const enter = reduce ? { opacity: 0 } : { opacity: 0, y: 4 }
  return (
    <AnimatePresence mode="wait" initial={false}>
      {sourceMode ? (
        <motion.div key="source" initial={enter} animate={{ opacity: 1, y: 0 }} exit={enter} transition={{ duration: 0.14, ease: 'easeOut' }}>
          <textarea
            value={sourceText}
            onChange={(e) => onSourceChange(e.target.value)}
            spellCheck={false}
            aria-label="Markdown source"
            className="block min-h-[120px] w-full resize-y bg-surface-panel px-ds-04 py-ds-04 font-mono text-body-sm leading-ds-relaxed text-surface-fg focus:outline-hidden"
          />
        </motion.div>
      ) : (
        <motion.div key="visual" initial={enter} animate={{ opacity: 1, y: 0 }} exit={enter} transition={{ duration: 0.14, ease: 'easeOut' }}>
          <EditorContent editor={editor} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
RichTextEditorContentSlot.displayName = 'RichTextEditor.Content'

/**
 * A source-view toggle (raw Markdown ⇄ visual). Text + icon by default;
 * pass `iconOnly` for a compact button. Place it anywhere inside a Provider.
 */
function RichTextEditorSourceToggleSlot({ className, iconOnly = false }: { className?: string; iconOnly?: boolean }) {
  const { sourceMode, toggleSource } = useRichTextEditor()
  const aria = sourceMode ? 'Switch to visual editor' : 'Switch to Markdown source'
  const icon = sourceMode ? IconEye : IconCode
  if (iconOnly) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-pressed={sourceMode}
        aria-label={aria}
        title={aria}
        className={className}
        onClick={toggleSource}
      >
        <Icon icon={icon} size="sm" />
      </Button>
    )
  }
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-pressed={sourceMode}
      aria-label={aria}
      startIcon={icon}
      className={className}
      onClick={toggleSource}
    >
      {sourceMode ? 'Editor' : 'Markdown'}
    </Button>
  )
}
RichTextEditorSourceToggleSlot.displayName = 'RichTextEditor.SourceToggle'

// Batteries-included default: Provider + bordered box + toolbar-over-content.
const RichTextEditorBase = React.forwardRef<HTMLDivElement, RichTextEditorProps>(
  function RichTextEditor(props, ref) {
    return (
      <RichTextEditorProvider ref={ref} {...props}>
        <div
          className={cn(
            'overflow-hidden rounded-surface border border-surface-border-strong bg-surface-panel',
            'transition-colors ease-productive-standard focus-within:border-surface-border-strong',
          )}
        >
          <RichTextEditorToolbarSlot
            trailing={props.sourceToggle ? <RichTextEditorSourceToggleSlot /> : undefined}
          />
          <RichTextEditorContentSlot />
        </div>
      </RichTextEditorProvider>
    )
  },
)
RichTextEditorBase.displayName = 'RichTextEditor'

const RichTextEditor = Object.assign(RichTextEditorBase, {
  Provider: RichTextEditorProvider,
  Toolbar: RichTextEditorToolbarSlot,
  Content: RichTextEditorContentSlot,
  SourceToggle: RichTextEditorSourceToggleSlot,
})

export interface RichTextViewerProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'content'> {
  content: string
  /** Content format. `markdown` parses Markdown; `html` (default) parses HTML. @default 'html' */
  format?: 'html' | 'markdown'
  className?: string
}

const RichTextViewer = React.forwardRef<HTMLDivElement, RichTextViewerProps>(
  function RichTextViewer({ content, format = 'html', className, ...props }, ref) {
  const editor = useEditor({
    immediatelyRender: false, // SSR-safe — prevents hydration mismatch in Next.js
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: {
          openOnClick: true,
          protocols: ['http', 'https', 'mailto'],
          validate: (href: string) => /^(https?:\/\/|mailto:)/i.test(href),
          HTMLAttributes: {
            rel: 'noopener noreferrer',
            target: '_blank',
          },
        },
      }),
      Highlight.configure({ multicolor: false }),
      ListKit.configure({
        bulletList: false,
        orderedList: false,
        listItem: false,
        listKeymap: false,
        taskList: {},
        taskItem: { nested: true },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'max-w-full rounded-control',
        },
      }),
      FileAttachment,
      Mention.configure({
        HTMLAttributes: { class: 'mention' },
      }),
      Markdown,
    ],
    content,
    contentType: format === 'markdown' ? 'markdown' : undefined,
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

export {
  RichTextEditor,
  RichTextEditorProvider,
  RichTextEditorToolbarSlot as RichTextEditorToolbar,
  RichTextEditorContentSlot as RichTextEditorContent,
  RichTextEditorSourceToggleSlot as RichTextEditorSourceToggle,
  useRichTextEditor,
  RichTextViewer,
}
