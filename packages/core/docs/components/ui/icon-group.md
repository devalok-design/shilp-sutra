# IconGroup

- Import: @devalok/shilp-sutra/ui (barrel export)
- Server-safe: No
- Category: ui

## Props
    size: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" — propagated to children via IconContext
    stroke: "light" | "regular" | "bold" — propagated to children via IconContext
    gap: "tight" | "default" | "loose" — flex gap between icons
    label: string — accessible label (used as aria-label when role="toolbar")
    role: "toolbar" — optional, set for toolbar patterns
    className: string
    children: ReactNode (REQUIRED)

## Defaults
    gap: "default"
    role: undefined (no ARIA role)

## Example
```jsx
<IconGroup size="sm" gap="tight" role="toolbar" label="Formatting">
  <Icon icon={IconBold} label="Bold" />
  <Icon icon={IconItalic} label="Italic" />
  <Icon icon={IconUnderline} label="Underline" />
</IconGroup>
```

## Gotchas
- Wraps children in an IconProvider — all child Icons inherit size/stroke from the group
- `label` is only applied as `aria-label` when `role="toolbar"` is set
- Gap values: tight=2px, default=4px, loose=8px

## Changes
### v0.29.0
- **Added** Initial release — icon grouping with shared context, toolbar ARIA support
