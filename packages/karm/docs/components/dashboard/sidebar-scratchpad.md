# SidebarScratchpad

- Import: @devalok/shilp-sutra-karm/dashboard
- Server-safe: No
- Category: dashboard

## Props
    items: ScratchpadItem[] (REQUIRED)
    onToggle: (id: string, done: boolean) => void (REQUIRED)
    onAdd: (text: string) => void — enables quick-add input
    onDelete: (id: string) => void — enables delete button on items
    onEdit: (id: string, text: string) => void — enables inline editing (double-click)
    onReorder: (items: ScratchpadItem[]) => void — enables drag-to-reorder
    onPromote: (id: string) => void — enables promote-to-task button
    maxItems: number (default: 20)
    defaultOpen: boolean (default: true)
    badgeCount: number
    className: string

## Related Types
    ScratchpadItem: { id: string; text: string; done: boolean }

## Defaults
    maxItems=20, defaultOpen=true

## Example
```jsx
<SidebarScratchpad
  items={scratchpadItems}
  onToggle={(id, done) => toggleItem(id, done)}
  onAdd={(text) => addItem(text)}
  onDelete={(id) => deleteItem(id)}
  onEdit={(id, text) => editItem(id, text)}
  onReorder={(items) => reorderItems(items)}
  onPromote={(id) => promoteToTask(id)}
  maxItems={20}
  badgeCount={scratchpadItems.filter(i => !i.done).length}
/>
```

## Gotchas
- Compact sidebar layout built on the composable Scratchpad compound component
- Renders Scratchpad.Collapse > Scratchpad.List (compact) + Scratchpad.AddInput
- Collapsible header with chevron; uses CSS grid-rows transition for smooth collapse
- badgeCount shows a pill badge in the header; hidden when badgeCount is undefined, null, or 0
- Extends React.HTMLAttributes<HTMLDivElement>
- onAdd, onDelete, onEdit, onReorder, onPromote are all optional; features auto-enable when callbacks are provided
- AddInput uses compact placeholders: "Quick add..." and "+ Add..."
- List renders in compact mode (smaller text and spacing)

## Changes
### v0.20.0
- **Added** `onAdd` prop — enables quick-add input
- **Added** `onDelete` prop — enables delete button on items
- **Added** `onEdit` prop — inline editing via double-click
- **Added** `onReorder` prop — drag-to-reorder via @dnd-kit
- **Added** `onPromote` prop — promote-to-task button
- **Added** `maxItems` prop (default: 20)
- **Changed** Internally rebuilt on composable Scratchpad compound component
- **Changed** No longer read-only — supports full CRUD when callbacks provided

### v0.18.0
- **Added** Initial release
