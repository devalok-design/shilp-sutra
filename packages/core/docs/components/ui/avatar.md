# Avatar

- Import: @devalok/shilp-sutra/ui/avatar
- Server-safe: No
- Category: ui

## Props
    size: "xs" | "sm" | "md" | "lg" | "xl"
    shape: "circle" | "square" | "rounded"
    status: "online" | "offline" | "busy" | "away"

## Compound Components
    Avatar (root with size/shape/status)
      AvatarImage (src, alt)
      AvatarFallback (children = initials text)

## Defaults
    size="md", shape="circle"

## Example
```jsx
<Avatar size="lg" status="online">
  <AvatarImage src={user.photoUrl} alt={user.name} />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>
```

## Gotchas
- Status dot renders with role="img" and aria-label (accessible, not decorative)
- Dot size scales automatically with avatar size

## Changes
### v0.1.0
- **Added** Initial release with CVA size variants (xs-xl) and status indicator badge
