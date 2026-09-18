# TaskPanel v3 — Full Redesign

**Date:** 2026-03-21
**Scope:** Replace TaskPanel v2's tab-based layout with a unified scrollable view, three progressive view modes, merged timeline, and client/staff perspective switching.
**Packages:** `@devalok/shilp-sutra-karm` (primary), `@devalok/shilp-sutra` (core components if needed)

---

## Design Principles

1. **Follow shilp-sutra token system** — surface layering (sunken shell, raised cards, overlay popovers), semantic colors, DS spacing/radius/shadow tokens. No raw hex or arbitrary values.
2. **Motion with purpose** — framer-motion springs/tweens from `lib/motion`. Animate mount/unmount, layout shifts, and micro-interactions. No animation for animation's sake.
3. **Composable API** — compound component pattern (`TaskPanel.Header`, `.Timeline`, `.Properties`, etc.). Consumers compose what they need. The DS provides the pieces, not a monolith.
4. **No regression** — every feature the current v2 supports must work in v3. The composition API evolves, not breaks.

---

## Polish & Intelligence Layer

These features elevate TaskPanel v3 from "functional" to "best-in-class":

### 1. Smart Timeline Collapsing
Consecutive system events by the same person collapse into a single line:
- "**Priya** made 5 changes · 2h ago" with expand chevron
- On expand: shows individual events with sub-timestamps
- Threshold: 3+ consecutive system events within 10 minutes
- Human comments always break a collapse group (never hidden)
- Implementation: group events in the timeline renderer, wrap in `MotionCollapse`

### 2. Unread Marker
A horizontal divider line in the timeline marking "New since you last viewed":
- `border-accent-7` dashed line with "NEW" pill label centered
- Position: between the last-read entry and the first-new entry
- Tracked via `lastViewedAt` timestamp prop (consumer provides, we render)
- On scroll past the marker, it fades out (one-shot, not persistent)
- Animation: `MotionFade` on mount, fade out on intersection

### 3. Jump to Latest
Floating pill when user has scrolled up and new entries arrive:
- "↓ 3 new comments" pill, fixed at bottom of timeline scroll area
- `bg-accent-9 text-white rounded-full shadow-floating` with bounce entrance
- Click scrolls to bottom smoothly
- Auto-dismisses when user scrolls to bottom manually
- Counter updates live as new entries arrive

### 4. Peek Quick Actions
Peek mode gets a triage action row below the quick props:
- Status dropdown + Priority dropdown + Assignee picker — compact, inline
- Enables: glance at task → change status → dismiss. The 80% workflow.
- Only in staff mode. Client peek is pure read-only.
- Action row tokens: `bg-surface-sunken rounded-ds-lg p-ds-03`

### 5. Keyboard Shortcuts (Inside Panel)
When the panel is focused, single-key shortcuts for power users:
- `S` → focus status picker
- `A` → focus assignee picker
- `P` → focus priority picker
- `D` → focus due date picker
- `E` → toggle description edit mode
- `C` → focus message input (jump to comment)
- `Escape` → close panel (or exit edit mode if editing)
- Display shortcut hints on hover over quick prop pills: "Status (S)"
- Keyboard shortcuts disabled in client mode and when an input is focused
- Implementation: `useTaskPanelKeyboard` hook, registered on panel focus

### 6. Description Byline & Diff
Below the description content, show a subtle byline:
- "Last edited by **Priya** · 2 days ago" in `text-ds-xs text-surface-fg-subtle`
- Optional "View changes" link that shows a visual diff (added text in green, removed in red)
- Diff rendered using a simple inline diff algorithm (not a full Monaco editor)
- Only shown when description has been edited at least once (not on initial creation)
- Tokens: byline in `text-surface-fg-subtle`, diff additions `bg-success-3 text-success-11`, removals `bg-error-3 text-error-11`

### 7. AI Response Guardrails
Agent responses longer than 10 lines collapse with a summary:
- Summary line: "**Sutradhar** analyzed the auth flow and suggested 3 changes" (agent-generated or first sentence)
- "Show full response" expand button below summary
- Collapsed state: summary + first 3 lines visible, rest hidden behind `MotionCollapse`
- Code blocks within agent responses get their own collapse at 15+ lines
- Max uncollapsed height: 300px, then scrollable within the entry

### 8. @Mention Highlighting
Comments that mention the current user get a visual accent:
- Left border: `border-l-2 border-l-accent-9`
- Subtle background tint: `bg-accent-2` (very light)
- The @mention text itself: `text-accent-11 font-semibold`
- Detection: scan comment content for `@{currentUser.name}` or `@{currentUser.id}`
- Works for both human and agent mentions

### 9. Empty States
Warm, contextual empty states for each section:
- **Timeline empty (staff):** Illustration + "Start the conversation" + "Your team will see updates here" + focus on message input
- **Timeline empty (client):** "No updates yet" + "We'll post progress updates as work begins"
- **Subtasks empty:** "No subtasks" + "+ Break this into steps" link
- **Description empty:** "Add a description..." placeholder text (click to edit)
- Use existing `EmptyState` composed component with contextual messaging
- Illustrations: reuse the 4 board column illustrations cycled by task ID hash

---

## Three View Modes

### Peek (Space bar on focused card)
- **Purpose:** Quick glance without leaving the board
- **Size:** ~400px wide, max 500px tall, floating card with `shadow-floating`
- **Content:** Header (task ID + title), quick props pills (read-only), description (truncated), latest 2 timeline entries
- **No:** Message input, subtasks, filters, sidebar
- **Surface:** `bg-surface-overlay`, `border-surface-border-strong`, `rounded-ds-xl`
- **Dismiss:** Space again, Escape, click outside

### Side Panel (Click task card)
- **Purpose:** Default working mode — edit, comment, review
- **Size:** ~480px wide, full viewport height, slides from right
- **Content:** Full unified view — header, editable quick props, review banner (contextual), description, subtasks, timeline with filters, message input
- **No:** Properties sidebar (not enough width — quick props handle editing)
- **Surface:** `bg-surface-raised`, right-anchored Sheet with `shadow-floating`
- **Dismiss:** X button, Escape, click outside sheet

### Full Page (Cmd+Enter or expand button)
- **Purpose:** Deep work — long conversations, file review, detailed editing
- **Size:** Full viewport, replaces board view
- **Content:** Everything from side panel PLUS properties sidebar on right (240px)
- **Surface:** `bg-surface-raised` main, `bg-surface-sunken` properties sidebar
- **Navigation:** Back button returns to board, browser back works

---

## Content Architecture (Unified Scroll)

Top-to-bottom in the main content area:

### 1. Header
- Task ID (monospace, `text-surface-fg-subtle`)
- Title (editable inline, `text-heading-lg`, `font-semibold`)
- Action buttons: Expand (peek/side only), More (...), Close
- Surface: part of panel chrome, `border-b border-surface-border`

### 2. Quick Props Pills
- Compact horizontal pills below header: Status, Assignee, Priority, Due Date
- **Staff:** Clickable — opens dropdown/picker inline (uses existing DS pickers: TaskColumnPicker, TaskMemberPicker, TaskPriorityPicker, TaskDatePicker)
- **Client:** Read-only display, no click interaction
- Tokens: `bg-surface-raised-hover`, `rounded-full`, `text-ds-sm`
- Animate pill value changes with `AnimatePresence` crossfade

### 3. Review Banner (Contextual)
- Only visible when task status is "Review" AND user is staff
- Shows: who submitted, when, what's being reviewed
- Actions: Approve (solid success), Request Changes (outline error)
- Surface: `bg-accent-2 border border-accent-6 rounded-ds-lg`
- Animate in/out with `MotionCollapse`
- On action: posts a review entry to the timeline, changes task status

### 4. Description
- Rich text area (RichTextEditor in edit mode, RichTextViewer in read mode)
- Staff: click to edit (inline toggle)
- Client: read-only
- Collapsible if long (> 4 lines) with "Show more"

### 5. Subtasks (Inline)
- Section header: "Subtasks" + count badge (`2 / 4`)
- Collapsible checklist — each item is a checkbox + title
- Click a subtask → could open its own peek/panel (recursive)
- Staff: can add, check/uncheck, reorder (drag)
- Client: read-only view of subtask progress
- Hidden in Peek mode

### 6. Timeline (Merged)
- **The centerpiece.** Replaces both Activity tab and Conversation tab.
- Single reverse-chronological stream mixing:
  - **Human comments** — prominent, with avatar, name, badge, timestamp, rich text content
  - **System events** — muted, single-line, collapsible ("Priya changed status to Review · 2h ago")
  - **File attachments** — inline in comments or standalone, with preview thumbnails
  - **Review events** — "Arjun approved · 1h ago" with checkmark icon
- **Filter bar** (optional, staff only): All | Comments | Activity | Files
- **Reactions:** Emoji reactions on comments (uses EmojiPicker composed component)
- **Typing indicator:** "[Avatar] Priya is typing..." with animated dots
- **Auto-scroll:** Scroll to bottom on new entries, with "New messages" pill if scrolled up

#### Comment Rendering
- Avatar (28px, `rounded-full`) + Author name (`font-semibold`) + Badge (Team/Client) + Timestamp
- Content: rich text (RichTextViewer) or plain text
- Hover actions: React (emoji), Reply (future), Copy link, Edit (own), Delete (own)
- Staff sees all comments. Client sees only comments where `authorType !== 'INTERNAL'` or task visibility is EVERYONE.

#### System Events
- Single line: icon + "**Name** action description" + timestamp
- Icon per event type: status change (🔄), label (🏷), assignment (👤), priority (⬆), due date (📅)
- Visually muted: `text-surface-fg-subtle`, `text-ds-xs`
- Collapsible: consecutive system events collapse into "3 updates" expandable

### 7. Message Input
- Fixed at bottom of content column (not scrollable)
- Auto-growing textarea (1 → 6 rows)
- Action buttons: Attach (📎), Emoji (🙂), Send (➤)
- Staff: @mention support (future), author type context
- Client: simplified "Post a comment..." placeholder
- Cmd+Enter to send, Shift+Enter for newline
- Surface: `bg-surface-base border border-surface-border rounded-ds-xl`

### 8. Properties Sidebar (Full Page Only)
- 240px right column, `bg-surface-sunken`, `border-l border-surface-border`
- Full property list with editable controls:
  - Status (TaskColumnPicker)
  - Assignee (TaskMemberPicker)
  - Lead (TaskMemberPicker)
  - Priority (TaskPriorityPicker)
  - Due Date (TaskDatePicker)
  - Labels (TaskLabelEditor)
  - Visibility (TaskVisibilityPicker)
  - Project (read-only link)
  - Created/Updated timestamps
- Each property row: label (`text-ds-xs uppercase`) + value (clickable, opens picker)
- Client mode: all read-only

---

## Client vs Staff Rendering

| Feature | Staff (Lokwasi) | Client |
|---------|----------------|--------|
| Quick props | Editable (click → picker) | Read-only |
| Review banner | Visible when in review | Hidden |
| Description | Click to edit | Read-only |
| Subtasks | Add, check, reorder | Read-only progress |
| System events | Visible, filterable | Hidden |
| Internal comments | Visible | Hidden |
| Reactions | Can add/remove | Hidden |
| @Mention | Available | Not available |
| Typing indicator | Shows for all users | Shows for staff typing |
| Properties sidebar | Full editing (full page) | Hidden |
| Message input | Full featured | "Post a comment..." |

Controlled via `clientMode?: boolean` prop on `TaskPanel`, cascading through context.

---

## AI Agent Integration

AI agents (Devadoot, Sutradhar, Prahari, etc.) participate in the timeline alongside humans. Design accommodations:

### Agent Comments in Timeline
- Same layout as human comments but with visual differentiation:
  - Agent avatar uses the agent's `icon` or a robot/sparkle icon with agent-specific color
  - Badge: "AI" or agent name (e.g., "Sutradhar") instead of Team/Client
  - Badge style: `bg-secondary-3 text-secondary-11` (distinct from Team blue and Client green)
- Agent messages support **streaming** — text appears progressively with animated cursor (reuse `StreamingText` from ChatPanel)
- Agent messages support **markdown** — code blocks, lists, bold/italic (reuse `markdownComponents` from ChatPanel)

### Agent Actions in Timeline
- Agents can post system events: "Sutradhar created 3 subtasks", "Devadoot updated description"
- These render like human system events but with the agent icon
- Agent-initiated status changes show agent name: "**Sutradhar** changed status to In Progress"

### Agent Invocation
- Message input supports `/agent` or `@Sutradhar` to summon an agent into the conversation
- When an agent is active, typing indicator shows: "[Agent icon] Sutradhar is thinking..."
- Agent responses can include structured blocks (from core's AI blocks: `SuccessBlock`, `ErrorBlock`, `InfoBlock`, `StatRow`, etc.)

### Data Model Extension
- `Comment.authorType` extends: `'INTERNAL' | 'CLIENT' | 'AGENT'`
- `Comment.agentAuthor?: { id: string; name: string; icon?: ReactNode }`
- Timeline items need a `type` discriminator: `'comment' | 'system-event' | 'review-event' | 'agent-response'`

### Streaming in Timeline
- When an agent is generating a response, a `StreamingTimelineEntry` renders at the bottom of the timeline
- Reuses `StreamingText` component from `packages/karm/src/chat/streaming-text.tsx`
- Auto-scrolls as content streams in
- Cancel button to stop generation (calls `onCancelAgentStream`)

### Integration with ChatPanel
- The ChatPanel (standalone AI chat sidebar) and TaskPanel timeline are separate UIs but can share agent conversations
- A "Continue in chat" action on an agent timeline entry opens ChatPanel with that conversation
- A "Post to task" action in ChatPanel pastes the agent response as a task comment

---

## Composable API (v3)

```tsx
// Simple — all defaults
<TaskPanel
  mode="side"          // 'peek' | 'side' | 'full'
  task={task}
  comments={comments}
  onPostComment={handlePost}
  onClickTask={handleClick}
  onClose={handleClose}
>
  <TaskPanel.Header />
  <TaskPanel.QuickProps />
  <TaskPanel.ReviewBanner />
  <TaskPanel.Description />
  <TaskPanel.Subtasks />
  <TaskPanel.Timeline />
  <TaskPanel.MessageInput />
</TaskPanel>

// Full page with sidebar
<TaskPanel mode="full" task={task} ...>
  <TaskPanel.Header />
  <TaskPanel.QuickProps />
  <TaskPanel.ReviewBanner />
  <TaskPanel.Body>
    <TaskPanel.Content>
      <TaskPanel.Description />
      <TaskPanel.Subtasks />
      <TaskPanel.Timeline />
      <TaskPanel.MessageInput />
    </TaskPanel.Content>
    <TaskPanel.PropertiesSidebar />
  </TaskPanel.Body>
</TaskPanel>

// Client mode — same API, different rendering
<TaskPanel mode="side" clientMode task={task} ...>
  <TaskPanel.Header />
  <TaskPanel.QuickProps />
  <TaskPanel.Description />
  <TaskPanel.Timeline />
  <TaskPanel.MessageInput />
</TaskPanel>

// Custom — add your own sections
<TaskPanel mode="side" task={task} ...>
  <TaskPanel.Header />
  <TaskPanel.QuickProps />
  <TaskPanel.Description />
  <MyCustomSection />
  <TaskPanel.Timeline />
  <TaskPanel.MessageInput />
</TaskPanel>
```

### Backward Compatibility

The v2 tab API (`TaskPanel.Tabs`, `TaskPanel.Tab`) will be removed. This is a breaking change, but the user has explicitly approved this direction. Consumers using custom tabs will migrate to composing sections directly. The v3 API is strictly more flexible.

---

## Animation Spec

| Element | Animation | Framer Config |
|---------|-----------|---------------|
| Peek mount | Scale 0.95→1, opacity 0→1 | `springs.snappy` |
| Side panel slide | translateX(100%)→0 | `springs.smooth` |
| Full page transition | Crossfade with scale | `tweens.fade` + `springs.smooth` |
| Review banner | Height collapse/expand | `MotionCollapse` |
| Quick prop value change | Crossfade text | `AnimatePresence mode="wait"` |
| Timeline new entry | Slide up + fade in | `MotionStaggerItem` (initial only) |
| Typing indicator | Bouncing dots | CSS `@keyframes` |
| Reactions add/remove | Scale pop | `springs.bouncy` |
| Subtask check | Checkbox scale + color | `springs.snappy` |
| Unread marker | Fade in on mount, fade out on scroll past | `MotionFade` |
| Jump to latest pill | Bounce entrance from bottom | `springs.bouncy` |
| System event collapse | Height expand/collapse | `MotionCollapse` |
| AI response collapse | Height expand with content reveal | `MotionCollapse` |
| @Mention highlight | Background tint fade in | `transition-colors duration-300` |
| Empty state | Fade in with slight y-shift | `MotionFade` + `y: 8→0` |
| Keyboard shortcut hint | Tooltip fade on hover | `springs.snappy` opacity |

---

## File Structure

```
packages/karm/src/tasks/
  task-panel-v3.tsx          — Root provider + mode orchestrator
  task-panel-header.tsx       — Header with title, actions
  task-panel-quick-props.tsx  — Editable property pills
  task-panel-review-banner.tsx — Contextual review UI
  task-panel-description.tsx  — Rich text description
  task-panel-subtasks.tsx     — Inline subtask checklist
  task-panel-timeline.tsx     — Merged comment/activity stream
  task-panel-message-input.tsx — Chat-style input
  task-panel-properties.tsx   — Full page sidebar
  task-panel-context.tsx      — Shared context (task data, mode, clientMode, callbacks)
  task-panel-peek.tsx         — Peek container
  task-panel-sheet.tsx        — Side panel Sheet container
  task-panel-full.tsx         — Full page container
```

---

## Testing Strategy

- Unit tests for each subcomponent (render, props, interactions)
- Integration test: full TaskPanel with all subcomponents composed
- Client mode test: verify internal content is hidden
- Peek mode test: verify truncated content, no input
- A11y tests: focus management in sheet, keyboard nav, ARIA roles
- Story for each mode × perspective combination (6 stories minimum)

---

## Migration from v2

1. `TaskPanel` import stays the same (re-export v3 as default)
2. `TaskPanel.Tabs` / `TaskPanel.Tab` removed — consumers compose sections directly
3. `ConversationTab` replaced by `TaskPanel.Timeline` + `TaskPanel.MessageInput`
4. `ActivityTab` merged into `TaskPanel.Timeline` (system events)
5. `FilesTab` content moves inline into timeline attachments
6. `ReviewTab` replaced by `TaskPanel.ReviewBanner`
7. `SubtasksTab` replaced by `TaskPanel.Subtasks`
8. `TaskPanel.Properties` (v2 inline) replaced by `TaskPanel.QuickProps` + `TaskPanel.PropertiesSidebar`
