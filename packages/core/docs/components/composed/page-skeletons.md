# PageSkeletons

- Import: @devalok/shilp-sutra/composed/page-skeletons
- Server-safe: Yes
- Category: composed

Exports: DashboardSkeleton, ProjectListSkeleton, TaskDetailSkeleton

## Props
    None (no configurable props on any of the page skeleton components)

## Defaults
    None

## Example
```jsx
<DashboardSkeleton />
<ProjectListSkeleton />
<TaskDetailSkeleton />
```

## Gotchas
- Server-safe: can be imported directly in Next.js Server Components
- These are full-page skeleton layouts — for smaller skeleton sections, use LoadingSkeleton components
- No props are accepted — these render fixed layouts representing common page structures

## Changes
### v0.2.0
- **Added** Identified as server-safe component

### v0.1.0
- **Added** Initial release
