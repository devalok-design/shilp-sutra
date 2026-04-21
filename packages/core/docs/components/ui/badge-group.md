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
    gap="default", max=undefined (show all), size="sm" (overflow badge)

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

## Composability
- **Wrapper for Badge children** — doesn't style children, just lays them out and optionally collapses overflow into a "+N" indicator.
- **Server-safe** — can render in RSC trees (children still need to be server-safe themselves).
- **Overflow indicator is a Badge** — picks `variant="outline" color="neutral"` and the `size` prop on BadgeGroup. Child badges keep their own variant/color/size.
- **Click-to-reveal pattern:** Pair `onOverflowClick` with a Popover / Sheet / Dialog that shows the full list. Without the handler, the overflow badge is inert (decorative count).
- Doesn't accept arbitrary children — only Badges. Non-Badge children render but may look off (no gap rhythm matching).

## Gotchas
- Overflow badge is always `variant="outline" color="neutral"`
- `size` only applies to the overflow badge — child badges keep their own size
- Gap values: tight=4px, default=6px, loose=8px
- Without `onOverflowClick`, the overflow badge is not interactive

## Changes
### v0.29.0
- **Added** Initial release — badge grouping with overflow collapse and click handler
