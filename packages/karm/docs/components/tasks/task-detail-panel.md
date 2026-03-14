# TaskDetailPanel (deprecated) / TaskPanel (v2)

- Import: @devalok/shilp-sutra-karm/tasks
- Server-safe: No
- Category: tasks

## TaskPanel — Composition API (v0.19.0)

TaskPanel is a headless compound component for building task detail panels.
It provides the **shell** (layout slots); you fill it with pickers, tab pieces,
or pre-assembled tabs as needed.

### Shell Subcomponents

| Subcomponent | Props | Description |
|---|---|---|
| `TaskPanel` (root) | `children`, `className` | Flex column container, `h-full` |
| `TaskPanel.Header` | `children`, `className` | Top section with bottom border |
| `TaskPanel.Title` | `value`, `editable?`, `onUpdate?`, `subtask?`, `className` | Inline-editable heading. Click to edit (staff), Enter to commit, Escape to cancel |
| `TaskPanel.Properties` | `children`, `className` | Property rows container with bottom border |
| `TaskPanel.Property` | `icon`, `label`, `children`, `className` | Single property row: 120 px icon+label, flex-1 value |
| `TaskPanel.Tabs` | `defaultTab`, `onTabChange?`, `children`, `className` | Tab system. Children must be `TaskPanel.Tab` |
| `TaskPanel.Tab` | `id`, `label`, `icon?`, `children` | Declarative tab definition (does not render on its own) |
| `TaskPanel.Loading` | `className` | Skeleton placeholder (title + 6 property rows + 5 tab triggers + 3 content lines) |

### Pickers (7)

All pickers support `readOnly?: boolean` and `className?: string`. Forwards ref.

| Picker | Key Props | Description |
|---|---|---|
| `TaskColumnPicker` | `columns: Column[]`, `value: string`, `onChange: (id) => void` | Popover column selector |
| `TaskPriorityPicker` | `value: Priority`, `onChange: (p) => void` | Popover with colored icons per priority |
| `TaskMemberPicker` | `members: Member[]`, `value: string \| null`, `onChange: (id \| null) => void`, `placeholder?` | Single-member picker (owner). Uses core MemberPicker |
| `TaskAssigneePicker` | `members: Member[]`, `value: Member[]`, `onAssign: (id) => void`, `onUnassign: (id) => void` | Multi-select assignee chips with add/remove. Uses core MemberPicker |
| `TaskDatePicker` | `value: Date \| string \| null`, `onChange: (date \| null) => void`, `presets?: boolean` | Date popover with quick-select presets (Today, Tomorrow, Next Monday, +7d, +14d, Clear) |
| `TaskLabelEditor` | `value: string[]`, `onChange: (labels) => void`, `availableLabels?: LabelOption[]` | Label chips with inline add input + autocomplete from availableLabels |
| `TaskVisibilityPicker` | `value: Visibility`, `onChange: (v) => void`, `confirmOnPublic?: boolean` | Internal/Everyone popover. When `confirmOnPublic=true`, shows a confirmation dialog before switching to EVERYONE |

### Tab Pieces (16)

Grouped by the pre-assembled tab they belong to.

**Subtasks (4)**

| Piece | Key Props |
|---|---|
| `SubtaskProgress` | `completed: number`, `total: number` — progress bar |
| `SubtaskList` | `children` — wrapper div |
| `SubtaskItem` | `subtask: Subtask`, `isComplete: boolean`, `onToggle?`, `onClick?` |
| `SubtaskAddForm` | `onCreate: (title) => void`, `placeholder?` |

**Conversation (4)**

| Piece | Key Props |
|---|---|
| `MessageList` | `children`, `autoScroll?: boolean` — auto-scrolls to bottom on new children |
| `MessageBubble` | `comment: Comment`, `clientMode?`, `renderViewer?` |
| `MessageInput` | `onSubmit: (content, authorType) => void`, `renderEditor?`, `placeholder?`, `clientMode?` |
| `VisibilityWarning` | (no custom props) — renders "Comments may be seen by external users" |

**Files (3)**

| Piece | Key Props |
|---|---|
| `FileDropZone` | `onUpload: (file, title?) => void`, `isUploading?`, `accept?` |
| `FileList` | `children` — wrapper div |
| `FileItem` | `file: TaskFile`, `onDelete?`, `readOnly?` |

**Review (3)**

| Piece | Key Props |
|---|---|
| `ReviewCard` | `review: ReviewRequest`, `onUpdateStatus?` |
| `ReviewResponseForm` | `reviewId: string`, `onSubmit: (id, status, feedback?) => void` |
| `ReviewRequestButton` | `members: Member[]`, `onRequest: (reviewerId) => void` |

**Activity (2)**

| Piece | Key Props |
|---|---|
| `ActivityTimeline` | `children` — vertical timeline wrapper |
| `ActivityEntry` | `entry: AuditLogEntry` — single entry with icon, dot, timestamp, description |

### Pre-Assembled Tab Defaults

These are the v0.18.0 tab components, still exported and usable inside `TaskPanel.Tab`:

| Tab | Import |
|---|---|
| `SubtasksTab` | `@devalok/shilp-sutra-karm/tasks` |
| `ConversationTab` | `@devalok/shilp-sutra-karm/tasks` |
| `FilesTab` | `@devalok/shilp-sutra-karm/tasks` |
| `ReviewTab` | `@devalok/shilp-sutra-karm/tasks` |
| `ActivityTab` | `@devalok/shilp-sutra-karm/tasks` |

Their props are unchanged from v0.18.0 (see individual docs).

### Shared Types

All shared types are exported from `@devalok/shilp-sutra-karm/tasks`:

    Priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    Visibility: 'INTERNAL' | 'EVERYONE'
    CommentAuthorType: 'INTERNAL' | 'CLIENT'
    LabelOption: { name: string; color?: string }
    Member: { id: string; name: string; email?: string; image?: string | null }
    Column: { id: string; name: string; isDefault?: boolean; isTerminal?: boolean }
    Subtask, ReviewRequest, Comment, TaskFile, AuditLogEntry — see task-types.ts

## Usage: Quick Drop-In (Pre-Assembled Tabs)

```jsx
import {
  TaskPanel,
  SubtasksTab,
  ConversationTab,
  FilesTab,
  ReviewTab,
  ActivityTab,
  TaskColumnPicker,
  TaskPriorityPicker,
  TaskMemberPicker,
  TaskAssigneePicker,
  TaskDatePicker,
  TaskLabelEditor,
  TaskVisibilityPicker,
} from '@devalok/shilp-sutra-karm/tasks'

function MyTaskPanel({ task, columns, members, activities }) {
  if (!task) return <TaskPanel><TaskPanel.Loading /></TaskPanel>

  return (
    <TaskPanel>
      <TaskPanel.Header>
        <TaskPanel.Title
          value={task.title}
          editable
          onUpdate={(title) => updateTitle(task.id, title)}
          subtask={!!task.parentTaskId}
        />
      </TaskPanel.Header>

      <TaskPanel.Properties>
        <TaskPanel.Property icon={<ColumnsIcon />} label="Column">
          <TaskColumnPicker columns={columns} value={task.columnId} onChange={(id) => update('columnId', id)} />
        </TaskPanel.Property>
        <TaskPanel.Property icon={<UserIcon />} label="Priority">
          <TaskPriorityPicker value={task.priority} onChange={(p) => update('priority', p)} />
        </TaskPanel.Property>
        {/* ...more properties */}
      </TaskPanel.Properties>

      <TaskPanel.Tabs defaultTab="subtasks">
        <TaskPanel.Tab id="subtasks" label="Subtasks">
          <SubtasksTab
            subtasks={task.subtasks}
            projectId={task.projectId}
            parentTaskId={task.id}
            defaultColumnId={columns[0]?.id ?? ''}
            onCreateSubtask={(title) => createSubtask(title)}
            onToggleSubtask={(id, done) => toggleSubtask(id, done)}
          />
        </TaskPanel.Tab>
        <TaskPanel.Tab id="conversation" label="Conversation">
          <ConversationTab
            comments={task.comments ?? []}
            taskVisibility={task.visibility}
            onPostComment={(content, type) => postComment(content, type)}
          />
        </TaskPanel.Tab>
        {/* ...more tabs */}
      </TaskPanel.Tabs>
    </TaskPanel>
  )
}
```

## Usage: Custom Composition (Individual Pieces)

```jsx
import {
  TaskPanel,
  SubtaskProgress,
  SubtaskList,
  SubtaskItem,
  SubtaskAddForm,
  MessageList,
  MessageBubble,
  MessageInput,
} from '@devalok/shilp-sutra-karm/tasks'

function CustomSubtasksContent({ task }) {
  const terminalId = columns.find(c => c.isTerminal)?.id

  return (
    <>
      <SubtaskProgress completed={doneCount} total={task.subtasks.length} />
      <SubtaskList>
        {task.subtasks.map(st => (
          <SubtaskItem
            key={st.id}
            subtask={st}
            isComplete={st.column?.isTerminal || st.columnId === terminalId}
            onToggle={(id, done) => toggleSubtask(id, done)}
            onClick={(id) => navigateToTask(id)}
          />
        ))}
      </SubtaskList>
      <SubtaskAddForm onCreate={(title) => createSubtask(title)} />
    </>
  )
}
```

## TaskDetailPanel (deprecated)

`TaskDetailPanel` is the v0.18.0 monolithic component. It is still exported
and functional but is **deprecated** in favour of the TaskPanel composition API.

### Migration Guide

| Old (TaskDetailPanel) | New (TaskPanel) |
|---|---|
| Single component with 30+ props | Compose shell + pickers + tab pieces |
| `task`, `columns`, `members` passed once | Pass data directly to each picker/tab |
| `clientMode` hides tabs/fields automatically | You control which tabs/properties to render |
| `headerSlot` render prop | Put any content inside `TaskPanel.Header` |
| `extraTabs` array | Add more `TaskPanel.Tab` children |
| `renderEditor`/`renderViewer` | Pass to `MessageBubble`/`MessageInput` or `ConversationTab` |
| `renderPriorityIndicator` | Use `TaskPriorityPicker` directly |
| `renderDatePicker` | Use `TaskDatePicker` directly |

### Old Props (for reference)

    task: FullTask | null (REQUIRED)
    loading: boolean (default: false)
    open: boolean (REQUIRED)
    onOpenChange: (open: boolean) => void (REQUIRED)
    columns: Column[] (REQUIRED)
    members: Member[] (REQUIRED)
    activities: AuditLogEntry[] (default: [])
    enrichedComments: Comment[] | null
    clientMode: boolean (default: false)
    clientEditableFields: string[] (default: ['priority', 'dueDate'])
    headerSlot: ReactNode
    extraTabs: ExtraTab[]
    onTitleUpdate, onPropertyUpdate, onAssign, onUnassign,
    onCreateSubtask, onToggleSubtask, onRequestReview,
    onUpdateReviewStatus, onPostComment, onUploadFile,
    onUploadDeliverable, onDeleteFile, onTabChange
    renderEditor, renderViewer, renderPriorityIndicator, renderDatePicker
    isUploading: boolean (default: false)

## Gotchas
- TaskPanel is a **layout shell** only — it does not render inside a Sheet. Wrap it in a Sheet yourself if you need a side panel.
- TaskDetailPanel (deprecated) still renders as a Sheet (right side panel, 40% width, min 380 px).
- TaskPanel.Tab renders nothing on its own; TaskPanel.Tabs extracts props from Tab children.
- TaskPanel.Title auto-selects text on edit activation for quick replacement.
- All pickers fall back to a read-only display when `readOnly=true`.
- TaskVisibilityPicker with `confirmOnPublic` shows a Dialog before switching to EVERYONE.
- TaskDatePicker accepts both `Date` and ISO string for the `value` prop.
- TaskLabelEditor supports both free-text entry and autocomplete from `availableLabels`.

## Changes
### v0.19.0
- **Added** TaskPanel composition API (shell: Root, Header, Title, Properties, Property, Tabs, Tab, Loading)
- **Added** 7 standalone pickers: TaskColumnPicker, TaskPriorityPicker, TaskMemberPicker, TaskAssigneePicker, TaskDatePicker, TaskLabelEditor, TaskVisibilityPicker
- **Added** 16 tab pieces: SubtaskProgress, SubtaskList, SubtaskItem, SubtaskAddForm, MessageList, MessageBubble, MessageInput, VisibilityWarning, FileDropZone, FileList, FileItem, ReviewCard, ReviewResponseForm, ReviewRequestButton, ActivityTimeline, ActivityEntry
- **Added** Shared domain types exported from task-types.ts
- **Deprecated** TaskDetailPanel — use TaskPanel composition API instead
- **Breaking** Import path unchanged (`@devalok/shilp-sutra-karm/tasks`), but consumers using TaskDetailPanel should migrate to TaskPanel for new features

### v0.18.0
- **Added** Initial release (monolithic TaskDetailPanel)
