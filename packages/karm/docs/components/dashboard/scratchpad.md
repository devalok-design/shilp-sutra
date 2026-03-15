# Scratchpad (Composable)

Compound component for building custom scratchpad UIs with drag-to-reorder, inline editing, promote-to-task, and filter completed toggle.

- Import: @devalok/shilp-sutra-karm/dashboard
- Server-safe: No
- Category: dashboard

## Compound Parts

| Part | Description |
|------|-------------|
| `Scratchpad.Root` | Context provider + layout div. All other parts must be children. |
| `Scratchpad.Header` | Title bar with optional children slot (e.g. ProgressRing, FilterToggle) |
| `Scratchpad.List` | Item list with optional @dnd-kit drag-to-reorder and AnimatePresence |
| `Scratchpad.Item` | Single item row: checkbox, text, inline edit, drag handle, promote/delete buttons |
| `Scratchpad.AddInput` | "Add a task" trigger that expands to an inline input + Add button |
| `Scratchpad.EmptyState` | Empty placeholder shown when visibleItems is empty |
| `Scratchpad.ProgressRing` | SVG ring showing items.length / maxItems with completion pulse |
| `Scratchpad.FilterToggle` | Eye icon button toggling show/hide completed items |
| `Scratchpad.Collapse` | Collapsible section with chevron header, CSS grid-rows transition, badge count |

## Props (Root)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| items | ScratchpadItem[] | REQUIRED | Full item list |
| onToggle | (id: string, done: boolean) => void | REQUIRED | Toggle item completion |
| onAdd | (text: string) => void | — | Enables AddInput when provided |
| onDelete | (id: string) => void | — | Enables delete button on items |
| onEdit | (id: string, text: string) => void | — | Enables inline editing (double-click) |
| onReorder | (items: ScratchpadItem[]) => void | — | Enables drag-to-reorder via @dnd-kit |
| onPromote | (id: string) => void | — | Enables promote-to-task button on items |
| maxItems | number | 20 | Maximum item count; AddInput hides when reached |
| defaultShowCompleted | boolean | true | Initial filter toggle state |
| className | string | — | Additional CSS classes |

## Props (Header)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| title | string | "Scratchpad" | Header title text |
| children | ReactNode | — | Slot for ProgressRing, FilterToggle, etc. |

## Props (List)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| compact | boolean | false | Compact layout passed to each item |

## Props (Item)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| item | ScratchpadItem | REQUIRED | The item data |
| compact | boolean | false | Compact sizing |
| sortable | boolean | false | Whether dnd-kit drag is active |

## Props (AddInput)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| placeholder | string | "What needs doing?" | Input placeholder |
| triggerLabel | string | "+ Add a task..." | Button label before expanding |

## Props (EmptyState)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| icon | React.ComponentType<{ className?: string }> | — | Icon shown above message |
| message | string | "Nothing here yet. Add a task!" | Empty state text |

## Props (ProgressRing)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| size | "sm" \| "md" | "md" | Ring diameter: sm=16px, md=20px |

## Props (FilterToggle)

No custom props. Extends `Omit<ButtonHTMLAttributes, 'children'>`.

## Props (Collapse)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| label | string | "Scratchpad" | Header label text |
| defaultOpen | boolean | true | Whether expanded initially |
| badgeCount | number | — | Badge pill count in header (hidden when 0 or undefined) |
| headerClassName | string | — | Override header text styling |

## Related Types

```typescript
interface ScratchpadItem {
  id: string
  text: string
  done: boolean
}
```

## Context-Driven Feature Visibility

Features auto-enable based on which callbacks are provided to Root:

| Callback | Enables |
|----------|---------|
| onAdd | AddInput component renders |
| onDelete | Delete (X) button on each item |
| onEdit | Double-click inline editing on items |
| onReorder | Drag handles + @dnd-kit SortableContext on List |
| onPromote | Promote (arrow-up) button on each item |

## Example

```tsx
<Scratchpad.Root
  items={items}
  onToggle={toggle}
  onAdd={add}
  onDelete={del}
  onEdit={edit}
  onReorder={reorder}
  onPromote={promote}
>
  <Scratchpad.Header title="My Scratchpad">
    <Scratchpad.FilterToggle />
    <Scratchpad.ProgressRing />
  </Scratchpad.Header>
  <Scratchpad.EmptyState />
  <Scratchpad.List />
  <Scratchpad.AddInput />
</Scratchpad.Root>
```

## Gotchas
- All sub-components must be inside `Scratchpad.Root` — they use React context
- Root extends `Omit<HTMLDivElement, 'onToggle'>` to avoid conflict with native onToggle
- Drag-to-reorder uses @dnd-kit with PointerSensor (5px activation distance) and KeyboardSensor
- When sortable, List does NOT render `role="list"` because dnd-kit adds `role="button"` to items
- Inline editing activates on double-click; Enter confirms, Escape cancels, blur confirms
- AddInput auto-hides when items.length >= maxItems
- EmptyState auto-hides when visibleItems.length > 0
- FilterToggle shows IconEye when completed shown, IconEyeOff when hidden
- ProgressRing pulses (scale animation) when all items are done
- Items animate in/out with framer-motion (opacity + x slide)
- Collapse uses CSS `grid-template-rows` transition for smooth open/close

## Changes
### v0.20.0
- **Added** Initial release — 9-part composable scratchpad: Root, Header, List, Item, AddInput, EmptyState, ProgressRing, FilterToggle, Collapse
