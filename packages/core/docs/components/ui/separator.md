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
- Gradient variants compose cleanly with any surface color — they use `bg-transparent` + inline linear-gradient, so the underlying `bg-*` of the parent shows through.
- Common inside Menu/DropdownMenu/Sheet components; their internal *Separator subcomponents already wrap this one.

## Gotchas
- When decorative is true, the separator is hidden from screen readers
- Vertical separator needs an explicit height from the parent flex container (`h-6`, `h-full`, etc.)

## Changes
### v0.22.0
- **Added** `variant` prop: `"gradient"` (fades both edges), `"gradient-left"` (fades left), `"gradient-right"` (fades right). Default behavior unchanged.

### v0.4.2
- **Added** `SeparatorProps` type export

### v0.1.0
- **Added** Initial release
