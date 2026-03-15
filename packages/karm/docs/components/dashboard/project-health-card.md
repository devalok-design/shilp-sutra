# ProjectHealthCard

Props-driven card showing project completion progress, status badge, sparkline trend, and context line.

- Import: @devalok/shilp-sutra-karm/dashboard
- Server-safe: No
- Category: dashboard

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| project | ProjectHealthData | REQUIRED | Project data object |
| onClick | () => void | — | Makes card clickable with hover state and keyboard activation |
| loading | boolean | false | Shows skeleton placeholder when true |
| className | string | — | Additional CSS classes |

## Related Types

```typescript
interface ProjectHealthData {
  id: string
  name: string
  completed: number
  total: number
  overdue?: number
  urgent?: number
  contextLine?: string
  /** 7 values (0-1) for sparkline trend chart */
  trend?: number[]
}
```

## Status Badge Severity

| Condition | Badge |
|-----------|-------|
| urgent > 0 | `solid` / `error` — "{urgent} urgent" |
| overdue > 0 (no urgent) | `subtle` / `warning` — "{overdue} overdue" |
| neither | `subtle` / `success` — "on track" |

## Progress Bar Color

| Percentage | Color |
|------------|-------|
| > 75% | success |
| 25%–75% | warning |
| < 25% | error |

## Sparkline

- Rendered as an inline SVG (48x20) when `trend` has >= 2 values
- Uses Catmull-Rom spline interpolation for smooth curves
- Color determined by comparing average of first 3 vs last 3 values:
  - Improving (diff > 0.05): success stroke/fill
  - Declining (diff < -0.05): error stroke/fill
  - Flat: warning stroke/fill
- Fewer than 6 data points always renders warning color

## Defaults
    loading=false

## Example

```tsx
<ProjectHealthCard
  project={{
    id: 'proj-1',
    name: 'Website Redesign',
    completed: 12,
    total: 20,
    overdue: 3,
    contextLine: 'Sprint 4 of 6',
    trend: [0.3, 0.4, 0.5, 0.55, 0.6, 0.65, 0.7],
  }}
  onClick={() => navigateToProject('proj-1')}
/>
```

## Gotchas
- Extends `Omit<React.HTMLAttributes<HTMLDivElement>, 'onClick'>` — native onClick is replaced by the typed onClick prop
- When `onClick` is provided, the card gets `role="button"`, `tabIndex={0}`, and keyboard activation (Enter/Space)
- When `onClick` is provided, the card uses `whileTap={{ scale: 0.98 }}` for press feedback
- `loading=true` renders a skeleton with no project data — use for async loading states
- The sparkline is `aria-hidden="true"` — it is decorative only
- `contextLine` and overdue count are combined in a third row separated by a middot

## Changes
### v0.20.0
- **Added** Initial release — project health card with progress bar, status badge, sparkline, and loading skeleton
