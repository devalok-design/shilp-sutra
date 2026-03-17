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

## Gotchas
- Color is applied via inline `backgroundColor` style, not a token class — accepts any runtime CSS color string
- Renders `role="presentation"` — purely decorative, not interactive
