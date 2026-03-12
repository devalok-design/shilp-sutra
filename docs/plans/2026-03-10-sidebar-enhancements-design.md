# AppSidebar Enhancements Design (S9–S14)

**Date:** 2026-03-10
**Source:** Karm V2 sidebar feature request
**Version:** 0.10.0 (minor, no breaking changes)

---

## Problem

Karm replaced `AppSidebar` entirely with ~150 lines of raw sidebar primitives because the props-driven API lacks common patterns: collapsible sub-items, badges, group actions, content slots, and structured footers. All the underlying primitives exist (`SidebarMenuSub`, `SidebarMenuBadge`, `SidebarGroupAction`, `Collapsible`) — they just aren't wired into the shell component.

## Scope

6 features, all additive (no breaking changes):

| # | Feature | Priority |
|---|---------|----------|
| S9 | Collapsible nav items with `children` | High |
| S13 | Named content slots (`headerSlot`, `preFooterSlot`) | High |
| S10 | Nav item `badge` | Medium |
| S11 | Nav group `action` button | Medium |
| S12 | Structured sidebar `footer` | Medium |
| S14 | `renderItem` escape hatch | Low |

## Type Definitions

```ts
export interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  exact?: boolean
  children?: NavSubItem[]     // S9
  defaultOpen?: boolean        // S9
  badge?: string | number      // S10
}

export interface NavSubItem {
  title: string
  href: string
  icon?: React.ReactNode
  exact?: boolean
}

export interface NavGroup {
  label: string
  items: NavItem[]
  action?: React.ReactNode     // S11
}

export interface SidebarFooterConfig {
  links?: Array<{ label: string; href: string }>
  version?: string
  slot?: React.ReactNode
}

export interface AppSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  currentPath?: string
  user?: SidebarUser | null
  navGroups?: NavGroup[]
  logo?: React.ReactNode
  footerLinks?: Array<{ label: string; href: string }>  // deprecated
  footer?: SidebarFooterConfig    // S12
  headerSlot?: React.ReactNode    // S13
  preFooterSlot?: React.ReactNode // S13
  renderItem?: (item: NavItem, defaultRender: () => React.ReactNode) => React.ReactNode | null  // S14
}
```

## Rendering Behavior

### S9 — Collapsible nav items

- When `item.children` exists, split the `SidebarMenuButton` into two zones: main area navigates to `href`, chevron button toggles collapse
- Wrap in `Collapsible` from vendored Radix primitive
- Sub-items: `SidebarMenuSub` > `SidebarMenuSubItem` > `SidebarMenuSubButton`
- Auto-expand: `defaultOpen` OR any child's `href` matches `currentPath`
- Chevron rotates 90deg on open via CSS transition on `data-state`
- Implemented as conditional branch inside existing `NavLink` component (not a separate component)

### S10 — Badge

- When `item.badge` exists, render `SidebarMenuBadge` inside `SidebarMenuItem`
- Numbers > 99 display as "99+"
- Badge renders after the menu button

### S11 — Group action

- When `group.action` exists, wrap in `SidebarGroupAction` next to `SidebarGroupLabel`
- Consumer provides the full element

### S12 — Structured footer

- `footer` prop takes precedence over `footerLinks`
- Layout: `footer.slot` on top > `footer.links` separated by `·` > `footer.version` centered below
- Uses `SidebarFooter` primitive with token-based styling
- When only `footerLinks` is provided, falls back to current behavior

### S13 — Content slots

- `headerSlot`: after user info + separator, before `SidebarContent`. Auto-adds `SidebarSeparator` below.
- `preFooterSlot`: after `SidebarContent`, before footer. Auto-adds `SidebarSeparator` above.
- When not provided, no extra DOM rendered.

### S14 — renderItem

- Called for every nav item
- Returns `null` → default rendering; returns ReactNode → replaces default
- `defaultRender` callback returns standard `NavLink` output for wrapping/decorating

## Backwards Compatibility

- All new props optional — zero breaks
- `footerLinks` still works when `footer` absent
- Existing consumers see identical behavior
- Version: 0.10.0 (minor)

## File Changes

| File | Change |
|------|--------|
| `packages/core/src/shell/sidebar.tsx` | All 6 features — types + rendering |
| `packages/core/src/shell/sidebar.stories.tsx` | New stories per feature |
| `packages/core/src/shell/sidebar.test.tsx` | New test file |
| `packages/core/llms.txt` | Update AppSidebar API |
| `packages/core/llms-full.txt` | Update AppSidebar detailed docs |
| `CHANGELOG.md` | 0.10.0 entry |

## Testing

- Collapsible: expand/collapse behavior, auto-expand on active child, chevron rotation
- Badge: renders for string/number, 99+ cap
- Group action: renders next to label
- Footer: structured layout, backwards compat with footerLinks
- Slots: render in correct positions, no DOM when absent
- renderItem: override works, null fallback works
- Accessibility: axe checks on all new elements
