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

## Gotchas
- Uses Framer Motion for enter/exit animations (v0.18.0)

## Changes
### v0.18.0
- **Changed** Migrated to Framer Motion for enter/exit animations
- **Added** `NavigationMenuProps`, `NavigationMenuContentProps` type exports

### v0.1.1
- **Fixed** Token compliance — icon sizes replaced with `h-ico-sm w-ico-sm`

### v0.1.0
- **Added** Initial release
