# Popover

- Import: @devalok/shilp-sutra/ui/popover
- Server-safe: No
- Category: ui

## Compound Components
    Popover (root)
      PopoverTrigger
      PopoverContent
      PopoverAnchor (optional anchor point)

## Example
```jsx
<Popover>
  <PopoverTrigger asChild><Button>Open</Button></PopoverTrigger>
  <PopoverContent>Content here</PopoverContent>
</Popover>
```

## Gotchas
- Uses Framer Motion for enter/exit animations (v0.18.0)

## Changes
### v0.18.0
- **Changed** Migrated to Framer Motion for enter/exit animations
- **Added** `PopoverContentProps` type export

### v0.1.0
- **Added** Initial release
