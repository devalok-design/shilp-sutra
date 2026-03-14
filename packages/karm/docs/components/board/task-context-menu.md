# TaskContextMenu

- Import: @devalok/shilp-sutra-karm/board
- Server-safe: No
- Category: board

## Props
    taskId: string (REQUIRED)
    children: ReactNode (REQUIRED)
    className: string

## Menu Items
- Set Priority (submenu: Low, Medium, High, Urgent with icons)
- Assign (submenu: member list, only shown when members exist)
- Add Label (submenu: labels derived from board data)
- Set Due Date (opens native date picker)
- Visibility (submenu: Internal only, Visible to all)
- Delete (destructive, separated by divider)

## Example
```jsx
<TaskContextMenu taskId={task.id}>
  <TaskCard task={task} />
</TaskContextMenu>
```

## Gotchas
- Must be rendered inside a BoardProvider context.
- Right-click triggers the context menu via Radix ContextMenu.
- Callbacks come from context: onQuickPriorityChange, onQuickAssign, onQuickLabelAdd, onQuickDueDateChange, onQuickVisibilityChange, onQuickDelete.
- Due date uses a hidden native date input with showPicker().
- Forwards ref to ContextMenuTrigger (HTMLSpanElement).

## Changes
### v0.18.0
- **Added** Initial release
