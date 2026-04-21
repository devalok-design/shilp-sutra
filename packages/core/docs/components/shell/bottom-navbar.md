# BottomNavbar

- Import: @devalok/shilp-sutra/shell/bottom-navbar
- Server-safe: No
- Category: shell

## Props
    currentPath?: string (optional)
    user?: BottomNavbarUser | null (optional)
    primaryItems?: BottomNavItem[] (max 4 recommended, optional)
    moreItems?: BottomNavItem[] (overflow items in "More" menu, optional)
    className?: string

BottomNavItem: { title: string, href: string, icon: ReactNode, exact?: boolean, badge?: number }
BottomNavbarUser: { name: string, role?: string }

## Defaults
    None

## Example
```jsx
<BottomNavbar
  currentPath="/dashboard"
  primaryItems={[
    { title: 'Home', href: '/', icon: <IconHome /> },
    { title: 'Tasks', href: '/tasks', icon: <IconChecklist /> },
  ]}
/>
```

## Composability
- **Mobile-only bottom nav** — fixed to bottom of viewport. Desktop should use AppSidebar instead.
- **Responsive switch pattern:** Use `useIsMobile()` hook to conditionally render AppSidebar (desktop) or BottomNavbar (mobile). Example:
  ```jsx
  const isMobile = useIsMobile()
  return isMobile ? <BottomNavbar ... /> : <AppSidebar ... />
  ```
- **Primary vs overflow:** `primaryItems` (max 4) for the always-visible slots; `moreItems` go into a "More" sheet that opens on tap. Don't exceed 4 primary — the bar becomes cramped.
- **Router integration via LinkProvider:** Each nav item is rendered using the framework-specific Link component registered in LinkProvider. Without LinkProvider, you get full-page reloads on tap.
- **Badge numbers** cap at 99+ (same as BadgeIndicator pattern).
- **Not for desktop:** The viewport-fixed positioning + touch-optimized sizing don't translate well to desktop. Hide behind `md:hidden`.

## Gotchas
- Designed for mobile viewports — fixed to bottom of screen
- Max 4 `primaryItems` recommended; overflow goes in `moreItems` shown in a "More" sheet
- Use with `useIsMobile()` hook to conditionally render instead of AppSidebar
- Requires LinkProvider for framework-specific link components (e.g., Next.js Link)

## Changes
### v0.19.0
- **Changed** Background elevated from `bg-surface-1` to `bg-surface-2` for visual hierarchy above app background
- **Changed** "More" menu and interactive items bumped accordingly

### v0.18.0
- **Fixed** Removed incorrect `role="button"` and `tabIndex` from overlay

### v0.16.0
- **Added** `badge?: number` on `BottomNavItem` — notification count badge (red dot, 99+ cap)

### v0.1.1
- **Changed** Decoupled from Next.js via LinkProvider

### v0.1.0
- **Added** Initial release
