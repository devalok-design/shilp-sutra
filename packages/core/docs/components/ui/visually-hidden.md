# VisuallyHidden

- Import: @devalok/shilp-sutra/ui/visually-hidden
- Server-safe: Yes
- Category: ui

## Props
    standard span attributes

## Example
```jsx
<VisuallyHidden>Screen reader only text</VisuallyHidden>
```

## Composability
- Server-safe. Works anywhere — no context, no cascade.
- Canonical use: wrap a DialogTitle / SheetTitle that must exist for a11y but shouldn't show visually (`<DialogTitle asChild><VisuallyHidden>...</VisuallyHidden></DialogTitle>`).
- Also useful inside IconButton to provide a text alternative when the icon already has an aria-label (redundant label is harmless and helps some screen readers).
- Uses the `sr-only` CSS pattern under the hood — content is in the DOM, just positioned off-screen.

## Gotchas
- Content is visually hidden but accessible to screen readers
- Useful for providing accessible labels without visual UI
- Don't use for content you want hidden entirely — that's `hidden` or conditional rendering

## Changes
### v0.1.0
- **Added** Initial release
