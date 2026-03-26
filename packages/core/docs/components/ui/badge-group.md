# BadgeGroup

- Import: @devalok/shilp-sutra/ui (as Badge.Group)
- Server-safe: Yes
- Category: ui

## Props
    max: number — Show at most N badges, rest collapsed into "+N" overflow
    gap: "tight" | "default" | "loose" (default: "default")
    size: BadgeProps["size"] — Size passed to the overflow "+N" badge
    onOverflowClick: () => void — Click handler for the overflow "+N" badge
    className: string
    children: ReactNode (REQUIRED)

## Defaults
    gap="default", max=undefined (show all)

## Example
```jsx
<Badge.Group max={3} size="sm" onOverflowClick={() => setShowAll(true)}>
  <Badge>React</Badge>
  <Badge>TypeScript</Badge>
  <Badge>Tailwind</Badge>
  <Badge>Vite</Badge>
  <Badge>Vitest</Badge>
</Badge.Group>
{/* Renders: React, TypeScript, Tailwind, +2 */}
```

## Gotchas
- Overflow badge is always `variant="outline" color="neutral"`
- `size` only applies to the overflow badge — child badges keep their own size
- Gap values: tight=4px, default=6px, loose=8px
- Without `onOverflowClick`, the overflow badge is not interactive

## Changes
### v0.29.0
- **Added** Initial release — badge grouping with overflow collapse and click handler
