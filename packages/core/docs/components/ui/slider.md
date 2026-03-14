# Slider

- Import: @devalok/shilp-sutra/ui/slider
- Server-safe: No
- Category: ui

## Props
    Standard Radix Slider props (value, onValueChange, defaultValue, min, max, step, aria-label)

## Example
```jsx
<Slider defaultValue={[50]} max={100} step={1} aria-label="Volume" />
<Slider defaultValue={[25, 75]} max={100} step={1} /> {/* range slider */}
```

## Gotchas
- value is number[] (array), not a single number
- Multi-thumb: Pass array `defaultValue={[25, 75]}` for range sliders — renders one thumb per value

## Changes
### v0.18.0
- **Fixed** Multi-thumb support added

### v0.3.0
- **Added** `SliderProps` type export

### v0.1.0
- **Added** Initial release
- **Fixed** `aria-label` now forwarded to thumb element (was only on root container)
