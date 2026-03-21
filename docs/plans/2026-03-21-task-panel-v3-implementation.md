# TaskPanel v3 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace TaskPanel v2's tab-based layout with a unified scrollable view, three progressive view modes (peek, side panel, full page), merged timeline, client/staff perspectives, and AI agent support.

**Architecture:** Context provider at root (`TaskPanelProvider`) feeds task data, mode, perspective, and callbacks to compound subcomponents. Each subcomponent reads context and renders accordingly. Three container components (Peek, Sheet, FullPage) wrap the content based on `mode` prop. Existing DS components (Sheet, Avatar, Badge, RichTextEditor, EmojiPicker, MotionCollapse, etc.) used directly — no custom replacements.

**Tech Stack:** React 18, TypeScript 5.7, Framer Motion, Tailwind 3.4, CVA, existing shilp-sutra core components, existing karm pickers/chat components.

**Design Doc:** `docs/plans/2026-03-21-task-panel-v3-design.md`

---

## Conventions

**All new files** go in `packages/karm/src/tasks/v3/`. The v2 files stay untouched until migration is complete.

**Imports from core DS:**
```tsx
import { Avatar, AvatarImage, AvatarFallback } from '@/ui/avatar'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Sheet, SheetContent } from '@/ui/sheet'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/ui/tooltip'
import { MotionCollapse, MotionFade } from '@/motion/primitives'
import { EmptyState } from '@/composed/empty-state'
import { EmojiPickerPopover } from '@/composed/emoji-picker'
import { RichTextEditor, RichTextViewer } from '@/composed/rich-text-editor'
```

**Imports from karm (existing):**
```tsx
import { TaskColumnPicker } from '../pickers/task-column-picker'
import { TaskPriorityPicker } from '../pickers/task-priority-picker'
import { TaskMemberPicker } from '../pickers/task-member-picker'
import { TaskDatePicker } from '../pickers/task-date-picker'
import { StreamingText } from '../../chat/streaming-text'
import { markdownComponents } from '../../chat/markdown-components'
```

**Test pattern:** Vitest + RTL. Each component gets a test file in `packages/karm/src/tasks/v3/__tests__/`.

**Story pattern:** Each component gets a story in `packages/karm/src/tasks/v3/`. Stories title: `Karm/Tasks/V3/{ComponentName}`.

**Commit after each task.** Conventional commits: `feat(karm):`, `test(karm):`, `fix(karm):`.

---

## Phase 1: Foundation (Context + Types + Containers)

### Task 1: Define v3 types and context

**Files:**
- Create: `packages/karm/src/tasks/v3/task-panel-types.ts`
- Create: `packages/karm/src/tasks/v3/task-panel-context.tsx`

**Types file** — extend existing `task-types.ts` with v3-specific types:
```typescript
// Re-export existing types
export type { Comment, CommentAuthorType, CommentAuthor, TaskSubtask } from '../task-types'

// View modes
export type TaskPanelMode = 'peek' | 'side' | 'full'

// Timeline entry discriminated union
export type TimelineEntry =
  | { type: 'comment'; comment: Comment }
  | { type: 'system-event'; event: SystemEvent }
  | { type: 'review-event'; event: ReviewEvent }
  | { type: 'agent-response'; response: AgentResponse }

export interface SystemEvent {
  id: string
  actorId: string
  actorName: string
  action: 'status-change' | 'assignment' | 'priority' | 'label-add' | 'label-remove' | 'due-date' | 'visibility'
  description: string
  timestamp: string
}

export interface ReviewEvent {
  id: string
  reviewerId: string
  reviewerName: string
  action: 'submitted' | 'approved' | 'changes-requested'
  comment?: string
  timestamp: string
}

export interface AgentResponse {
  id: string
  agentId: string
  agentName: string
  agentIcon?: React.ReactNode
  content: string
  summary?: string
  isStreaming?: boolean
  timestamp: string
}

export interface TaskPanelTask {
  id: string
  taskId: string
  title: string
  description: string
  descriptionUpdatedBy?: { name: string; timestamp: string }
  status: string
  statusOptions: { id: string; name: string }[]
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  assignee: { id: string; name: string; image?: string | null } | null
  lead: { id: string; name: string; image?: string | null } | null
  members: { id: string; name: string; image?: string | null }[]
  dueDate: string | null
  labels: string[]
  visibility: 'INTERNAL' | 'EVERYONE'
  project?: string
  createdAt: string
  updatedAt: string
  subtasks: TaskSubtask[]
  isInReview: boolean
  reviewSubmittedBy?: { name: string; timestamp: string }
}
```

**Context file** — provider + hook:
```typescript
export interface TaskPanelContextValue {
  task: TaskPanelTask
  mode: TaskPanelMode
  clientMode: boolean
  currentUserId: string | null
  timeline: TimelineEntry[]
  lastViewedAt?: string
  // Callbacks
  onUpdateTitle: (title: string) => void
  onUpdateDescription: (content: string) => void
  onUpdateStatus: (statusId: string) => void
  onUpdatePriority: (priority: string) => void
  onUpdateAssignee: (memberId: string | null) => void
  onUpdateDueDate: (date: Date | null) => void
  onPostComment: (content: string) => void
  onToggleSubtask: (subtaskId: string) => void
  onAddSubtask: (title: string) => void
  onApproveReview: () => void
  onRequestChanges: (comment: string) => void
  onReact: (entryId: string, emoji: string) => void
  onClose: () => void
  onExpand: () => void
  // Agent
  isAgentStreaming?: boolean
  agentStreamingText?: string
  onCancelAgentStream?: () => void
  typingUsers?: { name: string; image?: string | null }[]
}
```

Provider wraps children, exposes `useTaskPanel()` hook.

**Step 1:** Create both files with full type definitions and context provider.
**Step 2:** Typecheck: `pnpm --filter @devalok/shilp-sutra-karm typecheck`
**Step 3:** Commit: `feat(karm): add TaskPanel v3 types and context`

---

### Task 2: Build the three container components

**Files:**
- Create: `packages/karm/src/tasks/v3/task-panel-peek.tsx`
- Create: `packages/karm/src/tasks/v3/task-panel-sheet.tsx`
- Create: `packages/karm/src/tasks/v3/task-panel-full.tsx`
- Create: `packages/karm/src/tasks/v3/task-panel-root.tsx`

**Peek container:** Floating card, `bg-surface-overlay`, `shadow-floating`, `rounded-ds-xl`. Uses `MotionFade` + scale for mount/unmount. Max 400px wide, 500px tall. Rendered via `createPortal`.

**Sheet container:** Wraps core `Sheet` + `SheetContent` with `side="right"`. Override width to 480px. Passes `open` and `onOpenChange` from context.

**Full page container:** Full viewport div, `bg-surface-raised`. Renders a back button + content area. Uses `AnimatePresence` for crossfade transition.

**Root component:** `TaskPanelRoot` reads `mode` and renders the appropriate container:
```tsx
function TaskPanelRoot({ mode, children, ...providerProps }) {
  return (
    <TaskPanelProvider {...providerProps}>
      {mode === 'peek' && <PeekContainer>{children}</PeekContainer>}
      {mode === 'side' && <SheetContainer>{children}</SheetContainer>}
      {mode === 'full' && <FullPageContainer>{children}</FullPageContainer>}
    </TaskPanelProvider>
  )
}
```

**Step 1:** Create all four files.
**Step 2:** Write basic render test for each container mode.
**Step 3:** Typecheck + test: `pnpm --filter @devalok/shilp-sutra-karm typecheck`
**Step 4:** Commit: `feat(karm): add TaskPanel v3 container components`

---

## Phase 2: Content Subcomponents

### Task 3: TaskPanel.Header

**Files:**
- Create: `packages/karm/src/tasks/v3/task-panel-header.tsx`
- Create: `packages/karm/src/tasks/v3/__tests__/task-panel-header.test.tsx`

Renders: task ID (monospace), editable title (inline edit pattern from `InlineEdit`), action buttons (expand, more, close). Uses context for `task.taskId`, `task.title`, `onUpdateTitle`, `onClose`, `onExpand`, `mode`.

Expand button hidden in full mode. Title uses `InlineEdit` from `@/composed/inline-edit` for click-to-edit. Client mode: title is read-only.

**Step 1:** Write test — renders task ID, title, close button.
**Step 2:** Implement component.
**Step 3:** Run tests, verify pass.
**Step 4:** Commit: `feat(karm): add TaskPanel v3 header`

---

### Task 4: TaskPanel.QuickProps

**Files:**
- Create: `packages/karm/src/tasks/v3/task-panel-quick-props.tsx`
- Create: `packages/karm/src/tasks/v3/__tests__/task-panel-quick-props.test.tsx`

Renders horizontal pills: Status (dot + name), Assignee (avatar + name), Priority (icon + level), Due Date (icon + date).

**Staff mode:** Each pill wraps the existing task picker in a `Popover`. Click pill → picker opens inline → select value → `onUpdate*` callback fires → popover closes. Keyboard shortcut hints via `Tooltip` on hover (e.g., "Status (S)").

**Client mode:** Pills are plain display, no click interaction, no tooltips.

Reuses: `TaskColumnPicker`, `TaskPriorityPicker`, `TaskMemberPicker`, `TaskDatePicker`, `Avatar`, `Popover`, `Tooltip`.

**Step 1:** Write test — renders 4 pills with correct content, client mode is read-only.
**Step 2:** Implement with picker popovers for staff mode.
**Step 3:** Run tests.
**Step 4:** Commit: `feat(karm): add TaskPanel v3 quick props with inline editing`

---

### Task 5: TaskPanel.ReviewBanner

**Files:**
- Create: `packages/karm/src/tasks/v3/task-panel-review-banner.tsx`
- Create: `packages/karm/src/tasks/v3/__tests__/task-panel-review-banner.test.tsx`

Conditional rendering: only when `task.isInReview && !clientMode`. Wraps in `MotionCollapse` for animate in/out.

Content: Review icon, "REVIEW REQUESTED" title, "Submitted by X · time ago" subtitle, Approve button (`Button` variant="solid" color="default" with success styling), Request Changes button (`Button` variant="outline").

Reuses: `Button`, `MotionCollapse`, `Badge`.

**Step 1:** Write test — renders when in review + staff, hidden when client or not in review.
**Step 2:** Implement with animation.
**Step 3:** Run tests.
**Step 4:** Commit: `feat(karm): add TaskPanel v3 contextual review banner`

---

### Task 6: TaskPanel.Description

**Files:**
- Create: `packages/karm/src/tasks/v3/task-panel-description.tsx`
- Create: `packages/karm/src/tasks/v3/__tests__/task-panel-description.test.tsx`

**Staff mode:** Click description → switches from `RichTextViewer` to `RichTextEditor`. Blur/Escape saves. Byline below: "Last edited by X · time ago" with optional "View changes" link.

**Client mode:** `RichTextViewer` only, no byline.

**Empty state:** Placeholder text "Add a description..." (staff click to edit, client sees nothing).

Collapse long descriptions (> 4 lines) with "Show more" using `MotionCollapse`.

Reuses: `RichTextEditor`, `RichTextViewer`, `MotionCollapse`.

**Step 1:** Write test — renders content, toggles edit mode on click (staff), read-only (client).
**Step 2:** Implement.
**Step 3:** Run tests.
**Step 4:** Commit: `feat(karm): add TaskPanel v3 description with inline editing`

---

### Task 7: TaskPanel.Subtasks

**Files:**
- Create: `packages/karm/src/tasks/v3/task-panel-subtasks.tsx`
- Create: `packages/karm/src/tasks/v3/__tests__/task-panel-subtasks.test.tsx`

Collapsible section with header ("Subtasks" + count badge). Checklist of subtask items. Staff can check/uncheck (`onToggleSubtask`) and add new (`onAddSubtask` with inline input). Client sees read-only progress.

Hidden in peek mode (check `mode !== 'peek'` from context).

Empty state: "No subtasks" + "+ Break this into steps" link (staff only).

Reuses: `Checkbox` (core UI), `MotionCollapse`, `Badge`, `EmptyState`.

**Step 1:** Write test — renders subtasks, toggle works, hidden in peek.
**Step 2:** Implement.
**Step 3:** Run tests.
**Step 4:** Commit: `feat(karm): add TaskPanel v3 inline subtasks`

---

## Phase 3: Timeline (The Centerpiece)

### Task 8: Timeline entry renderers

**Files:**
- Create: `packages/karm/src/tasks/v3/timeline/timeline-comment.tsx`
- Create: `packages/karm/src/tasks/v3/timeline/timeline-system-event.tsx`
- Create: `packages/karm/src/tasks/v3/timeline/timeline-review-event.tsx`
- Create: `packages/karm/src/tasks/v3/timeline/timeline-agent-response.tsx`
- Create: `packages/karm/src/tasks/v3/timeline/timeline-entry.tsx` (discriminated union renderer)

**Comment renderer:** Avatar (sm) + name + badge (Team/Client/AI) + timestamp + content (RichTextViewer or markdown) + reactions row + hover actions (react, copy link). @Mention highlighting: detect `@currentUser` in content → accent left border + tint.

**System event renderer:** Single line, muted. Icon per action type + "**Name** action description" + timestamp. Consecutive events collapse (smart collapsing logic in parent).

**Review event renderer:** Icon (checkmark for approved, arrow for changes requested) + "**Name** approved/requested changes" + optional comment.

**Agent response renderer:** Agent avatar/icon + name + "AI" badge + streaming text or collapsed markdown. Collapse at 10+ lines with summary. Reuses `StreamingText` and `markdownComponents`.

**Entry discriminator:** Switch on `entry.type`, render the correct component.

Reuses: `Avatar`, `Badge`, `RichTextViewer`, `StreamingText`, `markdownComponents`, `EmojiPickerPopover`, `MotionCollapse`.

**Step 1:** Write tests for each renderer (renders correct content, badges, mentions).
**Step 2:** Implement all four renderers + discriminator.
**Step 3:** Run tests.
**Step 4:** Commit: `feat(karm): add TaskPanel v3 timeline entry renderers`

---

### Task 9: TaskPanel.Timeline (orchestrator)

**Files:**
- Create: `packages/karm/src/tasks/v3/task-panel-timeline.tsx`
- Create: `packages/karm/src/tasks/v3/__tests__/task-panel-timeline.test.tsx`

The main timeline component. Responsibilities:

1. **Filter bar** — All | Comments | Activity | Files buttons. Filters `timeline` entries by type.
2. **Smart collapsing** — Groups consecutive system events (same actor, < 10 min apart) into collapsed groups.
3. **Unread marker** — Inserts a "NEW" divider based on `lastViewedAt`.
4. **Client filtering** — Hides system events and internal-only comments when `clientMode`.
5. **Entry rendering** — Maps filtered entries through `TimelineEntry` discriminator.
6. **Auto-scroll** — Scroll to bottom on new entries. "Jump to latest" floating pill when scrolled up.
7. **Typing indicator** — Shows at bottom when `typingUsers` is non-empty.
8. **Empty state** — Contextual empty state when no entries (staff vs client messaging).

**Peek mode:** Shows only latest 2 entries, no filter bar, no input.

Reuses: `MotionFade`, `MotionStagger` (initial entrance only), `EmptyState`, `Badge`.

**Step 1:** Write test — renders entries, filters work, client mode hides system events.
**Step 2:** Implement timeline orchestrator.
**Step 3:** Run tests.
**Step 4:** Commit: `feat(karm): add TaskPanel v3 timeline with filtering and smart collapse`

---

### Task 10: TaskPanel.MessageInput

**Files:**
- Create: `packages/karm/src/tasks/v3/task-panel-message-input.tsx`
- Create: `packages/karm/src/tasks/v3/__tests__/task-panel-message-input.test.tsx`

Chat-style input fixed at the bottom of the content column. Auto-growing textarea (reuse ChatInput's `adjustHeight` pattern). Action buttons: Attach, Emoji (opens `EmojiPickerPopover`), Send. Cmd+Enter to send, Shift+Enter for newline.

Staff mode: full actions. Client mode: simplified placeholder, no @mention.

Hidden in peek mode.

Reuses: `EmojiPickerPopover`, `Button`.

**Step 1:** Write test — renders input, send fires callback, hidden in peek.
**Step 2:** Implement.
**Step 3:** Run tests.
**Step 4:** Commit: `feat(karm): add TaskPanel v3 message input`

---

## Phase 4: Full Page Sidebar + Keyboard Shortcuts

### Task 11: TaskPanel.PropertiesSidebar

**Files:**
- Create: `packages/karm/src/tasks/v3/task-panel-properties-sidebar.tsx`
- Create: `packages/karm/src/tasks/v3/__tests__/task-panel-properties-sidebar.test.tsx`

Only rendered in full page mode (`mode === 'full'`) and staff mode. Right column (240px), `bg-surface-sunken`.

Full property list with editable pickers: Status, Assignee, Lead, Priority, Due Date, Labels, Visibility, Project (read-only), Created, Updated.

Each property row: label + clickable value → opens picker inline.

Reuses: All existing task pickers, `Avatar`, `Badge`, `TaskLabelEditor`, `TaskVisibilityPicker`.

**Step 1:** Write test — renders all properties, hidden in non-full mode.
**Step 2:** Implement.
**Step 3:** Run tests.
**Step 4:** Commit: `feat(karm): add TaskPanel v3 properties sidebar`

---

### Task 12: Keyboard shortcuts hook

**Files:**
- Create: `packages/karm/src/tasks/v3/use-task-panel-keyboard.ts`
- Create: `packages/karm/src/tasks/v3/__tests__/use-task-panel-keyboard.test.ts`

`useTaskPanelKeyboard()` hook. Registers keydown listener on the panel root element. Shortcuts: S (status), A (assignee), P (priority), D (due date), E (edit description), C (focus comment input), Escape (close or exit edit).

Disabled when: `clientMode`, or any `<input>`/`<textarea>`/`[contenteditable]` is focused.

Exposes imperative refs for each picker/section to `.focus()`.

**Step 1:** Write test — hook fires correct callbacks for each key.
**Step 2:** Implement hook.
**Step 3:** Run tests.
**Step 4:** Commit: `feat(karm): add TaskPanel v3 keyboard shortcuts`

---

## Phase 5: Assembly + Stories + Migration

### Task 13: Assemble compound component + exports

**Files:**
- Create: `packages/karm/src/tasks/v3/task-panel.tsx` (compound component assembly)
- Create: `packages/karm/src/tasks/v3/index.ts` (barrel export)
- Modify: `packages/karm/src/tasks/index.ts` (add v3 exports)
- Modify: `packages/karm/src/index.ts` (add v3 exports)

Assemble via `Object.assign()`:
```tsx
export const TaskPanel = Object.assign(TaskPanelRoot, {
  Header: TaskPanelHeader,
  QuickProps: TaskPanelQuickProps,
  ReviewBanner: TaskPanelReviewBanner,
  Description: TaskPanelDescription,
  Subtasks: TaskPanelSubtasks,
  Timeline: TaskPanelTimeline,
  MessageInput: TaskPanelMessageInput,
  Body: TaskPanelBody,           // flex row container for content + sidebar
  Content: TaskPanelContent,     // flex-1 scrollable column
  PropertiesSidebar: TaskPanelPropertiesSidebar,
})
```

Add package.json exports entry for `./tasks/v3`.

**Step 1:** Create assembly file and barrel export.
**Step 2:** Add to package exports.
**Step 3:** Typecheck.
**Step 4:** Commit: `feat(karm): assemble TaskPanel v3 compound component`

---

### Task 14: Stories for all modes and perspectives

**Files:**
- Create: `packages/karm/src/tasks/v3/task-panel.stories.tsx`

Stories to create:
1. **SidePanelStaff** — default, full-featured side panel
2. **SidePanelClient** — client perspective side panel
3. **Peek** — peek mode with quick actions
4. **FullPage** — full page with properties sidebar
5. **FullPageClient** — full page client mode (no sidebar)
6. **InReview** — side panel with review banner
7. **WithAIAgent** — timeline with streaming agent response
8. **EmptyTask** — new task with empty states
9. **LongConversation** — timeline with 20+ entries to test scroll
10. **KeyboardShortcuts** — interactive story demonstrating shortcuts

Use realistic mock data: team members, comments with @mentions, system events, file attachments.

**Step 1:** Create story file with all 10 stories.
**Step 2:** Run Storybook, visually verify each.
**Step 3:** Commit: `feat(karm): add TaskPanel v3 stories`

---

### Task 15: Integration tests

**Files:**
- Create: `packages/karm/src/tasks/v3/__tests__/task-panel-integration.test.tsx`

Full integration test: render `TaskPanel` in side mode with all subcomponents, verify:
- Header renders with title
- Quick props show correct values
- Timeline renders comments
- Client mode hides internal content
- Posting a comment calls callback
- Keyboard shortcut focuses correct picker

**Step 1:** Write integration test.
**Step 2:** Run full test suite: `pnpm --filter @devalok/shilp-sutra-karm test -- --run`
**Step 3:** Commit: `test(karm): add TaskPanel v3 integration tests`

---

### Task 16: Migration — replace v2 default export

**Files:**
- Modify: `packages/karm/src/tasks/index.ts` — re-export v3 `TaskPanel` as default
- Modify: `packages/karm/src/tasks/task-panel.stories.tsx` — update stories to use v3
- Keep: v2 files intact (can be removed in a future cleanup)

**Step 1:** Update exports to make v3 the default `TaskPanel`.
**Step 2:** Update existing stories to demonstrate v3.
**Step 3:** Full typecheck + test suite.
**Step 4:** Commit: `feat(karm)!: TaskPanel v3 as default export`

---

## Phase 6: Documentation + Publish

### Task 17: Update docs and publish

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `packages/karm/llms.txt`
- Modify: `packages/karm/package.json` (version bump)

Follow `/publish-release` skill for full publishing checklist.

---

## Task Dependency Graph

```
Phase 1: Task 1 → Task 2
Phase 2: Task 2 → Tasks 3-7 (can parallelize)
Phase 3: Tasks 3-7 → Task 8 → Task 9 → Task 10
Phase 4: Task 9 → Task 11, Task 12 (can parallelize)
Phase 5: Tasks 11-12 → Task 13 → Task 14 → Task 15 → Task 16
Phase 6: Task 16 → Task 17
```

Total: **17 tasks across 6 phases.** Phases 2 and 4 have parallelizable tasks.
