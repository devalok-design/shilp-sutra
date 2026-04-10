'use client'

import * as React from 'react'
// motion removed — CSS transitions handle show/hide from parent
import type { Editor } from '@tiptap/core'
import { useEditorState } from '@tiptap/react'
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
  IconBlockquote,
  IconLink,
} from '@tabler/icons-react'
import { Icon } from '../../ui/icon'
import { cn } from '../../ui/lib/utils'

// ── Toolbar Context ─────────────────────────────────────────────
// Shares the TipTap editor instance with all toolbar primitives

const ToolbarContext = React.createContext<{ editor: Editor; disabled: boolean } | null>(null)

function useToolbarEditor() {
  const ctx = React.useContext(ToolbarContext)
  if (!ctx) throw new Error('Toolbar primitives must be used inside <ChatToolbar>')
  return ctx
}

// ── Toolbar Primitives (exported for custom toolbars) ───────────

/**
 * A single toolbar button. Use for built-in or custom actions.
 *
 * @example
 * <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold">
 *   <Icon icon={IconBold} size="xs" />
 * </ToolbarButton>
 */
export function ToolbarButton({
  onClick,
  isActive,
  disabled: disabledProp,
  title,
  children,
  className: classNameProp,
}: {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
  className?: string
}) {
  const { disabled: ctxDisabled } = useToolbarEditor()
  const isDisabled = disabledProp ?? ctxDisabled

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      title={title}
      aria-label={title}
      aria-pressed={isActive}
      className={cn(
        'inline-flex h-ds-xs-plus items-center justify-center rounded-ds-md touch-target',
        !classNameProp?.includes('w-') && 'w-ds-xs-plus',
        'transition-[color,background-color,transform] duration-fast-01 ease-productive-standard',
        'hover:bg-surface-raised-hover hover:text-surface-fg',
        'active:scale-95',
        'disabled:pointer-events-none disabled:opacity-action-disabled',
        isActive ? 'bg-surface-raised-hover text-accent-11' : 'text-surface-fg-subtle',
        classNameProp,
      )}
    >
      {children}
    </button>
  )
}

/** Visual separator between toolbar button groups. */
export function ToolbarDivider() {
  return <div className="h-4 w-px bg-surface-border-subtle mx-ds-01" />
}

/** Group wrapper — applies consistent spacing to a set of buttons. */
export function ToolbarGroup({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('flex items-center gap-ds-01', className)}>{children}</div>
}

// ── Pre-built Formatting Buttons (convenience exports) ──────────
// Each reads the editor from context and wires the correct command.

export function BoldButton() {
  const { editor } = useToolbarEditor()
  const { isActive } = useEditorState({
    editor,
    selector: ({ editor: e }) => ({ isActive: e.isActive('bold') }),
  })
  return (
    <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={isActive} title="Bold">
      <Icon icon={IconBold} size="xs" />
    </ToolbarButton>
  )
}

export function ItalicButton() {
  const { editor } = useToolbarEditor()
  const { isActive } = useEditorState({
    editor,
    selector: ({ editor: e }) => ({ isActive: e.isActive('italic') }),
  })
  return (
    <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={isActive} title="Italic">
      <Icon icon={IconItalic} size="xs" />
    </ToolbarButton>
  )
}

export function UnderlineButton() {
  const { editor } = useToolbarEditor()
  const { isActive } = useEditorState({
    editor,
    selector: ({ editor: e }) => ({ isActive: e.isActive('underline') }),
  })
  return (
    <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={isActive} title="Underline">
      <Icon icon={IconUnderline} size="xs" />
    </ToolbarButton>
  )
}

export function StrikeButton() {
  const { editor } = useToolbarEditor()
  const { isActive } = useEditorState({
    editor,
    selector: ({ editor: e }) => ({ isActive: e.isActive('strike') }),
  })
  return (
    <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={isActive} title="Strikethrough">
      <Icon icon={IconStrikethrough} size="xs" />
    </ToolbarButton>
  )
}

export function HighlightButton() {
  const { editor } = useToolbarEditor()
  const { isActive } = useEditorState({
    editor,
    selector: ({ editor: e }) => ({ isActive: e.isActive('highlight') }),
  })
  return (
    <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight().run()} isActive={isActive} title="Highlight">
      <Icon icon={IconHighlight} size="xs" />
    </ToolbarButton>
  )
}

export function CodeButton() {
  const { editor } = useToolbarEditor()
  const { isActive } = useEditorState({
    editor,
    selector: ({ editor: e }) => ({ isActive: e.isActive('code') }),
  })
  return (
    <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} isActive={isActive} title="Inline code">
      <Icon icon={IconCode} size="xs" />
    </ToolbarButton>
  )
}

export function BulletListButton() {
  const { editor } = useToolbarEditor()
  const { isActive } = useEditorState({
    editor,
    selector: ({ editor: e }) => ({ isActive: e.isActive('bulletList') }),
  })
  return (
    <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={isActive} title="Bullet list">
      <Icon icon={IconList} size="xs" />
    </ToolbarButton>
  )
}

export function OrderedListButton() {
  const { editor } = useToolbarEditor()
  const { isActive } = useEditorState({
    editor,
    selector: ({ editor: e }) => ({ isActive: e.isActive('orderedList') }),
  })
  return (
    <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={isActive} title="Ordered list">
      <Icon icon={IconListNumbers} size="xs" />
    </ToolbarButton>
  )
}

export function BlockquoteButton() {
  const { editor } = useToolbarEditor()
  const { isActive } = useEditorState({
    editor,
    selector: ({ editor: e }) => ({ isActive: e.isActive('blockquote') }),
  })
  return (
    <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={isActive} title="Quote">
      <Icon icon={IconBlockquote} size="xs" />
    </ToolbarButton>
  )
}

export function LinkButton() {
  const { editor } = useToolbarEditor()
  const { isActive } = useEditorState({
    editor,
    selector: ({ editor: e }) => ({ isActive: e.isActive('link') }),
  })
  return (
    <ToolbarButton
      onClick={() => {
        const url = window.prompt('URL')
        if (url) editor.chain().focus().setLink({ href: url }).run()
      }}
      isActive={isActive}
      title="Link"
    >
      <Icon icon={IconLink} size="xs" />
    </ToolbarButton>
  )
}

export function MentionButton() {
  const { editor } = useToolbarEditor()
  return (
    <ToolbarButton onClick={() => editor.chain().focus().insertContent('@').run()} title="Mention">
      <Icon icon={IconAt} size="xs" />
    </ToolbarButton>
  )
}

export function EmojiButton() {
  const { editor } = useToolbarEditor()
  return (
    <ToolbarButton onClick={() => editor.chain().focus().insertContent(':').run()} title="Emoji">
      <Icon icon={IconMoodSmile} size="xs" />
    </ToolbarButton>
  )
}

export function SlashCommandButton() {
  const { editor } = useToolbarEditor()
  return (
    <ToolbarButton onClick={() => editor.chain().focus().insertContent('/').run()} title="Slash command">
      <Icon icon={IconSlash} size="xs" />
    </ToolbarButton>
  )
}

// ── Default Toolbar Presets ─────────────────────────────────────

export type ChatToolbarItem =
  | 'bold' | 'italic' | 'underline' | 'strike' | 'highlight' | 'code'
  | 'bulletList' | 'orderedList'
  | 'blockquote' | 'link'
  | 'mention' | 'emoji' | 'slash'

/** The default toolbar layout — used when `toolbar={true}` or `toolbar={[...items]}` */
function DefaultToolbar({ items, isMobile, hasMentions, hasSlashCommands }: {
  items: ChatToolbarItem[] | null
  isMobile: boolean
  hasMentions: boolean
  hasSlashCommands: boolean
}) {
  const show = (item: ChatToolbarItem) => !items || items.includes(item)

  return (
    <>
      {/* Inline formatting — desktop only */}
      {!isMobile && (
        <ToolbarGroup>
          {show('bold') && <BoldButton />}
          {show('italic') && <ItalicButton />}
          {show('underline') && <UnderlineButton />}
          {show('strike') && <StrikeButton />}
          {show('highlight') && <HighlightButton />}
        </ToolbarGroup>
      )}

      {!isMobile && <ToolbarDivider />}

      {/* Lists — desktop only */}
      {!isMobile && (
        <ToolbarGroup>
          {show('bulletList') && <BulletListButton />}
          {show('orderedList') && <OrderedListButton />}
        </ToolbarGroup>
      )}

      {!isMobile && (show('blockquote') || show('link') || show('code')) && <ToolbarDivider />}

      {/* Block insert — desktop only */}
      {!isMobile && (
        <ToolbarGroup>
          {show('blockquote') && <BlockquoteButton />}
          {show('link') && <LinkButton />}
          {show('code') && <CodeButton />}
        </ToolbarGroup>
      )}

      {!isMobile && (hasMentions || hasSlashCommands) && <ToolbarDivider />}

      {/* Insert group — always visible */}
      <ToolbarGroup>
        {hasMentions && show('mention') && <MentionButton />}
        {show('emoji') && <EmojiButton />}
        {hasSlashCommands && show('slash') && <SlashCommandButton />}
      </ToolbarGroup>
    </>
  )
}

// ── ChatToolbar (main component) ────────────────────────────────

export interface ChatToolbarProps {
  editor: Editor
  /** true = default layout, ChatToolbarItem[] = whitelist, false = hidden, ReactNode = custom */
  toolbar: boolean | ChatToolbarItem[] | React.ReactNode
  isMobile: boolean
  hasMentions: boolean
  hasSlashCommands: boolean
  disabled: boolean
}

export function ChatToolbar({
  editor,
  toolbar,
  isMobile,
  hasMentions,
  hasSlashCommands,
  disabled,
}: ChatToolbarProps) {
  // toolbar={false} → don't render
  if (toolbar === false) return null

  const isCustom = typeof toolbar !== 'boolean' && !Array.isArray(toolbar)
  const items = Array.isArray(toolbar) ? toolbar : null

  return (
    <ToolbarContext.Provider value={{ editor, disabled }}>
      <div
        role="toolbar"
        aria-label="Text formatting"
        className="flex flex-wrap items-center gap-ds-01 border-t border-surface-border px-ds-04 py-ds-02b"
      >
          {isCustom ? (
            // Consumer provides their own toolbar content
            toolbar
          ) : (
            // Default layout (full or whitelist)
            <DefaultToolbar items={items} isMobile={isMobile} hasMentions={hasMentions} hasSlashCommands={hasSlashCommands} />
          )}
        </div>
      </ToolbarContext.Provider>
  )
}
