'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Editor } from '@tiptap/core'
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
  IconMicrophone,
} from '@tabler/icons-react'
import { Icon } from '../../ui/icon'
import { Button } from '../../ui/button'
import { cn } from '../../ui/lib/utils'

export type ChatToolbarItem =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strike'
  | 'highlight'
  | 'code'
  | 'bulletList'
  | 'orderedList'
  | 'mention'
  | 'emoji'
  | 'attach'
  | 'slash'

export interface ChatToolbarProps {
  editor: Editor
  toolbar: boolean | ChatToolbarItem[]
  isMobile: boolean
  hasMentions: boolean
  hasSlashCommands: boolean
  hasFileUpload: boolean
  onAttachClick: () => void
  maxLength?: number
  charCount: number
  isEmpty: boolean
  disabled: boolean
  isStreaming: boolean
  hasVoice: boolean
  hasContent: boolean
  onSubmit: () => void
  onCancel?: () => void
  onMicClick?: () => void
}

function ToolbarBtn({
  onClick,
  isActive,
  disabled,
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
        'inline-flex h-ds-xs-plus w-ds-xs-plus items-center justify-center rounded-ds-md touch-target',
        'transition-[color,background-color,transform] duration-fast-01 ease-productive-standard',
        'hover:bg-surface-raised-hover hover:text-surface-fg',
        'active:scale-95',
        'disabled:pointer-events-none disabled:opacity-action-disabled',
        isActive
          ? 'bg-surface-raised-hover text-accent-11'
          : 'text-surface-fg-subtle',
      )}
    >
      {children}
    </button>
  )
}

function Divider() {
  return (
    <div className="h-4 w-px bg-surface-border-subtle mx-ds-01" />
  )
}

export function ChatToolbar({
  editor,
  toolbar,
  isMobile,
  hasMentions,
  hasSlashCommands,
  hasFileUpload,
  onAttachClick,
  maxLength,
  charCount,
  isEmpty,
  disabled,
  isStreaming,
  hasVoice,
  hasContent,
  onSubmit,
  onCancel,
  onMicClick,
}: ChatToolbarProps) {
  const toolbarItems = toolbar === true ? null : (toolbar as ChatToolbarItem[])
  const show = (item: ChatToolbarItem) =>
    toolbarItems === null || toolbarItems.includes(item)

  const charPct = maxLength != null && maxLength > 0 ? charCount / maxLength : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.15, ease: [0.2, 0, 0.38, 0.9] }}
      role="toolbar"
      aria-label="Message formatting"
      className="flex flex-wrap items-center gap-ds-01 border-t border-surface-border px-ds-04 py-ds-02b"
    >
      {/* Formatting group — desktop only */}
      {!isMobile && show('bold') && (
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          disabled={disabled}
          title="Bold"
        >
          <Icon icon={IconBold} size="xs" />
        </ToolbarBtn>
      )}
      {!isMobile && show('italic') && (
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          disabled={disabled}
          title="Italic"
        >
          <Icon icon={IconItalic} size="xs" />
        </ToolbarBtn>
      )}
      {!isMobile && show('underline') && (
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          disabled={disabled}
          title="Underline"
        >
          <Icon icon={IconUnderline} size="xs" />
        </ToolbarBtn>
      )}
      {!isMobile && show('strike') && (
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          disabled={disabled}
          title="Strikethrough"
        >
          <Icon icon={IconStrikethrough} size="xs" />
        </ToolbarBtn>
      )}
      {!isMobile && show('highlight') && (
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          isActive={editor.isActive('highlight')}
          disabled={disabled}
          title="Highlight"
        >
          <Icon icon={IconHighlight} size="xs" />
        </ToolbarBtn>
      )}
      {!isMobile && show('code') && (
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          disabled={disabled}
          title="Code"
        >
          <Icon icon={IconCode} size="xs" />
        </ToolbarBtn>
      )}

      {/* Divider between formatting and lists — desktop only */}
      {!isMobile && <Divider />}

      {/* List group — desktop only */}
      {!isMobile && show('bulletList') && (
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          disabled={disabled}
          title="Bullet list"
        >
          <Icon icon={IconList} size="xs" />
        </ToolbarBtn>
      )}
      {!isMobile && show('orderedList') && (
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          disabled={disabled}
          title="Numbered list"
        >
          <Icon icon={IconListNumbers} size="xs" />
        </ToolbarBtn>
      )}

      {/* Divider between lists and insert group — desktop only */}
      {!isMobile && <Divider />}

      {/* Insert group — always visible */}
      {hasMentions && show('mention') && (
        <ToolbarBtn
          onClick={() => editor.chain().focus().insertContent('@').run()}
          disabled={disabled}
          title="Mention"
        >
          <Icon icon={IconAt} size="xs" />
        </ToolbarBtn>
      )}
      {show('emoji') && (
        <ToolbarBtn
          onClick={() => editor.chain().focus().insertContent(':').run()}
          disabled={disabled}
          title="Emoji"
        >
          <Icon icon={IconMoodSmile} size="xs" />
        </ToolbarBtn>
      )}
      {hasFileUpload && show('attach') && (
        <ToolbarBtn
          onClick={onAttachClick}
          disabled={disabled}
          title="Attach file"
        >
          <Icon icon={IconPaperclip} size="xs" />
        </ToolbarBtn>
      )}
      {hasSlashCommands && show('slash') && (
        <ToolbarBtn
          onClick={() => editor.chain().focus().insertContent('/').run()}
          disabled={disabled}
          title="Slash command"
        >
          <Icon icon={IconSlash} size="xs" />
        </ToolbarBtn>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Character counter */}
      {maxLength != null && (
        <span
          className={cn(
            'text-ds-xs tabular-nums transition-colors duration-moderate-01',
            charPct >= 1
              ? 'text-error-11'
              : charPct >= 0.9
                ? 'text-warning-11'
                : 'text-surface-fg-subtle',
          )}
        >
          {charCount}/{maxLength}
        </span>
      )}

      {/* Send / Stop / Mic morph */}
      <AnimatePresence mode="wait">
        {isStreaming ? (
          <motion.div
            key="stop"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.11 }}
          >
            <Button
              variant="ghost"
              size="icon-sm"
              color="error"
              onClick={onCancel}
              aria-label="Stop"
              title="Stop"
            >
              <Icon icon={IconSquare} size="sm" />
            </Button>
          </motion.div>
        ) : hasContent ? (
          <motion.div
            key="send"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [0.8, 1.05, 1.0], opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onSubmit}
              disabled={isEmpty || disabled}
              aria-label="Send"
              title="Send"
            >
              <Icon icon={IconSend} size="sm" />
            </Button>
          </motion.div>
        ) : hasVoice ? (
          <motion.div
            key="mic"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onMicClick}
              aria-label="Record voice message"
              title="Record voice message"
            >
              <Icon icon={IconMicrophone} size="sm" />
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="send-disabled"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Button
              variant="ghost"
              size="icon-sm"
              disabled
              aria-label="Send"
              title="Send"
            >
              <Icon icon={IconSend} size="sm" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
