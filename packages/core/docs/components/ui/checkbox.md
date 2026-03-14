# Checkbox

- Import: @devalok/shilp-sutra/ui/checkbox
- Server-safe: No
- Category: ui

## Props
    checked: boolean | "indeterminate"
    onCheckedChange: (checked: boolean | "indeterminate") => void
    error: boolean (shows red border)
    indeterminate: boolean (overrides checked, shows dash icon)
    disabled: boolean

## Defaults
    none

## Example
```jsx
<Checkbox checked={agreed} onCheckedChange={(v) => setAgreed(v === true)} />
```

## Gotchas
- indeterminate overrides checked visually

## Changes
### v0.18.0
- **Changed** Bouncy check indicator animation migrated to Framer Motion
- **Fixed** Icon sizing uses design tokens consistently

### v0.1.0
- **Added** Initial release
