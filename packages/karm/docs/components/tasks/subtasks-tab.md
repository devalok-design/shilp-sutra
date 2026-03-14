# SubtasksTab

- Import: @devalok/shilp-sutra-karm/tasks
- Server-safe: No
- Category: tasks

## Props
    subtasks: Subtask[] (REQUIRED)
    terminalColumnId: string (optional — column ID that marks tasks as complete)
    projectId: string (REQUIRED)
    parentTaskId: string (REQUIRED)
    defaultColumnId: string (REQUIRED)
    onCreateSubtask: (title: string) => void (REQUIRED)
    onToggleSubtask: (taskId: string, isComplete: boolean) => void (REQUIRED)
    onClickSubtask: (taskId: string) => void
    readOnly: boolean (default: false) — hides create/toggle controls
    ...HTMLAttributes<HTMLDivElement>

## Subtask Shape
    id: string
    title: string
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    columnId: string
    column: { id: string; name: string; isTerminal?: boolean } (optional)
    assignees: { user: { id: string; name: string; image?: string | null } }[]

## Defaults
    readOnly=false

## Example
```jsx
<SubtasksTab
  subtasks={task.subtasks}
  terminalColumnId="done-col"
  projectId={task.projectId}
  parentTaskId={task.id}
  defaultColumnId="todo-col"
  onCreateSubtask={(title) => createSubtask(title)}
  onToggleSubtask={(id, complete) => toggleSubtask(id, complete)}
  onClickSubtask={(id) => navigateToTask(id)}
/>
```

## Gotchas
- A subtask is considered "complete" when column.isTerminal is true OR columnId matches terminalColumnId.
- Progress bar shows completed/total count at the top.
- Each subtask row shows: checkbox, priority dot, title (strikethrough when complete), first assignee avatar.
- Clicking a subtask row triggers onClickSubtask (if provided).
- In readOnly mode, checkboxes are non-interactive and the "Add subtask" button is hidden.
- "Add subtask" inline form with Enter to submit, Escape to cancel.
- projectId, parentTaskId, and defaultColumnId are defined in the interface and required by the type but are not currently used in the component's rendering logic. They are reserved for future navigation/creation features.
- Empty state: "No subtasks".
- Forwards ref to outer div.

## Changes
### v0.19.0
- **Added** Decomposed into composable pieces: `SubtaskProgress`, `SubtaskList`, `SubtaskItem`, `SubtaskAddForm` — importable from `@devalok/shilp-sutra-karm/tasks`
- SubtasksTab remains as a pre-assembled default; use the pieces for custom layouts

### v0.18.0
- **Added** Initial release
