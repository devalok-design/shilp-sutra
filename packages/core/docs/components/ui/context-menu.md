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

## Gotchas
- Triggered by right-click (or long-press on touch devices)

## Changes
### v0.18.0
- **Added** `ContextMenuContentProps`, `ContextMenuItemProps` type exports

### v0.14.0
- **Changed** z-index promoted from `z-dropdown` (1000) to `z-popover` (1400) — fixes dropdown rendering behind Sheet/Dialog overlays

### v0.1.0
- **Added** Initial release
