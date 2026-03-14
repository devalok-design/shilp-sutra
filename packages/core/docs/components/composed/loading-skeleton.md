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

## Gotchas
- Server-safe: can be imported directly in Next.js Server Components
- These are pre-composed skeleton layouts — for individual skeleton shapes, use the `Skeleton` UI component

## Changes
### v0.2.0
- **Added** Identified as server-safe component

### v0.1.0
- **Added** Initial release
