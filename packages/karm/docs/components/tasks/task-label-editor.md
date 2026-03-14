# TaskLabelEditor

- Import: @devalok/shilp-sutra-karm/tasks
- Server-safe: No
- Category: tasks

Inline label editor with autocomplete suggestions and color dot support. Displays labels as removable chips and provides a "+" button to add new labels by typing.

## Props
    value: string[] (REQUIRED — currently applied label names)
    onChange: (labels: string[]) => void (REQUIRED — full updated label array)
    availableLabels?: LabelOption[] (default: [] — autocomplete options, each { name, color? })
    readOnly?: boolean (default: false — hides remove buttons and add input)
    className?: string

## Example
```jsx
<TaskLabelEditor
  value={task.labels}
  onChange={(labels) => updateTask({ labels })}
  availableLabels={[
    { name: 'Bug', color: '#ef4444' },
    { name: 'Feature', color: '#3b82f6' },
    { name: 'Design', color: '#8b5cf6' },
  ]}
/>
```

## Gotchas
- Supports both selecting from `availableLabels` and creating new labels by typing a name not in the list.
- Autocomplete popover appears as you type, filtered to labels matching the input that are not already applied.
- Enter key: selects the first matching suggestion if available, otherwise creates a new label from the typed text.
- Escape key closes the input without adding.
- On blur, the typed value is committed as a label (if non-empty).
- Color dots appear on chips and in autocomplete suggestions when a label has a `color` value.
- Duplicate labels are prevented — adding an already-applied label is a no-op.
- In readOnly mode with no labels, displays "None".
- Forwards ref to the outer `<div>`.

## Changes
### v0.19.0
- **Added** Initial release
