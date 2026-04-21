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

## Composability
- **Server-safe priority label** — icon + color + text for task / issue priority.
- **Composes inside list rows, DataTable cells, Card headers, task panels** — anywhere a priority flag fits.
- **display="compact"** shows only the icon (with priority text as title attribute for tooltip). Use in tight cells; use `display="full"` (default) in free space.
- **Case-insensitive priority** — accepts both UPPERCASE (LOW/MEDIUM/HIGH/URGENT) and lowercase. Designed to match both backend conventions without manual coercion.
- Color semantics: LOW=success, MEDIUM=warning, HIGH=error, URGENT=error with bolder icon.

## Gotchas
- Case-insensitive — "low" and "LOW" both work
- Server-safe: can be imported directly in Next.js Server Components
- `compact` display shows only the icon; `full` shows icon + text label

## Changes
### v0.2.0
- **Added** Identified as server-safe component

### v0.1.0
- **Added** Initial release
