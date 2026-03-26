# Switch

- Import: @devalok/shilp-sutra/ui/switch
- Server-safe: No
- Category: ui

## Props
    checked: boolean
    onCheckedChange: (checked: boolean) => void
    error: boolean (shows red border/bg)
    disabled: boolean
    size: "sm" | "md" | "lg"
    color: "accent" | "success" | "warning"
    thumbIcon: ReactNode (icon rendered inside the thumb)

## Defaults
    size="md", color="accent"

## Example
```jsx
<Switch checked={enabled} onCheckedChange={setEnabled} />
<Switch size="lg" color="success" thumbIcon={<IconCheck size={14} />} />
```

## Gotchas
- Use error prop for validation states (matches Checkbox API)
- `error` overrides `color` — when error is true, checked state always uses error-9

## Changes
### v0.29.0
- **Added** `size` prop: `"sm"` (18px track) | `"md"` (24px, default) | `"lg"` (28px track)
- **Added** `color` prop: `"accent"` (default) | `"success"` | `"warning"` for checked-state color
- **Added** `thumbIcon` prop — renders any ReactNode inside the thumb circle (e.g., check icon)

### v0.18.0
- **Changed** Migrated to Framer Motion spring thumb animation
- **Fixed** Added visible border on unchecked state (`border-surface-border-strong`) — was borderless, making unchecked state hard to see

### v0.4.2
- **Fixed** `React.ComponentRef` changed to `React.ElementRef` for consistency

### v0.3.0
- **Added** `SwitchProps` type export
- **Added** `error` prop (matches Checkbox API)

### v0.1.0
- **Added** Initial release
