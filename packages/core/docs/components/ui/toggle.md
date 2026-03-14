# Toggle

- Import: @devalok/shilp-sutra/ui/toggle
- Server-safe: No
- Category: ui

## Props
    variant: "default" | "outline"
    size: "sm" | "md" | "lg"
    pressed: boolean
    onPressedChange: (pressed: boolean) => void
    defaultPressed: boolean

## Defaults
    variant: "default"
    size: "md"

## Example
```jsx
<Toggle aria-label="Toggle bold" pressed={isBold} onPressedChange={setIsBold}>
  <IconBold />
</Toggle>
```

## Gotchas
- Always provide aria-label for accessibility

## Changes
### v0.18.0
- **Changed** Migrated to Framer Motion press spring animation

### v0.4.2
- **Fixed** `className` was passed inside CVA (silently dropped) — now separate `cn()` argument
- **Added** `ToggleProps` type export

### v0.1.0
- **Added** Initial release
