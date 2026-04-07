# RichChatInput — Design Document

**Date:** 2026-04-07
**Benchmark:** Slack, Linear, Notion comments
**Scope:** Compact rich text chat input with TipTap, slash commands, mentions, file handling

## Motivation

Modern workspaces have humans and AI working side by side. The current `MessageInput` is a plain textarea — no formatting, no mentions, no file paste. The `RichTextEditor` has all these features but is too large/heavy for a chat input. We need a compact, chat-optimized rich input that reuses TipTap extensions but with a Linear-style layout.

## Component Overview

A compact, Linear-style rich text input for unified human+AI chat. Built on TipTap (reusing existing extensions from RichTextEditor), with chat-optimized layout — compact by default, expandable, inline toolbar.

## Variants

| Variant | Behavior | Default maxRows | Use Case |
|---------|----------|----------------|----------|
| `compact` (default) | 2-3 visible lines, inline toolbar below text, expands with content | 8 | Rapid-fire messaging, channel chat |
| `expanded` | Full mini-editor (5+ lines), toolbar always visible | 15 | Composing longer messages, AI prompts |
| `minimal` | Single line, toolbar hidden until focus | 4 | Inline reply, comment threads |

## Props API

```tsx
interface RichChatInputProps {
  // Core
  onSubmit: (html: string, plainText: string) => void
  placeholder?: string  // default: 'Type a message...'
  disabled?: boolean

  // Variant & sizing
  variant?: 'compact' | 'expanded' | 'minimal'
  maxRows?: number  // overrides variant default

  // Behavior
  enterBehavior?: 'send' | 'newline'  // default: 'send'
  maxLength?: number  // shows character counter when set

  // Rich features
  mentions?: MentionItem[]
  onMentionSearch?: (query: string) => Promise<MentionItem[]>
  onFileUpload?: (file: File) => Promise<{ url: string; name: string; size: number }>
  onImageUpload?: (file: File) => Promise<string>
  slashCommands?: SlashCommandGroup[]  // omit = no slash trigger

  // Callbacks
  onTyping?: (isTyping: boolean) => void  // typing indicator (true on keystroke, false after 2s idle)
  onEmpty?: (isEmpty: boolean) => void  // empty state detection (TipTap has <p></p> when "empty")

  // Streaming/AI
  isStreaming?: boolean
  onCancel?: () => void

  // Customization
  leadingSlot?: React.ReactNode
  trailingSlot?: React.ReactNode
  disclaimer?: string
  className?: string

  // Toolbar control
  toolbar?: boolean | ToolbarItem[]  // true = default set, array = whitelist, false = hidden
}
```

## Toolbar Layout

Desktop — inline row below text area:
```
[B] [I] [U] [S] [~] [</>] [*] [1.] | [@] [:)] [+] [/] ............ 234/4000 [Send]
 ^--- formatting ---^  ^lists^   ^-- insert --^  ^slash^    ^counter^  ^action^
```

- Formatting: Bold, Italic, Underline, Strike, Highlight, Code
- Lists: Bullet, Ordered
- Insert: @Mention, Emoji, File attach, Slash commands
- Counter: only shows when `maxLength` is set
- Action: Send button (right-aligned), swap to Stop when `isStreaming`
- Dividers between groups (subtle separator)
- All buttons 24px with `touch-target` for mobile

Mobile — floating bubble toolbar on text selection (Medium/Notion pattern):
- Inline toolbar hidden on mobile viewports (<768px)
- On text selection, floating bubble appears above selection with formatting options
- @Mention, Emoji, Attach available as icon buttons in the input chrome (not toolbar)
- Send button always visible

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Enter` | Send message (when `enterBehavior='send'`) or newline |
| `Shift+Enter` | New line (when `enterBehavior='send'`) or send |
| `Cmd+Enter` | Always send, regardless of `enterBehavior` |
| `Cmd+B/I/U` | Bold / Italic / Underline |
| `@` | Open mention suggestion popover |
| `:` | Open emoji suggestion popover |
| `/` | Open slash command suggestion (only if `slashCommands` prop provided) |
| `Escape` | Close any open suggestion/palette |
| `Cmd+Z` / `Cmd+Shift+Z` | Undo / Redo (native, no toolbar button) |

## Slash Commands

Triggered by `/` at the start of a line. ONLY active when `slashCommands` prop is provided. No built-in commands — 100% consumer-defined.

```tsx
interface SlashCommandGroup {
  label: string
  commands: SlashCommand[]
}

interface SlashCommand {
  id: string
  label: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  action: (editor: Editor) => void  // TipTap editor instance
}
```

Renders as a suggestion popover (same pattern as mention/emoji suggestions — positioned above cursor, keyboard navigable, max 8 visible items).

## File Handling

- **Drag-drop** onto the input — files and images
- **Paste** from clipboard — images, screenshots
- **File picker** via toolbar button — any file type
- **Attachment preview strip** — renders ABOVE the text area (not inline). Shows thumbnails for images, chips for files (icon + name + size), each with a remove button.
- Uses `onFileUpload` / `onImageUpload` callbacks (same as RichTextEditor)

## Typing Indicator

`onTyping` fires `true` on first keystroke, `false` after 2 seconds of idle. Uses a debounced timer internally:

```tsx
const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

const handleUpdate = useCallback(() => {
  onTyping?.(true)
  clearTimeout(typingTimeoutRef.current)
  typingTimeoutRef.current = setTimeout(() => onTyping?.(false), 2000)
}, [onTyping])
```

## Empty State Detection

TipTap's editor has HTML content (`<p></p>`) even when visually empty. `onEmpty` uses TipTap's `editor.isEmpty` property which correctly detects truly empty content (ignoring empty paragraph tags).

## Character Counter

When `maxLength` is set:
- Counter shows near the send button: `234/4000`
- At 90%+ capacity: counter turns `text-warning-11`
- At 100%: counter turns `text-error-11`, input stops accepting characters
- Uses TipTap's `editor.storage.characterCount` extension

## Architecture

### Files
```
packages/core/src/composed/rich-chat-input.tsx       — main component
packages/core/src/composed/extensions/slash-command.tsx  — new TipTap extension
```

### Reuses from RichTextEditor
- TipTap extensions: mention-suggestion, emoji-suggestion, file-attachment
- PROSE_CLASSES (adjusted for compact density — tighter spacing, smaller headings)
- Upload handling logic (drag-drop, paste, file picker)
- Mention popover with avatar support
- Emoji suggestion with lazy-loaded emoji-mart data

### New
- `SlashCommand` TipTap extension (suggestion triggered by `/`)
- Compact inline toolbar component
- Floating bubble toolbar for mobile (text selection)
- Attachment preview strip (above editor)
- Typing indicator logic
- Character counter (TipTap CharacterCount extension)
- Variant-based sizing
- `Enter` to send behavior (RichTextEditor uses Enter for newline)

### Lazy Loading
Shares the TipTap chunk (546KB) with RichTextEditor. Consumers who don't use either pay nothing. Exported via `@devalok/shilp-sutra/composed/rich-chat-input`.

## NOT in scope
- Voice recording / audio messages
- Message editing (that's Message.EditableBody)
- Thread/reply UI (that's the chat layout layer)
- Real-time collaboration (TipTap Collab)
