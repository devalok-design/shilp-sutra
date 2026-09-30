# Chat Primitives — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build 7 composable chat primitives in core, then migrate Karm's AI chat and task timeline to use them — eliminating duplicated scroll/message/input code.

**Architecture:** Core primitives (`MessageList`, `Message` compound, `SystemMessage`, `DateSeparator`, `UnreadSeparator`, `MessageInput`, `TypingIndicator`) in `packages/core/src/ui/chat/`. Karm consumers compose these for AI chat (bubble variant) and task timeline (flat variant + system events). MessageList is the hard primitive (scroll, auto-scroll, load-more). Grouping is consumer-side.

**Tech Stack:** React 18, TypeScript 5.7, Framer Motion, shilp-sutra tokens, CVA.

**Design Doc:** `docs/plans/2026-03-26-chat-primitives-design.md`

---

## Conventions

- **Core chat dir:** `packages/core/src/ui/chat/` (create this directory)
- **Tests:** Co-located (e.g., `message-list.test.tsx` next to `message-list.tsx`)
- **Stories:** Co-located (e.g., `message-list.stories.tsx`)
- **Typecheck core:** `pnpm --filter @devalok/shilp-sutra typecheck`
- **Typecheck karm:** `pnpm --filter @devalok/shilp-sutra-karm typecheck`
- **Test core:** `pnpm --filter @devalok/shilp-sutra test -- --run`
- **Commit after each task.**

---

## Task Dependency Graph

```
Phase 1 — Core primitives (sequential, each builds on prior):
  Task 1 (MessageList)     — the foundation, no deps
  Task 2 (Message)         — compound component, no deps on Task 1
  Task 3 (SystemMessage)   — simple, no deps
  Task 4 (Separators)      — DateSeparator + UnreadSeparator, no deps
  Task 5 (MessageInput)    — no deps
  Task 6 (TypingIndicator) — no deps
  Task 7 (Barrel + Stories)— depends on Tasks 1-6

Phase 2 — Karm migrations:
  Task 8 (AI chat migration)      — depends on Phase 1
  Task 9 (Task timeline migration) — depends on Phase 1

Phase 3 — Final audit:
  Task 10 (Full audit + regression check)
```

Total: **10 tasks.**

---

## Phase 1: Core Primitives

### Task 1: MessageList — the scroll container

**File:** Create `packages/core/src/ui/chat/message-list.tsx`

This is the hardest component. It handles:
- Auto-scroll to bottom when new children arrive (unless user scrolled up)
- "N new" floating pill when scrolled up
- Load-more when scrolled to top (with scroll position preservation)
- Empty state slot
- Header slot (for fade gradient overlays)
- ARIA: `role="log"`, `aria-live="polite"`, `aria-relevant="additions"`

**Implementation outline:**

```tsx
'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../lib/utils'
import { tweens } from '../lib/motion'

export interface MessageListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  autoScroll?: boolean            // default true
  newMessageCount?: number
  onScrollToBottom?: () => void
  onLoadMore?: () => void
  isLoadingMore?: boolean
  emptySlot?: React.ReactNode
  scrollToBottomSlot?: React.ReactNode
  headerSlot?: React.ReactNode
}
```

**Key implementation details:**

1. **Scroll ref** — `useRef<HTMLDivElement>` on the scroll container
2. **isAtBottom** — computed on every scroll event: `scrollHeight - scrollTop - clientHeight < 40`. Stored in `isAtBottomRef`
3. **Auto-scroll** — `useLayoutEffect` watching `children`: if `isAtBottomRef.current` was true before update, scroll to bottom
4. **Scroll position preservation for prepend** — use `isLoadingMoreRef = useRef(false)`. Set `true` when `onLoadMore` fires + capture `prevScrollHeightRef.current`. In `useLayoutEffect`, if flag is true, set `scrollTop = newScrollHeight - prevScrollHeight`, then reset flag. (Avoids fragile `scrollTop < 100` heuristic.)
5. **"N new" pill** — `AnimatePresence` + `motion.button` absolutely positioned inside the `relative` wrapper. Shows when `newMessageCount > 0 && !isAtBottom`
6. **Load more** — `onScroll` checks `scrollTop < 100` + calls `onLoadMore` (debounced). Sets the `isLoadingMoreRef` flag
7. **Loading state** — `isLoadingMore` renders spinner INSIDE the scroll container at top (not replacing the component). Preserves `role="log"` and ref stability. Consumer can also render their own full-page loading state OUTSIDE MessageList if desired
8. **Empty state** — `React.Children.count(children) === 0` renders `emptySlot`
9. **AnimatePresence** — wrap children in `<AnimatePresence initial={false}>` so existing messages don't re-animate on mount

**Scroll container structure:**
```tsx
<div className="relative flex flex-1 flex-col overflow-hidden">
  {headerSlot}
  <div
    ref={scrollRef}
    role="log"
    aria-live="polite"
    aria-relevant="additions"
    className="flex-1 overflow-y-auto px-ds-05 py-ds-04"
    style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--color-surface-border) transparent' }}
    onScroll={handleScroll}
  >
    {isLoadingMore && loadingSpinner}
    <AnimatePresence initial={false}>
      {children}
    </AnimatePresence>
  </div>
  {/* "N new" pill */}
  <AnimatePresence>
    {showNewPill && (
      <motion.button ... onClick={scrollToBottom}>
        {newMessageCount} new
      </motion.button>
    )}
  </AnimatePresence>
</div>
```

**Tests:**
- Renders children
- Shows emptySlot when no children
- Has `role="log"` and `aria-live="polite"`
- Shows "N new" pill when `newMessageCount > 0` (mock scroll position)
- Calls `onScrollToBottom` when pill is clicked
- Calls `onLoadMore` (integration — harder to test, can be shallow)
- Renders headerSlot above scroll area
- Shows loading spinner when `isLoadingMore`

**Verify:** `pnpm --filter @devalok/shilp-sutra typecheck`

**Commit:** `feat(core): MessageList — scroll container with auto-scroll, N new pill, load-more, ARIA`

---

### Task 2: Message — compound component

**File:** Create `packages/core/src/ui/chat/message.tsx`

The Message compound component with sub-parts. Uses React context to share `grouped`, `variant`, `placement`, `highlight` with sub-components.

**Implementation outline:**

```tsx
// Context for sub-components
interface MessageContextValue {
  variant: 'flat' | 'bubble'
  placement: 'start' | 'end'
  grouped: boolean
  highlight?: 'mention' | 'internal'
}

const MessageContext = React.createContext<MessageContextValue>({
  variant: 'flat', placement: 'start', grouped: false,
})

function useMessage() { return React.useContext(MessageContext) }
```

**Message.Root** — the outer wrapper:
- `flat` variant: `flex gap-2` (avatar left, content right)
- `bubble` variant: `flex` with `justify-start` or `justify-end` based on placement. Content wrapped in a rounded div with bg.
- `highlight="mention"`: `border-l-2 border-l-accent-9 bg-accent-2 pl-ds-03 rounded-ds-sm`
- `highlight="internal"`: `bg-warning-2/50 rounded-ds-sm pl-ds-03` with auto lock icon
- `deleted`: renders muted placeholder: `<div className="flex items-center gap-ds-02 py-ds-02 text-ds-xs text-surface-fg-subtle/50 italic"><Icon icon={IconTrash} size="xs" /> This message was deleted</div>`. Custom text via `deletedText` prop
- Wrapped in `motion.div` for enter animation (springs.snappy, opacity+y)

**Message.Avatar** — reads `grouped` from context:
- When `grouped=true`: renders `<div className="w-6 shrink-0" />` (spacer)
- When `grouped=false`: renders Avatar with `src`/`fallback`/`icon`, or `children` escape hatch
- Size: sm=20px (`h-5 w-5`), md=24px (`h-6 w-6`)

**Message.Author** — reads `grouped` from context:
- When `grouped=true`: renders nothing
- When `grouped=false`: `<div>` with name (font-semibold), optional badge, timestamp (muted)
- `timestamp` accepts `Date` objects (formatted via `timestampFormat` or default formatter)
- `formattedTimestamp` accepts pre-formatted strings (rendered as-is, for when consumer already computed relative time)

**Message.Content** — simple flex column wrapper: `<div className="min-w-0 flex-1 flex flex-col">`

**Message.Body** — renders children: `<div className="text-ds-sm leading-relaxed">`

**Message.EditableBody** — view/edit toggle:
- Internal `isEditing` state
- View mode: calls `renderContent(content)` or renders text, click to edit (when `canEdit`)
- Edit mode: `<Textarea>` with Enter to save, Escape to cancel, blur to save
- Calls `onSave(newContent)` and `onCancel()` appropriately

**Message.Reactions** — pill row:
- Each reaction: `<button>` with emoji + count, `reacted` gets accent highlight ring
- Uses existing `Button` component with ghost variant and pill shape

**Message.Actions** — floating toolbar:
- `absolute -top-2 right-0`, `opacity-0 group-hover:opacity-100 transition-opacity duration-150 delay-100`
- Border + bg + shadow for floating effect
- Contains `Message.Action` items

**Message.Action** — icon button:
- `variant="default"`: `text-surface-fg-subtle hover:text-surface-fg`
- `variant="danger"`: `text-surface-fg-subtle hover:text-error-11`

**Compound export:**
```tsx
export const Message = Object.assign(MessageRoot, {
  Avatar: MessageAvatar,
  Content: MessageContent,
  Author: MessageAuthor,
  Body: MessageBody,
  EditableBody: MessageEditableBody,
  Reactions: MessageReactions,
  Actions: MessageActions,
  Action: MessageAction,
})
```

**Tests:**
- Renders flat variant with avatar + content
- Renders bubble variant with placement end (right-aligned)
- Grouped=true hides avatar and author
- deleted=true renders placeholder text
- highlight="mention" applies accent border
- highlight="internal" applies amber bg
- EditableBody: click to edit, Enter saves, Escape cancels
- Reactions: renders emoji pills, click calls onReact
- Actions: visible on hover (test via className)

**Verify:** `pnpm --filter @devalok/shilp-sutra typecheck`

**Commit:** `feat(core): Message — compound component with Avatar, Author, Body, EditableBody, Actions, Reactions`

---

### Task 3: SystemMessage

**File:** Create `packages/core/src/ui/chat/system-message.tsx`

Simple component, two variants.

**Implementation:**

```tsx
export function SystemMessage({ icon, timestamp, variant = 'event', children, className, ...props }) {
  if (variant === 'alert') {
    return (
      <div className="flex justify-center">
        <div className="flex items-center gap-ds-03 rounded-ds-lg bg-error-3 px-ds-04 py-ds-03">
          {icon ?? <Icon icon={IconAlertCircle} size="sm" className="shrink-0 text-error-11" />}
          <p className="text-ds-sm text-error-11">{children}</p>
        </div>
      </div>
    )
  }

  // 'event' variant — compact inline annotation
  return (
    <div className={cn(
      'flex items-center gap-ds-02 rounded-ds-sm bg-surface-raised-hover/30 px-ds-02 py-ds-01 -mx-ds-02 text-[11px] text-surface-fg-subtle/60',
      className
    )} {...props}>
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="min-w-0 flex-1">{children}</span>
      {timestamp && <span className="ml-auto shrink-0">{formatTimestamp(timestamp)}</span>}
    </div>
  )
}
```

**Tests:**
- Event variant renders compact line
- Alert variant renders centered error banner
- Icon renders when provided
- Timestamp renders when provided
- Default variant is 'event'

**Verify:** `pnpm --filter @devalok/shilp-sutra typecheck`

**Commit:** `feat(core): SystemMessage — event annotation + alert banner variants`

---

### Task 4: DateSeparator + UnreadSeparator

**File:** Create `packages/core/src/ui/chat/date-separator.tsx` and `packages/core/src/ui/chat/unread-separator.tsx`

**DateSeparator:**

```tsx
// Default format: "Today" / "Yesterday" / "Mar 25" / "Mar 25, 2025"
function defaultFormat(date: Date): string {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.round((today.getTime() - target.getTime()) / 86_400_000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  const month = date.toLocaleString('en-US', { month: 'short' })
  const day = date.getDate()
  if (date.getFullYear() === now.getFullYear()) return `${month} ${day}`
  return `${month} ${day}, ${date.getFullYear()}`
}

// Rendered as: ——— Today ———  (gradient separators)
```

**UnreadSeparator:**

```tsx
// Rendered as: ——— NEW ——— or ——— 3 NEW ———
// Uses accent-7 border color + accent-11 text
```

Both use the core `Separator` component with gradient variants if available, or plain `<div className="border-t">` with centered label.

**Tests:**
- DateSeparator: "Today" for today's date, "Yesterday" for yesterday, "Mar 25" for other dates
- DateSeparator: custom format function
- UnreadSeparator: "NEW" by default, "3 NEW" when count=3

**Verify:** `pnpm --filter @devalok/shilp-sutra typecheck`

**Commit:** `feat(core): DateSeparator + UnreadSeparator — chat divider primitives`

---

### Task 5: MessageInput

**File:** Create `packages/core/src/ui/chat/message-input.tsx`

**Implementation:**

- Auto-resizing textarea (ref + scrollHeight, max 160px then internal scroll)
- Enter to send, Shift+Enter for newline
- Send button: `<Button variant="ghost" size="icon-sm">` with `IconSend`, disabled when empty. Transforms to `<Button variant="ghost" size="icon-sm" color="error">` with `IconSquare` when `isStreaming`
- `leadingSlot` renders before textarea
- `trailingSlot` renders after send button
- `disclaimer` renders below the input container as muted text
- `disabled` renders nothing or a muted message (consumer decides via slot/wrapper)

**Tests:**
- Renders textarea with placeholder
- Enter calls onSubmit with text
- Shift+Enter does not call onSubmit
- Send button disabled when empty
- Shows stop button when isStreaming
- Clicking stop calls onCancel
- Enter does NOT send when isStreaming
- Renders leadingSlot and trailingSlot
- Renders disclaimer text

**Verify:** `pnpm --filter @devalok/shilp-sutra typecheck`

**Commit:** `feat(core): MessageInput — auto-resize textarea with send, streaming cancel, slots`

---

### Task 6: TypingIndicator

**File:** Create `packages/core/src/ui/chat/typing-indicator.tsx`

**Implementation:**

```tsx
function formatTypingText(users: { name: string }[]): string {
  if (users.length === 0) return ''
  if (users.length === 1) return `${users[0].name} is typing...`
  if (users.length === 2) return `${users[0].name} and ${users[1].name} are typing...`
  return 'Several people are typing...'
}
```

- Animated bouncing dots (3 spans with staggered `animate={{ y: [0, -4, 0] }}`)
- Reserves min-height to prevent layout shift
- AnimatePresence for enter/exit (fade in/out)
- When `users` is empty, renders nothing but keeps the reserved space via `min-h`

**Behavioral change from existing code:** The existing task timeline's typing indicator uses "Sarah and 1 others is typing..." (wrong grammar, singular verb). The new component fixes this to "Sarah and Arjun are typing..." (correct grammar, named individuals). For 3+, existing code doesn't handle this; new code says "Several people are typing..."

**Tests:**
- 1 user: "Sarah is typing..."
- 2 users: "Sarah and Arjun are typing..."
- 3+ users: "Several people are typing..."
- 0 users: renders but with no visible content
- Has animated dots

**Verify:** `pnpm --filter @devalok/shilp-sutra typecheck`

**Commit:** `feat(core): TypingIndicator — animated dots with correct grammar`

---

### Task 7: Barrel export + Stories

**Files:**
- Create `packages/core/src/ui/chat/index.ts` — barrel export
- Create `packages/core/src/ui/chat/chat.stories.tsx` — comprehensive stories

**Barrel export:**
```tsx
export { MessageList, type MessageListProps } from './message-list'
export { Message, type MessageProps } from './message'
export { SystemMessage, type SystemMessageProps } from './system-message'
export { DateSeparator, type DateSeparatorProps } from './date-separator'
export { UnreadSeparator, type UnreadSeparatorProps } from './unread-separator'
export { MessageInput, type MessageInputProps } from './message-input'
export { TypingIndicator, type TypingIndicatorProps } from './typing-indicator'
```

**Stories to create:**
1. `FlatConversation` — multi-author flat messages with system events, date separator, reactions, actions
2. `BubbleConversation` — USER/ASSISTANT bubbles with streaming indicator
3. `GroupedMessages` — 5 messages from same author, first shows avatar, rest grouped
4. `WithEditableBody` — click a message to edit inline
5. `DeletedMessage` — message with `deleted={true}`
6. `InternalHighlight` — message with `highlight="internal"` (amber tint)
7. `MentionHighlight` — message with `highlight="mention"` (accent border)
8. `SystemMessages` — event variant + alert variant side by side
9. `EmptyState` — MessageList with emptySlot
10. `MessageInputStory` — with leadingSlot, trailingSlot, streaming cancel
11. `TypingIndicatorStory` — 1 user, 2 users, 3+ users

**Also add to core barrel:** Update `packages/core/src/ui/index.ts` to re-export from `./chat`

**Vite entry point:** Check `packages/core/vite.config.ts` — the `collectEntries()` function scans `src/ui/` subdirectories. Verify that `src/ui/chat/` is picked up as a new entry point (`@devalok/shilp-sutra/ui/chat`). If not, add it explicitly. Also update the SSR smoke test (`packages/core/scripts/ssr-smoke-test.mjs`) to import from the new entry point — this is a hard publish gate.

**Verify:** `pnpm --filter @devalok/shilp-sutra typecheck`

**Commit:** `feat(core): chat primitives barrel export + 11 Storybook stories`

---

## Phase 2: Karm Migrations

### Task 8: Migrate AI chat

**Files:**
- Modify `packages/karm/src/chat/message-list.tsx` — rewrite to compose core primitives
- Modify `packages/karm/src/chat/chat-input.tsx` — rewrite to compose core `MessageInput`
- Modify `packages/karm/src/chat/chat-panel.tsx` — update imports

**Migration map:**
- Custom scroll container → `<MessageList>`
- USER bubble → `<Message variant="bubble" placement="end">`
- ASSISTANT bubble → `<Message variant="bubble" placement="start">` + `<Message.Avatar icon={robot}>`
- SYSTEM error → `<SystemMessage variant="alert">`
- Streaming dots → `<TypingIndicator users={[{ name: agentName }]}>`
- Streaming text → `<Message variant="bubble"><Message.Body><StreamingText /></Message.Body></Message>`
- Custom textarea input → `<MessageInput onSubmit={...} isStreaming={...} onCancel={...}>`

**Preserve all 14 AI chat features:**
- C1-C2: Bubble alignment + SYSTEM alerts ✓
- C3: Auto-scroll ✓ (MessageList)
- C4: Loading state ✓ (consumer wraps with loading check)
- C5: Empty state ✓ (emptySlot)
- C6-C7: Streaming text + dots ✓ (StreamingText + TypingIndicator)
- C8: AnimatePresence ✓ (MessageList wraps in AnimatePresence)
- C9: Markdown ✓ (consumer passes ReactMarkdown as Message.Body children)
- C10-C11: Auto-resize + Enter/Shift+Enter ✓ (MessageInput)
- C12: Cancel streaming ✓ (MessageInput.isStreaming + onCancel)
- C13-C14: Conversation list + agent selector ✓ (untouched, they don't use MessageList)

**Test migration:** Update `packages/karm/src/chat/__tests__/message-list.test.tsx` and `chat-input.test.tsx` to test the new compositions. Tests should verify behavior (messages render, scroll works, streaming shows) not internal implementation (no checking for specific CSS classes from the old code). Delete tests that are now covered by core's own test suite.

**Verify:** `pnpm --filter @devalok/shilp-sutra-karm typecheck`

**Commit:** `refactor(karm): AI chat — migrate to core chat primitives (MessageList, Message, MessageInput)`

---

### Task 9: Migrate task timeline

**Files:**
- Modify `packages/karm/src/tasks/v3/timeline/timeline-comment.tsx` — rewrite to compose `Message` compound
- Modify `packages/karm/src/tasks/v3/timeline/timeline-system-event.tsx` — rewrite to use `SystemMessage`
- Modify `packages/karm/src/tasks/v3/timeline/timeline-agent-response.tsx` — rewrite to compose `Message`
- Modify `packages/karm/src/tasks/v3/timeline/timeline-review-event.tsx` — rewrite to compose `Message` (NOT SystemMessage — review events have multi-line content with optional comment body that doesn't fit SystemMessage's compact format)
- Modify `packages/karm/src/tasks/v3/timeline/timeline-entry.tsx` — update the switch-case dispatcher to pass updated props to rewritten sub-components
- Verify `packages/karm/src/tasks/v3/task-panel-message-input.tsx` — already uses TaskComposer; confirm it's compatible with new MessageInput or leave as-is (it wraps TaskComposer, not core MessageInput directly)
- Modify `packages/karm/src/tasks/v3/task-panel-timeline.tsx` — swap scroll container for `MessageList`, use `DateSeparator` and `UnreadSeparator`

**Migration map:**

`timeline-comment.tsx`:
- Custom avatar + name + body + reactions + actions → `Message` compound with flat variant
- `isGrouped` prop → `Message grouped={isGrouped}`
- Inline editing → `Message.EditableBody`
- Hover action bar → `Message.Actions` + `Message.Action`
- Reactions → `Message.Reactions`
- Deleted placeholder → `Message deleted={entry.deleted}`
- CLIENT badge → `Message.Author badge={<Badge>Client</Badge>}`
- @mention highlight → `Message highlight="mention"`

`timeline-system-event.tsx`:
- Custom icon + text + timestamp → `<SystemMessage icon={...} timestamp={...}>`

`timeline-agent-response.tsx`:
- Custom robot icon + AI badge + body → `Message` flat variant with `Message.Avatar icon={response.agentIcon ?? <Icon icon={IconRobot} />}` + `Message.Author badge={<Badge>AI</Badge>}`
- Long content collapse → wrap `Message.Body` children in a custom `AgentCollapse` component that handles `COLLAPSE_CHAR_THRESHOLD`, `PREVIEW_CHAR_LIMIT`, `response.summary` display, and "Show full response" toggle. This stays in the timeline module, not core.
- Streaming → `<StreamingText>` inside `Message.Body`

`timeline-review-event.tsx`:
- Action icon + reviewer + label + optional comment body → `<Message variant="flat">` with icon avatar, NOT SystemMessage. Review events have a multi-line structure (header line + optional comment paragraph) that doesn't fit SystemMessage's compact format. Use `Message.Avatar icon={actionIcon}` + `Message.Author name={reviewerName}` + `Message.Body` for the comment.

`timeline-entry.tsx`:
- Update switch-case dispatcher to pass any changed props to rewritten sub-components. Check that `isGrouped`, `isClientTask`, and other props thread through correctly.

`task-panel-timeline.tsx`:
- Custom scroll container → `<MessageList autoScroll>`
- Custom "N new" pill → `MessageList newMessageCount={newCount}`
- Date dividers → `<DateSeparator date={...}>`
- Unread divider → `<UnreadSeparator />`
- Typing indicator → `<TypingIndicator users={typingUsers}>`
- KEEP: filter tabs, client filtering, smart collapsing, comment grouping, peek mode, fade gradient (via headerSlot)

**Preserve all 28 task timeline features** — check each off:
T1-T8 (comment features), T9-T10 (system events), T11-T14 (agent), T15-T16 (review), T17-T28 (container features)

**Verify:** `pnpm --filter @devalok/shilp-sutra-karm typecheck`

**Commit:** `refactor(karm): task timeline — migrate to core chat primitives`

---

## Phase 3: Final Audit

### Task 10: Full audit + regression check

1. **Typecheck all:** `pnpm typecheck`
2. **Run all tests:** `pnpm --filter @devalok/shilp-sutra test -- --run`
3. **Feature checklist:** Verify every feature from the 42-item inventory (28 timeline + 14 AI chat)
4. **Visual check:** Boot Storybook, verify:
   - Chat primitives stories (11 stories)
   - AI chat panel story (bubble conversation)
   - TaskPanel story (flat conversation with system events)
5. **Delete dead code:** Remove any unused imports, helper functions, or components that were replaced

**Commit:** `chore: final audit — typecheck, tests, dead code cleanup`

---

## Summary

| Task | Phase | What | Package | Files |
|------|-------|------|---------|-------|
| 1 | 1 | MessageList (scroll) | core | chat/message-list.tsx |
| 2 | 1 | Message (compound) | core | chat/message.tsx |
| 3 | 1 | SystemMessage | core | chat/system-message.tsx |
| 4 | 1 | DateSeparator + UnreadSeparator | core | chat/date-separator.tsx, unread-separator.tsx |
| 5 | 1 | MessageInput | core | chat/message-input.tsx |
| 6 | 1 | TypingIndicator | core | chat/typing-indicator.tsx |
| 7 | 1 | Barrel + Stories | core | chat/index.ts, chat.stories.tsx |
| 8 | 2 | AI chat migration | karm | chat/*.tsx |
| 9 | 2 | Task timeline migration | karm | tasks/v3/timeline/*.tsx, task-panel-timeline.tsx |
| 10 | 3 | Full audit | both | all changed files |
