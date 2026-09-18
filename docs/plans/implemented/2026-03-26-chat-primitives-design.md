# Chat Primitives — Design (v2, post-audit)

**Date:** 2026-03-26
**Scope:** Composable chat primitive components for `@devalok/shilp-sutra` (core), serving both Karm AI chat and task timeline conversations.
**Package:** `packages/core/src/ui/chat/`

---

## Problem

Karm has two chat-like experiences built with completely different architectures:
- **AI Chat** (`karm/src/chat/MessageList`) — bubble-based, 2-party (USER/ASSISTANT), no grouping, no reactions, no system events
- **Task Timeline** (`karm/src/tasks/v3/timeline/`) — flat, multi-party, system events, reactions, hover actions, inline editing, grouping, unread markers

Both rebuild scroll management, auto-scroll, typing indicators, and message rendering from scratch.

## Research Basis

Audited 8 chat component libraries: Stream Chat React, Chatscope, assistant-ui, Sendbird UIKit, TalkJS, Ant Design X, shadcn-chat. Industry consensus: composable primitives with a smart scroll container.

---

## Architecture

### Component Hierarchy

```
packages/core/src/ui/chat/
  message-list.tsx        — scroll container: auto-scroll, "N new" pill, load-more
  message.tsx             — compound: Message.Avatar, .Content, .Author, .Body, .Actions, .Reactions
  system-message.tsx      — compact inline event annotation (single-line or multi-line)
  date-separator.tsx      — "Today" / "Yesterday" / "Mar 25"
  unread-separator.tsx    — "NEW" accent-colored divider
  message-input.tsx       — auto-resize textarea + send + slots + streaming cancel
  typing-indicator.tsx    — "Name is typing..." with animated dots
  index.ts                — barrel export
```

**Removed:** `ChatContainer` (audit #7 — it's just a div with an empty context. Consumers write `<div className="flex flex-col h-full">` themselves).

### What lives where

| Layer | Owns |
|-------|------|
| **Core** (`ui/chat/`) | Scroll behavior, message compound, separators, input shell |
| **Karm consumers** | Grouping computation, client filtering, system event collapsing, peek mode, filter tabs, visibility toggle |

**Key decision (audit #1/#14/#23):** Grouping is **consumer-side**, not built into MessageList. The data-attribute approach doesn't work in React (can't read/set attributes on ReactElements before they render). The current task timeline's `computeCommentGrouping()` returning a boolean array + `isGrouped` prop is the correct pattern. MessageList is purely a scroll container — it doesn't inspect its children.

### NOT building

- State management / runtime (consumer's job)
- Grouping logic in MessageList (consumer computes, passes `grouped` prop to Message)
- Emoji picker (separate component)
- Virtualized list (add later if needed)
- Threading / reply chains (future)

---

## Component APIs

### MessageList (scroll container)

```tsx
interface MessageListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode

  /** Auto-scroll to bottom on new content (unless user scrolled up). @default true */
  autoScroll?: boolean
  /** Number of new messages when scrolled up — drives floating pill. */
  newMessageCount?: number
  /** Called when user scrolls to bottom or clicks pill. */
  onScrollToBottom?: () => void

  /** Called near top — load older messages. */
  onLoadMore?: () => void
  /** Shows spinner at top while loading. */
  isLoadingMore?: boolean

  /** Empty state when no children. */
  emptySlot?: React.ReactNode
  /** Custom scroll-to-bottom button. */
  scrollToBottomSlot?: React.ReactNode
  /** Slot above the scroll area (e.g., fade gradient overlay). */
  headerSlot?: React.ReactNode
}
```

**MessageList does NOT do grouping.** It's purely a scroll container with:
1. **Sticky scroll** — auto-scroll on new children unless user scrolled up (threshold: 40px)
2. **"N new" pill** — floating at bottom when `newMessageCount > 0` and scrolled up. **Consumer must reset `newMessageCount` to 0 inside `onScrollToBottom`** — MessageList does not clear it internally.
3. **Load more** — calls `onLoadMore` near top. Preserves scroll position via `useRef` capturing `scrollHeight` before update and adjusting `scrollTop` in `useLayoutEffect` after
4. **`headerSlot`** — for the fade gradient overlay the task timeline uses
5. **Accessibility** — `role="log"` + `aria-live="polite"` + `aria-relevant="additions"` baked in
6. **Thin scrollbar** — `scrollbar-width: thin`

### Message (compound component)

```tsx
interface MessageProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  /** flat = no bubble bg, bubble = rounded bg. @default 'flat' */
  variant?: 'flat' | 'bubble'
  /** start = left, end = right. @default 'start' */
  placement?: 'start' | 'end'
  /** Highlight tint. mention = accent, internal = amber. */
  highlight?: 'mention' | 'internal'
  /** When true, hides Avatar and Author (continuation of same-author group). Consumer controls this. */
  grouped?: boolean
  /** When true, renders deleted placeholder instead of children. */
  deleted?: boolean
  /** Deleted placeholder text. @default "This message was deleted" */
  deletedText?: string
}
```

**Audit fixes applied:**
- **#1/#23:** `grouped` is a simple boolean prop (not data-attributes). Consumer computes grouping and passes it. `Message.Avatar` and `Message.Author` check this prop and render a spacer/hide when `grouped=true`.
- **#3:** `deleted` prop renders a muted "This message was deleted" placeholder with trash icon instead of children.
- **#18:** Message wraps content in `motion.div` with `initial={{ opacity: 0, y: 8 }}` + `animate={{ opacity: 1, y: 0 }}` using `springs.snappy`. MessageList wraps children in `<AnimatePresence initial={false}>` so messages present on first render don't animate in — only subsequently added messages do. This is an internal implementation detail, not a public API.

**Sub-components:**

```tsx
// Message.Avatar — wraps core Avatar. Renders spacer when grouped.
interface MessageAvatarProps {
  src?: string | null
  fallback?: string
  icon?: React.ReactNode       // for bots
  size?: 'sm' | 'md'          // sm=20px, md=24px. @default 'md'
  children?: React.ReactNode   // escape hatch: full custom Avatar
}

// Message.Content — flex column wrapper
interface MessageContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

// Message.Author — name + badge + timestamp. Hidden when grouped.
interface MessageAuthorProps {
  name: string
  badge?: React.ReactNode
  /** ISO 8601 string or Date object. Strings are parsed via `new Date()`. For pre-formatted strings, use `formattedTimestamp` instead. */
  timestamp?: Date
  /** Pre-formatted timestamp string — rendered as-is, skips formatting. */
  formattedTimestamp?: string
  timestampFormat?: (date: Date) => string
}

// Message.Body — renders children (text, markdown, streaming, whatever)
interface MessageBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

// Message.EditableBody — view/edit toggle for inline editing (audit #2)
interface MessageEditableBodyProps {
  content: string
  onSave: (newContent: string) => void
  onCancel?: () => void        // called on Escape — for analytics, optimistic rollback, etc.
  canEdit?: boolean            // only show edit affordance for own messages
  renderContent?: (content: string) => React.ReactNode  // custom renderer (HTML, markdown)
}

// Message.Reactions — emoji pills
interface MessageReactionsProps {
  reactions: { emoji: string; count: number; reacted: boolean }[]
  onReact: (emoji: string) => void
}

// Message.Actions — floating toolbar on hover
interface MessageActionsProps {
  children: React.ReactNode
  delay?: number               // @default 100ms
}

// Message.Action — individual action button
interface MessageActionProps {
  icon: React.ComponentType<any>
  label: string
  onClick: () => void
  variant?: 'default' | 'danger'
}
```

**`Message.EditableBody` (audit #2):** Handles the view/edit toggle internally — click to edit (when `canEdit`), renders textarea in edit mode, Enter to save, Escape to cancel, blur to save. `renderContent` is the escape hatch for custom rendering (HTML, markdown). When not editing, calls `renderContent(content)` or renders content as text.

**`Message.Avatar` children escape hatch (audit #10):** When `children` is provided, renders that instead of the simplified `src`/`fallback` API. This lets consumers use the full core `Avatar` compound with status dots, rings, etc:
```tsx
<Message.Avatar>
  <Avatar size="sm" status="online" ring="lead">
    <AvatarImage src={...} />
    <AvatarFallback>AR</AvatarFallback>
  </Avatar>
</Message.Avatar>
```

### SystemMessage

```tsx
interface SystemMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  timestamp?: string
  /** Visual style. event = compact muted line, alert = centered error banner. @default 'event' */
  variant?: 'event' | 'alert'
  children: React.ReactNode
}
```

**Audit #4/#13 fix:** Two variants:
- `'event'` (default): compact single-line for status changes, assignments. Subtle bg tint, muted 11px text. Supports multi-line children for review events with comments.
- `'alert'`: centered error banner for AI chat SYSTEM role messages. `bg-error-3 text-error-11` with alert icon.

### DateSeparator

```tsx
interface DateSeparatorProps {
  date: Date | string
  format?: (date: Date) => string   // default: "Today"/"Yesterday"/"Mar 25"
  className?: string
}
```

Centered label on gradient horizontal rules.

### UnreadSeparator

```tsx
interface UnreadSeparatorProps {
  label?: string      // @default "NEW"
  count?: number      // shows "3 NEW" when provided
  className?: string
}
```

Accent-colored line with label.

### MessageInput

```tsx
interface MessageInputProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSubmit'> {
  onSubmit: (text: string) => void
  placeholder?: string
  disabled?: boolean
  /** Streaming/cancel state (audit #11) */
  isStreaming?: boolean
  onCancel?: () => void
  /** Slots */
  leadingSlot?: React.ReactNode     // visibility toggle
  trailingSlot?: React.ReactNode    // attach, emoji (appended after send/cancel button)
  /** Below the input (audit #12) */
  disclaimer?: string
  /** Custom send icon. @default IconSend */
  sendIcon?: React.ReactNode
}
```

**Audit #11 fix:** `isStreaming` + `onCancel` are first-class. When streaming, send button transforms to a stop button (red `IconSquare`) that calls `onCancel`. Enter-to-send is disabled during streaming.

**Audit #12 fix:** `disclaimer` renders muted text below the input area.

### TypingIndicator

```tsx
interface TypingIndicatorProps {
  users: { name: string; image?: string }[]
  className?: string
}
```

**Audit #19 fix:** Correct grammar: 1 user = "Sarah is typing...", 2 users = "Sarah and Arjun are typing...", 3+ = "Several people are typing..."

Reserves vertical space (min-height) to prevent layout shift. AnimatePresence for enter/exit.

---

## What Consumers Own (not core)

These features stay consumer-side (audit #6/#8/#9):

| Feature | Where | Why |
|---------|-------|-----|
| **Message grouping computation** | Consumer passes `grouped` prop | Grouping rules differ per context (task timeline groups comments, AI chat groups by role) |
| **System event collapsing** | `task-panel-timeline.tsx` | Business logic: 3+ events from same actor within 10min |
| **Client filtering** | `task-panel-timeline.tsx` | Business logic: hide internal comments from clients |
| **Peek mode** | `task-panel-timeline.tsx` | Slice to last 2 entries, hide filters |
| **Filter tabs** | `task-panel-timeline.tsx` | All/Comments/Activity tabs are task-specific |
| **Agent long-content collapse** | Consumer wraps `Message.Body` children | Use a collapsible wrapper around long content (audit #5) |
| **Visibility toggle** | Karm's `TaskComposer` | Core `MessageInput` provides `leadingSlot` |

---

## Animation and Tokens

- Message enter: `springs.snappy` (opacity 0→1, y 8→0). First mount skips animation.
- Typing indicator dots: `duration: 0.6, repeat: Infinity, delay: i * 0.15`
- "N new" pill: `tweens.fade` enter/exit via AnimatePresence
- Actions toolbar: CSS `transition-opacity duration-150 delay-100` (not Framer Motion — hover states don't need AnimatePresence)
- Scroll-to-bottom: `behavior: 'smooth'`
- All colors: semantic tokens only

---

## Migration Path

1. Build 7 core chat primitives
2. Migrate karm AI chat — `MessageList` replaces custom scroll, `Message variant="bubble"` replaces custom bubbles, `MessageInput` replaces `ChatInput`
3. Migrate karm task timeline — timeline sub-components (`TimelineComment`, `TimelineSystemEvent`, etc.) rewritten to compose `Message`, `SystemMessage`, separators. Container logic (`task-panel-timeline.tsx`) stays but renders core primitives.
4. Delete old implementations

---

## Success Criteria

- One `MessageList` handles scroll/auto-scroll for both AI chat and task timeline
- `Message` compound renders both bubble and flat variants
- All 28 task timeline features preserved (grouping consumer-side, scroll in core)
- All 14 AI chat features preserved (streaming cancel, SYSTEM alerts, bubbles)
- Zero scroll-related code in karm — all in core's MessageList
- Storybook stories for every primitive + both compositions
- Typecheck clean across both packages
- ARIA: `role="log"`, `aria-live="polite"` on MessageList
