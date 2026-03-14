# ColorInput

- Import: @devalok/shilp-sutra/ui/color-input
- Server-safe: No
- Category: ui

## Props
    value: string (hex color, e.g. "#d33163")
    onChange: (value: string) => void
    presets: string[] (optional preset color swatches)
    disabled: boolean
    className: string

## Defaults
    value="#000000", disabled=false

## Example
```jsx
<ColorInput
  value={color}
  onChange={setColor}
  presets={['#d33163', '#2563eb', '#16a34a']}
/>
```

## Gotchas
- Uses native color picker under the hood; value must be a valid hex string

## Changes
### v0.15.0
- **Changed** `md` size font standardized to `text-ds-md` (14px) from mixed values

### v0.8.0
- **Fixed** Added `aria-label` to hex color input

### v0.1.0
- **Added** Initial release
