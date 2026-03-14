# TopBar

- Import: @devalok/shilp-sutra/shell/top-bar
- Server-safe: No
- Category: shell

## Props
    pageTitle: string
    user: TopBarUser | null — { name, email?, image? }
    onNavigate: (path: string) => void
    onLogout: () => void
    onSearchClick: () => void
    onAiChatClick: () => void
    mobileLogo: ReactNode
    notificationSlot: ReactNode (render NotificationCenter here)
    userMenuItems?: UserMenuItem[] — custom items between Profile and Dark/Light Mode toggle
    className: string

TopBarUser: { name: string, email?: string, image?: string | null }
UserMenuItem: { label: string, icon?: ReactNode, href?: string, onClick?: () => void, separator?: boolean, color?: string, badge?: string | boolean, disabled?: boolean }

UserMenuItem fields:
- href — navigates via onNavigate callback
- onClick — custom action (takes precedence over href)
- separator — renders a DropdownMenuSeparator before this item
- color — semantic text color (e.g. "error" for text-error)
- badge — string for count badge, true for dot indicator
- disabled — greys out the item

## Defaults
    None

## Example
```jsx
<TopBar
  pageTitle="Dashboard"
  user={{ name: 'John', email: 'john@example.com' }}
  onNavigate={(p) => router.push(p)}
  onLogout={handleLogout}
  notificationSlot={<NotificationCenter notifications={notifications} />}
  userMenuItems={[
    { label: 'Changelog', icon: <IconNews />, href: '/changelog', badge: '3' },
    { label: 'Shortcuts', icon: <IconKeyboard />, onClick: () => openModal() },
  ]}
/>
```

## Gotchas
- `notificationSlot` is where NotificationCenter should be rendered
- `userMenuItems` are inserted between the Profile link and the Dark/Light Mode toggle in the user dropdown
- Requires LinkProvider for framework-specific navigation

## Changes
### v0.7.0
- **Added** `userMenuItems` prop for custom dropdown items

### v0.1.1
- **Changed** Decoupled from Next.js via LinkProvider
- **Fixed** Added `aria-label` to search/AI buttons
- **Fixed** Added `type="button"` to search/AI/avatar buttons to prevent form submission

### v0.1.0
- **Added** Initial release
