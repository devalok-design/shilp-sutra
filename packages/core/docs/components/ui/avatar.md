# Avatar

- Import: @devalok/shilp-sutra/ui/avatar
- Server-safe: No
- Category: ui

## Props
    size: "xs" | "sm" | "md" | "lg" | "xl"
    shape: "circle" | "square" | "rounded"
    status: "online" | "offline" | "busy" | "away"
    ring: "none" | "lead" | "admin" | "client" (default: "none") — Role ring with semantic colors
    badge: number | "dot" | ReactNode — Badge overlay at top-right
    loading: boolean (default: false) — Skeleton shimmer state

## Compound Components
    Avatar (root with size/shape/status/ring/badge/loading)
      AvatarImage (src, alt)
      AvatarFallback (children = initials text, colorSeed?: string)

## AvatarFallback Props
    colorSeed: string — Deterministic color seed for consistent background color across renders

## Defaults
    size="md", shape="circle", ring="none", loading=false

## Example
```jsx
<Avatar size="lg" status="online" ring="lead" badge={3}>
  <AvatarImage src={user.photoUrl} alt={user.name} />
  <AvatarFallback colorSeed={user.id}>JD</AvatarFallback>
</Avatar>
```

## Gotchas
- Status dot renders with role="img" and aria-label (accessible, not decorative)
- Dot size scales automatically with avatar size
- Ring offset color matches the surface context — ensure it sits on the expected background
- Badge is hidden when value is `0` (falsy); use `"dot"` for presence without a count
- Online status dot pulses with a CSS animation

## Changes
### v0.21.0
- **Added** `ring` prop with semantic role colors (`lead`, `admin`, `client`)
- **Added** `badge` prop for numeric, dot, or custom ReactNode overlay at top-right
- **Added** `loading` prop for skeleton shimmer placeholder state
- **Added** `AvatarFallback.colorSeed` for deterministic fallback background colors

### v0.1.0
- **Added** Initial release with CVA size variants (xs-xl) and status indicator badge
