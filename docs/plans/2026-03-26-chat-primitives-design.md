# Chat Primitives — Design

**Date:** 2026-03-26
**Scope:** Composable chat primitive components for `@devalok/shilp-sutra` (core), serving both Karm AI chat and task timeline conversations.
**Package:** `packages/core/src/ui/chat/`

---

## Problem

Karm has two chat-like experiences built with completely different architectures:
- **AI Chat** (`karm/src/chat/MessageList`) — bubble-based, 2-party (USER/ASSISTANT), no grouping, no reactions, no system events
- **Task Timeline** (`karm/src/tasks/v3/timeline/`) — flat, multi-party, system events, reactions, hover actions, inline editing, grouping, unread markers

Both rebuild scroll management, auto-scroll, typing indicators, and message rendering from scratch. When we tried to unify them via `ActivityFeed` (a log component), it destroyed the chat feel.

## Research Basis

Audited 8 chat component libraries: Stream Chat React, Chatscope, react-chat-elements, Sendbird UIKit, TalkJS, Ant Design X, shadcn-chat, assistant-ui.

**Industry consensus:** Composable primitives with a smart scroll container. The `MessageList` (scroll + auto-scroll + grouping + load-more) is the hard primitive. Message rendering is just styled divs composed by the consumer.

**What won:** Stream Chat's component override pattern + Chatscope's explicit composition + Ant Design X's role mapping. What failed: monolithic data-driven lists (react-chat-elements), black-box widgets (TalkJS).

---

## Architecture

### Component Hierarchy

```
packages/core/src/ui/chat/
  chat-container.tsx      — flex column wrapper, ChatContext provider
  message-list.tsx        — THE hard primitive: scroll, auto-scroll, grouping
  message.tsx             — compound: Message.Avatar, .Content, .Author, .Body, .Actions, .Reactions
  system-message.tsx      — compact inline event annotation
  date-separator.tsx      — "Today" / "Yesterday" / "Mar 25"
  unread-separator.tsx    — "NEW" accent-colored divider
  message-input.tsx       — auto-resize textarea + send + extensible slots
  typing-indicator.tsx    — "Name is typing..." with animated dots
  index.ts                — barrel export
```

### What lives where

| Layer | Owns | Examples |
|-------|------|---------|
| **Core** (`ui/chat/`) | Scroll behavior, grouping, message compound, separators, input shell | MessageList, Message, SystemMessage, DateSeparator, MessageInput |
| **Karm AI chat** | AI-specific composition — bubble variant, role mapping, streaming | Composes core with `variant="bubble"`, `placement="end"` |
| **Karm task timeline** | Task-specific orchestration — filters, visibility, collapsing | Composes core with `variant="flat"`, highlight, system events |

### NOT building

- State management / runtime (consumer's job)
- Emoji picker (separate component)
- File upload handling (already exists)
- Rich text editor (already exists)
- Virtualized list (premature — add later if 1000+ messages)

---

## Component APIs

### ChatContainer

```tsx
interface ChatContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}
```

Flex column wrapper. Provides `ChatContext` (currently just a marker for compound component validation — extensible later for shared state if needed). Handles `height: 100%` and overflow containment.

### MessageList (the hard primitive)

```tsx
interface MessageListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode

  /** Auto-scroll to bottom when new content arrives (unless user scrolled up). @default true */
  autoScroll?: boolean
  /** Number of new messages when user is scrolled up — drives the "N new" pill. */
  newMessageCount?: number
  /** Called when user scrolls to bottom or clicks the "scroll to bottom" pill. */
  onScrollToBottom?: () => void

  /** Called when user scrolls near the top — load older messages. */
  onLoadMore?: () => void
  /** Shows loading spinner at top while loading more. */
  isLoadingMore?: boolean

  /** Message grouping — groups consecutive messages by same author within time window.
   *  Reads data-author-id and data-timestamp from children.
   *  Adds data-group-position to each child.
   *  @default true */
  grouping?: boolean | { maxInterval?: number }

  /** Custom "scroll to bottom" button. Default: floating pill with count. */
  scrollToBottomSlot?: React.ReactNode
  /** Custom loading indicator for load-more. */
  loadingSlot?: React.ReactNode
  /** Empty state when no children. */
  emptySlot?: React.ReactNode
}
```

**Key behaviors:**
1. **Sticky scroll** — if at bottom, auto-scroll on new children. If scrolled up, hold position. Threshold: 40px from bottom.
2. **"N new" pill** — floating bottom-center when `newMessageCount > 0` and scrolled up. Click scrolls to bottom + `onScrollToBottom()`.
3. **Load more** — when within 100px of top, calls `onLoadMore`. Preserves scroll position after prepend (capture `scrollHeight` before, set `scrollTop = newScrollHeight - oldScrollHeight` after).
4. **Grouping via data attributes** — reads `data-author-id` and `data-timestamp` from direct children. Computes group boundaries (same author, within `maxInterval` ms, default 5min). Sets `data-group-position` on each child. Consumers style based on this attribute.
5. **Thin scrollbar** — `scrollbar-width: thin`, `scrollbar-color: var(--color-surface-border) transparent`.

### Message (compound component)

```tsx
interface MessageProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  /** Visual style. flat = no bubble bg, bubble = rounded bg. @default 'flat' */
  variant?: 'flat' | 'bubble'
  /** Alignment. start = left, end = right. @default 'start' */
  placement?: 'start' | 'end'
  /** Highlight tint. mention = accent, internal = amber, urgent = error. */
  highlight?: 'mention' | 'internal' | 'urgent'
  // Data attributes for MessageList grouping
  'data-author-id'?: string
  'data-timestamp'?: string
}
```

**Sub-components:**

```tsx
// Message.Avatar — shows author avatar. Auto-hides when grouped (middle/last).
interface MessageAvatarProps {
  src?: string | null
  fallback?: string          // initials
  icon?: React.ReactNode     // alternative: icon instead of image (for bots)
  size?: 'sm' | 'md'        // sm=20px, md=24px. @default 'md'
}

// Message.Content — flex column wrapper for author/body/reactions
interface MessageContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

// Message.Author — name + optional badge + timestamp. Auto-hides when grouped.
interface MessageAuthorProps {
  name: string
  badge?: React.ReactNode    // <Badge>Client</Badge>, <Badge>AI</Badge>
  timestamp?: string | Date
  timestampFormat?: (date: Date) => string
}

// Message.Body — renders children. Consumer decides: text, HTML, markdown, streaming.
interface MessageBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

// Message.Reactions — emoji pills row
interface MessageReactionsProps {
  reactions: { emoji: string; count: number; reacted: boolean }[]
  onReact: (emoji: string) => void
}

// Message.Actions — floating toolbar, appears on hover with delay
interface MessageActionsProps {
  children: React.ReactNode   // Message.Action items
  delay?: number              // hover delay in ms. @default 100
}

// Message.Action — individual action button
interface MessageActionProps {
  icon: React.ComponentType<any>
  label: string               // aria-label + tooltip
  onClick: () => void
  variant?: 'default' | 'danger'  // danger = error color on hover
}
```

**Grouping integration:**
- `Message.Avatar` reads `data-group-position` from the nearest `Message` ancestor. When position is `middle` or `last`, renders an invisible spacer instead of the avatar.
- `Message.Author` same logic — hides name/timestamp when grouped.
- CSS-driven: `[data-group-position="middle"] [data-chat-avatar] { visibility: hidden }` so it works without re-renders.

**Variant rendering:**
- `flat`: no background, flex row. Avatar left, content right. Full width.
- `bubble`: rounded background (`bg-surface-raised-hover` for start, `bg-accent-9 text-accent-fg` for end). Max-width 85%. Border radius adjusts for grouped messages.

### SystemMessage

```tsx
interface SystemMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  timestamp?: string
  children: React.ReactNode   // "Sarah changed status to Done"
}
```

Single compact line (~24px). Subtle background tint (`bg-surface-raised-hover/30`). Muted text (11px). No avatar, no hover actions.

### DateSeparator

```tsx
interface DateSeparatorProps {
  date: Date | string
  format?: (date: Date) => string
  className?: string
}
```

Centered label on gradient horizontal rules. Default format: "Today" / "Yesterday" / "Mar 25".

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
  /** Slot before the textarea (e.g., visibility toggle). */
  leadingSlot?: React.ReactNode
  /** Slot after the textarea (e.g., attach, emoji). Replaces default send button if provided. */
  trailingSlot?: React.ReactNode
  /** Custom send button icon. @default IconSend */
  sendIcon?: React.ReactNode
}
```

Auto-resizing textarea (max 160px). Enter to send, Shift+Enter for newline. The `leadingSlot` and `trailingSlot` are where karm adds its visibility Switch and paperclip.

### TypingIndicator

```tsx
interface TypingIndicatorProps {
  users: { name: string; image?: string }[]
  className?: string
}
```

"Sarah is typing..." or "Sarah and Arjun are typing..." with bouncing dots. Reserves vertical space to prevent layout shift.

---

## How Karm Composes These

### AI Chat (bubble, 2-party)

```tsx
<ChatContainer>
  <MessageList emptySlot={<EmptyState icon={IconRobot} title="Karm AI" />}>
    {messages.map(msg => (
      <Message key={msg.id}
        variant="bubble"
        placement={msg.role === 'USER' ? 'end' : 'start'}
        data-author-id={msg.role}
        data-timestamp={msg.createdAt}
      >
        {msg.role !== 'USER' && <Message.Avatar icon={<Icon icon={IconRobot} />} />}
        <Message.Content>
          {msg.role !== 'USER' && (
            <Message.Author name="Devadoot" badge={<Badge size="xs" color="accent">AI</Badge>} />
          )}
          <Message.Body><ReactMarkdown>{msg.content}</ReactMarkdown></Message.Body>
        </Message.Content>
      </Message>
    ))}
  </MessageList>
  <TypingIndicator users={isStreaming ? [{ name: 'Devadoot' }] : []} />
  <MessageInput onSubmit={onSend} placeholder="Ask Karm AI..." />
</ChatContainer>
```

### Task Timeline (flat, multi-party)

```tsx
<ChatContainer>
  <FilterTabs filter={filter} onChange={setFilter} />
  <MessageList autoScroll newMessageCount={newCount} onScrollToBottom={clearNew}
    emptySlot={<EmptyState title="Start the conversation" />}>

    {displayItems.map(item => {
      if (item.type === 'date-divider')
        return <DateSeparator key={item.key} date={item.date} />

      if (item.type === 'unread-divider')
        return <UnreadSeparator key="unread" />

      if (item.type === 'system-event')
        return (
          <SystemMessage key={item.id} icon={actionIcon}>
            <b>{actorName}</b> {description}
          </SystemMessage>
        )

      if (item.type === 'comment')
        return (
          <Message key={item.id}
            highlight={isInternal ? 'internal' : isMentioned ? 'mention' : undefined}
            data-author-id={authorId} data-timestamp={createdAt}>
            <Message.Avatar src={author.image} fallback={initials} />
            <Message.Content>
              <Message.Author name={author.name} badge={clientBadge} timestamp={createdAt} />
              <Message.Body>{sanitizedContent}</Message.Body>
              <Message.Reactions reactions={reactions} onReact={onReact} />
            </Message.Content>
            <Message.Actions>
              <Message.Action icon={IconMoodSmile} label="React" onClick={handleReact} />
              <Message.Action icon={IconPencil} label="Edit" onClick={handleEdit} />
              <Message.Action icon={IconTrash} label="Delete" onClick={handleDelete} variant="danger" />
            </Message.Actions>
          </Message>
        )

      if (item.type === 'agent-response')
        return (
          <Message key={item.id} data-author-id={agentId} data-timestamp={ts}>
            <Message.Avatar icon={<Icon icon={IconRobot} />} />
            <Message.Content>
              <Message.Author name={agentName} badge={<Badge size="xs" color="accent">AI</Badge>} />
              <Message.Body>{isStreaming ? <StreamingText /> : content}</Message.Body>
            </Message.Content>
          </Message>
        )
    })}
  </MessageList>
  <TypingIndicator users={typingUsers} />
  <TaskComposer onSubmit={onPost} showVisibility={showVis} />
</ChatContainer>
```

Same primitives. Different compositions. Core owns scroll + visual building blocks. Karm owns business logic.

---

## Animation and Tokens

All animations use existing motion tokens:
- Message enter: `springs.snappy` (opacity 0 to 1, y 8 to 0)
- Typing indicator dots: `duration: 0.6, repeat: Infinity, delay: i * 0.15`
- "N new" pill: `tweens.fade` enter/exit
- Actions toolbar: `opacity 0 to 1, transition-opacity duration-150 delay-100`
- Scroll-to-bottom: `behavior: 'smooth'`
- Grouping position changes: CSS-driven (data attribute swap, no JS re-render)

All colors use semantic tokens. No hardcoded values.

---

## Migration Path

1. Build core chat primitives (8 components)
2. Migrate karm AI chat (`karm/src/chat/MessageList` uses core `MessageList` + `Message` bubble variant)
3. Migrate karm task timeline (timeline sub-components use core `Message` + `SystemMessage` + separators)
4. Delete old implementations
5. `task-panel-timeline.tsx` container logic (filtering, collapsing, grouping, unread placement) stays — renders core primitives instead of custom components

---

## Success Criteria

- One `MessageList` handles scroll/auto-scroll for both AI chat and task timeline
- `Message` compound component renders both bubble (AI) and flat (task) variants
- Zero scroll-related code in karm — all in core's MessageList
- All 28 task timeline features preserved
- All 14 AI chat features preserved
- Storybook stories for every primitive + both compositions
- Typecheck clean across both packages
