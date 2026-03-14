# TaskColumnPicker

- Import: @devalok/shilp-sutra-karm/tasks
- Server-safe: No
- Category: tasks

Popover-based picker for selecting a board column (status). Displays the current column name and opens a dropdown with all available columns.

## Props
    columns: Column[] (REQUIRED — array of { id, name, isDefault?, isTerminal? })
    value: string (REQUIRED — currently selected column id)
    onChange: (columnId: string) => void (REQUIRED)
    readOnly?: boolean (default: false — renders as plain text)
    className?: string

## Example
```jsx
<TaskColumnPicker
  columns={[
    { id: 'todo', name: 'To Do' },
    { id: 'in-progress', name: 'In Progress' },
    { id: 'done', name: 'Done', isTerminal: true },
  ]}
  value={task.columnId}
  onChange={(columnId) => updateTask({ columnId })}
/>
```

## Gotchas
- If `value` does not match any column id, the trigger displays "Select column".
- The selected column is highlighted with `text-accent-11` and shows a check icon.
- Forwards ref to the trigger button.
- In readOnly mode, renders a plain `<span>` instead of a button.

## Changes
### v0.19.0
- **Added** Initial release
