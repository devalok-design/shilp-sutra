# AspectRatio

- Import: @devalok/shilp-sutra/ui/aspect-ratio
- Server-safe: No
- Category: ui

## Props
    ratio: number (e.g. 16/9, 4/3, 1)

## Defaults
    none

## Example
```jsx
<AspectRatio ratio={16 / 9}>
  <img src="/photo.jpg" alt="Photo" className="object-cover w-full h-full" />
</AspectRatio>
```

## Gotchas
- ratio is a number, not a string — use `16/9` not `"16/9"`

## Changes
### v0.1.0
- **Added** Initial release
