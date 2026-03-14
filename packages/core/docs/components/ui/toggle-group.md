# ToggleGroup

- Import: @devalok/shilp-sutra/ui/toggle-group
- Server-safe: No
- Category: ui

## Props
### ToggleGroup
    type: "single" | "multiple"
    variant: "default" | "outline" (propagated to items)
    size: "sm" | "md" | "lg" (propagated to items)
    value: string | string[]
    onValueChange: (value) => void

### ToggleGroupItem
    value: string

## Compound Components
    ToggleGroup (root)
      ToggleGroupItem (value: string)

## Example
```jsx
<ToggleGroup type="single" variant="outline" size="sm" value={alignment} onValueChange={setAlignment}>
  <ToggleGroupItem value="left"><IconAlignLeft /></ToggleGroupItem>
  <ToggleGroupItem value="center"><IconAlignCenter /></ToggleGroupItem>
  <ToggleGroupItem value="right"><IconAlignRight /></ToggleGroupItem>
</ToggleGroup>
```

## Gotchas
- type is required — "single" or "multiple"
- variant and size propagate from ToggleGroup to items

## Changes
### v0.18.0
- **Fixed** Wrapped ToggleGroup context provider value in `useMemo` for performance

### v0.4.2
- **Added** `ToggleGroupProps`, `ToggleGroupItemProps` type exports

### v0.1.0
- **Added** Initial release
