# TaskAssigneePicker

- Import: @devalok/shilp-sutra-karm/tasks
- Server-safe: No
- Category: tasks

Multi-select assignee picker. Displays assigned members as removable chips with avatars and provides a "+" button to add more via the core MemberPicker.

## Props
    members: Member[] (REQUIRED — full list of available members)
    value: Member[] (REQUIRED — currently assigned members)
    onAssign: (userId: string) => void (REQUIRED — called when a member is added)
    onUnassign: (userId: string) => void (REQUIRED — called when a member is removed)
    readOnly?: boolean (default: false — hides remove buttons and add button)
    className?: string

## Example
```jsx
<TaskAssigneePicker
  members={projectMembers}
  value={task.assignees}
  onAssign={(userId) => assignUser(task.id, userId)}
  onUnassign={(userId) => unassignUser(task.id, userId)}
/>
```

## Gotchas
- Unlike TaskMemberPicker (single-select), this is multi-select with separate onAssign/onUnassign callbacks.
- Each assignee chip shows first name only (splits on space).
- The "+" button opens a MemberPicker with `multiple` mode. Toggling an already-assigned member calls onUnassign.
- In readOnly mode with no assignees, displays "None".
- Forwards ref to the outer `<div>`, not a button.

## Changes
### v0.19.0
- **Added** Initial release
