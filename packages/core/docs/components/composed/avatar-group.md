# AvatarGroup

- Import: @devalok/shilp-sutra/composed/avatar-group
- Server-safe: No
- Category: composed

## Props
    users: AvatarUser[] (REQUIRED) — { name: string, image?: string | null }
    max: number (default: 4, overflow shows "+N" badge)
    size: "sm" | "md" | "lg"
    showTooltip: boolean (default: true)

## Defaults
    size="md", max=4, showTooltip=true

## Example
```jsx
<AvatarGroup
  users={[{ name: 'Alice', image: '/alice.jpg' }, { name: 'Bob' }]}
  max={3}
  size="md"
/>
```

## Gotchas
- Wraps TooltipProvider internally — no need to add one yourself
- Users beyond `max` are collapsed into a "+N" overflow badge
- Missing `image` falls back to initials derived from `name`

## Changes
### v0.1.0
- **Added** Initial release
