# ScratchpadWidget

- Import: @devalok/shilp-sutra-karm/dashboard
- Server-safe: No
- Category: dashboard

## Props
    items: ScratchpadItem[] (REQUIRED)
    maxItems: number (default: 5)
    onToggle: (id: string, done: boolean) => void (REQUIRED)
    onAdd: (text: string) => void (REQUIRED)
    onDelete: (id: string) => void (REQUIRED)
    title: string (default: "My Scratchpad")
    resetLabel: string
    emptyText: string (default: "Nothing here yet. Add a task!")
    emptyIcon: React.ComponentType<{ className?: string }>
    loading: boolean (default: false)
    className: string

## Related Types
    ScratchpadItem: { id: string; text: string; done: boolean }

## Defaults
    maxItems=5, title="My Scratchpad", emptyText="Nothing here yet. Add a task!", loading=false

## Example
```jsx
<ScratchpadWidget
  items={scratchpadItems}
  onToggle={(id, done) => toggleItem(id, done)}
  onAdd={(text) => addItem(text)}
  onDelete={(id) => deleteItem(id)}
  maxItems={5}
/>
```

## Gotchas
- Extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> — the native title attribute is replaced by the title prop
- The "Add a task" input appears only when items.length < maxItems
- After adding an item, the input stays open for rapid entry; press Escape to close
- Enter submits the new item; Escape cancels the add flow
- Blurring the input with empty text closes the add flow
- Shows a progress ring in the header displaying items.length / maxItems with accent/success color
- When all items are done, the progress ring pulses with a scale animation
- Each item has a delete button that appears on hover
- resetLabel renders as footer text below the item list (e.g., "Resets daily at midnight")
- When loading=true, shows a shimmer skeleton placeholder
- Uses framer-motion AnimatePresence for item enter/exit animations

## Changes
### v0.18.0
- **Added** Initial release
