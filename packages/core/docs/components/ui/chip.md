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

## Composability
- **DEPRECATED — use Badge instead.** Chip v0.29.0+ superset capability merged into Badge. Chip remains in the library for backward compatibility; new code should use:
  - `<Badge>...</Badge>` for static tags (replaces `<Chip label="..." />`)
  - `<Badge onClick={...} selected={isSelected}>...</Badge>` for interactive filter chips
  - `<Badge onDismiss={...}>...</Badge>` for dismissible chips
- **Why deprecated:** Chip used `label` prop (not children) and had a separate CVA; Badge now supports everything Chip did via children + onClick/onDismiss/selected, with more colors and variants.
- **Migration:** `<Chip label="React" color="info" />` → `<Badge variant="subtle" color="info">React</Badge>`. ChipGroup → BadgeGroup or just AnimatePresence wrapper.

## Gotchas
- MUST use label prop — children are NOT rendered
- `<Chip>text</Chip>` is WRONG — use `<Chip label="text" />`
- Wrap dynamic chip lists in `<ChipGroup>` for exit animations
- `color="primary"` will be renamed to `color="brand"` in v1.0 — use `color="primary"` for now
- **Deprecated — migrate to Badge for all new code**

## Changes
### v0.19.1
- **Fixed** `active:scale-95` tap feedback broken by Framer Motion transform override — replaced with `whileTap={{ scale: 0.95 }}`

### v0.4.2
- **Changed** (BREAKING) `variant="filled"` renamed to `"subtle"`, `variant="outlined"` renamed to `"outline"`, `onDelete` renamed to `onDismiss`

### v0.1.1
- **Fixed** `opacity-[var(--action-disabled-opacity,0.38)]` replaced with `opacity-action-disabled`
- **Fixed** Converted from `React.createElement` to JSX syntax

### v0.1.0
- **Added** Initial release
