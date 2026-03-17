# ProgressRing

- Import: @devalok/shilp-sutra/ui/progress-ring
- Server-safe: No
- Category: ui

## Props

### ProgressRing
    value: number (current progress value)
    max: number (maximum value)
    size: "sm" | "md" | "lg"
    color: "default" | "success" | "warning" | "error" | "info"
    showValue: boolean (show percentage text in center)
    label: string (accessible label — falls back to "{n}% progress")

### MultiProgressRing
    rings: Array<{ value: number; max?: number; color?: "default" | "success" | "warning" | "error" | "info"; label?: string }>
    size: "sm" | "md" | "lg"

## Defaults
    max={100}, size="md", color="default", showValue={false}

## Example
```jsx
<ProgressRing value={75} />
<ProgressRing value={3} max={12} size="lg" color="warning" showValue />

<MultiProgressRing
  rings={[
    { value: 80, color: 'error', label: 'Move' },
    { value: 60, color: 'success', label: 'Exercise' },
  ]}
  size="lg"
/>
```

## Gotchas
- Uses Framer Motion for the animated fill — not server-safe
- Value is clamped to `[0, max]` internally
- MultiProgressRing skips rings whose computed radius would be <= 0 (too many rings for the size)
