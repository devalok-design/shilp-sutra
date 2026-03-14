# TaskDetailPanel v2 — Full Composition Design

**Date:** 2026-03-14
**Status:** Approved

## Problem

TaskDetailPanel is a monolith with ~20 props, hardcoded tabs, hardcoded property rows, and a hardcoded Sheet container. Every new feature requires a new prop. Consumers can't reorder, remove, or replace any section.

## Design Principles

- **Container-agnostic** — TaskPanel is content only; consumer wraps in Sheet, Dialog, page, etc.
- **Full composition** — Every section is a subcomponent; nothing is hardcoded
- **Pre-built + pieces** — Each tab exports a ready-to-use default AND individual sub-pieces
- **Pre-built pickers** — Property pickers exported as standalone components with upgraded UX

## Shell Subcomponents

| Component | Purpose |
|-----------|---------|
| `TaskPanel` | Root — flex column, overflow handling |
| `TaskPanel.Header` | Top section container |
| `TaskPanel.Title` | Editable/read-only title, optional "Subtask" label |
| `TaskPanel.Properties` | Property rows container |
| `TaskPanel.Property` | Generic row: icon (120px label) + content (flex-1) |
| `TaskPanel.Tabs` | Tab bar + scrollable content area |
| `TaskPanel.Tab` | Individual tab: trigger icon/label + content panel |
| `TaskPanel.Loading` | Skeleton placeholder |

## Pre-built Property Pickers

| Component | Props | UX Notes |
|-----------|-------|----------|
| `TaskColumnPicker` | columns, value, onChange | Popover dropdown with checkmark (unchanged) |
| `TaskPriorityPicker` | value, onChange | **Upgraded:** Icons per level instead of colored dots (accessibility + clarity) |
| `TaskMemberPicker` | members, value, onChange | Single member select with avatar + search (unchanged) |
| `TaskAssigneePicker` | members, value, onChange, onAssign, onUnassign | Multi-select chips with avatar + remove + add (unchanged) |
| `TaskDatePicker` | value, onChange, presets? | **Upgraded:** Calendar popover with presets (Today/Tomorrow/Next week) instead of native input |
| `TaskLabelEditor` | value, onChange, availableLabels? | **Upgraded:** Autocomplete from available labels + optional color per label |
| `TaskVisibilityPicker` | value, onChange, confirmOnPublic? | **Upgraded:** Dropdown picker with lock/globe icons instead of toggle button |

### Priority Icons (new)
- URGENT — double up-arrow or exclamation flag, error color
- HIGH — up-arrow flag, warning color
- MEDIUM — horizontal flag, surface-fg-muted
- LOW — down-arrow flag, surface-fg-subtle

### Date Picker Presets (new)
- Today, Tomorrow, Next Monday, Next week, In 2 weeks, None (clear)
- Calendar grid below presets for custom date

### Label Autocomplete (new)
- `availableLabels?: Array<{ name: string, color?: string }>`
- Typing filters available labels, Enter on match selects, Enter on no match creates new
- Color renders as colored dot before label text in both chip and dropdown

### Visibility Picker (new)
- Popover dropdown matching Priority/Column pattern
- Options: 🔒 Internal ("Only team members"), 🌐 Everyone ("Visible to clients")
- Optional `confirmOnPublic` shows confirmation before switching to EVERYONE

## Tab Content Components

### SubtasksTab
| Component | Props | Purpose |
|-----------|-------|---------|
| `SubtasksTab` | subtasks, onToggle, onCreate, readOnly, terminalColumnId | Pre-assembled default |
| `SubtaskProgress` | completed, total | Progress bar + count |
| `SubtaskList` | children | Container |
| `SubtaskItem` | subtask, onToggle, renderPriority? | Row: checkbox + priority + title + assignee |
| `SubtaskAddForm` | onCreate, placeholder? | Inline input + add button |

### ConversationTab
| Component | Props | Purpose |
|-----------|-------|---------|
| `ConversationTab` | comments, onPost, taskVisibility?, clientMode?, renderEditor?, renderViewer? | Pre-assembled default |
| `MessageList` | children, autoScroll? | Scrollable container |
| `MessageBubble` | comment, clientMode?, renderViewer? | Avatar + header + content |
| `MessageInput` | onSubmit, renderEditor?, placeholder? | Rich text or textarea + send |
| `VisibilityWarning` | none | Static warning banner |

### FilesTab
| Component | Props | Purpose |
|-----------|-------|---------|
| `FilesTab` | files, onUpload, onDelete, readOnly?, isUploading? | Pre-assembled default |
| `FileDropZone` | onUpload, isUploading?, accept? | Drag-and-drop area |
| `FileList` | children | Container |
| `FileItem` | file, onDelete?, readOnly? | Row: icon + info + actions |

### ReviewTab
| Component | Props | Purpose |
|-----------|-------|---------|
| `ReviewTab` | reviews, members, onRequest, onUpdateStatus, readOnly? | Pre-assembled default |
| `ReviewCard` | review, onUpdateStatus? | Avatar + status badge + feedback |
| `ReviewResponseForm` | reviewId, onSubmit | Approve/Changes/Reject + feedback textarea |
| `ReviewRequestButton` | members, onRequest | Member picker trigger |

### ActivityTab
| Component | Props | Purpose |
|-----------|-------|---------|
| `ActivityTab` | activities | Pre-assembled default |
| `ActivityTimeline` | children | Vertical line container |
| `ActivityEntry` | entry | Dot + icon + actor + description + timestamp |

## Usage Examples

### Quick (similar to today)
```tsx
<Sheet open={open} onOpenChange={setOpen}>
  <SheetContent side="right" className="w-[40%] min-w-[380px]">
    <TaskPanel>
      <TaskPanel.Header>
        <TaskPanel.Title editable value={task.title} onUpdate={saveTitle} />
      </TaskPanel.Header>
      <TaskPanel.Properties>
        <TaskPanel.Property icon={<IconColumns3 />} label="Column">
          <TaskColumnPicker columns={columns} value={task.columnId} onChange={...} />
        </TaskPanel.Property>
        <TaskPanel.Property icon={<IconFlag />} label="Priority">
          <TaskPriorityPicker value={task.priority} onChange={...} />
        </TaskPanel.Property>
        <TaskPanel.Property icon={<IconCalendar />} label="Due Date">
          <TaskDatePicker value={task.dueDate} onChange={...} />
        </TaskPanel.Property>
      </TaskPanel.Properties>
      <TaskPanel.Tabs defaultTab="subtasks">
        <TaskPanel.Tab id="subtasks" icon={<IconListCheck />} label="Subtasks">
          <SubtasksTab subtasks={task.subtasks} onToggle={...} onCreate={...} />
        </TaskPanel.Tab>
        <TaskPanel.Tab id="conversation" icon={<IconMessage />} label="Chat">
          <ConversationTab comments={task.comments} onPost={...} />
        </TaskPanel.Tab>
      </TaskPanel.Tabs>
    </TaskPanel>
  </SheetContent>
</Sheet>
```

### Custom (mixed pieces + custom tabs)
```tsx
<TaskPanel>
  <TaskPanel.Header>
    <TaskPanel.Title editable value={task.title} onUpdate={saveTitle} />
    <MyStatusBadge status={task.status} />
  </TaskPanel.Header>
  <TaskPanel.Properties>
    <TaskPanel.Property icon={<IconFlag />} label="Priority">
      <TaskPriorityPicker value={task.priority} onChange={...} />
    </TaskPanel.Property>
    <TaskPanel.Property icon={<IconClock />} label="Time Tracked">
      <span>12h 30m</span>
    </TaskPanel.Property>
  </TaskPanel.Properties>
  <TaskPanel.Tabs defaultTab="conversation">
    <TaskPanel.Tab id="conversation" icon={<IconMessage />} label="Chat">
      <MessageList>
        {comments.map(c => <MessageBubble key={c.id} comment={c} />)}
      </MessageList>
      <MyCustomInput onSubmit={...} />
    </TaskPanel.Tab>
    <TaskPanel.Tab id="timelog" icon={<IconClock />} label="Time Log">
      <MyTimeLogWidget taskId={task.id} />
    </TaskPanel.Tab>
  </TaskPanel.Tabs>
</TaskPanel>
```

## Breaking Changes
- `TaskDetailPanel` removed → `TaskPanel` + subcomponents
- All monolith callback props removed → individual picker/tab props
- `task: FullTask` monolith prop removed → data flows to each subcomponent
- `clientMode` / `clientEditableFields` removed → consumer controls rendering
- `renderEditor` / `renderViewer` / `renderPriorityIndicator` / `renderDatePicker` render props removed → consumer composes directly
- Sheet container removed → consumer wraps in own container
- Priority dots → icons
- Native date input → calendar popover with presets
- Visibility toggle → dropdown picker
- Label editor gains autocomplete + color support
