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

## Composability
- **Server-safe inline status** — renders a colored text label ("2d left" / "3h left" / "Overdue by 1d") with optional clock icon prefix.
- **Threshold-driven color:** `warningThreshold` + `criticalThreshold` drive the green→yellow→red progression. Tune per use case (billing deadlines vs. task due dates have different urgency cadences).
- **Composes inside Card, StatusBadge, DataTable cells** — anywhere a short inline deadline string fits.
- **Doesn't live-update** — uses `Date.now()` at render time. For ticking timestamps, re-render via a parent interval or use a dedicated "time ago" library.
- For static absolute timestamps (not relative), set `format="absolute"` — useful when you want the exact date rendered with semantic color coding.

## Gotchas
- Color is semantic: green (on-track) -> yellow (warning threshold) -> red (critical/overdue)
- Overdue deadlines show bold red text with "Overdue by Xd/h/m"
- Relative format uses `Date.now()` at render time — does not live-update (re-render to refresh)
