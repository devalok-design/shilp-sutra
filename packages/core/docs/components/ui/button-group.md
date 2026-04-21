# ButtonGroup

- Import: @devalok/shilp-sutra/ui/button-group
- Server-safe: No
- Category: ui

## Props
    variant: ButtonProps['variant'] (propagated to children via context)
    color: ButtonProps['color'] (propagated to children)
    size: ButtonProps['size'] (propagated to children)
    weight: ButtonProps['weight'] (propagated to children)
    shape: ButtonProps['shape'] (propagated to children)
    disabled: boolean (propagates to all children)
    orientation: "horizontal" | "vertical"
    attached: boolean (true = buttons visually merge with shared borders; false = spaced apart via gap)
    fullWidth: boolean (group stretches to parent width; children stretch equally)

## Defaults
    orientation="horizontal", attached=true

## Example
```jsx
<ButtonGroup variant="outline" size="sm">
  <Button>Bold</Button>
  <Button>Italic</Button>
  <Button>Underline</Button>
</ButtonGroup>

{/* Spaced, not attached */}
<ButtonGroup attached={false} variant="soft">
  <Button>Save</Button>
  <Button>Cancel</Button>
</ButtonGroup>
```

## Composability
- Every Button child reads variant/color/size/weight/shape/disabled from ButtonGroup context. Explicit props on individual children override context.
- **Position-aware border radius:** Child Buttons read their position in the group (first / middle / last) and apply appropriate corner radii inline. Works for both horizontal and vertical orientations.
- **Focus z-index isolation:** The focused button rises above its siblings so the focus ring isn't clipped by adjacent borders.
- **Tonal dividers:** For solid/soft/ghost variants without visible borders, ButtonGroup injects subtle divider elements between children.
- **Works with SplitButton:** `<SplitButton>` inside a `<ButtonGroup>` inherits the same context and position rules.

## Gotchas
- Children can override variant/size individually — context is a default, not a lock
- `attached={false}` disables the position-aware border radius (children use their default corners)

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
