# Switch

- Import: @devalok/shilp-sutra/ui/switch
- Server-safe: No
- Category: ui

## Props
    checked: boolean
    onCheckedChange: (checked: boolean) => void
    error: boolean (shows red border/bg)
    disabled: boolean

## Example
```jsx
<Switch checked={enabled} onCheckedChange={setEnabled} />
```

## Gotchas
- Use error prop for validation states (matches Checkbox API)

## Changes
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
