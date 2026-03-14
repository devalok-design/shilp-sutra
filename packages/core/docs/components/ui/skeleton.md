# Skeleton

- Import: @devalok/shilp-sutra/ui/skeleton
- Server-safe: Yes
- Category: ui

## Props
    variant: "rectangle" | "circle" | "text"
    animation: "pulse" | "shimmer" | "none"

## Defaults
    variant: "rectangle"
    animation: "pulse"

## Example
```jsx
<Skeleton variant="text" className="w-3/4" />
<Skeleton variant="circle" className="h-12 w-12" />
<Skeleton variant="rectangle" animation="shimmer" className="h-48 w-full" />
```

## Gotchas
- shimmer respects prefers-reduced-motion

## Changes
### v0.1.0
- **Added** Initial release with `shape` variants (text, circular, rectangular) and shimmer animation
