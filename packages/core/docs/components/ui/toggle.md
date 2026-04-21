# Toggle

- Import: @devalok/shilp-sutra/ui/toggle
- Server-safe: No
- Category: ui

## Props
    variant: "default" | "outline"
    size: "sm" | "md" | "lg"
    color: "accent" | "error" | "success" | "neutral" (pressed-state bg + text color)
    pressed: boolean
    onPressedChange: (pressed: boolean) => void
    defaultPressed: boolean

## Defaults
    variant="default", size="md", color="accent"

## Example
```jsx
<Toggle aria-label="Toggle bold" pressed={isBold} onPressedChange={setIsBold}>
  <IconBold />
</Toggle>
```

## Composability
- Radix Toggle primitive — `pressed` / `onPressedChange` / `defaultPressed`. Not the same as Switch (boolean value doesn't map to on/off semantically — Toggle is "this action is currently active").
- **Pairs with ToggleGroup** for mutually-exclusive or multi-select toggle clusters — ToggleGroupItem inherits variant + size from ToggleGroup via context. Don't set variant on a ToggleGroupItem directly.
- **No context consumption as a standalone** — when rendered outside a ToggleGroup, Toggle is fully independent.
- **Icon content:** Commonly wraps a single `<Icon>` for formatting toolbar toggles (Bold, Italic, AlignLeft). Pair with IconGroup for a horizontal cluster of independent toggles (vs. ToggleGroup for related state).
- **aria-label is required** — icon-only toggles need an accessible name.

## Gotchas
- Always provide aria-label for accessibility
- Toggle is not Switch — Toggle means "this action is active right now"; Switch means "this setting is on"

## Changes
### v0.18.0
- **Changed** Migrated to Framer Motion press spring animation

### v0.4.2
- **Fixed** `className` was passed inside CVA (silently dropped) — now separate `cn()` argument
- **Added** `ToggleProps` type export

### v0.1.0
- **Added** Initial release
