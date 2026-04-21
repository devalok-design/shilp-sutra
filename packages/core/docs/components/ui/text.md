# Text

- Import: @devalok/shilp-sutra/ui/text
- Server-safe: Yes
- Category: ui

## Props
    variant: "heading-2xl" | "heading-xl" | "heading-lg" | "heading-md" | "heading-sm" | "heading-xs" | "body-lg" | "body-md" | "body-sm" | "body-xs" | "label-lg" | "label-md" | "label-sm" | "label-xs" | "label-plain-lg" | "label-plain-md" | "label-plain-sm" | "caption" | "overline" | "code"
    as: ElementType (override the auto-selected HTML element)

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

## Composability
- **Server-safe** (one of few components in the library that is). Can render in RSC trees without `"use client"`.
- No context consumption, no context cascade — pure typography primitive.
- **Semantic HTML by default:** Each variant maps to a meaningful HTML element (h1 through p, span, code). The `as` prop overrides for visual-only demotion: e.g. `<Text variant="heading-xl" as="div">` renders h2-sized text inside a div, useful when the element already has a heading ancestor but you want the visual weight.
- **Underpins many components:** Card's CardTitle, Alert's title, PageHeader, EmptyState, SectionHeader all render Text internally with specific variants. Don't wrap another Text inside them — variants cascade structurally, not via context.
- Pairs with Code for inline code spans inside body text: `<Text>Call <Code>onClick</Code> to...</Text>`.

## Gotchas
- label-* and overline variants are automatically uppercase
- Use "as" prop to override the HTML element when needed
- Don't use Text inside headings that already have semantic meaning (e.g. CardTitle) — the double-element wraps are redundant and break screen-reader heading navigation

## Changes
### v0.2.0
- **Fixed** `as` prop widened to accept any `React.ElementType` — `<Text as="h1">` no longer causes TypeScript errors

### v0.1.0
- **Added** Initial release
