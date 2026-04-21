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
    ToggleGroup (root — variant, size propagated to items via context)
      ToggleGroupItem (value: string — reads variant/size from context)

## Defaults
    variant="default", size="md"

## Example
```jsx
<ToggleGroup type="single" variant="outline" size="sm" value={alignment} onValueChange={setAlignment}>
  <ToggleGroupItem value="left"><IconAlignLeft /></ToggleGroupItem>
  <ToggleGroupItem value="center"><IconAlignCenter /></ToggleGroupItem>
  <ToggleGroupItem value="right"><IconAlignRight /></ToggleGroupItem>
</ToggleGroup>
```

## Composability
- ToggleGroup passes `variant` and `size` to every ToggleGroupItem via `ToggleGroupContext`. Items read both from context; explicit props on a child override.
- `type="single"` enforces one-selected-at-a-time (value: string); `type="multiple"` allows many (value: string[]). Radix Toggle Group underpins this — it's the same role + keyboard model as Radix.
- Built on top of the plain `Toggle` component's CVA — the `variant` and `size` axes of ToggleGroupItem match Toggle exactly (`default | outline`, `sm | md | lg`).

## Gotchas
- `type` is required — "single" or "multiple" — and drives the value shape
- variant and size propagate from ToggleGroup to items; setting them on a ToggleGroupItem overrides that item only
- Unlike Tabs (where TabsList is the styling surface), ToggleGroup itself is the styling surface — there's no intermediate List component

## Changes
### v0.18.0
- **Fixed** Wrapped ToggleGroup context provider value in `useMemo` for performance

### v0.4.2
- **Added** `ToggleGroupProps`, `ToggleGroupItemProps` type exports

### v0.1.0
- **Added** Initial release
