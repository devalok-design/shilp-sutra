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

## Composability
- Radix AspectRatio primitive — pure layout wrapper, no context, no cascade.
- **Child fill pattern:** Its child is absolutely positioned to fill. Pair with `object-cover` / `object-contain` on `<img>`/`<video>` and `w-full h-full` for anything else.
- Useful as a responsive-image container, a chart area (pair with Chart components), or a placeholder frame for media skeletons.
- Works inside Card, any layout component, or flex/grid containers — nothing to configure.

## Gotchas
- ratio is a number, not a string — use `16/9` not `"16/9"`
- The child must be size-fluid (`w-full h-full` or absolutely positioned) — elements with intrinsic size escape the aspect-ratio box

## Changes
### v0.1.0
- **Added** Initial release
