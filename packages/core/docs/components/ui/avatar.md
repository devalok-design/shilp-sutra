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
- AvatarFallback font size scales automatically with avatar size (via AvatarSizeContext)
- Ring offset color matches the surface context — ensure it sits on the expected background
- Badge is hidden when value is `0` (falsy); use `"dot"` for presence without a count
- Online status dot pulses with a CSS animation

## Changes
### v0.22.3
- **Fixed** AvatarFallback text now auto-scales with avatar size — xs gets `text-[9px]`, sm `text-ds-xs`, md `text-ds-sm`, lg `text-ds-md`, xl `text-ds-lg`

### v0.22.0
- **Fixed** Fallback always rendered `rounded-ds-full` regardless of `shape` prop. Now uses `AvatarShapeContext` to inherit the correct border-radius from `shape="square"` or `shape="rounded"`.

### v0.21.0
- **Added** `ring` prop with semantic role colors (`lead`, `admin`, `client`)
- **Added** `badge` prop for numeric, dot, or custom ReactNode overlay at top-right
- **Added** `loading` prop for skeleton shimmer placeholder state
- **Added** `AvatarFallback.colorSeed` for deterministic fallback background colors

### v0.1.0
- **Added** Initial release with CVA size variants (xs-xl) and status indicator badge
