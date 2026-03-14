# RadioGroup

- Import: @devalok/shilp-sutra/ui/radio
- Server-safe: No
- Category: ui

## Compound Components
    RadioGroup (root, value, onValueChange, defaultValue)
      RadioGroupItem (value: string, REQUIRED)

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

## Gotchas
- Each RadioGroupItem needs a unique `value` prop
- Pair each item with a Label for accessibility

## Changes
### v0.4.2
- **Added** `RadioGroupProps`, `RadioGroupItemProps` type exports

### v0.1.0
- **Added** Initial release
