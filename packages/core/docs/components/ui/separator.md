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

## Composability
- Radix Separator — no context, no cascade. Drop it anywhere; it inherits its stretch dimension from its parent container (full width for horizontal, full height for vertical — but vertical needs an explicit height from the parent flexbox).
- `decorative={true}` (default) sets `role="none"` — screen readers skip it. Set `decorative={false}` for semantic separators (e.g. between navigation sections) so screen readers announce the boundary.
- Common inside Menu/DropdownMenu/Sheet components; their internal *Separator subcomponents already wrap this one.

## Gotchas
- When decorative is true, the separator is hidden from screen readers
- Vertical separator needs an explicit height from the parent flex container (`h-6`, `h-full`, etc.)

## Changes
### v0.44.2
- **Deprecated** the `variant` prop and its `gradient` / `gradient-left` / `gradient-right` values. They were decorative and never rendered in production (the interpolated gradient class couldn't be emitted by the Tailwind 4 scanner). Separator now always renders a solid hairline; the prop is removed in 0.45.0.

### v0.22.0
- **Added** `variant` prop: `"gradient"` (fades both edges), `"gradient-left"` (fades left), `"gradient-right"` (fades right). Default behavior unchanged.

### v0.4.2
- **Added** `SeparatorProps` type export

### v0.1.0
- **Added** Initial release
