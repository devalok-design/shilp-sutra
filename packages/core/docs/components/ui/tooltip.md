# Tooltip

- Import: @devalok/shilp-sutra/ui/tooltip
- Server-safe: No
- Category: ui

## Compound Components
    TooltipProvider (REQUIRED at layout root or wrapping tooltip usage, controls delay)
      Tooltip (root)
        TooltipTrigger
        TooltipContent

## Example
```jsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild><Button>Hover me</Button></TooltipTrigger>
    <TooltipContent>Tooltip text</TooltipContent>
  </Tooltip>
</TooltipProvider>
```

## Composability
- Built on Radix Tooltip — accepts `delayDuration`, `skipDelayDuration` (on TooltipProvider), and `open`/`onOpenChange`/`defaultOpen` (on Tooltip root).
- **Auto-provider (v0.22.0+):** If no ancestor TooltipProvider exists, `<Tooltip>` auto-wraps itself with one. Explicit TooltipProvider is still recommended at layout root for shared `delayDuration` tuning.
- **Trigger:** `<TooltipTrigger asChild>` around the element that should show the tooltip on hover/focus. Icon-only buttons are the canonical use case.
- **Not interactive:** TooltipContent is for non-interactive text labels — don't put buttons/links inside. Use HoverCard or Popover when the popped content needs interaction.
- **Positioning:** TooltipContent accepts `side`, `align`, `sideOffset`, and arrow via `<TooltipArrow>` (optional).
- **Portal rendering:** z-index is `z-tooltip` (highest in the stack — above Popover and Dialog).

## Gotchas
- TooltipProvider is REQUIRED at the layout level OR auto-created per-tooltip — but having a single root provider is better for consistent delays
- Don't use Tooltip for critical information — hover-triggered UI is invisible to touch users. Pair with a visible label or aria-description
- TooltipContent children must be inert — no buttons, no links, no focusable elements

## Changes
### v0.22.0
- **Added** Auto-provider: `<Tooltip>` now auto-wraps with `<TooltipProvider>` when no ancestor provider exists. No more "tooltip doesn't appear" issues.
- **Fixed** Content children not rendering — `motion.div` was self-closing (`/>`), so children were never passed through.
- **Fixed** Text invisible in dark mode — `text-accent-fg` resolves to same value as `bg-surface-fg` in dark mode. Changed to `text-surface-1`.

### v0.18.0
- **Changed** Migrated to Framer Motion for enter/exit animations
- **Added** `TooltipContentProps` type export
- **Fixed** Wrapped Tooltip context provider value in `useMemo` for performance

### v0.1.0
- **Added** Initial release
