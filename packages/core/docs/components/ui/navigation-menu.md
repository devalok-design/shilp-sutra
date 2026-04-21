# NavigationMenu

- Import: @devalok/shilp-sutra/ui/navigation-menu
- Server-safe: No
- Category: ui

## Compound Components
    NavigationMenu (root)
      NavigationMenuList
        NavigationMenuItem
          NavigationMenuTrigger (for items with content panels)
          NavigationMenuContent (dropdown panel)
          NavigationMenuLink (for direct links)
      NavigationMenuIndicator
      NavigationMenuViewport

## Example
```jsx
<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Products</NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul>...</ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
    <NavigationMenuItem>
      <NavigationMenuLink href="/about">About</NavigationMenuLink>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>
```

## Composability
- **Radix NavigationMenu** underneath — keyboard model (Tab between items, Arrow for panel navigation, Esc to close) is pre-wired.
- **NavigationMenuLink vs NavigationMenuTrigger:** Use Link for simple nav items (no dropdown); use Trigger + Content for items with a panel of sub-links.
- **NavigationMenuViewport** is the animated container that holds the active Content panel — it auto-positions below the triggers. NavigationMenuIndicator is the small arrow/caret pointing from trigger to viewport.
- **Purpose:** Top-level site navigation (Products, Solutions, Resources) with rich dropdowns containing links grouped by category. Don't use for context menus (use DropdownMenu) or action toolbars (use ButtonGroup).
- **Router integration:** Use `<NavigationMenuLink asChild><NextLink href="/...">...</NextLink></NavigationMenuLink>` for framework-specific Link components.
- **Portal + z-popover (1400)** — content panels portal to body and stack above Dialog/Sheet.

## Gotchas
- Uses Framer Motion for enter/exit animations (v0.18.0)
- NavigationMenu is NOT for sidebar nav — use Sidebar; NOT for mobile nav — use Sheet or BottomNavbar

## Changes
### v0.18.0
- **Changed** Migrated to Framer Motion for enter/exit animations
- **Added** `NavigationMenuProps`, `NavigationMenuContentProps` type exports

### v0.1.1
- **Fixed** Token compliance — icon sizes replaced with `h-ico-sm w-ico-sm`

### v0.1.0
- **Added** Initial release
