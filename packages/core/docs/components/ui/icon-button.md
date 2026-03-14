# IconButton

- Import: @devalok/shilp-sutra/ui/icon-button
- Server-safe: No
- Category: ui

## Props
    icon: ReactNode (REQUIRED)
    aria-label: string (REQUIRED — WCAG AA mandatory)
    shape: "square" | "circle"
    size: "sm" | "md" | "lg"
    variant: same as Button (solid, outline, ghost, link)
    color: same as Button (default, error)
    loading: boolean
    disabled: boolean

## Defaults
    shape: "square"
    size: "md"

## Example
```jsx
<IconButton icon={<IconEdit />} variant="ghost" aria-label="Edit item" />
<IconButton icon={<IconX />} shape="circle" variant="ghost" size="sm" aria-label="Close" />
```

## Gotchas
- aria-label is enforced by TypeScript — you MUST provide it
- Prefer IconButton over Button with size="icon-*" for icon-only buttons

## Changes
### v0.1.0
- **Added** Initial release
