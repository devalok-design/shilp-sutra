# WeekHeatmap

Composable weekly task-completion heatmap with day cells, streak indicator, summary stats, and progress bar.

- Import: @devalok/shilp-sutra-karm/dashboard
- Server-safe: No
- Category: dashboard

## Compound Parts

| Part | Description |
|------|-------------|
| `WeekHeatmap` | Props shorthand — renders Root + DayStrip + Streak + Summary + ProgressBar |
| `WeekHeatmap.Root` | Context provider + layout wrapper |
| `WeekHeatmap.DayStrip` | 7-column grid of Day cells with keyboard navigation and MotionStagger animation |
| `WeekHeatmap.Day` | Individual day cell with tooltip, status color, and click/keyboard activation |
| `WeekHeatmap.Summary` | Text line showing completed/remaining/overdue counts |
| `WeekHeatmap.ProgressBar` | Progress bar colored by success, driven by totalCompleted/totalTasks |
| `WeekHeatmap.Streak` | Streak badge (hidden when streak <= 1) |

## Props (Root / Shorthand)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| days | WeekDay[] | REQUIRED | Array of 7 day objects |
| onDayClick | (date: string) => void | — | Called when a past or today day cell is clicked |
| overdue | number | — | Overdue task count shown in Summary |
| today | string | — | ISO date override for "today" (defaults to actual today) |
| className | string | — | Additional CSS classes |

## Props (DayStrip)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| className | string | — | Additional CSS classes |

## Props (Summary, ProgressBar, Streak)

All accept `className` and standard `HTMLDivElement` attributes. They read data from context.

## Related Types

```typescript
interface WeekDay {
  date: string       // ISO date string (YYYY-MM-DD)
  completed: number
  total: number
}

type DayStatus = 'complete' | 'partial' | 'none' | 'today' | 'future' | 'empty'
```

## Day Status Colors

| Status | Condition | Color |
|--------|-----------|-------|
| complete | Past day, completed === total | success-9 |
| partial | Past day, completed > 0 but < total | warning-9 |
| none | Past day, completed === 0 | error-9 |
| today | date === today | info-9 with ring |
| future | date > today | surface-3 |
| empty | total === 0 | surface-2 dashed border |

## Defaults
    today = new Date().toISOString().split('T')[0]

## Example

```tsx
// Props shorthand
<WeekHeatmap days={days} onDayClick={(date) => navigate(date)} overdue={2} />

// Composable — custom arrangement
<WeekHeatmap.Root days={days} onDayClick={fn}>
  <WeekHeatmap.DayStrip />
  <WeekHeatmap.Streak />
  <WeekHeatmap.Summary />
  <WeekHeatmap.ProgressBar />
</WeekHeatmap.Root>
```

## Gotchas
- DayStrip uses `role="grid"` with `role="row"` and `role="gridcell"` for a11y
- Keyboard navigation: ArrowLeft/ArrowRight moves focus between days, Home/End jump to first/last, Enter/Space activates onDayClick
- Uses roving tabIndex pattern — only the focused day has tabIndex=0
- Today's cell gets a MotionPop bounce animation; other days use MotionStagger fade-in
- Clicking a future or empty day does nothing (no onDayClick fired)
- Streak counts consecutive past days where completed === total; hidden when streak <= 1
- ProgressBar uses core Progress component with `color="success"` and `size="sm"`
- Each Day cell shows a Tooltip with full date and completion count on hover
- Extends `React.HTMLAttributes<HTMLDivElement>` (Root omits `onDayClick` from native HTML)

## Changes
### v0.20.0
- **Added** Initial release — composable WeekHeatmap with Root, DayStrip, Day, Summary, ProgressBar, Streak
