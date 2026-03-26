# Progress

- Import: @devalok/shilp-sutra/ui/progress
- Server-safe: No
- Category: ui

## Props
    value: number (0-100) — omit for indeterminate
    size: "sm" | "md" | "lg" (track height)
    color: "default" | "success" | "warning" | "error" (indicator color)
    autoColor: boolean (auto-shifts color by value: 0-59=default, 60-84=warning, 85-100=success, >100=error)
    showLabel: boolean (shows percentage text)
    indicatorClassName: string

## Defaults
    size: "md"
    color: "default"

## Example
```jsx
<Progress value={75} color="success" showLabel />
<Progress size="sm" />  {/* indeterminate */}
```

## Gotchas
- Omit value (or pass undefined) for indeterminate animation
- `autoColor` overrides `color` when `value` is set — do not pass both unless you want autoColor to win

## Changes
### v0.29.0
- **Added** `autoColor` prop — automatically shifts indicator color based on value thresholds (0-59 default, 60-84 warning, 85-100 success, >100 error)

### v0.1.0
- **Added** Initial release with `size`, `color`, `indeterminate` variants and optional label slot
