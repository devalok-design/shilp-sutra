# TopBar

- Import: @devalok/shilp-sutra/shell/top-bar
- Server-safe: No
- Category: shell

## Overview

Composition-based application top bar. Uses dot-notation subcomponents for flexible layout.

## Subcomponents

| Component | Purpose |
|-----------|---------|
| `TopBar` | Root — bg-surface-2, border-b, sticky. Auto-switches to grid when Center is present. |
| `TopBar.Left` | Left zone — sidebar trigger, title, breadcrumbs |
| `TopBar.Center` | Optional center zone — search bar, tabs. Triggers 3-column grid layout. |
| `TopBar.Right` | Right zone — action buttons, user menu. Gets ml-auto in flex mode. |
| `TopBar.Section` | Groups items with configurable gap |
| `TopBar.IconButton` | Circular icon button with tooltip (bg-surface-3, hover:bg-surface-4) |
| `TopBar.Title` | Page title heading, hidden on mobile |
| `TopBar.UserMenu` | Avatar dropdown with color mode toggle, profile, logout |

## Props

### TopBar (root)
    children: ReactNode
    className?: string

### TopBar.Left / TopBar.Center / TopBar.Right
    children: ReactNode
    className?: string

### TopBar.Section
    gap?: "tight" | "default" | "loose" (default: "default")
    children: ReactNode
    className?: string

Gap values: tight = gap-ds-02, default = gap-ds-04, loose = gap-ds-06

### TopBar.IconButton
    icon: ReactNode
    tooltip: string
    ...ButtonHTMLAttributes

### TopBar.Title
    children: ReactNode
    className?: string

### TopBar.UserMenu
    user: TopBarUser — { name, email?, image? }
    onNavigate?: (path: string) => void
    onLogout?: () => void
    userMenuItems?: UserMenuItem[]
    className?: string

TopBarUser: { name: string, email?: string, image?: string | null }
UserMenuItem: { label: string, icon?: ReactNode, href?: string, onClick?: () => void, separator?: boolean, color?: string, badge?: string | boolean, disabled?: boolean }

UserMenuItem fields:
- href — navigates via onNavigate callback
- onClick — custom action (takes precedence over href)
- separator — renders a DropdownMenuSeparator before this item
- color — semantic text color (e.g. "error" for text-error)
- badge — string for count badge, true for dot indicator
- disabled — greys out the item

## Example

### Two-zone (standard)
```jsx
<TopBar>
  <TopBar.Left>
    <SidebarTrigger />
    <TopBar.Title>Dashboard</TopBar.Title>
  </TopBar.Left>
  <TopBar.Right>
    <TopBar.Section gap="tight">
      <TopBar.IconButton icon={<IconSearch />} tooltip="Search (Ctrl+K)" onClick={openSearch} />
      <NotificationCenter notifications={notifications} />
      <TopBar.IconButton icon={<IconSparkles />} tooltip="AI Chat" onClick={openAI} />
    </TopBar.Section>
    <TopBar.UserMenu
      user={{ name: 'John', email: 'john@example.com' }}
      onNavigate={(p) => router.push(p)}
      onLogout={handleLogout}
      userMenuItems={[
        { label: 'Changelog', icon: <IconNews />, href: '/changelog', badge: '3' },
      ]}
    />
  </TopBar.Right>
</TopBar>
```

### Three-zone (centered search bar)
```jsx
<TopBar>
  <TopBar.Left>
    <SidebarTrigger />
    <TopBar.Title>Dashboard</TopBar.Title>
  </TopBar.Left>
  <TopBar.Center>
    <SearchBarTrigger />
  </TopBar.Center>
  <TopBar.Right>
    <TopBar.Section gap="tight">
      <TopBar.IconButton icon={<IconBell />} tooltip="Notifications" onClick={fn} />
    </TopBar.Section>
    <TopBar.UserMenu user={user} onLogout={logout} />
  </TopBar.Right>
</TopBar>
```

## Gotchas
- Without `TopBar.Center`, layout is flex (two-zone). With it, layout switches to CSS grid `1fr auto 1fr` for true centering.
- `TopBar.IconButton` renders any number of action buttons — no artificial limit. Use responsive hiding (`className="hidden md:flex"`) for mobile.
- `TopBar.UserMenu` includes Profile link, color mode toggle, and logout automatically. `userMenuItems` are inserted between Profile and the toggle.
- Requires SidebarProvider wrapper for SidebarTrigger to work.

## Changes
### v0.19.0
- **BREAKING** Rewritten as composition API. Old props-based API removed (`pageTitle`, `onSearchClick`, `onAiChatClick`, `notificationSlot`, `mobileLogo` props).
- **Added** `TopBar.Left`, `TopBar.Center`, `TopBar.Right` zone components
- **Added** `TopBar.Section` with `gap` prop (`tight` | `default` | `loose`)
- **Added** `TopBar.IconButton` — reusable circular icon button with tooltip
- **Added** `TopBar.Title` — responsive page title (hidden on mobile)
- **Added** `TopBar.UserMenu` — extracted user dropdown as standalone subcomponent
- **Added** Auto grid/flex layout detection based on Center zone presence
- **Changed** Background elevated from `bg-surface-1` to `bg-surface-2`

### v0.7.0
- **Added** `userMenuItems` prop for custom dropdown items

### v0.1.1
- **Changed** Decoupled from Next.js via LinkProvider
- **Fixed** Added `aria-label` to search/AI buttons
- **Fixed** Added `type="button"` to search/AI/avatar buttons to prevent form submission

### v0.1.0
- **Added** Initial release
