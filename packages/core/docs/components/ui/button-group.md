# ButtonGroup

- Import: @devalok/shilp-sutra/ui/button-group
- Server-safe: No
- Category: ui

## Props
    variant: ButtonProps['variant'] (propagated to children)
    color: ButtonProps['color'] (propagated to children)
    size: ButtonProps['size'] (propagated to children)
    orientation: "horizontal" | "vertical" (default: "horizontal")

## Defaults
    orientation="horizontal"

## Example
```jsx
<ButtonGroup variant="outline" size="sm">
  <Button>Bold</Button>
  <Button>Italic</Button>
</ButtonGroup>
```

## Gotchas
- Children can override variant/size individually

## Changes
### v0.33.0
- **Rebuilt** with compound component pattern — Button reads position from ButtonGroup context and applies border-radius inline
- **Added** `disabled` prop (propagates to all children via context)
- **Added** `attached` prop (default true; false = spaced with gap)
- **Added** `fullWidth` prop (stretch to fill container)
- **Added** Tonal divider elements between buttons for solid/soft/ghost variants
- **Added** Focus z-index isolation (focused button rises above siblings)
- **Fixed** Border-radius not working with custom `rounded-ds-*` design tokens

### v0.4.2
- **Fixed** `Omit<HTMLAttributes, 'color'>` resolves TS2320 conflict with CVA color prop

### v0.1.0
- **Added** Initial release
