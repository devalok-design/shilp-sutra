# Chat

- Import: @devalok/shilp-sutra/ui/chat
- Server-safe: No (MessageList, Message, MessageInput, TypingIndicator use Framer Motion); DateSeparator and UnreadSeparator are server-safe
- Category: ui

Seven primitives for building chat interfaces: MessageList, Message (compound), SystemMessage, MessageInput, DateSeparator, UnreadSeparator, TypingIndicator.

---

## MessageList

Scrollable container with auto-scroll, load-more, empty state, and "N new" floating pill.

### Props
    autoScroll: boolean — auto-scroll to bottom on new content (default: true)
    newMessageCount: number — count shown in floating pill (default: 0)
    onScrollToBottom: () => void — called when user clicks the "N new" pill
    onLoadMore: () => void — called when user scrolls near top
    isLoadingMore: boolean — shows spinner at top (default: false)
    emptySlot: ReactNode — content when there are no children
    headerSlot: ReactNode — content above the scroll container (e.g. channel name)
    scrollToBottomSlot: ReactNode — reserved slot for custom scroll-to-bottom button
    children: ReactNode (REQUIRED)

### Example
```jsx
<MessageList autoScroll onLoadMore={loadMore} isLoadingMore={loading} newMessageCount={3} onScrollToBottom={markRead}>
  {messages.map(m => <Message key={m.id}>...</Message>)}
</MessageList>
```

---

## Message (Compound)

Compound component: `Message`, `Message.Avatar`, `Message.Content`, `Message.Author`, `Message.Body`, `Message.EditableBody`, `Message.Reactions`, `Message.Actions`, `Message.Action`.

### Message (root) Props
    variant: "flat" | "bubble" (default: "flat")
    placement: "start" | "end" (default: "start")
    highlight: "mention" | "internal" — "mention" styles in-content @tokens (any <span class="mention">) so they tint (accent-2/accent-11); the row itself stays flat. "internal" tints the whole row (warning-2) for system/internal notes. Both also expose a `data-highlight` attribute hook.
    grouped: boolean — hides avatar/author for consecutive messages (default: false)
    deleted: boolean — renders deleted placeholder (default: false)
    deletedText: string (default: "This message was deleted")

### Message.Avatar Props
    src: string | null — avatar image URL
    fallback: string — initials text
    icon: ReactNode — custom icon instead of avatar
    size: "sm" | "md" (default: "md")
    children: ReactNode — fully custom avatar slot

### Message.Author Props
    name: string (REQUIRED)
    badge: ReactNode
    timestamp: Date
    formattedTimestamp: string — pre-formatted timestamp (overrides timestamp)
    timestampFormat: (date: Date) => string — custom formatter

### Message.Body Props
    children: ReactNode (REQUIRED)

### Message.EditableBody Props
    content: string (REQUIRED)
    onSave: (newContent: string) => void (REQUIRED)
    onCancel: () => void
    canEdit: boolean (default: false)
    renderContent: (content: string) => ReactNode — custom render for display mode

### Message.Reactions Props
    reactions: { emoji: string; count: number; reacted: boolean }[] (REQUIRED)
    onReact: (emoji: string) => void (REQUIRED)

### Message.Content Props
    children: ReactNode (REQUIRED)
    className: string

### Message.Actions Props
    children: ReactNode (REQUIRED)
    delay: number — hover reveal delay in ms (default: 100)

### Message.Action Props
    icon: IconProps["icon"] (REQUIRED) — pass the Tabler component reference, e.g. `IconReply` (not `<IconReply />`)
    label: string (REQUIRED)
    onClick: () => void (REQUIRED)
    variant: "default" | "danger" (default: "default")

### Example
```jsx
<Message variant="flat" highlight="mention">
  <Message.Avatar src={user.photo} fallback="JD" />
  <Message.Content>
    <Message.Author name="Jane Doe" timestamp={new Date()} badge={<Badge>Admin</Badge>} />
    <Message.Body>Hello, world!</Message.Body>
    <Message.Reactions reactions={reactions} onReact={handleReact} />
    <Message.Actions>
      <Message.Action icon={IconReply} label="Reply" onClick={handleReply} />
      <Message.Action icon={IconTrash} label="Delete" onClick={handleDelete} variant="danger" />
    </Message.Actions>
  </Message.Content>
</Message>
```

---

## SystemMessage

Inline system event or alert message (e.g. "Alice joined the channel").

### Props
    icon: ReactNode — custom icon
    timestamp: string — ISO timestamp string
    variant: "event" | "alert" (default: "event")
    children: ReactNode (REQUIRED)

### Example
```jsx
<SystemMessage>Alice joined the channel</SystemMessage>
<SystemMessage variant="alert" timestamp="2026-03-26T10:00:00Z">Connection lost</SystemMessage>
```

---

## MessageInput

Auto-resizing textarea with send/stop buttons, streaming support, and slot-based extensibility.

### Props
    onSubmit: (text: string) => void (REQUIRED)
    placeholder: string (default: "Type a message...")
    disabled: boolean (default: false)
    isStreaming: boolean — shows stop button instead of send (default: false)
    onCancel: () => void — called when stop button is clicked
    leadingSlot: ReactNode — content before the textarea (e.g. attachment button)
    trailingSlot: ReactNode — content after the send button
    disclaimer: string — centered text below the input (e.g. "AI can make mistakes")
    sendIcon: ReactNode — custom send icon

### Example
```jsx
<MessageInput
  onSubmit={handleSend}
  isStreaming={streaming}
  onCancel={handleStop}
  disclaimer="AI can make mistakes"
/>
```

---

## DateSeparator

Horizontal rule with a formatted date label.

### Props
    date: Date | string (REQUIRED)
    format: (date: Date) => string — custom date formatter
    className: string

### Example
```jsx
<DateSeparator date={new Date()} />
<DateSeparator date="2026-03-25" format={(d) => d.toLocaleDateString()} />
```

---

## UnreadSeparator

Accent-colored horizontal rule marking the unread boundary.

### Props
    label: string (default: "NEW")
    count: number — prepended to label (e.g. "5 NEW")
    className: string

### Example
```jsx
<UnreadSeparator />
<UnreadSeparator count={5} />
```

---

## TypingIndicator

Animated bouncing dots with a text description of who is typing.

### Props
    users: { name: string; image?: string }[] (REQUIRED)
    className: string

### Example
```jsx
<TypingIndicator users={[{ name: 'Alice' }]} />
<TypingIndicator users={[{ name: 'Alice' }, { name: 'Bob' }]} />
```

---

## Composability
- **Chat is a kit of 7 primitives, not a monolithic ChatWindow.** Compose MessageList (scroll container) + Message/SystemMessage (row variants) + DateSeparator/UnreadSeparator (visual dividers) + MessageInput (composer) + TypingIndicator (presence).
- **Message is a compound component** — `Message.Avatar`, `Message.Content`, `Message.Author`, `Message.Body`, `Message.Reactions`, `Message.Actions`, `Message.Action`. Arrange them to match your design; most layouts only need Avatar + Content (with Author + Body inside).
- **Message.Actions reveal on hover** via `group-hover/message` — ONLY works when Actions is nested inside a Message root. If you want a custom action bar, do it differently.
- **MessageList ARIA:** `role="log" + aria-live="polite"` — screen readers announce new messages automatically. Don't manually add aria-live to children.
- **grouped mode:** For consecutive messages from the same user, set `grouped={true}` to hide the avatar and author (typical chat UI pattern). Logic for "same user as previous" is consumer-side.
- **MessageInput is specifically for chat** — auto-resizing textarea (up to 160px), Enter-to-send, Shift+Enter-for-newline, streaming support. For richer composition (formatting, attachments), use RichChatInput from composed (built on top of this + TipTap).
- **TypingIndicator** accepts multiple users — handles pluralization of the "is/are typing" label automatically.

## Gotchas
- MessageList uses `role="log"` with `aria-live="polite"` — screen readers announce new messages
- Message entrance animations use Framer Motion springs — AnimatePresence wraps children in MessageList
- `grouped` hides avatar and author — use for consecutive messages from the same user
- MessageInput sends on Enter (Shift+Enter for newline) — textarea auto-resizes up to 160px
- TypingIndicator renders nothing when `users` is empty
- Message.Actions toolbar is hidden by default (opacity-0) — it reveals on hover of the parent Message root via `group-hover/message`. Only works when Actions is inside a Message root.
- Message.Content is the flex column wrapper for Author + Body — required for proper layout in flat variant
- DateSeparator's default formatter shows "Today", "Yesterday", or "Mon DD" / "Mon DD, YYYY"

## Changes
### v0.29.0
- **Added** Initial release — 7 chat primitives (MessageList, Message, SystemMessage, MessageInput, DateSeparator, UnreadSeparator, TypingIndicator)
