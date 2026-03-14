# TaskDatePicker

- Import: @devalok/shilp-sutra-karm/tasks
- Server-safe: No
- Category: tasks

Date picker with optional quick-select presets. Uses a native `<input type="date">` inside a popover, with preset buttons for common due dates.

## Props
    value: Date | string | null (REQUIRED — current date value)
    onChange: (date: Date | null) => void (REQUIRED — null means cleared)
    presets?: boolean (default: true — show quick-select preset buttons)
    readOnly?: boolean (default: false — renders as plain text)
    className?: string

## Presets
When `presets` is true, the popover includes a "Quick select" section with:
- Today
- Tomorrow
- Next Monday
- +7 days
- +14 days
- Clear

## Example
```jsx
<TaskDatePicker
  value={task.dueDate}
  onChange={(date) => updateTask({ dueDate: date })}
/>

{/* Without presets */}
<TaskDatePicker
  value={task.startDate}
  onChange={(date) => updateTask({ startDate: date })}
  presets={false}
/>
```

## Gotchas
- Accepts both `Date` objects and ISO date strings as `value`. Internally normalizes to `Date`.
- An inline clear button (X icon) appears next to the trigger when a date is set.
- The popover contains a native date input as the primary selector, with presets below it.
- Date display format: "Mar 14, 2026" (en-US, short month).
- Forwards ref to the trigger button.

## Changes
### v0.19.0
- **Added** Initial release
