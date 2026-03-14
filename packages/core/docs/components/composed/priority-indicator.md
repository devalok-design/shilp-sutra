# PriorityIndicator

- Import: @devalok/shilp-sutra/composed/priority-indicator
- Server-safe: Yes
- Category: composed

## Props
    priority: Priority
    display: "compact" | "full" (default: "full")

Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | 'low' | 'medium' | 'high' | 'urgent'

## Defaults
    display="full"

## Example
```jsx
<PriorityIndicator priority="HIGH" />
<PriorityIndicator priority="low" display="compact" />
```

## Gotchas
- Case-insensitive — "low" and "LOW" both work
- Server-safe: can be imported directly in Next.js Server Components
- `compact` display shows only the icon; `full` shows icon + text label

## Changes
### v0.2.0
- **Added** Identified as server-safe component

### v0.1.0
- **Added** Initial release
