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
        AccordionTrigger (clickable header, chevron auto-renders)
        AccordionContent (collapsible body)

## Defaults
    none (type is required)

## Example
```jsx
<Accordion type="single" defaultValue="item-1" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Question?</AccordionTrigger>
    <AccordionContent>Answer.</AccordionContent>
  </AccordionItem>
</Accordion>
```

## Gotchas
- type is REQUIRED — omitting it causes runtime error
- collapsible only works with type="single"

## Changes
### v0.18.0
- **Changed** Accordion content fade animation migrated to Framer Motion (height animation still uses CSS keyframes)

### v0.13.0
- **Added** `accordion-down` and `accordion-up` keyframes added to Tailwind preset using Radix CSS custom properties

### v0.4.2
- **Added** `AccordionItemProps`, `AccordionTriggerProps`, `AccordionContentProps` type exports

### v0.1.0
- **Added** Initial release
