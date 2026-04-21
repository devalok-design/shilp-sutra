# Collapsible

- Import: @devalok/shilp-sutra/ui/collapsible
- Server-safe: No
- Category: ui

## Props
    open: boolean (controlled)
    onOpenChange: (open: boolean) => void
    defaultOpen: boolean

## Compound Components
    Collapsible (root)
      CollapsibleTrigger
      CollapsibleContent

## Defaults
    none

## Example
```jsx
<Collapsible>
  <CollapsibleTrigger>Toggle</CollapsibleTrigger>
  <CollapsibleContent>Hidden content</CollapsibleContent>
</Collapsible>
```

## Composability
- Radix Collapsible primitive — smaller than Accordion (no grouping/value matching, just open/close).
- **When to use:** A single show/hide section where the state is local (e.g. "Advanced options" inside a form, expandable row detail, show-more). For multi-section with mutual exclusion, use Accordion.
- **Inline rendering:** CollapsibleContent is NOT portalled — it expands inline and pushes sibling content down. Respects `overflow` rules of the parent.
- **No built-in chevron** — unlike AccordionTrigger, CollapsibleTrigger is bare. Add your own icon + rotate via `data-state` attribute Radix sets (`[data-state=open]:rotate-180`).
- **Animation:** Height transition via `animate-collapsible-down/up` keyframes + Radix `--radix-collapsible-content-height` CSS custom property.

## Gotchas
- Standard Radix Collapsible API
- No auto-chevron — add one manually if you want the affordance
- Not portalled — clipped by parent `overflow: hidden`

## Changes
### v0.13.0
- **Changed** Default animation changed from fade-only to height-based expand/collapse using `animate-collapsible-down`/`animate-collapsible-up`
- **Added** `collapsible-down` and `collapsible-up` keyframes added to Tailwind preset

### v0.4.2
- **Added** `CollapsibleProps` type export

### v0.1.0
- **Added** Initial release
