# TaskPriorityPicker

- Import: @devalok/shilp-sutra-karm/tasks
- Server-safe: No
- Category: tasks

Popover-based picker for task priority. Each priority level has a distinct icon and color.

## Props
    value: Priority (REQUIRED — 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT')
    onChange: (priority: Priority) => void (REQUIRED)
    readOnly?: boolean (default: false — renders as non-interactive indicator)
    className?: string

## Priority Icons
    URGENT: IconAlertTriangleFilled (text-error-9)
    HIGH: IconArrowUp (text-warning-9)
    MEDIUM: IconMinus (text-surface-fg-muted)
    LOW: IconArrowDown (text-surface-fg-subtle)

## Example
```jsx
<TaskPriorityPicker
  value={task.priority}
  onChange={(priority) => updateTask({ priority })}
/>
```

## Gotchas
- Icon-per-level design: each priority has a unique icon and semantic color, not just a label.
- Priority labels are sourced from the shared `PRIORITY_LABELS` constant in `task-constants`.
- The selected priority row has a highlighted background and check icon.
- Forwards ref to the trigger button.

## Changes
### v0.19.0
- **Added** Initial release
