# AvatarGroup

- Import: @devalok/shilp-sutra/composed/avatar-group
- Server-safe: No
- Category: composed

## Props
    users: AvatarUser[] (REQUIRED) — { name: string, image?: string | null, ring?: AvatarRing }
    max: number (default: 4, overflow shows "+N" badge)
    size: "xs" | "sm" | "md" | "lg" | "xl"
    showTooltip: boolean (default: true)
    borderColor: "surface-1" | "surface-2" (default: "surface-2") — overlap border color
    onOverflowClick: () => void — makes the "+N" badge interactive (button)
    overflowContent: ReactNode — popover content shown on overflow click
    renderAvatar: (user: AvatarUser, index: number) => ReactNode — custom avatar render

## AvatarUser Type
    name: string (REQUIRED)
    image?: string | null
    ring?: "none" | "lead" | "admin" | "client" — role ring per user in group

## Defaults
    size="md", max=4, showTooltip=true, borderColor="surface-2"

## Example
```jsx
<AvatarGroup
  users={[
    { name: 'Alice', image: '/alice.jpg', ring: 'lead' },
    { name: 'Bob', ring: 'admin' },
  ]}
  max={3}
  size="md"
  borderColor="surface-1"
  onOverflowClick={() => setShowAll(true)}
/>
```

## Gotchas
- Wraps TooltipProvider internally — no need to add one yourself
- Users beyond `max` are collapsed into a "+N" overflow badge
- Missing `image` falls back to initials derived from `name`
- Hover expand animation uses CSS `group-hover` — parent must not clip overflow
- `borderColor` should match the surface context the group sits on (e.g., `surface-1` on cards)

## Changes
### v0.21.0
- **Added** `xs` and `xl` size variants
- **Added** `borderColor` prop for overlap border matching surface context
- **Added** `onOverflowClick` prop making the overflow badge an interactive button
- **Added** `overflowContent` prop for popover content on overflow click
- **Added** `renderAvatar` prop for custom per-avatar rendering
- **Added** `AvatarUser.ring` field for per-user role rings in groups

### v0.1.0
- **Added** Initial release
