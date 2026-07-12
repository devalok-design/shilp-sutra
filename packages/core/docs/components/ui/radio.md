# RadioGroup

- Import: @devalok/shilp-sutra/ui/radio
- Server-safe: No
- Category: ui

## Props
### RadioGroup
    value: string (controlled)
    onValueChange: (value: string) => void
    defaultValue: string
    disabled: boolean (propagates to all items)
    orientation: "horizontal" | "vertical"
    name: string (form name for all items)
    state: "default" | "error" | "warning" | "success" (validation; sets aria-invalid on the group + tints item borders. Inherited from FormField when omitted)

### RadioGroupItem
    value: string (REQUIRED — what's selected when this item is checked)
    size: "sm" | "md" | "lg"
    disabled: boolean (item-level override)

## Compound Components
    RadioGroup (root — value, onValueChange, defaultValue, disabled propagated)
      RadioGroupItem (value REQUIRED, size/disabled individually overridable)

## Defaults
    RadioGroupItem size="md"

## Example
```jsx
<RadioGroup defaultValue="option-1" onValueChange={setValue}>
  <div className="flex items-center gap-2">
    <RadioGroupItem value="option-1" id="r1" />
    <Label htmlFor="r1">Option 1</Label>
  </div>
  <div className="flex items-center gap-2">
    <RadioGroupItem value="option-2" id="r2" />
    <Label htmlFor="r2">Option 2</Label>
  </div>
</RadioGroup>
```

## Composability
- Radix RadioGroup — keyboard navigation (arrow keys to move between items, space to select) is pre-wired.
- **RadioGroup propagates** `disabled` to every RadioGroupItem; items can opt back in with `disabled={false}` for granular control (rare).
- **Labels:** RadioGroupItem has no intrinsic label — pair each with `<Label htmlFor="x" />` + `<RadioGroupItem id="x" value="..." />`. Screen readers announce the group label (from FormField or aria-labelledby on RadioGroup) plus each item's label.
- **Form libraries:** RadioGroup works with react-hook-form via Controller (onValueChange maps to field.onChange). The `name` prop puts a hidden form input per item for native form serialization.
- **FormField integration:** RadioGroup now consumes FormField state (or set `state` explicitly). It sets `aria-invalid` on the group and tints each item's border to match — unified with the other form controls via the shared `FieldState` type. An explicit `state` prop wins over FormField context.

## Gotchas
- Each RadioGroupItem needs a unique `value` prop
- Pair each item with a Label for accessibility
- RadioGroup inherits FormField state; pass `state` explicitly to override

## Changes
### v0.49.0
- **Added** `state` prop on RadioGroup (`FieldState = "default" | "error" | "warning" | "success"`) — unified field-state API. Sets `aria-invalid` + tints item borders, and now inherits from `FormField` context.

### v0.4.2
- **Added** `RadioGroupProps`, `RadioGroupItemProps` type exports

### v0.1.0
- **Added** Initial release
