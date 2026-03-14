# Container

- Import: @devalok/shilp-sutra/ui/container
- Server-safe: Yes
- Category: ui

## Props
    maxWidth: "default" | "body" | "full"
    as: ElementType (default: "div")

## Defaults
    maxWidth="default"

## Example
```jsx
<Container maxWidth="body">
  <p>Centered content</p>
</Container>
```

## Gotchas
- Server-safe component — can be imported directly in Next.js Server Components

## Changes
### v0.1.0
- **Added** Initial release
