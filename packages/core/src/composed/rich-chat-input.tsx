'use client'

import { computePosition, flip, offset, shift } from '@floating-ui/dom'
import {
  IconBold,
  IconChevronDown,
  IconClock,
  IconCode,
  IconHighlight,
  IconItalic,
  IconMicrophone,
  IconMoodSmile,
  IconPlus,
  IconSend,
  IconSquare,
  IconStrikethrough,
  IconTextSize,
  IconTrash,
  IconUnderline,
} from '@tabler/icons-react'
import Highlight from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'
import Mention from '@tiptap/extension-mention'
import { CharacterCount,Placeholder } from '@tiptap/extensions'
import { type Editor,EditorContent, Extension, useEditor, useEditorState } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import { AnimatePresence, motion } from 'framer-motion'
import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { useIsMobile } from '../hooks/use-mobile'
import { Button } from '../ui/button'
import { Icon } from '../ui/icon'
import { MENTION_TOKEN_CLASS } from '../ui/lib/mention'
import { durations } from '../ui/lib/motion'
import { cn } from '../ui/lib/utils'
import { SplitButton } from '../ui/split-button'
import type { EmojiData, EmojiSet } from './emoji-picker'
import { EmojiNode } from './extensions/emoji-node'
import { createEmojiSuggestion } from './extensions/emoji-suggestion'
import { FileAttachment } from './extensions/file-attachment'
import { createSuggestionRenderer } from './extensions/mention-suggestion'
import type { SlashCommandGroup } from './extensions/slash-command'
import { createSlashCommandExtension } from './extensions/slash-command'
import type { Attachment } from './rich-chat-input/attachment-strip'
import { AttachmentStrip } from './rich-chat-input/attachment-strip'
import type { AudioPlayerProps } from './rich-chat-input/audio-player'
import { AudioPlayer } from './rich-chat-input/audio-player'
import type { AudioWaveformProps } from './rich-chat-input/audio-waveform'
import { AudioWaveform } from './rich-chat-input/audio-waveform'
import type { ChatToolbarItem } from './rich-chat-input/chat-toolbar'
import { ChatToolbar } from './rich-chat-input/chat-toolbar'
import { RecordingOverlay } from './rich-chat-input/recording-overlay'
import { ReplyBanner } from './rich-chat-input/reply-banner'
import { ScheduleBanner, ScheduleDialog,ScheduleDropdownContent } from './rich-chat-input/schedule-send'
import type { UseVoiceRecorderOptions, UseVoiceRecorderReturn } from './rich-chat-input/use-voice-recorder'
import { useVoiceRecorder } from './rich-chat-input/use-voice-recorder'
import type { MentionItem } from './rich-text-editor'

// ── Re-exports ──────────────────────────────────────────────────

export type { MentionItem }
export type { SlashCommand, SlashCommandGroup } from './extensions/slash-command'

export { AudioWaveform }
export type { AudioWaveformProps }
export { AudioPlayer }
export type { AudioPlayerProps }
export { useVoiceRecorder }
export type { UseVoiceRecorderOptions, UseVoiceRecorderReturn }

// ── Types ───────────────────────────────────────────────────────

// Only track states that are USER-TRIGGERED (not editor-triggered).
// idle/focused/composing are derived from editor.isEmpty at render time.
type InputState = 'idle' | 'recording' | 'review'

export interface RichChatInputMessage {
  html: string
  plainText: string
  attachments?: Array<{ url: string; name: string; size: number; type: string }>
  voiceNote?: { blob: Blob; duration: number }
}

export interface RichChatInputProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSubmit' | 'content'> {
  onSubmit: (message: RichChatInputMessage) => void
  placeholder?: string
  disabled?: boolean
  /** Initial HTML content (not reactive — use for message editing). */
  content?: string
  variant?: 'compact' | 'expanded' | 'minimal' | 'inline'
  enterBehavior?: 'send' | 'newline'
  maxLength?: number
  /** When to show the character counter. @default 'near-limit' */
  charCountDisplay?: 'always' | 'focus' | 'near-limit' | 'hidden'
  mentions?: MentionItem[]
  onMentionSearch?: (query: string) => Promise<MentionItem[]>
  onMentionSelect?: (item: MentionItem) => void
  onFileUpload?: (file: File) => Promise<{ url: string; name: string; size: number }>
  onImageUpload?: (file: File) => Promise<string>
  slashCommands?: SlashCommandGroup[]
  onVoiceRecord?: (audio: Blob, duration: number) => void
  /** Called after recording stops. Consumer can transcribe and return text to insert into the editor. If null is returned, the audio is attached as a voice note. */
  onTranscribe?: (blob: Blob, duration: number) => Promise<string | null>
  maxDuration?: number
  replyTo?: { id: string; author: string; preview: string; onDismiss: () => void }
  onTyping?: (isTyping: boolean) => void
  onEmpty?: (isEmpty: boolean) => void
  isStreaming?: boolean
  onCancel?: () => void
  leadingSlot?: React.ReactNode
  trailingSlot?: React.ReactNode
  disclaimer?: string
  /** true = default toolbar, ChatToolbarItem[] = whitelist, ReactNode = custom toolbar, false = hidden */
  toolbar?: boolean | ChatToolbarItem[] | React.ReactNode
  /** Custom action button rendered to the left of the input (replaces the default attach button). Pass `false` to hide. */
  actionButton?: React.ReactNode | false
  /** Emoji art style in the picker. @default 'native' (system emoji) */
  emojiSet?: EmojiSet
  /** Called when user schedules a message. If provided, a schedule button appears next to send. */
  onSchedule?: (message: RichChatInputMessage, scheduledAt: Date) => void
  /** Split send button — dropdown options next to send (e.g. custom actions). */
  sendOptions?: Array<{
    label: string
    icon?: React.ComponentType<{ className?: string }>
    onSelect: () => void
  }>
}

// ── Variant config ──────────────────────────────────────────────

const variantConfig = {
  compact:  { minHeight: 44, maxHeight: 256, showToolbar: true, toolbarPosition: 'bottom' as const },
  expanded: { minHeight: 96, maxHeight: 384, showToolbar: true, toolbarPosition: 'bottom' as const },
  minimal:  { minHeight: 44, maxHeight: 128, showToolbar: false, toolbarPosition: 'bottom' as const },
  inline:   { minHeight: 40, maxHeight: 160, showToolbar: false, toolbarPosition: 'top' as const },
}

// ── Chat prose (tighter than RTE, text-ds-md to match Input) ────

const CHAT_PROSE = [
  'prose prose-sm max-w-none focus:outline-hidden',
  'font-body text-ds-md leading-relaxed text-surface-fg',
  '[&_p.is-editor-empty:first-child]:relative',
  '[&_p.is-editor-empty:first-child::before]:text-surface-fg-subtle [&_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_p.is-editor-empty:first-child::before]:pointer-events-none [&_p.is-editor-empty:first-child::before]:absolute [&_p.is-editor-empty:first-child::before]:left-0 [&_p.is-editor-empty:first-child::before]:top-0 [&_p.is-editor-empty:first-child::before]:w-full [&_p.is-editor-empty:first-child::before]:truncate',
  '[&_p]:mb-ds-01 [&_p]:text-surface-fg',
  '[&_p:last-child]:mb-0',
  '[&_ul]:ml-ds-04 [&_ul]:list-disc [&_ol]:ml-ds-04 [&_ol]:list-decimal',
  '[&_li]:text-surface-fg',
  '[&_code]:rounded [&_code]:bg-surface-raised [&_code]:px-ds-02 [&_code]:py-[1px] [&_code]:text-ds-md [&_code]:text-accent-11',
  '[&_strong]:font-semibold [&_strong]:text-surface-fg',
  '[&_mark]:rounded-xs [&_mark]:bg-warning-3 [&_mark]:px-[2px]',
  '[&_a]:text-accent-11 [&_a]:underline',
  MENTION_TOKEN_CLASS,
].join(' ')

// ── Split Send Dropdown (chevron next to send — schedule send, etc.) ──

function SplitSendDropdown({ options }: { options: Array<{ label: string; icon?: React.ComponentType<{ className?: string }>; onSelect: () => void }> }) {
  const [open, setOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  // Close on outside click
  React.useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        title="More send options"
        aria-label="More send options"
        aria-expanded={open}
        className={cn(
          'inline-flex h-ds-xs-plus w-5 items-center justify-center rounded-control touch-target',
          'text-surface-fg-subtle hover:bg-surface-raised-hover hover:text-surface-fg',
          'transition-colors duration-fast-01 ease-productive-standard',
          open && 'bg-surface-raised-hover text-surface-fg',
        )}
      >
        <Icon icon={IconChevronDown} size="xs" />
      </button>
      {/* min-w-[200px]: component-specific dropdown width — no design token equivalent */}
      {open && (
        <div className="absolute bottom-full right-0 mb-ds-02 min-w-[200px] rounded-surface bg-surface-overlay p-ds-02 shadow-floating z-popover">
          <p className="px-ds-03 py-ds-01 text-ds-xs font-medium text-surface-fg-subtle">Send options</p>
          {options.map((opt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => { opt.onSelect(); setOpen(false) }}
              className="flex w-full items-center gap-ds-03 rounded-control px-ds-03 py-ds-02 text-ds-sm text-surface-fg hover:bg-surface-raised-hover transition-colors duration-fast-01"
            >
              {opt.icon && <opt.icon className="h-ico-sm w-ico-sm text-surface-fg-muted" />}
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Emoji Picker Popover (lazy-loaded) ──────────────────────────

const LazyEmojiPicker = React.lazy(() =>
  import('./emoji-picker').then((m) => ({ default: m.EmojiPicker })),
)

function EmojiPickerPopover({ onSelect, onClose }: { onSelect: (emoji: EmojiData) => void; onClose: () => void }) {
  const ref = React.useRef<HTMLDivElement>(null)

  // Close on click outside
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  // Close on Escape
  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const fallback = (
    <div className="flex h-[435px] w-[352px] items-center justify-center rounded-surface bg-surface-overlay shadow-floating">
      <span className="text-ds-sm text-surface-fg-subtle">Loading…</span>
    </div>
  )

  return (
    <div ref={ref}>
      <React.Suspense fallback={fallback}>
        <LazyEmojiPicker onSelect={onSelect} />
      </React.Suspense>
    </div>
  )
}

// ── Toolbar Button (for BubbleMenu only — ChatToolbar has its own) ──

function BubbleBtn({
  onClick,
  isActive = false,
  title,
  children,
}: {
  onClick: () => void
  isActive?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      aria-pressed={isActive}
      className={cn(
        'inline-flex h-ds-xs-plus w-ds-xs-plus items-center justify-center rounded-control touch-target',
        'transition-colors duration-fast-01 ease-productive-standard',
        'hover:bg-surface-raised-hover',
        isActive ? 'bg-surface-raised-hover text-accent-11' : 'text-surface-fg-subtle',
      )}
    >
      {children}
    </button>
  )
}

// ── BubbleMenu with useEditorState (v3) ────────────────────────

function ChatBubbleMenu({ editor }: { editor: Editor }) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      isBold: e.isActive('bold'),
      isItalic: e.isActive('italic'),
      isUnderline: e.isActive('underline'),
      isStrike: e.isActive('strike'),
      isHighlight: e.isActive('highlight'),
      isCode: e.isActive('code'),
    }),
  })

  return (
    <BubbleMenu
      editor={editor}
      className="flex gap-ds-01 rounded-surface bg-surface-overlay p-ds-02 shadow-floating"
    >
      <BubbleBtn onClick={() => editor.chain().focus().toggleBold().run()} isActive={state.isBold} title="Bold">
        <Icon icon={IconBold} size="xs" />
      </BubbleBtn>
      <BubbleBtn onClick={() => editor.chain().focus().toggleItalic().run()} isActive={state.isItalic} title="Italic">
        <Icon icon={IconItalic} size="xs" />
      </BubbleBtn>
      <BubbleBtn onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={state.isUnderline} title="Underline">
        <Icon icon={IconUnderline} size="xs" />
      </BubbleBtn>
      <BubbleBtn onClick={() => editor.chain().focus().toggleStrike().run()} isActive={state.isStrike} title="Strikethrough">
        <Icon icon={IconStrikethrough} size="xs" />
      </BubbleBtn>
      <BubbleBtn onClick={() => editor.chain().focus().toggleHighlight().run()} isActive={state.isHighlight} title="Highlight">
        <Icon icon={IconHighlight} size="xs" />
      </BubbleBtn>
      <BubbleBtn onClick={() => editor.chain().focus().toggleCode().run()} isActive={state.isCode} title="Code">
        <Icon icon={IconCode} size="xs" />
      </BubbleBtn>
    </BubbleMenu>
  )
}

// ── Component ───────────────────────────────────────────────────

const RichChatInput = React.forwardRef<HTMLDivElement, RichChatInputProps>(
  function RichChatInput(
    {
      onSubmit,
      placeholder = 'Type a message...',
      disabled = false,
      content = '',
      variant = 'compact',
      enterBehavior = 'send',
      maxLength,
      charCountDisplay = 'near-limit',
      mentions,
      onMentionSearch,
      onMentionSelect,
      onFileUpload,
      onImageUpload,
      slashCommands,
      onVoiceRecord,
      onTranscribe,
      maxDuration,
      replyTo,
      onTyping,
      onEmpty,
      isStreaming = false,
      onCancel,
      leadingSlot,
      trailingSlot,
      disclaimer,
      toolbar: toolbarProp = true,
      sendOptions,
      onSchedule,
      actionButton,
      emojiSet = 'native',
      className,
      ...props
    },
    ref,
  ) {
    // ── State ──────────────────────────────────────────────────
    const [state, setState] = React.useState<InputState>('idle')
    const [toolbarExpanded, setToolbarExpanded] = React.useState(false)
    const [showEmojiPicker, setShowEmojiPicker] = React.useState(false)
    const [scheduledDate, setScheduledDate] = React.useState<Date | null>(null)
    const [scheduleDialogOpen, setScheduleDialogOpen] = React.useState(false)
    const [editorFocused, setEditorFocused] = React.useState(false)
    const [charCount, setCharCount] = React.useState(0)
    const emojiAnchorRef = React.useRef<HTMLButtonElement>(null)
    const emojiFloatingRef = React.useRef<HTMLDivElement>(null)

    // Position emoji picker with Floating UI (auto-flips top/bottom based on space)
    React.useEffect(() => {
      if (!showEmojiPicker || !emojiAnchorRef.current || !emojiFloatingRef.current) return
      const anchor = emojiAnchorRef.current
      const floating = emojiFloatingRef.current

      const update = () => {
        computePosition(anchor, floating, {
          placement: 'top-end',
          middleware: [offset(8), flip(), shift({ padding: 8 })],
        }).then(({ x, y }) => {
          Object.assign(floating.style, { left: `${x}px`, top: `${y}px` })
        })
      }

      update()
      // Update on scroll/resize
      window.addEventListener('scroll', update, true)
      window.addEventListener('resize', update)
      return () => {
        window.removeEventListener('scroll', update, true)
        window.removeEventListener('resize', update)
      }
    }, [showEmojiPicker])
    const [attachments, setAttachments] = React.useState<Attachment[]>([])
    const [voiceNote, setVoiceNote] = React.useState<{ blob: Blob; duration: number; waveformData: number[] } | null>(null)
    const [isDragging, setIsDragging] = React.useState(false)
    // editorHeight state removed — was causing re-renders during ProseMirror DOM changes

    const fileInputRef = React.useRef<HTMLInputElement>(null)
    const editorWrapperRef = React.useRef<HTMLDivElement>(null)
    const typingTimeoutRef = React.useRef<ReturnType<typeof setTimeout>>(undefined)
    const submitRef = React.useRef<(() => void) | undefined>(undefined)
    const enterBehaviorRef = React.useRef(enterBehavior)
    enterBehaviorRef.current = enterBehavior
    // Same live-ref pattern for the mention-select callback: the extensions memo
    // only rebuilds on presence changes (`!!mentions` etc.), so passing
    // onMentionSelect directly would freeze the mount-time closure. See #92.
    const onMentionSelectRef = React.useRef(onMentionSelect)
    onMentionSelectRef.current = onMentionSelect
    // Same reasoning for the mention data sources read inside the memoized
    // `items` resolver — the memo only rebuilds on presence, so a consumer
    // swapping the list or the search fn would otherwise keep the mount-time
    // value. See #92.
    const mentionsRef = React.useRef(mentions)
    mentionsRef.current = mentions
    const onMentionSearchRef = React.useRef(onMentionSearch)
    onMentionSearchRef.current = onMentionSearch

    const isMobile = useIsMobile()
    const config = variantConfig[variant]
    const maxHeightPx = config.maxHeight

    // ── Voice Recorder ────────────────────────────────────────
    const voiceRecorder = useVoiceRecorder({
      maxDuration,
      onComplete: async (blob, duration, waveformData) => {
        onVoiceRecord?.(blob, duration)

        // If consumer provides a transcription handler, try to transcribe
        if (onTranscribe) {
          const text = await onTranscribe(blob, duration)
          if (text != null) {
            // Insert transcribed text into the editor instead of attaching voice note
            editor?.chain().focus().insertContent(text).run()
            setState('idle')  // back to idle — hasContent will be derived from editor
            return
          }
        }

        // Fall back to voice note attachment
        setVoiceNote({ blob, duration, waveformData })
        setState('review')
      },
    })

    const handleStartRecording = React.useCallback(() => {
      voiceRecorder.start()
      setState('recording')
    }, [voiceRecorder])

    const handleStopRecording = React.useCallback(() => {
      voiceRecorder.stop() // triggers onComplete → setState('review')
    }, [voiceRecorder])

    const handleCancelRecording = React.useCallback(() => {
      voiceRecorder.cancel()
      setState('idle')
    }, [voiceRecorder])

    // ── TipTap Extensions ─────────────────────────────────────
    const extensions = React.useMemo(() => {
      const exts = [
        StarterKit.configure({
          heading: false,
          horizontalRule: false,
          codeBlock: false,
          blockquote: false,
          // v3: Underline + Link included in StarterKit
          link: {
            openOnClick: false,
            HTMLAttributes: { class: 'text-accent-11 underline' },
          },
        }),
        Placeholder.configure({ placeholder }),
        Highlight.configure({ multicolor: false }),
        Image,
        CharacterCount.configure({ limit: maxLength || undefined }),
        FileAttachment,
        EmojiNode,
        createEmojiSuggestion(),
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
                if (onMentionSearchRef.current) return await onMentionSearchRef.current(query)
                const list = mentionsRef.current
                if (list) return list.filter(m => m.label.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
                return []
              },
              render: createSuggestionRenderer((item: MentionItem) => onMentionSelectRef.current?.(item)),
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
    }, [placeholder, maxLength, emojiSet, !!mentions, !!onMentionSearch, !!slashCommands])

    // ── Editor ────────────────────────────────────────────────
    const editor = useEditor({
      immediatelyRender: false, // SSR-safe — prevents hydration mismatch in Next.js
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
            return true
          }
          return false
        },
      },
    })

    // ── Submit Handler (structured output) ────────────────────
    const handleSubmit = React.useCallback(() => {
      if (!editor) return

      const hasText = !editor.isEmpty
      const hasAttachments = attachments.length > 0
      const hasVoice = !!voiceNote

      if (!hasText && !hasAttachments && !hasVoice) return
      if (isStreaming) return

      const message: RichChatInputMessage = {
        html: hasText ? editor.getHTML() : '',
        plainText: hasText ? editor.getText() : '',
      }

      if (hasAttachments) {
        message.attachments = attachments
          .filter(a => !a.uploading && a.url)
          .map(a => ({ url: a.url!, name: a.name, size: a.size, type: a.type }))
      }

      if (hasVoice) {
        message.voiceNote = { blob: voiceNote.blob, duration: voiceNote.duration }
      }

      if (scheduledDate && onSchedule) {
        onSchedule(message, scheduledDate)
      } else {
        onSubmit(message)
      }

      // Reset everything
      editor.commands.clearContent()
      setAttachments([])
      setVoiceNote(null)
      setScheduledDate(null)
      setState('idle')
    }, [editor, attachments, voiceNote, isStreaming, onSubmit, onSchedule, scheduledDate])

    // Wire submit ref (for enter-to-send extension)
    submitRef.current = handleSubmit

    // ── NO state tracking from editor events ──────────────────
    // Previous approach tracked idle/focused/composing via setState from TipTap
    // events. This caused React re-renders during ProseMirror DOM modifications →
    // "removeChild" crashes. Instead, we derive hasContent/editorIsEmpty at render
    // time, and use CSS :focus-within for focus styling. Only recording/review
    // states are tracked (user-triggered, not editor-triggered).

    // ── Editor height: pure CSS (no ResizeObserver/setState) ───
    // ResizeObserver was calling setEditorHeight during ProseMirror DOM changes,
    // triggering React re-renders → removeChild crashes. CSS min/max-height
    // + overflow-y: auto handles this natively without any state.

    // ── Typing Indicator ──────────────────────────────────────
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

    // ── Empty State Callback ──────────────────────────────────
    React.useEffect(() => {
      if (!editor || !onEmpty) return
      const handleUpdate = () => { onEmpty(editor.isEmpty) }
      editor.on('update', handleUpdate)
      handleUpdate()
      return () => { editor.off('update', handleUpdate) }
    }, [editor, onEmpty])

    // ── File Handling ─────────────────────────────────────────
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

    // ── Voice Note Review Discard ─────────────────────────────
    const handleDiscardVoice = React.useCallback(() => {
      setVoiceNote(null)
      setState('idle')
    }, [])

    // ── Derived Values ────────────────────────────────────────
    // v3: useEditorState subscribes to editor changes so charCount/isEmpty
    // update without full parent re-renders on every transaction.
    const editorDerived = useEditorState({
      editor,
      selector: ({ editor: e }) => {
        if (!e) return null
        return { editorIsEmpty: e.isEmpty }
      },
    })
    const editorIsEmpty = editorDerived?.editorIsEmpty ?? true

    // Track character count via editor event (useEditorState's deep-equal comparison
    // swallows storage.characterCount changes since the function reference is stable)
    React.useEffect(() => {
      if (!editor) return
      const updateCount = () => {
        // Compute directly from document — CharacterCount storage.characters() returns 0 in TipTap v3
        const text = editor.state.doc.textBetween(0, editor.state.doc.content.size, undefined, ' ')
        setCharCount(text.length)
      }
      updateCount()
      editor.on('update', updateCount)
      return () => { editor.off('update', updateCount) }
    }, [editor])
    const hasContent = !editorIsEmpty || attachments.length > 0 || !!voiceNote
    const isInline = variant === 'inline'
    const showToolbar = toolbarExpanded || state === 'review' || variant === 'expanded'
    const btnSize = 'icon-md' as const
    const iconSize = 'md' as const

    return (
      <div
        ref={ref}
        className={cn(
          'border-t border-surface-border-subtle px-ds-05 py-ds-04',
          'flex items-center gap-ds-03',
          className,
        )}
        {...props}
      >
        {/* Action button outside the input on the left */}
        {actionButton !== false && (
          actionButton ?? (
            (onFileUpload || onImageUpload) ? (
              <Button
                variant="solid"
                size="icon-md"
                onClick={() => fileInputRef.current?.click()}
                title="Attach"
                aria-label="Attach file"
                className="shrink-0"
              >
                <Icon icon={IconPlus} size="md" />
              </Button>
            ) : null
          )
        )}

        {/* Container */}
        <div
          role="region"
          aria-label="Message composer"
          className={cn(
            'flex-1 min-w-0 overflow-hidden rounded-surface border border-surface-border-strong bg-surface-raised-hover',
            'transition-[color,background-color,border-color,box-shadow] duration-fast-02 ease-productive-standard',
            'hover:bg-surface-raised-active',
            'focus-within:ring-2 focus-within:ring-accent-9 focus-within:ring-offset-2 focus-within:border-accent-9',
            state === 'recording' && 'border-error-7/30',
            isDragging && 'border-dashed border-accent-7 bg-accent-2',
            disabled && 'opacity-action-disabled cursor-not-allowed',
          )}
          onFocus={() => setEditorFocused(true)}
          onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setEditorFocused(false) }}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          {/* Leading slot */}
          {leadingSlot}

          {/* Zone 1: Reply Banner */}
          <AnimatePresence>
            {replyTo && (
              <ReplyBanner
                key="reply"
                author={replyTo.author}
                preview={replyTo.preview}
                onDismiss={replyTo.onDismiss}
              />
            )}
          </AnimatePresence>

          {/* Schedule Banner */}
          <AnimatePresence>
            {scheduledDate && (
              <ScheduleBanner
                key="schedule"
                date={scheduledDate}
                onEdit={() => setScheduleDialogOpen(true)}
                onClear={() => setScheduledDate(null)}
              />
            )}
          </AnimatePresence>

          {/* Zone 2: Attachment Strip */}
          <AnimatePresence>
            {attachments.length > 0 && (
              <AttachmentStrip
                key="attachments"
                attachments={attachments}
                onRemoveAttachment={removeAttachment}
              />
            )}
          </AnimatePresence>

          {/* Toolbar above input (inline variant) — CSS transition */}
          {config.toolbarPosition === 'top' && editor && (
            <div
              className={cn(
                'grid transition-[grid-template-rows,opacity] duration-moderate-01 ease-productive-standard',
                toolbarExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none',
              )}
            >
              <div className="overflow-hidden">
                <ChatToolbar
                  editor={editor}
                  toolbar={toolbarProp}
                  isMobile={false}
                  hasMentions={!!(mentions || onMentionSearch)}
                  hasSlashCommands={!!slashCommands}
                  disabled={disabled}
                />
              </div>
            </div>
          )}

          {/* Zone 3: Editor (always mounted — never unmount TipTap) */}
          <div className="relative">
            {/* Recording overlay — positioned over the editor, no AnimatePresence */}
            {state === 'recording' && (
              <RecordingOverlay
                duration={voiceRecorder.duration}
                analyserNode={voiceRecorder.analyserNode}
                maxDuration={maxDuration}
                onCancel={handleCancelRecording}
              />
            )}

            {/* Editor + inline action icons in one flex row */}
            <div
              ref={editorWrapperRef}
              className={cn(
                'flex items-center px-ds-04 py-ds-03 cursor-text [&_.tiptap]:w-full [&_.tiptap]:outline-hidden',
                state === 'recording' && 'invisible',
              )}
              style={{
                minHeight: config.minHeight,
                maxHeight: maxHeightPx,
                overflowY: 'auto',
              }}
              onClick={() => editor?.commands.focus()}
            >
              {/* Editor takes all available space */}
              <div className="flex-1 min-w-0">
                <EditorContent editor={editor} />
              </div>

              {/* Action icons — right-aligned inside input */}
              {editor && state !== 'recording' && (
                <div className="flex items-center gap-ds-01 shrink-0 ml-ds-03">
                  {/* Formatting toggle (A button) */}
                  <button
                    type="button"
                    onClick={() => setToolbarExpanded(prev => !prev)}
                    title={toolbarExpanded ? 'Hide formatting' : 'Show formatting'}
                    aria-label={toolbarExpanded ? 'Hide formatting' : 'Show formatting'}
                    aria-pressed={toolbarExpanded}
                    className={cn(
                      'inline-flex h-ds-xs-plus w-ds-xs-plus items-center justify-center rounded-control touch-target',
                      'transition-colors duration-fast-01 ease-productive-standard',
                      'hover:bg-surface-raised-hover',
                      toolbarExpanded ? 'bg-surface-raised-hover text-accent-11' : 'text-surface-fg-subtle',
                    )}
                  >
                    <Icon icon={IconTextSize} size="xs" />
                  </button>

                  {/* Emoji picker */}
                  <div className="relative">
                    <button
                      ref={emojiAnchorRef}
                      type="button"
                      onClick={() => setShowEmojiPicker(prev => !prev)}
                      title="Emoji"
                      aria-label="Emoji"
                      className={cn(
                        'inline-flex h-ds-xs-plus w-ds-xs-plus items-center justify-center rounded-control touch-target transition-colors duration-fast-01',
                        showEmojiPicker ? 'bg-surface-raised-hover text-accent-11' : 'text-surface-fg-subtle hover:bg-surface-raised-hover hover:text-surface-fg',
                      )}
                    >
                      <Icon icon={IconMoodSmile} size="xs" />
                    </button>
                    {showEmojiPicker && ReactDOM.createPortal(
                      <div ref={emojiFloatingRef} className="absolute z-popover" style={{ top: 0, left: 0 }}>
                        <EmojiPickerPopover
                          onSelect={({ id, native }) => {
                            editor.chain().focus().insertContent({
                              type: 'emojiNode',
                              attrs: { id, native },
                            }).run()
                            setShowEmojiPicker(false)
                          }}
                          onClose={() => setShowEmojiPicker(false)}
                        />
                      </div>,
                      document.body,
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Voice Note Review — shown in 'review' state */}
          {state === 'review' && voiceNote && (
            <div className="flex items-center gap-ds-03 px-ds-04 py-ds-02b border-b border-surface-border">
              <AudioPlayer
                src={voiceNote.blob}
                duration={voiceNote.duration}
                waveformData={voiceNote.waveformData}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleDiscardVoice}
                aria-label="Discard voice note"
                title="Discard voice note"
                className="text-surface-fg-subtle hover:text-error-11"
              >
                <Icon icon={IconTrash} size="sm" />
              </Button>
            </div>
          )}

          {/* Mobile BubbleMenu — shows on text selection */}
          {isMobile && editor && !editorIsEmpty && (
            <ChatBubbleMenu editor={editor} />
          )}

          {/* Zone 4: Toolbar below — CSS transition instead of AnimatePresence */}
          {config.toolbarPosition === 'bottom' && editor && (
            <div
              className={cn(
                'grid transition-[grid-template-rows,opacity] duration-moderate-01 ease-productive-standard',
                showToolbar ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none',
              )}
            >
              <div className="overflow-hidden">
                <ChatToolbar
                  editor={editor}
                  toolbar={toolbarProp}
                  isMobile={isMobile}
                  hasMentions={!!(mentions || onMentionSearch)}
                  hasSlashCommands={!!slashCommands}
                  disabled={disabled}
                />
              </div>
            </div>
          )}

          {/* Character counter */}
          {maxLength && charCountDisplay !== 'hidden' && (() => {
            const ratio = charCount / maxLength
            const showAlways = charCountDisplay === 'always'
            const showFocus = charCountDisplay === 'focus' && editorFocused
            const showNearLimit = (charCountDisplay === 'near-limit' || !charCountDisplay) && ratio >= 0.8
            const visible = showAlways || showFocus || showNearLimit || ratio >= 1

            if (!visible) return null

            return (
              <div className={cn(
                'flex justify-end px-ds-04 pb-ds-02 text-ds-xs tabular-nums transition-opacity duration-fast-01',
                ratio >= 1 ? 'text-error-11 font-medium' : ratio >= 0.9 ? 'text-warning-11' : 'text-surface-fg-subtle',
              )}>
                {charCount}/{maxLength}
              </div>
            )
          })()}

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

        {/* Send/mic/recording buttons — animated transitions between states */}
        <div className="flex items-center gap-ds-02 shrink-0">
          {sendOptions && sendOptions.length > 0 && state !== 'recording' && (
            <SplitSendDropdown options={sendOptions} />
          )}
          <AnimatePresence mode="popLayout" initial={false}>
            {state === 'recording' && (
              <motion.div
                key="recording"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: durations.moderate01 }}
                className="flex items-center gap-ds-02"
              >
                <Button variant="soft" size={btnSize} onClick={handleCancelRecording} aria-label="Cancel recording" title="Cancel recording" className="text-surface-fg-subtle hover:text-error-11">
                  <Icon icon={IconTrash} size={iconSize} />
                </Button>
                <Button variant="solid" size={btnSize} color="error" onClick={handleStopRecording} aria-label="Stop recording" title="Stop recording">
                  <Icon icon={IconSquare} size={iconSize} />
                </Button>
              </motion.div>
            )}
            {isStreaming && state !== 'recording' && (
              <motion.div
                key="streaming"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: durations.moderate01 }}
              >
                <Button variant="solid" size={btnSize} color="error" onClick={onCancel} aria-label="Stop" title="Stop">
                  <Icon icon={IconSquare} size={iconSize} />
                </Button>
              </motion.div>
            )}
            {!isStreaming && state !== 'recording' && hasContent && onSchedule && (
              <motion.div
                key="split-send"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: durations.moderate01 }}
              >
                <SplitButton
                  onClick={handleSubmit}
                  disabled={disabled}
                  aria-label={scheduledDate ? 'Schedule send' : 'Send'}
                  size={btnSize}
                  dropdownContent={
                    <ScheduleDropdownContent
                      onSchedule={(date) => setScheduledDate(date)}
                      onClose={() => {}}
                      onOpenDialog={() => setScheduleDialogOpen(true)}
                    />
                  }
                >
                  <Icon icon={scheduledDate ? IconClock : IconSend} size={iconSize} />
                </SplitButton>
              </motion.div>
            )}
            {!isStreaming && state !== 'recording' && hasContent && !onSchedule && (
              <motion.div
                key="send"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: durations.moderate01 }}
              >
                <Button variant="solid" size={btnSize} onClick={handleSubmit} disabled={disabled} aria-label="Send" title="Send">
                  <Icon icon={IconSend} size={iconSize} />
                </Button>
              </motion.div>
            )}
            {!isStreaming && state !== 'recording' && !hasContent && onVoiceRecord && (
              <motion.div
                key="mic"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: durations.moderate01 }}
              >
                <Button variant="soft" size={btnSize} onClick={handleStartRecording} aria-label="Record voice message" title="Record voice message">
                  <Icon icon={IconMicrophone} size={iconSize} />
                </Button>
              </motion.div>
            )}
            {!isStreaming && state !== 'recording' && !hasContent && !onVoiceRecord && (
              <motion.div
                key="send-disabled"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: durations.moderate01 }}
              >
                <Button variant="solid" size={btnSize} disabled aria-label="Send" title="Send">
                  <Icon icon={IconSend} size={iconSize} />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Disclaimer */}
        {disclaimer && (
          <p className="mt-ds-02 text-center text-ds-xs text-surface-fg-subtle/50">
            {disclaimer}
          </p>
        )}

        {/* Schedule Dialog (full picker) */}
        {onSchedule && (
          <ScheduleDialog
            open={scheduleDialogOpen}
            onOpenChange={setScheduleDialogOpen}
            onSchedule={(date) => setScheduledDate(date)}
            initialDate={scheduledDate}
          />
        )}
      </div>
    )
  },
)
RichChatInput.displayName = 'RichChatInput'

export { RichChatInput }
export type { ChatToolbarItem }

// Re-export toolbar primitives for custom toolbar composition
export {
  BlockquoteButton,
  BoldButton,
  BulletListButton,
  CodeButton,
  EmojiButton,
  HighlightButton,
  ItalicButton,
  LinkButton,
  MentionButton,
  OrderedListButton,
  SlashCommandButton,
  StrikeButton,
  ToolbarButton,
  ToolbarDivider,
  ToolbarGroup,
  UnderlineButton,
} from './rich-chat-input/chat-toolbar'
