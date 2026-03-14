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

## Gotchas
- Use asChild with framework-specific Link components (e.g. Next.js Link)

## Changes
### v0.18.0
- **Fixed** Color tokens — `text-info-9` changed to `text-accent-11` (links are interactive = accent scale)

### v0.1.0
- **Added** Initial release
