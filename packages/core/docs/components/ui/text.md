# Text

- Import: @devalok/shilp-sutra/ui/text
- Server-safe: Yes
- Category: ui

## Props
    variant: TextVariant
    as: ElementType (override the auto-selected HTML element)

## Types
    TextVariant = 'heading-2xl' | 'heading-xl' | 'heading-lg' | 'heading-md' | 'heading-sm' | 'heading-xs' | 'body-lg' | 'body-md' | 'body-sm' | 'body-xs' | 'label-lg' | 'label-md' | 'label-sm' | 'label-xs' | 'caption' | 'overline'

## Defaults
    variant: "body-md"

## Default Element Mapping
    heading-2xl -> h1, heading-xl -> h2, heading-lg -> h3, heading-md -> h4, heading-sm -> h5, heading-xs -> h6
    body-* -> p, label-* -> span, caption -> span, overline -> span

## Example
```jsx
<Text variant="heading-2xl">Page Title</Text>
<Text variant="body-sm" as="span">Inline text</Text>
<Text variant="label-sm" className="text-text-secondary">SECTION LABEL</Text>
```

## Gotchas
- label-* and overline variants are automatically uppercase
- Use "as" prop to override the HTML element when needed

## Changes
### v0.2.0
- **Fixed** `as` prop widened to accept any `React.ElementType` — `<Text as="h1">` no longer causes TypeScript errors

### v0.1.0
- **Added** Initial release
