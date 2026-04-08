'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
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
  IconSlash,
} from '@tabler/icons-react'
import { Icon } from '../../ui/icon'
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
  | 'slash'

export interface ChatToolbarProps {
  editor: Editor
  toolbar: boolean | ChatToolbarItem[]
  isMobile: boolean
  hasMentions: boolean
  hasSlashCommands: boolean
  disabled: boolean
}

// ── Toolbar Button ──────────────────────────────────────────────

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
  return <div className="h-4 w-px bg-surface-border-subtle mx-ds-01" />
}

// ── ChatToolbar ─────────────────────────────────────────────────

export function ChatToolbar({
  editor,
  toolbar,
  isMobile,
  hasMentions,
  hasSlashCommands,
  disabled,
}: ChatToolbarProps) {
  const toolbarItems = Array.isArray(toolbar) ? toolbar : null
  const show = (item: ChatToolbarItem) =>
    !toolbarItems || toolbarItems.includes(item)

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.15, ease: [0.2, 0, 0.38, 0.9] }}
      className="overflow-hidden"
    >
      <div
        role="toolbar"
        aria-label="Text formatting"
        className="flex flex-wrap items-center gap-ds-01 border-t border-surface-border px-ds-04 py-ds-02b"
      >
        {/* Formatting group — desktop only */}
        {!isMobile && show('bold') && (
          <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} disabled={disabled} title="Bold">
            <Icon icon={IconBold} size="xs" />
          </ToolbarBtn>
        )}
        {!isMobile && show('italic') && (
          <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} disabled={disabled} title="Italic">
            <Icon icon={IconItalic} size="xs" />
          </ToolbarBtn>
        )}
        {!isMobile && show('underline') && (
          <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} disabled={disabled} title="Underline">
            <Icon icon={IconUnderline} size="xs" />
          </ToolbarBtn>
        )}
        {!isMobile && show('strike') && (
          <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} disabled={disabled} title="Strikethrough">
            <Icon icon={IconStrikethrough} size="xs" />
          </ToolbarBtn>
        )}
        {!isMobile && show('highlight') && (
          <ToolbarBtn onClick={() => editor.chain().focus().toggleHighlight().run()} isActive={editor.isActive('highlight')} disabled={disabled} title="Highlight">
            <Icon icon={IconHighlight} size="xs" />
          </ToolbarBtn>
        )}
        {!isMobile && show('code') && (
          <ToolbarBtn onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')} disabled={disabled} title="Inline code">
            <Icon icon={IconCode} size="xs" />
          </ToolbarBtn>
        )}

        {!isMobile && <Divider />}

        {/* Lists — desktop only */}
        {!isMobile && show('bulletList') && (
          <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} disabled={disabled} title="Bullet list">
            <Icon icon={IconList} size="xs" />
          </ToolbarBtn>
        )}
        {!isMobile && show('orderedList') && (
          <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} disabled={disabled} title="Ordered list">
            <Icon icon={IconListNumbers} size="xs" />
          </ToolbarBtn>
        )}

        {!isMobile && <Divider />}

        {/* Insert group */}
        {hasMentions && show('mention') && (
          <ToolbarBtn onClick={() => editor.chain().focus().insertContent('@').run()} disabled={disabled} title="Mention">
            <Icon icon={IconAt} size="xs" />
          </ToolbarBtn>
        )}
        {show('emoji') && (
          <ToolbarBtn onClick={() => editor.chain().focus().insertContent(':').run()} disabled={disabled} title="Emoji">
            <Icon icon={IconMoodSmile} size="xs" />
          </ToolbarBtn>
        )}
        {hasSlashCommands && show('slash') && (
          <ToolbarBtn onClick={() => editor.chain().focus().insertContent('/').run()} disabled={disabled} title="Slash command">
            <Icon icon={IconSlash} size="xs" />
          </ToolbarBtn>
        )}
      </div>
    </motion.div>
  )
}
