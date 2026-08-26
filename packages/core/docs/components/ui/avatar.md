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

## Composability
- **Two internal contexts cascade to AvatarFallback:**
  - `AvatarSizeContext` — carries the Avatar's `size` so AvatarFallback's font size scales without re-specifying (xs → `text-[9px]`, sm → `text-ds-xs`, md → `text-ds-sm`, lg → `text-ds-md`, xl → `text-ds-lg`)
  - `AvatarShapeContext` — carries `shape` so AvatarFallback inherits the same border-radius (critical for `shape="square"` / `shape="rounded"` — without context the fallback would always be `rounded-ds-full` regardless of parent)
- **Status + Ring + Badge are independent** — you can stack all three on one Avatar. They render in separate layers so they don't conflict visually.
- **Use with AvatarGroup:** AvatarGroup applies its own `size` to children. If your Avatar has an explicit `size`, it overrides AvatarGroup's default — keep it consistent across the group.
- **AvatarFallback colorSeed:** Deterministic background color from the seed string — identical user IDs produce identical backgrounds across renders. Useful for user-identifying avatars without photos.
- **Ring offset color:** The ring renders with `ring-offset` matching the current surface — it assumes the Avatar sits on `bg-surface-panel`. On other backgrounds, add a ring-offset className to compensate.

## Gotchas
- Status dot renders with role="img" and aria-label (accessible, not decorative)
- Dot size scales automatically with avatar size
- AvatarFallback font size scales automatically with avatar size (via AvatarSizeContext)
- AvatarFallback shape inherits from Avatar (via AvatarShapeContext) — setting `rounded-*` on AvatarFallback directly conflicts with the context
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
