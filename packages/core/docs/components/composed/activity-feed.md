# ActivityFeed

- Import: @devalok/shilp-sutra/composed/activity-feed
- Server-safe: No
- Category: composed

## Props
    items: ActivityItem[] (REQUIRED) — { id, actor?: { name, image? }, action: string|ReactNode, timestamp: Date|string, icon?, color?: 'default'|'success'|'warning'|'error'|'info', detail?: ReactNode }
    onLoadMore?: () => void — "Load more" button callback
    loading: boolean — skeleton shimmer
    hasMore?: boolean — shows "Load more" button
    emptyState?: ReactNode — empty state content
    compact: boolean — tighter spacing, no avatars, smaller text
    maxInitialItems: number — truncate with "Show all (N)" toggle
    groupBy?: 'time' | 'none' — group items by time buckets (today, yesterday, this week, older)
    groupLabels?: GroupLabels — custom labels for time groups: { today?, yesterday?, thisWeek?, older? }
    renderItem?: (item: ActivityItem, index: number) => ReactNode | undefined — custom renderer per item; return undefined to fall back to default ActivityEntry

## Defaults
    loading=false, compact=false, hasMore=false, groupBy='none'

## Example
```jsx
<ActivityFeed
  items={[
    { id: '1', actor: { name: 'Alice' }, action: 'completed task', timestamp: new Date(), color: 'success' },
    { id: '2', action: 'System backup completed', timestamp: new Date(), detail: <pre>Details...</pre> },
  ]}
  hasMore
  onLoadMore={() => fetchMore()}
  compact
/>
```

## Exported Utilities
    groupItemsByTime(items: ActivityItem[], labels?: GroupLabels) — pure function that buckets items into time groups; returns { label: string, items: ActivityItem[] }[]

## Gotchas
- `items` is required — passing an empty array renders the `emptyState` content
- `color` on each item controls the timeline dot color
- `actor.image` is optional — falls back to initials from `actor.name`
- `maxInitialItems` truncates with a "Show all (N)" toggle button
- `maxInitialItems` applies to the flat list BEFORE grouping — items are sliced first, then grouped
- Empty time groups are automatically skipped
- `renderItem` receives the item and index; return `undefined` to use the default ActivityEntry rendering
- Custom `renderItem` content is wrapped in the same dot + layout container as default entries for consistent vertical rhythm

## Changes
### v0.29.0
- **Added** `renderItem` prop — custom render function per item; return ReactNode for custom rendering, return `undefined` to fall back to default ActivityEntry
- **Added** Internal `CustomEntry` wrapper that keeps dot + layout consistent with default entries

### v0.20.0
- **Added** `groupBy="time"` prop — groups items into Today, Yesterday, This Week, Older with section headers
- **Added** `groupLabels` prop for custom group label text
- **Added** `groupItemsByTime()` exported pure utility function

### v0.18.0
- **Fixed** `bg-accent-9` changed to `bg-info-9` (info color, not accent)

### v0.16.0
- **Added** Initial release — vertical timeline with colored dots, actor avatars, expandable detail, compact mode, load more, maxInitialItems truncation
