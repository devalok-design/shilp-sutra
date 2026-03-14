# TopBar v2 — Composition-based Design

**Date:** 2026-03-14
**Status:** Approved

## Problem

The current TopBar hardcodes search, AI chat, and notification buttons as individual props (`onSearchClick`, `onAiChatClick`, `notificationSlot`). This is rigid — every new button requires a new prop, and consumers can't control spacing or grouping.

## Design

Replace the props-driven TopBar with a composition-based API using dot-notation subcomponents.

### Subcomponents

| Component | Purpose |
|-----------|---------|
| `TopBar` | Root — `bg-surface-2`, border-b, flex/grid, sticky |
| `TopBar.Left` | Left zone — sidebar trigger, title, breadcrumbs |
| `TopBar.Center` | Optional center zone — search bar, tabs |
| `TopBar.Right` | Right zone — action buttons, user menu |
| `TopBar.Section` | Groups items with configurable gap (`tight`/`default`/`loose`) |
| `TopBar.IconButton` | Circular icon button with tooltip |
| `TopBar.Title` | Page title with responsive desktop-only display |
| `TopBar.UserMenu` | Avatar + dropdown (extracts current user menu logic) |

### Layout

- **Without Center:** Flex with `ml-auto` on Right (two-zone)
- **With Center:** CSS grid `1fr auto 1fr` so center is truly centered

### Gap values (TopBar.Section)

- `tight` — `gap-ds-02`
- `default` — `gap-ds-04`
- `loose` — `gap-ds-06`

### Example usage

```tsx
<TopBar>
  <TopBar.Left>
    <SidebarTrigger />
    <TopBar.Title>Dashboard</TopBar.Title>
  </TopBar.Left>
  <TopBar.Right>
    <TopBar.Section gap="tight">
      <TopBar.IconButton icon={<IconSearch />} tooltip="Search" onClick={fn} />
      <TopBar.IconButton icon={<IconBell />} tooltip="Notifications" onClick={fn} />
    </TopBar.Section>
    <TopBar.UserMenu user={user} onLogout={logout} />
  </TopBar.Right>
</TopBar>
```

### Breaking change

Removes: `pageTitle`, `onSearchClick`, `onAiChatClick`, `notificationSlot`, `mobileLogo` props.
Consumers compose these directly using subcomponents instead.
`TopBar.UserMenu` preserves `userMenuItems`, color mode toggle, and logout behavior.

### No icon button limit

Consumers render as many `TopBar.IconButton` as needed. Responsive hiding is handled via className (`hidden md:flex`).
