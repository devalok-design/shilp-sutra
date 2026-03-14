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
### v0.18.0
- **Changed** Migrated to Framer Motion for enter/exit animations
- **Added** `TooltipContentProps` type export
- **Fixed** Wrapped Tooltip context provider value in `useMemo` for performance

### v0.1.0
- **Added** Initial release
