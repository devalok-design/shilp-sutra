# Skeleton

- Import: @devalok/shilp-sutra/ui/skeleton
- Server-safe: Yes
- Category: ui

## Props
### Skeleton (base)
    variant: "rectangle" | "circle" | "text"
    animation: "pulse" | "shimmer" | "none"

### SkeletonAvatar
    size: "sm" | "md" | "lg" | "xl"
    animation: "pulse" | "shimmer" | "none"

### SkeletonText
    lines: number (default: 3)
    lastLineWidth: "full" | "three-quarter" | "half" (default: "three-quarter")
    spacing: "sm" | "md" (default: "md")
    animation: "pulse" | "shimmer" | "none"

### SkeletonButton
    size: "sm" | "md" | "lg"
    width: "auto" | "full" | "icon"
    animation: "pulse" | "shimmer" | "none"

### SkeletonInput
    size: "sm" | "md" | "lg"
    animation: "pulse" | "shimmer" | "none"

### SkeletonChart
    bars: number (default: 7)
    height: string (default: "h-40")
    animation: "pulse" | "shimmer" | "none"

### SkeletonImage
    width: string (default: "w-full")
    height: string (default: "h-40")
    animation: "pulse" | "shimmer" | "none"

### SkeletonGroup
    label: string (default: "Loading") — accessible label for the loading state

## Defaults
    Skeleton: variant="rectangle", animation="pulse"
    SkeletonAvatar: size="md", animation="pulse"
    SkeletonText: lines=3, lastLineWidth="three-quarter", spacing="md", animation="pulse"
    SkeletonButton: size="md", width="auto", animation="pulse"
    SkeletonInput: size="md", animation="pulse"
    SkeletonChart: bars=7, height="h-40", animation="pulse"
    SkeletonImage: width="w-full", height="h-40", animation="pulse"
    SkeletonGroup: label="Loading"

## Example
```jsx
<Skeleton variant="text" className="w-3/4" />
<Skeleton variant="circle" className="h-12 w-12" />
<Skeleton variant="rectangle" animation="shimmer" className="h-48 w-full" />

<SkeletonGroup label="Loading user profile">
  <SkeletonAvatar size="lg" />
  <SkeletonText lines={2} />
  <SkeletonButton />
</SkeletonGroup>

<SkeletonChart bars={5} height="h-32" />
<SkeletonImage height="h-64" />
```

## Gotchas
- shimmer respects prefers-reduced-motion
- SkeletonGroup adds role="status" and aria-busy="true" — wrap multiple skeletons for a11y
- All sub-components accept className for custom sizing

## Changes
### v0.1.0
- **Added** Initial release with `shape` variants (text, circular, rectangular) and shimmer animation
