# Accordion

- Import: @devalok/shilp-sutra/ui/accordion
- Server-safe: No
- Category: ui

## Props
    type: "single" | "multiple" (REQUIRED)
    defaultValue: string (single) | string[] (multiple)
    value: string | string[] (controlled)
    onValueChange: (value) => void
    collapsible: boolean (only valid when type="single")

## Compound Components
    Accordion (root)
      AccordionItem (value: string, REQUIRED)
        AccordionTrigger (clickable header, chevron auto-renders; chevronPosition: "left" | "right")
        AccordionContent (collapsible body)

## Defaults
    none (type is required); AccordionTrigger: chevronPosition="right"

## Example
```jsx
<Accordion type="single" defaultValue="item-1" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Question?</AccordionTrigger>
    <AccordionContent>Answer.</AccordionContent>
  </AccordionItem>
</Accordion>
```

## Composability
- Built on Radix Accordion — accepts `value`/`defaultValue`/`onValueChange` matching the `type` discriminated union.
- **`type="single"`** — value is a string (which item is open). Only one item open at a time. Pair with `collapsible` to allow closing the current item by re-clicking it.
- **`type="multiple"`** — value is a string[] (which items are open). Multiple can be open at once.
- **AccordionTrigger chevron:** Inline SVG that auto-rotates via the `data-state` attribute Radix sets (`open` / `closed`). The `chevronPosition` prop controls render order inside the trigger (left / right) — rotation still works from either position.
- **AccordionContent:** Uses Radix CSS custom properties (`--radix-accordion-content-height`) for open/close height animation. Framer Motion handles the fade. Don't wrap AccordionContent children in additional motion components — doubles the animation.
- **Inline, not portalled** — parent `overflow: hidden` WILL clip an open accordion. Keep accordions out of tight overflow contexts or use `overflow-visible` on the container.

## Gotchas
- type is REQUIRED — omitting it causes runtime error
- collapsible only works with type="single"
- Each AccordionItem needs a unique `value` — duplicates silently break toggling
- Don't put focusable elements inside AccordionTrigger — the trigger IS the focusable button, nested focusables break screen reader navigation

## Changes
### v0.29.0
- **Added** `chevronPosition` prop on AccordionTrigger: `"left"` | `"right"` (default: `"right"`) — controls which side the chevron icon renders

### v0.18.0
- **Changed** Accordion content fade animation migrated to Framer Motion (height animation still uses CSS keyframes)

### v0.13.0
- **Added** `accordion-down` and `accordion-up` keyframes added to Tailwind preset using Radix CSS custom properties

### v0.4.2
- **Added** `AccordionItemProps`, `AccordionTriggerProps`, `AccordionContentProps` type exports

### v0.1.0
- **Added** Initial release
