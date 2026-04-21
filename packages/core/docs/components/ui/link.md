# Link

- Import: @devalok/shilp-sutra/ui/link
- Server-safe: No
- Category: ui

## Props
    inline: boolean (default: true — "inline" or "block" display)
    asChild: boolean (merge with child element, e.g. Next.js Link)
    (plus standard anchor attributes)

## Defaults
    inline: true

## Example
```jsx
<Link href="/docs">Documentation</Link>
<Link asChild><NextLink href="/about">About</NextLink></Link>
```

## Composability
- **Framework router integration via `asChild`:** `<Link asChild><NextLink href="/foo">...</NextLink></Link>` — Link's styling transfers to the child (NextLink/react-router Link/any `<a>`-like component) while preserving the child's navigation semantics. Don't use `asChild` for plain anchors — it's unnecessary and adds a layer.
- **inline vs block:** Default `inline` (display: inline) so Link composes naturally inside paragraphs and mixed text. Set `inline={false}` for full-width link regions (card wrappers, list items).
- No context, no cascade. Safe to use anywhere.
- For icon + text links, nest Icon inside — Link doesn't auto-size via IconProvider (unlike Button), so pass an explicit `size` to the Icon.

## Gotchas
- Use asChild with framework-specific Link components (e.g. Next.js Link)
- Don't nest interactive elements (buttons, form controls) inside a Link — that's invalid HTML and breaks screen-reader navigation

## Changes
### v0.18.0
- **Fixed** Color tokens — `text-info-9` changed to `text-accent-11` (links are interactive = accent scale)

### v0.1.0
- **Added** Initial release
