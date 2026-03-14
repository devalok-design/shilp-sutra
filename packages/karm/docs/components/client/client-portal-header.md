# ClientPortalHeader

- Import: @devalok/shilp-sutra-karm/client
- Server-safe: No
- Category: client

## Props
    orgName: string (REQUIRED)
    orgLogo: string | null
    userName: string (REQUIRED)
    userAvatar: string | null
    children: ReactNode
    className: string

## Defaults
    (no prop defaults)

## Example
```jsx
<ClientPortalHeader
  orgName="Acme Corp"
  orgLogo="/logos/acme.png"
  userName="Jane Doe"
  userAvatar="/avatars/jane.jpg"
>
  <Button variant="ghost" size="sm">Settings</Button>
</ClientPortalHeader>
```

## Gotchas
- Renders a <header> element — extends React.HTMLAttributes<HTMLElement>
- If orgLogo is null/undefined, shows a fallback with the first two initials of orgName on an accent background
- If userAvatar is null/undefined, shows an Avatar fallback with the first two initials of userName
- children are rendered between the org branding (left) and user avatar (right) — use this slot for action buttons or navigation
- The user's full name is hidden on small screens (shown only on sm: and above)
- Fixed height of h-ds-lg with bottom border

## Changes
### v0.18.0
- **Added** Initial release
