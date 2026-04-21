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

## Composability
- **One-liner Tooltip** — wraps TooltipProvider + Tooltip + TooltipTrigger + TooltipContent so consumers don't have to manually compose them for a simple label.
- **When to use:** 90% of tooltip use cases (icon-only button labels, abbreviated text expansions, secondary info). Use the ui/Tooltip compound for advanced cases (controlled open, nested triggers, custom animations).
- **Auto-provides its own TooltipProvider** — safe to drop anywhere. You can still wrap a broader TooltipProvider at layout level for shared `delayDuration`; SimpleTooltip respects it if present.
- **Content must be inert** — same rule as ui/Tooltip. For interactive popped content, use Popover or HoverCard.
- **Pairs with IconButton** — the canonical pattern for labeled icon buttons.

## Gotchas
- Wraps the full Tooltip compound (Provider + Tooltip + Trigger + Content) into one component — no need for TooltipProvider
- Unlike the low-level Tooltip, SimpleTooltip does not require wrapping in a TooltipProvider

## Changes
### v0.18.0
- **Fixed** Type definition corrected

### v0.1.0
- **Added** Initial release
