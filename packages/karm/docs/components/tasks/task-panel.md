# TaskPanel

- Import: @devalok/shilp-sutra-karm/tasks
- Server-safe: No
- Category: tasks

Compound component shell for the task detail panel. Container-agnostic — works in sidebars, modals, or full-page layouts. Compose the sub-components to build a complete task view.

## Sub-components

### TaskPanel (root)
    children: ReactNode (REQUIRED)
    className?: string

### TaskPanel.Header
    children: ReactNode (REQUIRED)
    className?: string

### TaskPanel.Title
    value: string (REQUIRED — current title text)
    editable?: boolean (default: false — enables inline editing)
    onUpdate?: (title: string) => void (called when user commits a title change)
    subtask?: boolean (default: false — shows a "Subtask" label above the title)
    className?: string

### TaskPanel.Properties
    children: ReactNode (REQUIRED — should contain TaskPanel.Property rows)
    className?: string

### TaskPanel.Property
    icon: ReactNode (REQUIRED — icon element for the label area)
    label: string (REQUIRED — human-readable property name)
    children: ReactNode (REQUIRED — property value or control)
    className?: string

### TaskPanel.Tabs
    defaultTab: string (REQUIRED — id of the initially active tab)
    onTabChange?: (tab: string) => void
    children: ReactNode (REQUIRED — must contain TaskPanel.Tab children)
    className?: string

### TaskPanel.Tab
    id: string (REQUIRED — unique tab identifier)
    icon?: ReactNode (optional icon in the tab trigger)
    label: string (REQUIRED — tab trigger label)
    children: ReactNode (REQUIRED — tab panel content)

### TaskPanel.Loading
    className?: string

## Example
```jsx
<TaskPanel>
  <TaskPanel.Header>
    <TaskPanel.Title value={task.title} editable onUpdate={handleTitleUpdate} />
  </TaskPanel.Header>

  <TaskPanel.Properties>
    <TaskPanel.Property icon={<IconColumns />} label="Status">
      <TaskColumnPicker columns={columns} value={task.columnId} onChange={handleColumnChange} />
    </TaskPanel.Property>
    <TaskPanel.Property icon={<IconFlag />} label="Priority">
      <TaskPriorityPicker value={task.priority} onChange={handlePriorityChange} />
    </TaskPanel.Property>
  </TaskPanel.Properties>

  <TaskPanel.Tabs defaultTab="comments">
    <TaskPanel.Tab id="comments" label="Comments" icon={<IconMessage />}>
      {/* comments content */}
    </TaskPanel.Tab>
    <TaskPanel.Tab id="subtasks" label="Subtasks" icon={<IconSubtask />}>
      {/* subtasks content */}
    </TaskPanel.Tab>
  </TaskPanel.Tabs>
</TaskPanel>
```

## Gotchas
- TaskPanel is container-agnostic. It renders as a flex column with `overflow-hidden h-full` — the parent must provide height constraints.
- TaskPanel.Tab does not render anything on its own. TaskPanel.Tabs extracts props from Tab children declaratively.
- TaskPanel.Title in editable mode: Enter commits, Escape cancels, blur commits. Empty titles revert to the previous value.
- TaskPanel.Title with `subtask` shows a small uppercase "Subtask" label above the heading.
- TaskPanel.Tabs uses a sticky tab bar. The content area scrolls independently.
- TaskPanel.Loading renders a skeleton placeholder with 6 property rows and 5 tab stubs.
- The label area in TaskPanel.Property has a fixed 120px width.

## Changes
### v0.19.0
- **Added** Initial release
