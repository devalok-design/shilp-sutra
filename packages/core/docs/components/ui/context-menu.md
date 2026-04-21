# ContextMenu

- Import: @devalok/shilp-sutra/ui/context-menu
- Server-safe: No
- Category: ui

## Compound Components
    ContextMenu (root)
      ContextMenuTrigger (right-click target)
      ContextMenuContent
        ContextMenuItem
        ContextMenuCheckboxItem
        ContextMenuRadioGroup > ContextMenuRadioItem
        ContextMenuLabel
        ContextMenuSeparator
        ContextMenuSub > ContextMenuSubTrigger, ContextMenuSubContent

## Defaults
    none

## Example
```jsx
<ContextMenu>
  <ContextMenuTrigger>Right-click me</ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem>Edit</ContextMenuItem>
    <ContextMenuItem>Delete</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>
```

## Composability
- Radix ContextMenu — same item-variant surface as DropdownMenu (checkbox, radio group, sub-menus, label, separator) with the same keyboard model. Swap `Dropdown` → `Context` in imports and everything behaves the same.
- **Trigger is not a button** — ContextMenuTrigger is a wrapper element (defaults to `<div>`) that listens for `contextmenu` events on itself and children. Use `asChild` to pass styling to your own element.
- **Touch support:** Radix maps long-press to right-click. On mobile, hold-to-open just works without extra code.
- **No visible trigger affordance** — unlike DropdownMenu/Popover, the user has to *know* the element is right-clickable. Pair with a visible hint (keyboard shortcut label, menu icon elsewhere) for discoverability.
- **Portal + z-index:** z-popover (1400).

## Gotchas
- Triggered by right-click (or long-press on touch devices)
- ContextMenuTrigger doesn't auto-indicate it's interactive — add visual affordance elsewhere on the page

## Changes
### v0.18.0
- **Added** `ContextMenuContentProps`, `ContextMenuItemProps` type exports

### v0.14.0
- **Changed** z-index promoted from `z-dropdown` (1000) to `z-popover` (1400) — fixes dropdown rendering behind Sheet/Dialog overlays

### v0.1.0
- **Added** Initial release
