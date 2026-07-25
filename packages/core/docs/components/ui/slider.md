# Slider

- Import: @devalok/shilp-sutra/ui/slider
- Server-safe: No
- Category: ui

## Props
    size: "sm" | "md" | "lg" (track height and thumb dimensions)
    color: "accent" | "success" | "warning" | "error" (thumb border + focus ring color)
    (plus standard Radix Slider props: value, onValueChange, defaultValue, min, max, step, aria-label)

## Defaults
    size="md", color="accent"

## Example
```jsx
<Slider defaultValue={[50]} max={100} step={1} aria-label="Volume" />
<Slider defaultValue={[25, 75]} max={100} step={1} /> {/* range slider */}
```

## Composability
- Radix Slider primitive — keyboard navigation (arrow keys, Home/End, PageUp/PageDown) pre-wired.
- **Value is always an array** — single-thumb: `[50]`; range: `[25, 75]`. Don't pass a plain number.
- **Multi-thumb range:** Pass `[start, end]` — renders two thumbs that can cross each other by default. Use `minStepsBetweenThumbs` to enforce a gap.
- **FormField:** Slider consumes FormField for a11y wiring (`aria-invalid` / `aria-describedby` / `aria-required`) but renders no visual validation treatment — values are valid by construction, so there's no error UX to hand-wire.
- **No label pairing via Label** — use `aria-label` or `aria-labelledby` directly on the Slider. The thumb is the focusable/labeled element.
- Not portal-rendered — inline; overflow rules of parents apply.

## Gotchas
- value is number[] (array), not a single number
- Multi-thumb: Pass array `defaultValue={[25, 75]}` for range sliders — renders one thumb per value
- Slider consumes FormField for a11y wiring (aria-invalid/describedby/required) but shows no validation visuals by design — don't hand-wire what it already does

## Changes
### v0.18.0
- **Fixed** Multi-thumb support added

### v0.3.0
- **Added** `SliderProps` type export

### v0.1.0
- **Added** Initial release
- **Fixed** `aria-label` now forwarded to thumb element (was only on root container)
