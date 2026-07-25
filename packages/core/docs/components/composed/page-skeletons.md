# PageSkeletons

- Import: @devalok/shilp-sutra/composed/page-skeletons
- Server-safe: Yes
- Category: composed

Exports: DashboardSkeleton, ProjectListSkeleton, TaskDetailSkeleton

## Props
    className?: string (plus all standard HTML div attributes via React.ComponentPropsWithoutRef<'div'>)

## Defaults
    None

## Example
```jsx
<DashboardSkeleton />
<ProjectListSkeleton />
<TaskDetailSkeleton />
```

## Composability
- **Full-page skeleton layouts** for route-level loading states. Each mimics a common page shape (dashboard tiles, project list with filters, task detail with sidebar).
- **Server-safe** — use in Next.js app router `loading.tsx` files for instant route-transition feedback while data streams.
- **Assembled from `ui/Skeleton`** — these compose the base `Skeleton` primitive directly into page-shaped layouts (they do NOT wrap the `LoadingSkeleton` regional exports). Each root is a `role="status"` / `aria-busy` region with an sr-only label.
- **When to use which skeleton tier:**
  - `<Skeleton>` (ui) — single shape for a single element
  - `<CardSkeleton>` / `<TableSkeleton>` (LoadingSkeleton) — individual region shape
  - `<DashboardSkeleton>` / etc. (PageSkeletons) — full page placeholder
- **Fixed layout structure** — the className prop adjusts the outer container, but internal layout isn't customizable. For custom page skeletons, compose `ui/Skeleton` (or the `LoadingSkeleton` regional exports) yourself.

## Gotchas
- Server-safe: can be imported directly in Next.js Server Components
- These are full-page skeleton layouts — for smaller skeleton sections, use LoadingSkeleton components
- Accept `className` and standard div attributes but render fixed layout structures

## Changes
### v0.2.0
- **Added** Identified as server-safe component

### v0.1.0
- **Added** Initial release
