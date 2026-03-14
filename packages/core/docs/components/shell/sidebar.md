# AppSidebar

- Import: @devalok/shilp-sutra/shell/sidebar
- Server-safe: No
- Category: shell

## Props
    currentPath?: string (highlights active nav item)
    user?: SidebarUser | null — { name, email?, image?, designation?, role? }
    navGroups?: NavGroup[] — { label: string, items: NavItem[], action?: ReactNode }
    logo?: ReactNode
    footerLinks?: Array<{ label: string, href: string }> (DEPRECATED — use footer.links)
    footer?: SidebarFooterConfig — structured footer (takes precedence over footerLinks)
    headerSlot?: ReactNode — content between user info and navigation
    preFooterSlot?: ReactNode — content between navigation and footer
    preFooterClassName?: string — className on preFooterSlot wrapper div
    renderItem?: (item: NavItem, defaultRender: () => ReactNode) => ReactNode | null — custom item rendering
    className?: string

NavItem: { title: string, href: string, icon: ReactNode, exact?: boolean, badge?: string | number, children?: NavSubItem[], defaultOpen?: boolean }
NavSubItem: { title: string, href: string, icon?: ReactNode, exact?: boolean }
NavGroup: { label: string, items: NavItem[], action?: ReactNode }
SidebarUser: { name: string, email?: string, image?: string | null, designation?: string, role?: string }
SidebarFooterConfig: { links: Array<{ label: string, href: string }>, version: string | { label: string, href: string }, slot: ReactNode, promo: SidebarPromo }
SidebarPromo: { text: string, icon?: ReactNode, action?: { label: string, href?: string, onClick?: () => void }, onDismiss?: () => void }

## Defaults
    None

## Example
```jsx
<AppSidebar
  currentPath="/dashboard"
  user={{ name: 'Jane', email: 'jane@example.com' }}
  navGroups={[{
    label: 'Main',
    items: [
      { title: 'Dashboard', href: '/dashboard', icon: <IconHome /> },
      { title: 'Projects', href: '/projects', icon: <IconFolder />, children: [
        { title: 'Karm V2', href: '/projects/abc/board' },
      ]},
    ],
  }]}
  footer={{
    links: [{ label: 'Terms', href: '/terms' }],
    version: { label: 'v2.4.1', href: '/changelog' },
  }}
/>
```

## Gotchas
- Must be wrapped in SidebarProvider (from ui/sidebar)
- Requires LinkProvider for framework-specific link components
- `footerLinks` is deprecated — use `footer.links` instead
- `renderItem` returning `null` falls back to default rendering
- Collapsible nav items auto-open when a child is active (matching `currentPath`)
- Badge numbers > 99 display as "99+"

## Changes
### v0.18.0
- **Fixed** `bg-interactive-subtle` changed to `bg-accent-2` (OKLCH migration)

### v0.16.0
- **Added** `preFooterClassName?: string` — custom className on preFooterSlot wrapper

### v0.14.0
- **Changed** `footer.version` now accepts `string | { label: string; href: string }` — version can link to changelog

### v0.13.0
- **Added** `SidebarPromo` type and `footer.promo` prop — dismissable promo/upsell banner
- **Changed** Footer links and version now render on a single line separated by dividers
- **Fixed** Collapsible chevron wrapped in fixed-height container to prevent drift
- **Fixed** Collapsible chevron no longer drifts into child elements when sub-list expands

### v0.10.0
- **Added** Collapsible nav items with `children` array and `NavSubItem` type
- **Added** Nav item `badge` prop for counts/labels, caps at 99+
- **Added** Nav group `action` prop for buttons next to group labels
- **Added** Structured `footer` prop with `SidebarFooterConfig` — links, version, slot
- **Added** `headerSlot` and `preFooterSlot` content slots
- **Added** `renderItem` escape hatch for custom item rendering
- **Deprecated** `footerLinks` prop — use `footer.links` instead

### v0.1.1
- **Changed** Decoupled from Next.js via LinkProvider

### v0.1.0
- **Added** Initial release
