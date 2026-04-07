'use client'

import * as React from 'react'
import { useEditor, EditorContent, Extension, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Mention from '@tiptap/extension-mention'
import CharacterCount from '@tiptap/extension-character-count'
import {
  IconBold,
  IconItalic,
  IconUnderline,
  IconStrikethrough,
  IconHighlight,
  IconCode,
  IconList,
  IconListNumbers,
  IconAt,
  IconMoodSmile,
  IconPaperclip,
  IconSlash,
  IconSend,
  IconSquare,
  IconX,
} from '@tabler/icons-react'
import { FileAttachment } from './extensions/file-attachment'
import { EmojiSuggestion } from './extensions/emoji-suggestion'
import { createSuggestionRenderer } from './extensions/mention-suggestion'
import { createSlashCommandExtension } from './extensions/slash-command'
import type { MentionItem } from './rich-text-editor'
import { Button } from '../ui/button'
import { Icon } from '../ui/icon'
import { cn } from '../ui/lib/utils'
import { useIsMobile } from '../hooks/use-mobile'

// ── Types ────────────────────────────────────────────────────────

export type { MentionItem }
export type { SlashCommand, SlashCommandGroup } from './extensions/slash-command'

export type ChatToolbarItem =
  | 'bold' | 'italic' | 'underline' | 'strike' | 'highlight' | 'code'
  | 'bulletList' | 'orderedList'
  | 'mention' | 'emoji' | 'attach' | 'slash'

/**
 * A compact, Linear-style rich text chat input for unified human+AI workspaces.
 *
 * Built on TipTap with @mentions, emoji, file drag-drop/paste, optional slash commands,
 * typing indicator, and character counter. Three variants: compact (default), expanded, minimal.
 *
 * @example
 * <RichChatInput
 *   onSubmit={(html, text) => sendMessage(html)}
 *   mentions={teamMembers}
 *   onFileUpload={uploadFile}
 *   slashCommands={[{ label: 'Actions', commands: [...] }]}
 * />
 */
export interface RichChatInputProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSubmit' | 'content'> {
  onSubmit: (html: string, plainText: string) => void
  placeholder?: string
  disabled?: boolean
  /** Initial HTML content (not reactive — use for message editing). */
  content?: string
  variant?: 'compact' | 'expanded' | 'minimal'
  maxRows?: number
  enterBehavior?: 'send' | 'newline'
  maxLength?: number
  mentions?: MentionItem[]
  onMentionSearch?: (query: string) => Promise<MentionItem[]>
  onMentionSelect?: (item: MentionItem) => void
  onFileUpload?: (file: File) => Promise<{ url: string; name: string; size: number }>
  onImageUpload?: (file: File) => Promise<string>
  slashCommands?: import('./extensions/slash-command').SlashCommandGroup[]
  onTyping?: (isTyping: boolean) => void
  onEmpty?: (isEmpty: boolean) => void
  isStreaming?: boolean
  onCancel?: () => void
  leadingSlot?: React.ReactNode
  trailingSlot?: React.ReactNode
  disclaimer?: string
  toolbar?: boolean | ChatToolbarItem[]
}

// ── Variant config ───────────────────────────────────────────────

const variantConfig = {
  compact: { minHeight: '4.5rem', maxHeight: '16rem', showToolbar: true },
  expanded: { minHeight: '8rem', maxHeight: '24rem', showToolbar: true },
  minimal: { minHeight: '2.5rem', maxHeight: '8rem', showToolbar: false },
}

// ── Chat prose (tighter than RTE) ────────────────────────────────

const CHAT_PROSE = [
  'prose prose-sm max-w-none focus:outline-none',
  'font-body text-ds-sm leading-relaxed text-surface-fg',
  '[&_p]:mb-ds-01 [&_p]:text-surface-fg',
  '[&_p:last-child]:mb-0',
  '[&_ul]:ml-ds-04 [&_ul]:list-disc [&_ol]:ml-ds-04 [&_ol]:list-decimal',
  '[&_li]:text-surface-fg',
  '[&_code]:rounded [&_code]:bg-surface-raised [&_code]:px-ds-02 [&_code]:py-[1px] [&_code]:text-ds-sm [&_code]:text-accent-11',
  '[&_strong]:font-semibold [&_strong]:text-surface-fg',
  '[&_mark]:rounded-sm [&_mark]:bg-warning-3 [&_mark]:px-[2px]',
  '[&_a]:text-accent-11 [&_a]:underline',
  '[&_.mention]:rounded-ds-sm [&_.mention]:bg-accent-2 [&_.mention]:px-ds-02 [&_.mention]:py-[1px] [&_.mention]:font-medium [&_.mention]:text-accent-11',
].join(' ')

// ── Toolbar Button (local — RTE's is private) ───────────────────

function ToolbarBtn({
  onClick,
  isActive = false,
  disabled = false,
  title,
  children,
}: {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      aria-pressed={isActive}
      className={cn(
        'inline-flex h-6 w-6 items-center justify-center rounded-ds-md touch-target',
        'transition-colors duration-fast-01 ease-productive-standard',
        'hover:bg-surface-raised-hover',
        'disabled:pointer-events-none disabled:opacity-action-disabled',
        isActive ? 'bg-surface-raised-hover text-accent-11' : 'text-surface-fg-subtle',
      )}
    >
      {children}
    </button>
  )
}

function ToolbarDivider() {
  return <div className="h-4 w-px bg-surface-border-subtle mx-ds-01" />
}

// ── Attachment type ──────────────────────────────────────────────

interface Attachment {
  id: string
  url?: string
  name: string
  size: number
  type: 'image' | 'file'
  uploading: boolean
}

// ── Component ────────────────────────────────────────────────────

const RichChatInput = React.forwardRef<HTMLDivElement, RichChatInputProps>(
  function RichChatInput(
    {
      onSubmit,
      placeholder = 'Type a message...',
      disabled = false,
      content = '',
      variant = 'compact',
      maxRows,
      enterBehavior = 'send',
      maxLength,
      mentions,
      onMentionSearch,
      onMentionSelect,
      onFileUpload,
      onImageUpload,
      slashCommands,
      onTyping,
      onEmpty,
      isStreaming = false,
      onCancel,
      leadingSlot,
      trailingSlot,
      disclaimer,
      toolbar: toolbarProp = true,
      className,
      ...props
    },
    ref,
  ) {
    const [attachments, setAttachments] = React.useState<Attachment[]>([])
    const [isDragging, setIsDragging] = React.useState(false)
    const [focused, setFocused] = React.useState(false)
    const fileInputRef = React.useRef<HTMLInputElement>(null)
    const typingTimeoutRef = React.useRef<ReturnType<typeof setTimeout>>(undefined)
    const submitRef = React.useRef<(() => void) | undefined>(undefined)
    const enterBehaviorRef = React.useRef(enterBehavior)
    enterBehaviorRef.current = enterBehavior

    const isMobile = useIsMobile()
    const config = variantConfig[variant]

    // Build extensions
    const extensions = React.useMemo(() => {
      const exts = [
        StarterKit.configure({
          heading: false,
          horizontalRule: false,
          codeBlock: false,
          blockquote: false,
        }),
        Placeholder.configure({ placeholder }),
        Underline,
        Highlight.configure({ multicolor: false }),
        Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-accent-11 underline' } }),
        Image,
        CharacterCount.configure({ limit: maxLength || undefined }),
        FileAttachment,
        EmojiSuggestion,
        // Enter-to-send
        Extension.create({
          name: 'enterToSend',
          addKeyboardShortcuts() {
            return {
              'Enter': () => {
                if (enterBehaviorRef.current === 'send') {
                  submitRef.current?.()
                  return true
                }
                return false
              },
              'Shift-Enter': () => {
                if (enterBehaviorRef.current === 'send') {
                  this.editor.commands.splitBlock()
                  return true
                }
                return false
              },
              'Mod-Enter': () => {
                submitRef.current?.()
                return true
              },
            }
          },
        }),
      ]

      // Mentions
      if (mentions || onMentionSearch) {
        exts.push(
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
        )
      }

      // Slash commands
      if (slashCommands) {
        exts.push(createSlashCommandExtension(slashCommands))
      }

      return exts
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [placeholder, maxLength])

    const editor = useEditor({
      extensions,
      content: content || undefined,
      editable: !disabled,
      editorProps: {
        attributes: {
          class: CHAT_PROSE,
        },
        handlePaste: (_view, event) => {
          const files = Array.from(event.clipboardData?.files ?? [])
          if (files.length > 0) {
            files.forEach(processFile)
            return true // prevent default paste
          }
          return false // let TipTap handle text paste
        },
      },
    })

    // Submit handler
    const handleSubmit = React.useCallback(() => {
      if (!editor || editor.isEmpty || isStreaming) return
      const html = editor.getHTML()
      const plainText = editor.getText()
      onSubmit(html, plainText)
      editor.commands.clearContent()
      setAttachments([])
    }, [editor, isStreaming, onSubmit])

    // Wire submit ref (for enter-to-send extension)
    submitRef.current = handleSubmit

    // Typing indicator
    React.useEffect(() => {
      if (!editor || !onTyping) return
      const handleUpdate = () => {
        onTyping(true)
        clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = setTimeout(() => onTyping(false), 2000)
      }
      editor.on('update', handleUpdate)
      return () => {
        editor.off('update', handleUpdate)
        clearTimeout(typingTimeoutRef.current)
      }
    }, [editor, onTyping])

    // Empty state
    React.useEffect(() => {
      if (!editor || !onEmpty) return
      const handleUpdate = () => { onEmpty(editor.isEmpty) }
      editor.on('update', handleUpdate)
      handleUpdate()
      return () => { editor.off('update', handleUpdate) }
    }, [editor, onEmpty])

    // File handling
    const processFile = React.useCallback(async (file: File) => {
      const id = Math.random().toString(36).slice(2)
      const isImage = file.type.startsWith('image/')

      setAttachments(prev => [...prev, {
        id,
        name: file.name,
        size: file.size,
        type: isImage ? 'image' : 'file',
        uploading: true,
      }])

      try {
        if (isImage && onImageUpload) {
          const url = await onImageUpload(file)
          setAttachments(prev => prev.map(a => a.id === id ? { ...a, url, uploading: false } : a))
        } else if (onFileUpload) {
          const result = await onFileUpload(file)
          setAttachments(prev => prev.map(a => a.id === id ? { ...a, url: result.url, name: result.name, size: result.size, uploading: false } : a))
        } else {
          // No handler — create local URL for images
          if (isImage) {
            const url = URL.createObjectURL(file)
            setAttachments(prev => prev.map(a => a.id === id ? { ...a, url, uploading: false } : a))
          } else {
            setAttachments(prev => prev.filter(a => a.id !== id))
          }
        }
      } catch {
        setAttachments(prev => prev.filter(a => a.id !== id))
      }
    }, [onFileUpload, onImageUpload])

    const removeAttachment = React.useCallback((id: string) => {
      setAttachments(prev => prev.filter(a => a.id !== id))
    }, [])

    const handleDrop = React.useCallback((e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const files = Array.from(e.dataTransfer.files)
      files.forEach(processFile)
    }, [processFile])

    const handleFileInput = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      files.forEach(processFile)
      e.target.value = '' // reset so same file can be re-selected
    }, [processFile])

    // Toolbar visibility
    const showToolbar = toolbarProp !== false && (config.showToolbar || focused)
    const toolbarItems = Array.isArray(toolbarProp) ? toolbarProp : null
    const show = (item: ChatToolbarItem) => !toolbarItems || toolbarItems.includes(item)

    // Character count
    const charCount = editor?.storage.characterCount?.characters() ?? 0
    const charPct = maxLength ? charCount / maxLength : 0

    const isEmpty = editor?.isEmpty ?? true

    // Format file size
    const formatSize = (bytes: number) => {
      if (bytes < 1024) return `${bytes} B`
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    return (
      <div
        ref={ref}
        className={cn('border-t border-surface-border-subtle px-ds-05 py-ds-04', className)}
        {...props}
      >
        <div
          className={cn(
            'rounded-ds-xl border bg-surface-base transition-colors',
            isDragging ? 'border-dashed border-accent-7' : 'border-surface-border',
            focused && 'border-accent-7',
          )}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          {/* Leading slot */}
          {leadingSlot}

          {/* Attachment preview strip */}
          {attachments.length > 0 && (
            <div className="flex gap-ds-02 overflow-x-auto px-ds-03 py-ds-02 border-b border-surface-border-subtle">
              {attachments.map(att => (
                att.type === 'image' && att.url ? (
                  <div key={att.id} className="relative h-12 w-12 shrink-0 rounded-ds-md overflow-hidden">
                    <img src={att.url} alt={att.name} className="h-full w-full object-cover" />
                    <button
                      onClick={() => removeAttachment(att.id)}
                      className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-error-9 text-error-fg text-ds-xs flex items-center justify-center"
                      title="Remove"
                    >
                      <Icon icon={IconX} size="xs" />
                    </button>
                  </div>
                ) : (
                  <div key={att.id} className="flex items-center gap-ds-02 shrink-0 rounded-ds-md bg-surface-raised px-ds-03 py-ds-01">
                    <span className="text-ds-xs text-surface-fg-muted truncate max-w-[120px]">
                      {att.name}
                    </span>
                    <span className="text-ds-xs text-surface-fg-subtle">
                      {formatSize(att.size)}
                    </span>
                    <button
                      onClick={() => removeAttachment(att.id)}
                      className="text-surface-fg-subtle hover:text-surface-fg"
                      title="Remove"
                    >
                      <Icon icon={IconX} size="xs" />
                    </button>
                  </div>
                )
              ))}
            </div>
          )}

          {/* Editor */}
          <div
            className="px-ds-03 py-ds-02"
            style={{ minHeight: config.minHeight, maxHeight: config.maxHeight, overflowY: 'auto' }}
          >
            <EditorContent
              editor={editor}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
          </div>

          {/* Mobile floating bubble toolbar — shows on text selection */}
          {isMobile && editor && (
            <BubbleMenu
              editor={editor}
              className="flex gap-ds-01 rounded-ds-lg border border-surface-border-strong bg-surface-overlay p-ds-02 shadow-floating"
            >
              <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold">
                <Icon icon={IconBold} size="xs" />
              </ToolbarBtn>
              <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic">
                <Icon icon={IconItalic} size="xs" />
              </ToolbarBtn>
              <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Underline">
                <Icon icon={IconUnderline} size="xs" />
              </ToolbarBtn>
              <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Strike">
                <Icon icon={IconStrikethrough} size="xs" />
              </ToolbarBtn>
              <ToolbarBtn onClick={() => editor.chain().focus().toggleHighlight().run()} isActive={editor.isActive('highlight')} title="Highlight">
                <Icon icon={IconHighlight} size="xs" />
              </ToolbarBtn>
              <ToolbarBtn onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')} title="Code">
                <Icon icon={IconCode} size="xs" />
              </ToolbarBtn>
            </BubbleMenu>
          )}

          {/* Toolbar */}
          {showToolbar && editor && (
            <div
              role="toolbar"
              aria-label="Message formatting"
              className="flex flex-wrap items-center gap-ds-01 border-t border-surface-border-subtle px-ds-03 py-ds-02"
            >
              {/* Formatting — hidden on mobile (BubbleMenu handles it) */}
              {!isMobile && show('bold') && (
                <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold">
                  <Icon icon={IconBold} size="xs" />
                </ToolbarBtn>
              )}
              {!isMobile && show('italic') && (
                <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic">
                  <Icon icon={IconItalic} size="xs" />
                </ToolbarBtn>
              )}
              {!isMobile && show('underline') && (
                <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Underline">
                  <Icon icon={IconUnderline} size="xs" />
                </ToolbarBtn>
              )}
              {!isMobile && show('strike') && (
                <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Strikethrough">
                  <Icon icon={IconStrikethrough} size="xs" />
                </ToolbarBtn>
              )}
              {!isMobile && show('highlight') && (
                <ToolbarBtn onClick={() => editor.chain().focus().toggleHighlight().run()} isActive={editor.isActive('highlight')} title="Highlight">
                  <Icon icon={IconHighlight} size="xs" />
                </ToolbarBtn>
              )}
              {!isMobile && show('code') && (
                <ToolbarBtn onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')} title="Code">
                  <Icon icon={IconCode} size="xs" />
                </ToolbarBtn>
              )}

              {!isMobile && <ToolbarDivider />}

              {/* Lists — hidden on mobile */}
              {!isMobile && show('bulletList') && (
                <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet list">
                  <Icon icon={IconList} size="xs" />
                </ToolbarBtn>
              )}
              {!isMobile && show('orderedList') && (
                <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Ordered list">
                  <Icon icon={IconListNumbers} size="xs" />
                </ToolbarBtn>
              )}

              {!isMobile && <ToolbarDivider />}

              {/* Insert */}
              {show('mention') && (mentions || onMentionSearch) && (
                <ToolbarBtn onClick={() => editor.chain().focus().insertContent('@').run()} title="Mention someone">
                  <Icon icon={IconAt} size="xs" />
                </ToolbarBtn>
              )}
              {show('emoji') && (
                <ToolbarBtn onClick={() => editor.chain().focus().insertContent(':').run()} title="Emoji">
                  <Icon icon={IconMoodSmile} size="xs" />
                </ToolbarBtn>
              )}
              {show('attach') && (onFileUpload || onImageUpload) && (
                <ToolbarBtn onClick={() => fileInputRef.current?.click()} title="Attach file">
                  <Icon icon={IconPaperclip} size="xs" />
                </ToolbarBtn>
              )}
              {show('slash') && slashCommands && (
                <ToolbarBtn onClick={() => { editor.chain().focus().insertContent('/').run() }} title="Slash commands">
                  <Icon icon={IconSlash} size="xs" />
                </ToolbarBtn>
              )}

              {/* Spacer */}
              <div className="flex-1" />

              {/* Character counter */}
              {maxLength != null && (
                <span className={cn(
                  'text-ds-xs tabular-nums',
                  charPct >= 1 ? 'text-error-11' : charPct >= 0.9 ? 'text-warning-11' : 'text-surface-fg-subtle',
                )}>
                  {charCount}/{maxLength}
                </span>
              )}

              {/* Send / Stop */}
              {isStreaming ? (
                <Button variant="ghost" size="icon-sm" color="error" onClick={onCancel} aria-label="Stop" title="Stop">
                  <Icon icon={IconSquare} size="sm" />
                </Button>
              ) : (
                <Button variant="ghost" size="icon-sm" onClick={handleSubmit} disabled={isEmpty || disabled} aria-label="Send" title="Send">
                  <Icon icon={IconSend} size="sm" />
                </Button>
              )}
            </div>
          )}

          {/* Trailing slot */}
          {trailingSlot}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileInput}
          />
        </div>

        {/* Disclaimer */}
        {disclaimer && (
          <p className="mt-ds-02 text-center text-ds-xs text-surface-fg-subtle/50">
            {disclaimer}
          </p>
        )}
      </div>
    )
  },
)
RichChatInput.displayName = 'RichChatInput'

export { RichChatInput }
