# Progress

- Import: @devalok/shilp-sutra/ui/progress
- Server-safe: No
- Category: ui

## Props
    value: number (0-100) — omit for indeterminate
    size: "sm" | "md" | "lg" (track height)
    color: "default" | "success" | "warning" | "error" (indicator color)
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

## Changes
### v0.1.0
- **Added** Initial release with `size`, `color`, `indeterminate` variants and optional label slot
