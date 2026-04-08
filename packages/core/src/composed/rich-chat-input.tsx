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
import { AnimatePresence } from 'framer-motion'
import {
  IconBold,
  IconItalic,
  IconUnderline,
  IconStrikethrough,
  IconHighlight,
  IconCode,
  IconMicrophone,
} from '@tabler/icons-react'
import { FileAttachment } from './extensions/file-attachment'
import { EmojiSuggestion } from './extensions/emoji-suggestion'
import { createSuggestionRenderer } from './extensions/mention-suggestion'
import { createSlashCommandExtension } from './extensions/slash-command'
import type { SlashCommandGroup } from './extensions/slash-command'
import type { MentionItem } from './rich-text-editor'
import { ReplyBanner } from './rich-chat-input/reply-banner'
import { AttachmentStrip } from './rich-chat-input/attachment-strip'
import type { Attachment } from './rich-chat-input/attachment-strip'
import { RecordingOverlay } from './rich-chat-input/recording-overlay'
import { ChatToolbar } from './rich-chat-input/chat-toolbar'
import type { ChatToolbarItem } from './rich-chat-input/chat-toolbar'
import { AudioWaveform } from './rich-chat-input/audio-waveform'
import type { AudioWaveformProps } from './rich-chat-input/audio-waveform'
import { AudioPlayer } from './rich-chat-input/audio-player'
import type { AudioPlayerProps } from './rich-chat-input/audio-player'
import { useVoiceRecorder } from './rich-chat-input/use-voice-recorder'
import type { UseVoiceRecorderOptions, UseVoiceRecorderReturn } from './rich-chat-input/use-voice-recorder'
import { Button } from '../ui/button'
import { Icon } from '../ui/icon'
import { cn } from '../ui/lib/utils'
import { useIsMobile } from '../hooks/use-mobile'

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

type InputState = 'idle' | 'focused' | 'composing' | 'recording' | 'review'

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
  variant?: 'compact' | 'expanded' | 'minimal'
  enterBehavior?: 'send' | 'newline'
  maxLength?: number
  mentions?: MentionItem[]
  onMentionSearch?: (query: string) => Promise<MentionItem[]>
  onMentionSelect?: (item: MentionItem) => void
  onFileUpload?: (file: File) => Promise<{ url: string; name: string; size: number }>
  onImageUpload?: (file: File) => Promise<string>
  slashCommands?: SlashCommandGroup[]
  onVoiceRecord?: (audio: Blob, duration: number) => void
  maxDuration?: number
  replyTo?: { id: string; author: string; preview: string; onDismiss: () => void }
  onTyping?: (isTyping: boolean) => void
  onEmpty?: (isEmpty: boolean) => void
  isStreaming?: boolean
  onCancel?: () => void
  leadingSlot?: React.ReactNode
  trailingSlot?: React.ReactNode
  disclaimer?: string
  toolbar?: boolean | ChatToolbarItem[]
}

// ── Variant config ──────────────────────────────────────────────

const variantConfig = {
  compact:  { minHeight: 40, maxHeight: 256, showToolbar: true },
  expanded: { minHeight: 96, maxHeight: 384, showToolbar: true },
  minimal:  { minHeight: 32, maxHeight: 128, showToolbar: false },
}

// ── Chat prose (tighter than RTE, text-ds-md to match Input) ────

const CHAT_PROSE = [
  'prose prose-sm max-w-none focus:outline-none',
  'font-body text-ds-md leading-relaxed text-surface-fg',
  '[&_p]:mb-ds-01 [&_p]:text-surface-fg',
  '[&_p:last-child]:mb-0',
  '[&_ul]:ml-ds-04 [&_ul]:list-disc [&_ol]:ml-ds-04 [&_ol]:list-decimal',
  '[&_li]:text-surface-fg',
  '[&_code]:rounded [&_code]:bg-surface-raised [&_code]:px-ds-02 [&_code]:py-[1px] [&_code]:text-ds-md [&_code]:text-accent-11',
  '[&_strong]:font-semibold [&_strong]:text-surface-fg',
  '[&_mark]:rounded-sm [&_mark]:bg-warning-3 [&_mark]:px-[2px]',
  '[&_a]:text-accent-11 [&_a]:underline',
  '[&_.mention]:rounded-ds-sm [&_.mention]:bg-accent-2 [&_.mention]:px-ds-02 [&_.mention]:py-[1px] [&_.mention]:font-medium [&_.mention]:text-accent-11',
].join(' ')

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
        'inline-flex h-ds-xs-plus w-ds-xs-plus items-center justify-center rounded-ds-md touch-target',
        'transition-colors duration-fast-01 ease-productive-standard',
        'hover:bg-surface-raised-hover',
        isActive ? 'bg-surface-raised-hover text-accent-11' : 'text-surface-fg-subtle',
      )}
    >
      {children}
    </button>
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
      mentions,
      onMentionSearch,
      onMentionSelect,
      onFileUpload,
      onImageUpload,
      slashCommands,
      onVoiceRecord,
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
      className,
      ...props
    },
    ref,
  ) {
    // ── State ──────────────────────────────────────────────────
    const [state, setState] = React.useState<InputState>('idle')
    const [attachments, setAttachments] = React.useState<Attachment[]>([])
    const [voiceNote, setVoiceNote] = React.useState<{ blob: Blob; duration: number; waveformData: number[] } | null>(null)
    const [isDragging, setIsDragging] = React.useState(false)
    const [editorHeight, setEditorHeight] = React.useState<number>(0)

    const fileInputRef = React.useRef<HTMLInputElement>(null)
    const typingTimeoutRef = React.useRef<ReturnType<typeof setTimeout>>(undefined)
    const submitRef = React.useRef<(() => void) | undefined>(undefined)
    const enterBehaviorRef = React.useRef(enterBehavior)
    enterBehaviorRef.current = enterBehavior

    const isMobile = useIsMobile()
    const config = variantConfig[variant]
    const maxHeightPx = config.maxHeight

    // ── Voice Recorder ────────────────────────────────────────
    const voiceRecorder = useVoiceRecorder({
      maxDuration,
      onComplete: (blob, duration, waveformData) => {
        setVoiceNote({ blob, duration, waveformData })
        setState('review')
        onVoiceRecord?.(blob, duration)
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
      // Return to previous state based on editor content
      setState((prev) => {
        // We can't read editor here directly in a setState callback,
        // so we'll correct in the effect below. Default to 'focused'.
        return 'focused'
      })
    }, [voiceRecorder])

    // ── TipTap Extensions ─────────────────────────────────────
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
        Link.configure({
          openOnClick: false,
          HTMLAttributes: { class: 'text-accent-11 underline' },
        }),
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

    // ── Editor ────────────────────────────────────────────────
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

      onSubmit(message)

      // Reset everything
      editor.commands.clearContent()
      setAttachments([])
      setVoiceNote(null)
      setState('idle')
    }, [editor, attachments, voiceNote, isStreaming, onSubmit])

    // Wire submit ref (for enter-to-send extension)
    submitRef.current = handleSubmit

    // ── Focus / Blur / State Tracking ─────────────────────────
    React.useEffect(() => {
      if (!editor) return

      const handleFocus = () => {
        if (state === 'idle') setState('focused')
      }

      const handleBlur = () => {
        if (state === 'focused' && editor.isEmpty) setState('idle')
        if (state === 'composing' && editor.isEmpty && attachments.length === 0) setState('idle')
      }

      const handleUpdate = () => {
        if (!editor.isEmpty && (state === 'idle' || state === 'focused')) {
          setState('composing')
        }
        if (editor.isEmpty && state === 'composing' && attachments.length === 0 && !voiceNote) {
          setState(editor.isFocused ? 'focused' : 'idle')
        }
      }

      editor.on('focus', handleFocus)
      editor.on('blur', handleBlur)
      editor.on('update', handleUpdate)

      return () => {
        editor.off('focus', handleFocus)
        editor.off('blur', handleBlur)
        editor.off('update', handleUpdate)
      }
    }, [editor, state, attachments.length, voiceNote])

    // ── Editor Height Breathing (ResizeObserver) ──────────────
    React.useEffect(() => {
      const el = editor?.view?.dom
      if (!el) return

      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const height = Math.min(entry.contentRect.height, maxHeightPx)
          setEditorHeight(height)
        }
      })

      observer.observe(el)
      return () => observer.disconnect()
    }, [editor, maxHeightPx])

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

      // Transition to composing if we're idle/focused
      setState(prev => {
        if (prev === 'idle' || prev === 'focused') return 'composing'
        return prev
      })

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
      setAttachments(prev => {
        const next = prev.filter(a => a.id !== id)
        // If no attachments and editor is empty, drop back
        if (next.length === 0 && editor?.isEmpty && !voiceNote) {
          setState(editor.isFocused ? 'focused' : 'idle')
        }
        return next
      })
    }, [editor, voiceNote])

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
      if (editor && !editor.isEmpty) {
        setState('composing')
      } else if (attachments.length > 0) {
        setState('composing')
      } else {
        setState(editor?.isFocused ? 'focused' : 'idle')
      }
    }, [editor, attachments.length])

    // ── Derived Values ────────────────────────────────────────
    const charCount = editor?.storage.characterCount?.characters() ?? 0
    const editorIsEmpty = editor?.isEmpty ?? true
    const hasContent = !editorIsEmpty || attachments.length > 0 || !!voiceNote
    const showToolbar = state === 'composing' || state === 'review' || variant === 'expanded'

    return (
      <div
        ref={ref}
        className={cn('border-t border-surface-border-subtle px-ds-05 py-ds-04', className)}
        {...props}
      >
        {/* Container */}
        <div
          role="region"
          aria-label="Message composer"
          className={cn(
            'rounded-ds-lg border border-surface-border-strong bg-surface-raised-hover',
            'transition-[color,background-color,border-color,box-shadow] duration-fast-02 ease-productive-standard',
            'hover:bg-surface-raised-active',
            (state !== 'idle') && 'ring-2 ring-accent-9 ring-offset-2 border-accent-9',
            state === 'recording' && 'border-error-7/30',
            isDragging && 'border-dashed border-accent-7 bg-accent-2',
            disabled && 'opacity-action-disabled cursor-not-allowed',
          )}
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

          {/* Zone 3: Editor / Recording */}
          <AnimatePresence mode="wait">
            {state === 'recording' ? (
              <RecordingOverlay
                key="recording"
                duration={voiceRecorder.duration}
                analyserNode={voiceRecorder.analyserNode}
                maxDuration={maxDuration}
                onStop={handleStopRecording}
                onCancel={handleCancelRecording}
              />
            ) : (
              <div
                key="editor"
                className="px-ds-04 py-ds-03"
                style={{
                  minHeight: config.minHeight,
                  maxHeight: maxHeightPx,
                  overflowY: 'auto',
                }}
              >
                <EditorContent
                  editor={editor}
                />
              </div>
            )}
          </AnimatePresence>

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
                <Icon icon={IconMicrophone} size="sm" className="line-through" />
              </Button>
            </div>
          )}

          {/* Mobile BubbleMenu — shows on text selection */}
          {isMobile && editor && state === 'composing' && (
            <BubbleMenu
              editor={editor}
              className="flex gap-ds-01 rounded-ds-lg border border-surface-border-strong bg-surface-overlay p-ds-02 shadow-floating"
            >
              <BubbleBtn onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold">
                <Icon icon={IconBold} size="xs" />
              </BubbleBtn>
              <BubbleBtn onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic">
                <Icon icon={IconItalic} size="xs" />
              </BubbleBtn>
              <BubbleBtn onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Underline">
                <Icon icon={IconUnderline} size="xs" />
              </BubbleBtn>
              <BubbleBtn onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Strikethrough">
                <Icon icon={IconStrikethrough} size="xs" />
              </BubbleBtn>
              <BubbleBtn onClick={() => editor.chain().focus().toggleHighlight().run()} isActive={editor.isActive('highlight')} title="Highlight">
                <Icon icon={IconHighlight} size="xs" />
              </BubbleBtn>
              <BubbleBtn onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')} title="Code">
                <Icon icon={IconCode} size="xs" />
              </BubbleBtn>
            </BubbleMenu>
          )}

          {/* Zone 4: Toolbar — shown in composing/review or expanded variant */}
          <AnimatePresence>
            {showToolbar && editor && (
              <ChatToolbar
                key="toolbar"
                editor={editor}
                toolbar={toolbarProp}
                isMobile={isMobile}
                hasMentions={!!(mentions || onMentionSearch)}
                hasSlashCommands={!!slashCommands}
                hasFileUpload={!!(onFileUpload || onImageUpload)}
                onAttachClick={() => fileInputRef.current?.click()}
                maxLength={maxLength}
                charCount={charCount}
                isEmpty={editorIsEmpty && attachments.length === 0 && !voiceNote}
                disabled={disabled}
                isStreaming={isStreaming}
                hasVoice={!!onVoiceRecord}
                hasContent={hasContent}
                onSubmit={handleSubmit}
                onCancel={onCancel}
                onMicClick={handleStartRecording}
              />
            )}
          </AnimatePresence>

          {/* Idle/Focused state: just the mic button (when voice is enabled) */}
          {(state === 'idle' || state === 'focused') && variant !== 'expanded' && onVoiceRecord && (
            <div className="flex justify-end px-ds-04 py-ds-02b">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleStartRecording}
                aria-label="Record voice message"
                title="Record voice message"
              >
                <Icon icon={IconMicrophone} size="sm" />
              </Button>
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
export type { ChatToolbarItem }
