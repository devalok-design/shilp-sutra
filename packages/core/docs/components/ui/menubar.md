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

## Composability
- Radix Menubar — shares the item-variant vocabulary with DropdownMenu and ContextMenu (checkbox items, radio groups, sub-menus, labels, separators, shortcuts).
- **Key difference from DropdownMenu:** Menubar is the horizontal top-bar-menu pattern (File / Edit / View / Help). Multiple MenubarMenu children sit side-by-side at the root; opening one closes the others, and arrow keys move between them.
- **Typical use:** Desktop app-like UIs where the menu is always visible at the top (code editors, design tools). For a single collapsed trigger, use DropdownMenu instead.
- **Controlled open:** Pass `value` + `onValueChange` to Menubar root to control which MenubarMenu is open (value = menu's `value` prop or falsy for none).
- **Portal + z-index:** z-popover (1400).

## Gotchas
- Follows the standard Radix Menubar compound pattern
- Don't use Menubar for a single dropdown — use DropdownMenu instead
- MenubarShortcut is decorative (same as DropdownMenuShortcut) — bind shortcuts separately

## Changes
### v0.18.0
- **Added** `MenubarContentProps`, `MenubarItemProps` type exports

### v0.14.0
- **Changed** z-index promoted from `z-dropdown` (1000) to `z-popover` (1400) — fixes content rendering behind Sheet/Dialog overlays

### v0.1.0
- **Added** Initial release
