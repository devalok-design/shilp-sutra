# TaskActionRow

Composable task row for action lists, "my tasks", and dashboard views. Shows checkbox, priority, title, labels, project badge, due date, status badge, and navigate button.

- Import: @devalok/shilp-sutra-karm/tasks
- Server-safe: No
- Category: tasks

## Compound Parts

| Part | Description |
|------|-------------|
| `TaskActionRow` | Props shorthand — renders selected sub-components via show* flags |
| `TaskActionRow.Root` | Context provider + row wrapper with separator, click, and keyboard activation |
| `TaskActionRow.Checkbox` | Completion checkbox; stops propagation to avoid triggering row click |
| `TaskActionRow.Priority` | PriorityIndicator in compact display mode |
| `TaskActionRow.Title` | Task title text with optional truncation |
| `TaskActionRow.Labels` | Label badges with overflow count (+N) |
| `TaskActionRow.ProjectBadge` | Project name badge with optional click handler |
| `TaskActionRow.DueDate` | Formatted short date with overdue/today color coding |
| `TaskActionRow.StatusBadge` | StatusBadge mapped from task.stage |
| `TaskActionRow.Navigate` | Hover-reveal chevron button for opening the task |

## Props (Shorthand)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| task | TaskActionRowTask | REQUIRED | Task data object |
| onClick | () => void | — | Row click handler; adds role="button" and keyboard activation |
| onComplete | (taskId: string) => void \| Promise<void> | — | Checkbox completion callback |
| onContextMenu | (e: React.MouseEvent) => void | — | Right-click handler |
| showCheckbox | boolean | — | Show completion checkbox |
| showPriority | boolean | — | Show priority indicator |
| showLabels | boolean | — | Show label badges |
| showProject | boolean | — | Show project name badge |
| showDueDate | boolean | — | Show due date |
| showNavigate | boolean | — | Show navigate chevron button |
| showStatusBadge | boolean | — | Show stage status badge |
| truncateTitle | boolean | — | Truncate long titles with ellipsis |
| showSeparator | boolean | true | Show bottom border separator |
| maxLabels | number | 2 | Max visible labels before +N overflow |
| navigateHref | string | — | URL for navigate button |
| onProjectClick | (e: React.MouseEvent) => void | — | Project badge click handler |
| onNavigateClick | (e: React.MouseEvent) => void | — | Navigate button click handler |
| className | string | — | Additional CSS classes |

## Props (Root)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| task | TaskActionRowTask | REQUIRED | Task data object |
| children | ReactNode | REQUIRED | Sub-components |
| onClick | () => void | — | Row click handler |
| onContextMenu | (e: React.MouseEvent) => void | — | Right-click handler |
| showSeparator | boolean | true | Show bottom border |
| className | string | — | Additional CSS classes |

## Props (Checkbox)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| onComplete | (taskId: string) => void \| Promise<void> | — | Called when checkbox is checked |

## Props (Title)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| truncate | boolean | — | Enable text truncation |
| className | string | — | Additional CSS classes |

## Props (Labels)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| max | number | — | Max visible labels; overflow shows +N badge |

## Props (ProjectBadge)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| onClick | (e: React.MouseEvent) => void | — | Click handler; stops propagation |

## Props (Navigate)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| href | string | — | URL to navigate to on click |
| onClick | (e: React.MouseEvent) => void | — | Click handler (takes priority over href) |

## Related Types

```typescript
type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

interface TaskActionRowTask {
  id: string
  title: string
  priority: Priority
  dueDate?: string | null
  projectName?: string
  projectId?: string
  stage?: string
  isOverdue?: boolean
  labels?: string[]
}
```

## Due Date Colors

| Condition | Color |
|-----------|-------|
| isOverdue | error-11 + font-medium |
| today | warning-11 |
| default | surface-fg-muted |

## Defaults
    showSeparator=true, maxLabels=2

## Example

```tsx
// Props shorthand
<TaskActionRow
  task={task}
  onClick={() => openTask(task.id)}
  onComplete={(id) => completeTask(id)}
  showCheckbox
  showPriority
  showLabels
  showDueDate
  showNavigate
  truncateTitle
/>

// Composable — custom layout
<TaskActionRow.Root task={task} onClick={() => openTask(task.id)}>
  <TaskActionRow.Checkbox onComplete={completeTask} />
  <TaskActionRow.Priority />
  <TaskActionRow.Title truncate />
  <TaskActionRow.Labels max={3} />
  <TaskActionRow.DueDate />
  <TaskActionRow.Navigate onClick={(e) => handleNav(e)} />
</TaskActionRow.Root>
```

## Gotchas
- Root adds `role="button"` and `tabIndex={0}` only when `onClick` is provided
- Keyboard activation: Enter or Space triggers onClick on Root
- Checkbox stops click propagation to avoid triggering the row's onClick
- Navigate button is hover-reveal (opacity-0 by default, visible on group-hover/group-focus-within)
- ProjectBadge stops propagation on click to avoid triggering row onClick
- Navigate button stops propagation; if both href and onClick are provided, onClick takes priority
- Labels, ProjectBadge, DueDate, StatusBadge return null when their data is missing from the task
- StatusBadge maps task.stage (case-insensitive) to StatusBadge status values; unrecognized stages return null
- Priority, DueDate, and StatusBadge sub-components accept no custom props

## Changes
### v0.20.0
- **Added** Initial release — composable TaskActionRow with Root, Checkbox, Priority, Title, Labels, ProjectBadge, DueDate, StatusBadge, Navigate
