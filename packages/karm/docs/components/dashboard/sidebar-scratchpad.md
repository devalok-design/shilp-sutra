# SidebarScratchpad

- Import: @devalok/shilp-sutra-karm/dashboard
- Server-safe: No
- Category: dashboard

## Props
    items: ScratchpadItem[] (REQUIRED)
    onToggle: (id: string, done: boolean) => void (REQUIRED)
    defaultOpen: boolean (default: true)
    badgeCount: number
    className: string

## Related Types
    ScratchpadItem: { id: string; text: string; done: boolean } (imported from scratchpad-widget)

## Defaults
    defaultOpen=true

## Example
```jsx
<SidebarScratchpad
  items={scratchpadItems}
  onToggle={(id, done) => toggleItem(id, done)}
  badgeCount={scratchpadItems.filter(i => !i.done).length}
/>
```

## Gotchas
- This is a compact, read-only version of ScratchpadWidget designed for the app sidebar
- Does NOT support adding or deleting items — use ScratchpadWidget for full CRUD
- Only supports toggling done state via checkboxes
- Collapsible header with chevron; uses CSS grid-rows transition for smooth collapse
- badgeCount shows a pill badge in the header; hidden when badgeCount is undefined, null, or 0
- Extends React.HTMLAttributes<HTMLDivElement>

## Changes
### v0.18.0
- **Added** Initial release
