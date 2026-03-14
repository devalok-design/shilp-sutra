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

## Gotchas
- Server-safe: can be imported directly in Next.js Server Components
- These are full-page skeleton layouts — for smaller skeleton sections, use LoadingSkeleton components
- Accept `className` and standard div attributes but render fixed layout structures

## Changes
### v0.2.0
- **Added** Identified as server-safe component

### v0.1.0
- **Added** Initial release
