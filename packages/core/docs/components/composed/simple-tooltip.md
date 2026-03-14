# SimpleTooltip

- Import: @devalok/shilp-sutra/composed/simple-tooltip
- Server-safe: No
- Category: composed

## Props
    content: ReactNode (REQUIRED — tooltip content)
    side: "top" | "right" | "bottom" | "left" (default: "top")
    align: "start" | "center" | "end" (default: "center")
    delayDuration: number (ms, default: 300)
    children: ReactNode (trigger element)

## Defaults
    side="top", align="center", delayDuration=300

## Example
```jsx
<SimpleTooltip content="Edit this item">
  <IconButton icon={<IconEdit />} aria-label="Edit" />
</SimpleTooltip>
```

## Gotchas
- Wraps the full Tooltip compound (Provider + Tooltip + Trigger + Content) into one component — no need for TooltipProvider
- Unlike the low-level Tooltip, SimpleTooltip does not require wrapping in a TooltipProvider

## Changes
### v0.18.0
- **Fixed** Type definition corrected

### v0.1.0
- **Added** Initial release
