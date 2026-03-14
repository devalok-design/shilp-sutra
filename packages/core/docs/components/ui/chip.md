# Chip

- Import: @devalok/shilp-sutra/ui/chip
- Server-safe: No
- Category: ui

## Props
    label: string (REQUIRED — use this, NOT children)
    variant: "subtle" | "outline"
    color: "default" | "primary" | "success" | "error" | "warning" | "info" | "teal" | "amber" | "slate" | "indigo" | "cyan" | "orange" | "emerald"
    size: "sm" | "md" | "lg"
    icon: ReactNode
    onClick: MouseEventHandler (renders as <button> when provided)
    onDismiss: () => void (shows X button)
    disabled: boolean

## Defaults
    variant="subtle", size="md", color="default"

## Example
```jsx
<Chip label="In Progress" color="warning" />
<Chip label="React" color="info" onDismiss={() => removeFilter('react')} />
```

## Additional Exports
    ChipGroup — re-exported AnimatePresence from framer-motion; wrap a list of Chips for coordinated exit animations

## Gotchas
- MUST use label prop — children are NOT rendered
- `<Chip>text</Chip>` is WRONG — use `<Chip label="text" />`
- Wrap dynamic chip lists in `<ChipGroup>` for exit animations

## Changes
### v0.4.2
- **Changed** (BREAKING) `variant="filled"` renamed to `"subtle"`, `variant="outlined"` renamed to `"outline"`, `onDelete` renamed to `onDismiss`

### v0.1.1
- **Fixed** `opacity-[var(--action-disabled-opacity,0.38)]` replaced with `opacity-action-disabled`
- **Fixed** Converted from `React.createElement` to JSX syntax

### v0.1.0
- **Added** Initial release
