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
### v0.4.2
- **Fixed** `Omit<HTMLAttributes, 'color'>` resolves TS2320 conflict with CVA color prop

### v0.1.0
- **Added** Initial release
