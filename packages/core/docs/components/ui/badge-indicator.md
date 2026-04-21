# BadgeIndicator

- Import: @devalok/shilp-sutra/ui (as Badge.Indicator)
- Server-safe: No
- Category: ui

## Props
    count: number — Numeric value to display
    max: number (default: 99) — Cap display at this value, shows "99+" when exceeded
    dot: boolean (default: false) — Show a small dot instead of count
    color: "error" | "success" | "warning" | "accent" | "info" (default: "error")
    invisible: boolean (default: false) — Hide the indicator while keeping layout
    showZero: boolean (default: false) — Show indicator when count is 0
    placement: "top-right" | "top-left" | "bottom-right" | "bottom-left" (default: "top-right")
    className: string
    children: ReactNode (REQUIRED) — The element to attach the indicator to

## Defaults
    max=99, dot=false, color="error", invisible=false, showZero=false, placement="top-right"

## Example
```jsx
<Badge.Indicator count={5}>
  <IconButton icon={IconBell} variant="ghost" />
</Badge.Indicator>

<Badge.Indicator dot color="success">
  <Avatar src={user.avatar} fallback={user.name} />
</Badge.Indicator>
```

## Composability
- **Overlay wrapper** — takes any child and overlays a positioned count/dot at the specified corner. The child must be inline-friendly (anything that renders in a span-wrapped position: relative context).
- **Common pairings:** IconButton (notification bell with count), Avatar (online presence dot), Button (cart with item count), tabs (unread indicator).
- **Invisible for layout stability:** Use `invisible={true}` to keep the child's position consistent when the badge should disappear — avoids layout shift as counts appear/disappear.
- **showZero vs hide-on-zero:** By default `count={0}` hides the indicator. Set `showZero={true}` for use cases where "zero" is meaningful (scores, pending items that should display 0 explicitly).
- **Dot vs count:** `dot={true}` is a presence-only pulse indicator (online, new activity); count is a numeric badge. They're mutually exclusive — setting both uses dot.

## Gotchas
- Wraps children in `position: relative` span — the indicator is absolutely positioned
- Animation uses spring physics, respects `prefers-reduced-motion`
- When `count > max`, displays `${max}+` (e.g., "99+")
- `invisible` keeps the layout but hides the dot/count (useful for transitions)

## Changes
### v0.29.0
- **Added** Initial release — animated notification indicator with count, dot, placement, and color
