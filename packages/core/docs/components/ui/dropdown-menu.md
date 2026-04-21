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

## Composability
- Radix DropdownMenu underneath — same prop surface (`open`, `onOpenChange`, `defaultOpen`, `modal`).
- **Item variants** stack cleanly: `DropdownMenuCheckboxItem` for multi-select toggles, `DropdownMenuRadioGroup` + `DropdownMenuRadioItem` for single-select, `DropdownMenuSub` + `DropdownMenuSubTrigger/SubContent` for nested submenus. Each has its own keyboard model pre-wired.
- **Keyboard:** Arrow keys navigate items, Enter/Space activates, Esc closes, typeahead jumps to first letter. All handled by Radix — don't re-implement.
- **Trigger:** `<DropdownMenuTrigger asChild>` around any button. IconButton is the common pairing.
- **Shortcut hints:** `<DropdownMenuShortcut>` inside an item renders a right-aligned `⌘K`-style kbd. Visual only — does NOT bind the shortcut globally.
- **Closing from a handler:** Item onSelect auto-closes the menu by default. Pass `event.preventDefault()` inside the handler to keep it open (e.g. for checkbox items that shouldn't close on toggle).

## Gotchas
- Use `asChild` on DropdownMenuTrigger to render your own button element
- DropdownMenuShortcut is decorative — bind keyboard shortcuts separately (e.g. with `useHotkeys`)
- Sub-menus need BOTH DropdownMenuSubTrigger (visible item) and DropdownMenuSubContent (the submenu panel) — missing either silently breaks the hover-open behavior

## Changes
### v0.22.0
- **Added** Hover state on `DropdownMenuItem` — was completely missing. Items now show `bg-surface-3` on hover with `ease-productive-standard` transition.

### v0.18.0
- **Added** `DropdownMenuContentProps`, `DropdownMenuItemProps` type exports

### v0.14.0
- **Changed** z-index promoted from `z-dropdown` (1000) to `z-popover` (1400) — fixes dropdown rendering behind Sheet/Dialog overlays

### v0.1.0
- **Added** Initial release
