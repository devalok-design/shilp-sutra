# TaskVisibilityPicker

- Import: @devalok/shilp-sutra-karm/tasks
- Server-safe: No
- Category: tasks

Popover-based picker for task visibility with an optional confirmation dialog when switching to public ("Everyone") visibility.

## Props
    value: Visibility (REQUIRED — 'INTERNAL' | 'EVERYONE')
    onChange: (visibility: Visibility) => void (REQUIRED)
    confirmOnPublic?: boolean (default: false — when true, shows a confirmation dialog before switching to EVERYONE)
    readOnly?: boolean (default: false — renders as non-interactive display)
    className?: string

## Visibility Options
    INTERNAL: IconLock — "Internal" — "Only team members"
    EVERYONE: IconWorld — "Everyone" — "Visible to clients"

## Example
```jsx
<TaskVisibilityPicker
  value={task.visibility}
  onChange={(visibility) => updateTask({ visibility })}
  confirmOnPublic
/>
```

## Gotchas
- When `confirmOnPublic` is true and the user selects "Everyone", a confirmation Dialog appears warning that the task will become visible to clients. The change only applies after the user clicks "Confirm".
- Switching to "Internal" never requires confirmation.
- Selecting the already-active option closes the popover without calling onChange.
- Each option row shows an icon, label, and description. The selected option has a highlighted background and check icon.
- Forwards ref to the trigger button.

## Changes
### v0.19.0
- **Added** Initial release
