# HoverCard

- Import: @devalok/shilp-sutra/ui/hover-card
- Server-safe: No
- Category: ui

## Compound Components
    HoverCard (root)
      HoverCardTrigger
      HoverCardContent

## Example
```jsx
<HoverCard>
  <HoverCardTrigger asChild><span>Hover me</span></HoverCardTrigger>
  <HoverCardContent>Preview content</HoverCardContent>
</HoverCard>
```

## Gotchas
- Overlay component — uses Framer Motion for enter/exit animations (v0.18.0)

## Changes
### v0.18.0
- **Changed** Migrated to Framer Motion for enter/exit animations
- **Added** `HoverCardContentProps` type export

### v0.14.0
- **Changed** z-index promoted from `z-dropdown` (1000) to `z-popover` (1400) — fixes content rendering behind Sheet/Dialog overlays

### v0.4.2
- **Added** `HoverCardContentProps` type export

### v0.1.0
- **Added** Initial release
