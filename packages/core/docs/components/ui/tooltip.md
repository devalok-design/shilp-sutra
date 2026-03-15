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

## Gotchas
- TooltipProvider is REQUIRED — without it, tooltips won't show

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
