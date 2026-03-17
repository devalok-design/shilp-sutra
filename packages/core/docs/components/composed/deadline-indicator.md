# DeadlineIndicator

- Import: @devalok/shilp-sutra/composed/deadline-indicator
- Server-safe: Yes
- Category: composed

## Props
    deadline: Date | string (deadline timestamp)
    warningThreshold: number (minutes before deadline to show warning color)
    criticalThreshold: number (minutes before deadline to show critical/error color)
    format: "relative" | "absolute"
    showIcon: boolean (show clock icon prefix)

## Defaults
    warningThreshold={1440} (24h), criticalThreshold={240} (4h), format="relative", showIcon={false}

## Example
```jsx
<DeadlineIndicator deadline={task.dueDate} />
<DeadlineIndicator deadline="2026-03-20T17:00:00Z" showIcon format="absolute" />
<DeadlineIndicator deadline={task.dueDate} warningThreshold={2880} criticalThreshold={480} />
```

## Gotchas
- Color is semantic: green (on-track) -> yellow (warning threshold) -> red (critical/overdue)
- Overdue deadlines show bold red text with "Overdue by Xd/h/m"
- Relative format uses `Date.now()` at render time — does not live-update (re-render to refresh)
