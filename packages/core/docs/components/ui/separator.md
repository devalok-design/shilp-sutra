# Separator

- Import: @devalok/shilp-sutra/ui/separator
- Server-safe: No
- Category: ui

## Props
    orientation: "horizontal" | "vertical"
    decorative: boolean

## Defaults
    orientation: "horizontal"
    decorative: true

## Example
```jsx
<Separator />
<Separator orientation="vertical" className="h-6" />
```

## Gotchas
- When decorative is true, the separator is hidden from screen readers

## Changes
### v0.22.0
- **Added** `variant` prop: `"gradient"` (fades both edges), `"gradient-left"` (fades left), `"gradient-right"` (fades right). Default behavior unchanged.

### v0.4.2
- **Added** `SeparatorProps` type export

### v0.1.0
- **Added** Initial release
