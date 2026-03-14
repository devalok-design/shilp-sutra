# Menubar

- Import: @devalok/shilp-sutra/ui/menubar
- Server-safe: No
- Category: ui

## Compound Components
    Menubar (root)
      MenubarMenu
        MenubarTrigger
        MenubarContent
          MenubarItem (+ MenubarShortcut)
          MenubarCheckboxItem
          MenubarRadioGroup > MenubarRadioItem
          MenubarLabel
          MenubarSeparator
          MenubarSub > MenubarSubTrigger, MenubarSubContent

## Example
```jsx
<Menubar>
  <MenubarMenu>
    <MenubarTrigger>File</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>New<MenubarShortcut>Ctrl+N</MenubarShortcut></MenubarItem>
      <MenubarSeparator />
      <MenubarItem>Exit</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</Menubar>
```

## Gotchas
- Follows the standard Radix Menubar compound pattern

## Changes
### v0.18.0
- **Added** `MenubarContentProps`, `MenubarItemProps` type exports

### v0.14.0
- **Changed** z-index promoted from `z-dropdown` (1000) to `z-popover` (1400) — fixes content rendering behind Sheet/Dialog overlays

### v0.1.0
- **Added** Initial release
