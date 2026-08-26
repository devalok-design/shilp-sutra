# ColorSwatch

- Import: @devalok/shilp-sutra/ui/color-swatch
- Server-safe: Yes
- Category: ui

## Props
    color: string (any valid CSS color — hex, rgb, oklch, etc.)
    size: "sm" | "md" | "lg"
    shape: "circle" | "square" | "rounded"
    ring: boolean (shows subtle ring border — useful for light colors that blend into the background)

## Defaults
    size="md", shape="circle", ring={false}

## Example
```jsx
<ColorSwatch color="#FF5733" />
<ColorSwatch color={org.brandColor} size="lg" ring />
<ColorSwatch color="oklch(0.7 0.15 200)" shape="rounded" />
```

## Composability
- **Server-safe, decorative-only primitive.** Accepts any valid CSS color string — hex, rgb, oklch, hsl, named. Pure presentation, no context.
- **Usage patterns:** Inline color marker next to a label, preview dot in lists, color-indicator in a category chip, legend swatch for charts.
- **`ring={true}`** adds a subtle outline — essential for white/very-light colors that would otherwise disappear on surface-panel backgrounds.
- **Interactive color picking:** Use ColorInput (which opens a full picker). ColorSwatch is display-only.
- No IconProvider cascade, no FormField consumption — composes freely with anything.

## Gotchas
- Color is applied via inline `backgroundColor` style, not a token class — accepts any runtime CSS color string
- Renders `role="presentation"` — purely decorative, not interactive
