# TaskMemberPicker

- Import: @devalok/shilp-sutra-karm/tasks
- Server-safe: No
- Category: tasks

Single-select member picker for assigning a task owner. Wraps the core MemberPicker composed component with task-specific styling.

## Props
    members: Member[] (REQUIRED — array of { id, name, email?, image? })
    value: string | null (REQUIRED — selected member id, or null for none)
    onChange: (memberId: string | null) => void (REQUIRED — returns null when deselecting)
    placeholder?: string (default: 'No owner')
    readOnly?: boolean (default: false — renders as non-interactive display)
    className?: string

## Example
```jsx
<TaskMemberPicker
  members={projectMembers}
  value={task.ownerId}
  onChange={(memberId) => updateTask({ ownerId: memberId })}
  placeholder="Assign owner"
/>
```

## Gotchas
- Selecting the already-selected member deselects them (toggles to null).
- Uses core Avatar with initials fallback via `getInitials()`.
- In readOnly mode with no selection, shows the placeholder text in muted style.
- Forwards ref to the trigger button.

## Changes
### v0.19.0
- **Added** Initial release
