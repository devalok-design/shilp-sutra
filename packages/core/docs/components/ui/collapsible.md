# Collapsible

- Import: @devalok/shilp-sutra/ui/collapsible
- Server-safe: No
- Category: ui

## Props
    open: boolean (controlled)
    onOpenChange: (open: boolean) => void
    defaultOpen: boolean

## Compound Components
    Collapsible (root)
      CollapsibleTrigger
      CollapsibleContent

## Defaults
    none

## Example
```jsx
<Collapsible>
  <CollapsibleTrigger>Toggle</CollapsibleTrigger>
  <CollapsibleContent>Hidden content</CollapsibleContent>
</Collapsible>
```

## Gotchas
- Standard Radix Collapsible API

## Changes
### v0.13.0
- **Changed** Default animation changed from fade-only to height-based expand/collapse using `animate-collapsible-down`/`animate-collapsible-up`
- **Added** `collapsible-down` and `collapsible-up` keyframes added to Tailwind preset

### v0.4.2
- **Added** `CollapsibleProps` type export

### v0.1.0
- **Added** Initial release
