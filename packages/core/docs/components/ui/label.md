# Label

- Import: @devalok/shilp-sutra/ui/label
- Server-safe: No
- Category: ui

## Props
    required: boolean (shows red asterisk)
    htmlFor: string
    (plus standard Radix Label props)

## Example
```jsx
<Label htmlFor="email" required>Email Address</Label>
```

## Composability
- **Label is NOT auto-wired by FormField** — you must explicitly pair `<Label htmlFor="x" />` with the matching `<Input id="x" />` (or Checkbox/Radio/Switch/Select). Screen-reader label association depends on this.
- Radix Label primitive underneath — clicking the Label focuses its associated control, which is why the `htmlFor`/`id` pairing matters.
- `required={true}` only renders the red asterisk; it does NOT set `aria-required` on the associated control (that comes from FormField context on the control itself).
- Works with any input-like component in the library — pair with Input, Textarea, NumberInput, Checkbox, Radio, Switch, Select, Combobox, Autocomplete.

## Gotchas
- Use with FormField for automatic aria wiring on the control (but the Label-to-control association is always manual)

## Changes
### v0.2.0
- **Fixed** Children rendering verified and covered by tests — issue was caused by `@primitives` type leak, not a runtime bug

### v0.1.0
- **Added** Initial release
