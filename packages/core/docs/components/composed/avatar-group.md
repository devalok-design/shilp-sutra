# AvatarGroup

- Import: @devalok/shilp-sutra/composed/avatar-group
- Server-safe: No
- Category: composed

## Props
    users: AvatarUser[] (REQUIRED) — { name: string, image?: string | null, ring?: AvatarRing }
    max: number (default: 4, overflow shows "+N" badge)
    size: "xs" | "sm" | "md" | "lg" | "xl"
    showTooltip: boolean (default: true)
    borderColor: "surface-base" | "surface-raised" (default: "surface-raised") — overlap border color
    onOverflowClick: () => void — makes the "+N" badge interactive (button)
    renderAvatar: (user: AvatarUser, index: number) => ReactNode — custom avatar render
    expandDirection: "left" | "right" (default: "right") — direction group expands on hover
    expandAmount: "compact" | "default" | "wide" (default: "default") — how far group spreads

## AvatarUser Type
    name: string (REQUIRED)
    image?: string | null
    ring?: "none" | "lead" | "admin" | "client" — role ring per user in group
    indicator?: "lead" | "admin" | ReactNode — small dot indicator at top-right of avatar

## Defaults
    size="md", max=4, showTooltip=true, borderColor="surface-raised", expandDirection="right", expandAmount="default"

## Example
```jsx
<AvatarGroup
  users={[
    { name: 'Alice', image: '/alice.jpg', ring: 'lead' },
    { name: 'Bob', ring: 'admin' },
  ]}
  max={3}
  size="md"
  borderColor="surface-base"
  onOverflowClick={() => setShowAll(true)}
/>
```

## Gotchas
- Wraps TooltipProvider internally — no need to add one yourself
- Users beyond `max` are collapsed into a "+N" overflow badge
- Missing `image` falls back to initials derived from `name`
- Hover expand animation uses CSS `group-hover` — parent must not clip overflow
- `borderColor` should match the surface the group sits on (`surface-base` on page bg, `surface-raised` on cards)
- `renderAvatar` wrapper is positioning-only — pass `size` directly to your Avatar (do NOT use `className="h-full w-full"`)

## Changes
### v0.29.0
- **Added** `indicator` prop on AvatarUser: `"lead"` (warning dot) | `"admin"` (accent dot) | ReactNode (custom indicator) — animated dot at the top-right corner of each avatar

### v0.22.3
- **Fixed** `renderAvatar` wrapper no longer clips consumer Avatar content (removed overflow-hidden, border, and size classes from wrapper)
- **Fixed** Removed redundant text-size classes from wrapper — Avatar handles font scaling internally

### v0.21.0
- **Added** `xs` and `xl` size variants
- **Added** `borderColor` prop for overlap border matching surface context
- **Added** `onOverflowClick` prop making the overflow badge an interactive button
- **Added** `renderAvatar` prop for custom per-avatar rendering
- **Added** `AvatarUser.ring` field for per-user role rings in groups

### v0.1.0
- **Added** Initial release
