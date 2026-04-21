# LoadingSkeleton

- Import: @devalok/shilp-sutra/composed/loading-skeleton
- Server-safe: Yes
- Category: composed

Exports: CardSkeleton, TableSkeleton, BoardSkeleton, ListSkeleton

## Props

### CardSkeleton
    className: string

### TableSkeleton
    rows: number (default: 5)
    columns: number (default: 4)
    className: string

### BoardSkeleton
    columns: number (default: 4)
    cardsPerColumn: number (default: 3)
    className: string

### ListSkeleton
    rows: number (default: 6)
    showAvatar: boolean (default: true)
    className: string

## Defaults
    TableSkeleton: rows=5, columns=4
    BoardSkeleton: columns=4, cardsPerColumn=3
    ListSkeleton: rows=6, showAvatar=true

## Example
```jsx
<CardSkeleton />
<TableSkeleton rows={8} columns={5} />
<BoardSkeleton columns={3} cardsPerColumn={4} />
<ListSkeleton rows={10} showAvatar={false} />
```

## Composability
- **Pre-composed skeleton layouts** — CardSkeleton, TableSkeleton, BoardSkeleton, ListSkeleton. Each mimics the shape of a common DS layout so users see meaningful loading placeholders.
- **Built on ui/Skeleton** — for custom loading layouts, use Skeleton directly (rectangle/circle/text variants). These composed versions are just opinionated shape combinations.
- **Server-safe** — use during SSR for initial-paint skeletons in Next.js app router (while server data streams in).
- **Pairs with conditional rendering:** `{isLoading ? <TableSkeleton rows={8} /> : <DataTable data={rows} />}`.
- **PageSkeletons (separate file)** provides full-page placeholders (DashboardSkeleton, ProjectListSkeleton, TaskDetailSkeleton) — use those for route-level loading states.

## Gotchas
- Server-safe: can be imported directly in Next.js Server Components
- These are pre-composed skeleton layouts — for individual skeleton shapes, use the `Skeleton` UI component

## Changes
### v0.2.0
- **Added** Identified as server-safe component

### v0.1.0
- **Added** Initial release
