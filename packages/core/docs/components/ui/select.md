# Select

- Import: @devalok/shilp-sutra/ui/select
- Server-safe: No
- Category: ui

## Props
### SelectTrigger
    size: "sm" | "md" | "lg"

## Compound Components
    Select (root — value, onValueChange, defaultValue)
      SelectTrigger (size goes HERE, not on Select root)
        SelectValue (placeholder)
      SelectContent
        SelectGroup (optional grouping)
          SelectLabel (group header)
          SelectItem (value: string, REQUIRED)
        SelectSeparator

## Defaults
    SelectTrigger size: "md"

## Example
```jsx
<Select onValueChange={setValue}>
  <SelectTrigger size="lg">
    <SelectValue placeholder="Choose..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="a">Option A</SelectItem>
    <SelectItem value="b">Option B</SelectItem>
  </SelectContent>
</Select>
```

## Gotchas
- Size goes on SelectTrigger, NOT on Select root
- `<Select size="lg">` is silently ignored (no TypeScript error)

## Changes
### v0.15.0
- **Changed** `lg` size font changed from `text-ds-lg` (18px) to `text-ds-md` (14px) — all input sizes now use 14px for consistency

### v0.14.0
- **Changed** z-index promoted from `z-dropdown` (1000) to `z-popover` (1400) — fixes content rendering behind Sheet/Dialog overlays

### v0.1.0
- **Added** Initial release
