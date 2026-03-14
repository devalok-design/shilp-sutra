# TaskPanel v2 Composition Rewrite — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rewrite TaskDetailPanel as a fully composable component system with container-agnostic shell, composable tabs, upgraded property pickers, and pre-assembled defaults.

**Architecture:** Bottom-up build — shared types first, then individual pickers and tab pieces, then tab defaults, then shell subcomponents, then barrel exports. Each component is self-contained with its own test and story file.

**Tech Stack:** React 18, TypeScript 5.7, CVA, Tailwind 3.4, @tabler/icons-react, vitest + RTL

**Design doc:** `docs/plans/2026-03-14-task-panel-v2-composition-design.md`

---

## Phase 1: Foundation (Types + Constants)

### Task 1: Extract shared types into task-types.ts

Currently types are scattered across files (Member in task-properties, Subtask in subtasks-tab, etc.). Centralize them.

**Files:**
- Create: `packages/karm/src/tasks/task-types.ts`
- Modify: `packages/karm/src/tasks/task-constants.ts` (no changes needed, just verify)

**Step 1: Create task-types.ts**

Extract and centralize all domain types:

```ts
// task-types.ts
export interface Member {
  id: string
  name: string
  email?: string
  image?: string | null
}

export interface Column {
  id: string
  name: string
  isDefault?: boolean
  isTerminal?: boolean
}

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
export type Visibility = 'INTERNAL' | 'EVERYONE'
export type CommentAuthorType = 'INTERNAL' | 'CLIENT'

export interface Subtask {
  id: string
  title: string
  priority: Priority
  columnId: string
  column?: { id: string; name: string; isTerminal?: boolean }
  assignees: { user: { id: string; name: string; image?: string | null } }[]
}

export interface ReviewUser {
  id: string
  name: string
  image: string | null
}

export interface ReviewRequest {
  id: string
  taskId: string
  status: 'PENDING' | 'APPROVED' | 'CHANGES_REQUESTED' | 'REJECTED'
  feedback: string | null
  requestedBy: ReviewUser
  reviewer: ReviewUser
  createdAt: string
  updatedAt: string
}

export interface CommentAuthor {
  id: string
  name: string
  email?: string
  image?: string | null
}

export interface Comment {
  id: string
  taskId: string
  authorType: CommentAuthorType
  authorId: string
  content: string
  createdAt: string
  updatedAt: string
  internalAuthor?: CommentAuthor | null
  clientAuthor?: { id: string; name: string; email: string } | null
}

export interface TaskFile {
  id: string
  taskId: string
  title: string
  fileUrl: string
  downloadUrl?: string
  fileType: string | null
  uploadedBy: { id: string; name: string; image: string | null }
  createdAt: string
  externalUrl?: string
  externalLabel?: string
}

export interface AuditLogEntry {
  id: string
  timestamp: string
  actorType: 'USER' | 'CLIENT' | 'SYSTEM' | 'AGENT'
  actorId: string | null
  action: string
  entityType: string
  entityId: string
  projectId: string | null
  metadata: Record<string, unknown> | null
}

export interface LabelOption {
  name: string
  color?: string
}
```

**Step 2: Verify typecheck**

Run: `pnpm typecheck`

**Step 3: Commit**

```
feat(karm): extract shared task types into task-types.ts
```

---

## Phase 2: Property Pickers (6 tasks)

Each picker is a standalone component in `packages/karm/src/tasks/pickers/`. They use core DS primitives (Popover, Avatar, etc.) and are independently testable.

### Task 2: TaskColumnPicker

**Files:**
- Create: `packages/karm/src/tasks/pickers/task-column-picker.tsx`
- Create: `packages/karm/src/tasks/pickers/task-column-picker.test.tsx`
- Create: `packages/karm/src/tasks/pickers/task-column-picker.stories.tsx`

**Implementation:** Extract column picker from current task-properties.tsx. Popover with flat list + checkmark on current selection. Props: `columns: Column[], value: string, onChange: (columnId: string) => void, readOnly?: boolean, className?: string`.

**Step 1: Write test** — render, select a column, verify onChange called with column id. Verify readOnly disables interaction.

**Step 2: Run test to verify it fails**

**Step 3: Implement** — extract the column Popover from task-properties.tsx into standalone component. Keep same visual: `hover:bg-surface-3`, chevron, checkmark on selected.

**Step 4: Write story** — Default, WithManyColumns, ReadOnly.

**Step 5: Run tests, typecheck**

**Step 6: Commit**

```
feat(karm): add TaskColumnPicker component
```

### Task 3: TaskPriorityPicker (upgraded with icons)

**Files:**
- Create: `packages/karm/src/tasks/pickers/task-priority-picker.tsx`
- Create: `packages/karm/src/tasks/pickers/task-priority-picker.test.tsx`
- Create: `packages/karm/src/tasks/pickers/task-priority-picker.stories.tsx`
- Modify: `packages/karm/src/tasks/task-constants.ts` — add PRIORITY_ICONS map

**Implementation:** Popover dropdown. Each option shows an icon + label. Icons per level:
- URGENT — IconAlertTriangle or IconUrgent, error-9
- HIGH — IconArrowUp, warning-9
- MEDIUM — IconMinus, surface-fg-muted
- LOW — IconArrowDown, surface-fg-subtle

Props: `value: Priority, onChange: (p: Priority) => void, readOnly?: boolean, className?: string`.

Add to task-constants.ts:
```ts
export const PRIORITY_ICONS: Record<string, { icon: string; color: string }> = {
  URGENT: { icon: 'IconAlertTriangle', color: 'text-error-9' },
  HIGH: { icon: 'IconArrowUp', color: 'text-warning-9' },
  MEDIUM: { icon: 'IconMinus', color: 'text-surface-fg-muted' },
  LOW: { icon: 'IconArrowDown', color: 'text-surface-fg-subtle' },
}
```

**Step 1-6:** Same TDD cycle as Task 2.

```
feat(karm): add TaskPriorityPicker with per-level icons
```

### Task 4: TaskMemberPicker (single select, for owner)

**Files:**
- Create: `packages/karm/src/tasks/pickers/task-member-picker.tsx`
- Create: `packages/karm/src/tasks/pickers/task-member-picker.test.tsx`
- Create: `packages/karm/src/tasks/pickers/task-member-picker.stories.tsx`

**Implementation:** Wraps core MemberPicker. Shows avatar + name for current value, or "No owner" placeholder. Props: `members: Member[], value: string | null, onChange: (memberId: string | null) => void, placeholder?: string, readOnly?: boolean, className?: string`.

```
feat(karm): add TaskMemberPicker component
```

### Task 5: TaskAssigneePicker (multi-select with chips)

**Files:**
- Create: `packages/karm/src/tasks/pickers/task-assignee-picker.tsx`
- Create: `packages/karm/src/tasks/pickers/task-assignee-picker.test.tsx`
- Create: `packages/karm/src/tasks/pickers/task-assignee-picker.stories.tsx`

**Implementation:** Multi-select. Shows assigned members as chips (avatar + first name + X remove button). "+" button triggers MemberPicker to add. Props: `members: Member[], value: Member[], onAssign: (userId: string) => void, onUnassign: (userId: string) => void, readOnly?: boolean, className?: string`.

```
feat(karm): add TaskAssigneePicker with chip display
```

### Task 6: TaskDatePicker (calendar popover with presets)

**Files:**
- Create: `packages/karm/src/tasks/pickers/task-date-picker.tsx`
- Create: `packages/karm/src/tasks/pickers/task-date-picker.test.tsx`
- Create: `packages/karm/src/tasks/pickers/task-date-picker.stories.tsx`

**Implementation:** Replaces native `<input type="date">`. Popover with:
- Preset buttons: Today, Tomorrow, Next Monday, Next week (+7d), In 2 weeks (+14d), Clear
- Calendar grid below (use core Calendar component if available, otherwise a simple month grid)
- Shows formatted date + clear button in trigger

Props: `value: Date | string | null, onChange: (date: Date | null) => void, presets?: boolean, readOnly?: boolean, className?: string`.

Check if core has a Calendar/DatePicker component first. If not, build a simple month grid or use the native input as the calendar portion with presets above it.

```
feat(karm): add TaskDatePicker with calendar popover and presets
```

### Task 7: TaskLabelEditor (autocomplete + color)

**Files:**
- Create: `packages/karm/src/tasks/pickers/task-label-editor.tsx`
- Create: `packages/karm/src/tasks/pickers/task-label-editor.test.tsx`
- Create: `packages/karm/src/tasks/pickers/task-label-editor.stories.tsx`

**Implementation:** Label chips with inline add/remove. Upgraded with:
- `availableLabels?: LabelOption[]` — autocomplete dropdown when typing
- Color dot before label text (in chip and dropdown)
- Typing filters matches, Enter selects match or creates new
- Each chip: colored dot + name + X remove button

Props: `value: string[], onChange: (labels: string[]) => void, availableLabels?: LabelOption[], readOnly?: boolean, className?: string`.

```
feat(karm): add TaskLabelEditor with autocomplete and color support
```

### Task 8: TaskVisibilityPicker (dropdown)

**Files:**
- Create: `packages/karm/src/tasks/pickers/task-visibility-picker.tsx`
- Create: `packages/karm/src/tasks/pickers/task-visibility-picker.test.tsx`
- Create: `packages/karm/src/tasks/pickers/task-visibility-picker.stories.tsx`

**Implementation:** Popover dropdown (same pattern as Column/Priority pickers):
- 🔒 Internal — "Only team members"
- 🌐 Everyone — "Visible to clients"
- Checkmark on current selection
- Optional `confirmOnPublic` — shows confirmation dialog before switching to EVERYONE

Props: `value: Visibility, onChange: (v: Visibility) => void, confirmOnPublic?: boolean, readOnly?: boolean, className?: string`.

```
feat(karm): add TaskVisibilityPicker as dropdown with confirm option
```

### Task 9: Picker barrel export

**Files:**
- Create: `packages/karm/src/tasks/pickers/index.ts`

Re-export all pickers from one barrel:
```ts
export { TaskColumnPicker } from './task-column-picker'
export { TaskPriorityPicker } from './task-priority-picker'
export { TaskMemberPicker } from './task-member-picker'
export { TaskAssigneePicker } from './task-assignee-picker'
export { TaskDatePicker } from './task-date-picker'
export { TaskLabelEditor } from './task-label-editor'
export { TaskVisibilityPicker } from './task-visibility-picker'
```

**Step 1: Run full typecheck + tests**

Run: `pnpm typecheck && cd packages/karm && pnpm vitest run src/tasks/pickers/`

**Step 2: Commit**

```
feat(karm): add pickers barrel export
```

---

## Phase 3: Composable Tab Pieces (5 tasks)

Each tab gets decomposed into standalone sub-pieces. The pre-assembled default tab stays as a convenience wrapper.

### Task 10: SubtasksTab pieces

**Files:**
- Create: `packages/karm/src/tasks/tabs/subtask-progress.tsx`
- Create: `packages/karm/src/tasks/tabs/subtask-list.tsx`
- Create: `packages/karm/src/tasks/tabs/subtask-item.tsx`
- Create: `packages/karm/src/tasks/tabs/subtask-add-form.tsx`
- Modify: `packages/karm/src/tasks/subtasks-tab.tsx` — refactor to compose from pieces
- Modify: `packages/karm/src/tasks/__tests__/subtasks-tab.test.tsx` — update imports, add piece-level tests
- Modify: `packages/karm/src/tasks/subtasks-tab.stories.tsx` — add stories for individual pieces

**Sub-components:**
- `SubtaskProgress` — props: `completed: number, total: number, className?: string`
- `SubtaskList` — props: `children: ReactNode, className?: string` (simple container, space-y-ds-01)
- `SubtaskItem` — props: `subtask: Subtask, isComplete: boolean, onToggle: (id: string, isComplete: boolean) => void, onClick?: (id: string) => void, className?: string`
- `SubtaskAddForm` — props: `onCreate: (title: string) => void, placeholder?: string, className?: string`
- `SubtasksTab` — refactored to compose SubtaskProgress + SubtaskList + SubtaskItems + SubtaskAddForm. Same external props, just internal refactor.

**TDD cycle per piece, then integration test that SubtasksTab still passes all existing tests.**

```
feat(karm): decompose SubtasksTab into composable pieces
```

### Task 11: ConversationTab pieces

**Files:**
- Create: `packages/karm/src/tasks/tabs/message-list.tsx`
- Create: `packages/karm/src/tasks/tabs/message-bubble.tsx`
- Create: `packages/karm/src/tasks/tabs/message-input.tsx`
- Create: `packages/karm/src/tasks/tabs/visibility-warning.tsx`
- Modify: `packages/karm/src/tasks/conversation-tab.tsx` — refactor to compose from pieces
- Modify: `packages/karm/src/tasks/__tests__/conversation-tab.test.tsx`
- Modify: `packages/karm/src/tasks/conversation-tab.stories.tsx`

**Sub-components:**
- `MessageList` — props: `children: ReactNode, autoScroll?: boolean, className?: string` (scrollable, auto-scroll to bottom on children change)
- `MessageBubble` — props: `comment: Comment, clientMode?: boolean, renderViewer?: ..., className?: string`
- `MessageInput` — props: `onSubmit: (content: string, authorType: CommentAuthorType) => void, renderEditor?: ..., placeholder?: string, clientMode?: boolean, className?: string`
- `VisibilityWarning` — props: `className?: string` (static warning text)
- `ConversationTab` — refactored to compose above. Same external props.

```
feat(karm): decompose ConversationTab into composable pieces
```

### Task 12: FilesTab pieces

**Files:**
- Create: `packages/karm/src/tasks/tabs/file-drop-zone.tsx`
- Create: `packages/karm/src/tasks/tabs/file-list.tsx`
- Create: `packages/karm/src/tasks/tabs/file-item.tsx`
- Modify: `packages/karm/src/tasks/files-tab.tsx`
- Modify: `packages/karm/src/tasks/__tests__/files-tab.test.tsx`
- Modify: `packages/karm/src/tasks/files-tab.stories.tsx`

**Sub-components:**
- `FileDropZone` — props: `onUpload: (file: File, title?: string) => void, isUploading?: boolean, accept?: string, className?: string`
- `FileList` — props: `children: ReactNode, className?: string` (container)
- `FileItem` — props: `file: TaskFile, onDelete?: (id: string) => void, readOnly?: boolean, className?: string`

```
feat(karm): decompose FilesTab into composable pieces
```

### Task 13: ReviewTab pieces

**Files:**
- Create: `packages/karm/src/tasks/tabs/review-card.tsx`
- Create: `packages/karm/src/tasks/tabs/review-response-form.tsx`
- Create: `packages/karm/src/tasks/tabs/review-request-button.tsx`
- Modify: `packages/karm/src/tasks/review-tab.tsx`
- Modify: `packages/karm/src/tasks/__tests__/review-tab.test.tsx`
- Modify: `packages/karm/src/tasks/review-tab.stories.tsx`

**Sub-components:**
- `ReviewCard` — props: `review: ReviewRequest, onUpdateStatus?: ..., className?: string`
- `ReviewResponseForm` — props: `reviewId: string, onSubmit: (id: string, status: string, feedback?: string) => void, className?: string`
- `ReviewRequestButton` — props: `members: Member[], onRequest: (reviewerId: string) => void, className?: string`

```
feat(karm): decompose ReviewTab into composable pieces
```

### Task 14: ActivityTab pieces

**Files:**
- Create: `packages/karm/src/tasks/tabs/activity-timeline.tsx`
- Create: `packages/karm/src/tasks/tabs/activity-entry.tsx`
- Modify: `packages/karm/src/tasks/activity-tab.tsx`
- Modify: `packages/karm/src/tasks/__tests__/activity-tab.test.tsx`
- Modify: `packages/karm/src/tasks/activity-tab.stories.tsx`

**Sub-components:**
- `ActivityTimeline` — props: `children: ReactNode, className?: string` (vertical line container)
- `ActivityEntry` — props: `entry: AuditLogEntry, className?: string` (dot + icon + description + timestamp)

```
feat(karm): decompose ActivityTab into composable pieces
```

### Task 15: Tabs barrel export

**Files:**
- Create: `packages/karm/src/tasks/tabs/index.ts`

Re-export all tab pieces:
```ts
export { SubtaskProgress, SubtaskList, SubtaskItem, SubtaskAddForm } from ...
export { MessageList, MessageBubble, MessageInput, VisibilityWarning } from ...
export { FileDropZone, FileList, FileItem } from ...
export { ReviewCard, ReviewResponseForm, ReviewRequestButton } from ...
export { ActivityTimeline, ActivityEntry } from ...
```

```
chore(karm): add tabs pieces barrel export
```

---

## Phase 4: TaskPanel Shell (3 tasks)

### Task 16: TaskPanel shell subcomponents

**Files:**
- Create: `packages/karm/src/tasks/task-panel.tsx`
- Create: `packages/karm/src/tasks/__tests__/task-panel.test.tsx`
- Create: `packages/karm/src/tasks/task-panel.stories.tsx`

**Implementation:** Build the compound component:

- `TaskPanel` — root div, `flex flex-col overflow-hidden h-full`
- `TaskPanel.Header` — `shrink-0 border-b border-surface-border-strong px-ds-06 pb-ds-05 pt-ds-06`
- `TaskPanel.Title` — editable heading. Props: `value: string, editable?: boolean, onUpdate?: (title: string) => void, subtask?: boolean, className?: string`. Click/Enter to edit, Escape to revert, blur/Enter to save.
- `TaskPanel.Properties` — container with `border-b border-surface-border-strong px-ds-06 py-ds-05 space-y-0`
- `TaskPanel.Property` — generic row: `flex items-center gap-ds-04 py-ds-03`. Props: `icon: ReactNode, label: string, children: ReactNode, className?: string`. Icon+label in 120px left column, children in flex-1 right column.
- `TaskPanel.Tabs` — wraps core Tabs with `variant="line"`. Props: `defaultTab: string, onTabChange?: (tab: string) => void, children: ReactNode, className?: string`. Tab bar is sticky with `bg-surface-1 z-raised`. Content area is `flex-1 overflow-y-auto px-ds-06 py-ds-05`.
- `TaskPanel.Tab` — renders TabsTrigger + TabsContent. Props: `id: string, icon?: ReactNode, label: string, children: ReactNode`.
- `TaskPanel.Loading` — skeleton placeholder matching current PanelSkeleton.

**Compound export:**
```ts
const TaskPanel = Object.assign(TaskPanelRoot, {
  Header: TaskPanelHeader,
  Title: TaskPanelTitle,
  Properties: TaskPanelProperties,
  Property: TaskPanelProperty,
  Tabs: TaskPanelTabs,
  Tab: TaskPanelTab,
  Loading: TaskPanelLoading,
})
```

**Tests:**
- Renders children in correct zones
- Title editing: click to edit, Enter to save, Escape to revert
- Properties renders icon + label + content
- Tabs switch between tab contents
- Loading shows skeleton

**Stories:**
- Minimal (header + 1 property + 1 tab)
- Full (all sections populated)
- Loading state
- With custom content in each zone
- Editable vs read-only title

```
feat(karm): add TaskPanel shell with composition subcomponents
```

### Task 17: Update barrel exports

**Files:**
- Modify: `packages/karm/src/tasks/index.ts`

Update to export:
1. New TaskPanel + subcomponents
2. All pickers
3. All tab defaults (SubtasksTab, ConversationTab, etc.)
4. All tab pieces (SubtaskItem, MessageBubble, etc.)
5. All shared types from task-types.ts
6. Keep old TaskDetailPanel export temporarily with `@deprecated` JSDoc

```ts
// Shell
export { TaskPanel } from './task-panel'

// Pre-assembled tab defaults
export { SubtasksTab, type SubtasksTabProps } from './subtasks-tab'
export { ConversationTab, type ConversationTabProps } from './conversation-tab'
export { FilesTab, type FilesTabProps } from './files-tab'
export { ReviewTab, type ReviewTabProps } from './review-tab'
export { ActivityTab, type ActivityTabProps } from './activity-tab'

// Tab pieces
export * from './tabs'

// Pickers
export * from './pickers'

// Types
export type { Member, Column, Priority, Visibility, Subtask, ReviewRequest, Comment, TaskFile, AuditLogEntry, LabelOption } from './task-types'

// @deprecated — use TaskPanel composition API
export { TaskDetailPanel, type TaskDetailPanelProps, type FullTask, type ExtraTab } from './task-detail-panel'
```

```
feat(karm): update barrel exports for TaskPanel v2
```

### Task 18: Integration stories

**Files:**
- Create: `packages/karm/src/tasks/task-panel-examples.stories.tsx`

Full integration stories showing real-world usage:

1. **QuickStart** — Sheet + TaskPanel with all sections, matching current TaskDetailPanel feature parity
2. **ClientMode** — Only conversation tab, read-only properties, no staff-only features
3. **CustomTabs** — Standard tabs + custom "Time Log" tab
4. **CustomProperties** — Standard pickers + custom "Time Tracked" property row
5. **MinimalPanel** — Just title + priority + conversation (lightweight)
6. **FullPage** — TaskPanel in a full-width page layout (no Sheet)
7. **ComposedPieces** — SubtaskList with custom SubtaskItems, MessageList with custom input

```
feat(karm): add TaskPanel v2 integration stories
```

---

## Phase 5: Cleanup & Docs

### Task 19: Run full test suite + typecheck + build

**Step 1:** `pnpm typecheck`
**Step 2:** `pnpm test` (verify all existing + new tests pass)
**Step 3:** `pnpm build` (verify build output)
**Step 4:** Fix any issues found

```
fix(karm): resolve any build/test issues from TaskPanel v2
```

### Task 20: Update component docs

**Files:**
- Modify: `packages/karm/docs/components/tasks/task-detail-panel.md` — update for composition API
- Create doc files for each new picker and tab piece if they don't exist
- Rebuild llms-full.txt

```
docs(karm): update task component docs for v2 composition API
```

### Task 21: Update CHANGELOG

**Files:**
- Modify: `CHANGELOG.md`

Add karm entries for all breaking changes, new components, and upgraded pickers.

```
docs: update CHANGELOG for TaskPanel v2
```

---

## Execution Order Summary

| Phase | Tasks | Components | Estimated Steps |
|-------|-------|-----------|----------------|
| 1. Foundation | 1 | task-types.ts | ~5 |
| 2. Pickers | 2-9 | 7 pickers + barrel | ~50 |
| 3. Tab Pieces | 10-15 | 15 pieces + barrel | ~60 |
| 4. Shell | 16-18 | TaskPanel + stories | ~30 |
| 5. Cleanup | 19-21 | Tests, docs, changelog | ~15 |

**Total: 21 tasks, ~160 steps**

## Critical Path

Tasks 2-9 (pickers) and Tasks 10-15 (tab pieces) are **independent** and can be parallelized.

Task 16 (shell) depends on all pickers and tab pieces being complete.

Tasks 19-21 (cleanup) depend on everything.

## Non-Regression Guarantee

- All existing tab tests are preserved and updated (not deleted)
- Pre-assembled tab defaults (SubtasksTab, ConversationTab, etc.) keep the same external props API
- Old TaskDetailPanel is kept with @deprecated tag (can be removed in next major)
- Full typecheck + test + build gate before docs
