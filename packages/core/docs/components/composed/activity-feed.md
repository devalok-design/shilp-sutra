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

## Defaults
    loading=false, compact=false, hasMore=false

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

## Gotchas
- `items` is required — passing an empty array renders the `emptyState` content
- `color` on each item controls the timeline dot color
- `actor.image` is optional — falls back to initials from `actor.name`
- `maxInitialItems` truncates with a "Show all (N)" toggle button

## Changes
### v0.18.0
- **Fixed** `bg-accent-9` changed to `bg-info-9` (info color, not accent)

### v0.16.0
- **Added** Initial release — vertical timeline with colored dots, actor avatars, expandable detail, compact mode, load more, maxInitialItems truncation
