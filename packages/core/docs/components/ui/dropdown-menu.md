# DropdownMenu

- Import: @devalok/shilp-sutra/ui/dropdown-menu
- Server-safe: No
- Category: ui

## Compound Components
    DropdownMenu (root)
      DropdownMenuTrigger
      DropdownMenuContent
        DropdownMenuLabel
        DropdownMenuSeparator
        DropdownMenuItem (+ DropdownMenuShortcut for keyboard hints)
        DropdownMenuCheckboxItem
        DropdownMenuRadioGroup > DropdownMenuRadioItem
        DropdownMenuGroup
        DropdownMenuSub > DropdownMenuSubTrigger, DropdownMenuSubContent

## Defaults
    none

## Example
```jsx
<DropdownMenu>
  <DropdownMenuTrigger asChild><Button variant="ghost">Menu</Button></DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Logout</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

## Gotchas
- Use `asChild` on DropdownMenuTrigger to render your own button element

## Changes
### v0.18.0
- **Added** `DropdownMenuContentProps`, `DropdownMenuItemProps` type exports

### v0.14.0
- **Changed** z-index promoted from `z-dropdown` (1000) to `z-popover` (1400) — fixes dropdown rendering behind Sheet/Dialog overlays

### v0.1.0
- **Added** Initial release
