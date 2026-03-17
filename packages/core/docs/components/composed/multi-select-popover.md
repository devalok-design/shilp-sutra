# MultiSelectPopover

- Import: @devalok/shilp-sutra/composed/multi-select-popover
- Server-safe: No
- Category: composed

## Props
    items: MultiSelectItem[] (flat list — use `groups` for grouped rendering)
    groups: MultiSelectGroup[] (grouped items with section headers)
    value: string[] (currently selected item IDs)
    onValueChange: (ids: string[]) => void
    searchPlaceholder: string
    onSearch: (query: string) => Promise<MultiSelectItem[]> (async search — replaces local filter)
    searchDebounce: number (debounce for async search in ms)
    renderItem: (item: MultiSelectItem, selected: boolean) => ReactNode (custom item renderer)
    emptyMessage: string (message when no items match)
    maxSelections: number (cap on selections)
    align: "start" | "center" | "end"
    width: string | number (popover width)
    children: ReactNode (trigger element)

### MultiSelectItem
    id: string
    label: string
    image?: string
    description?: string
    disabled?: boolean

### MultiSelectGroup
    label: string
    items: MultiSelectItem[]

## Defaults
    searchPlaceholder="Search...", searchDebounce={300}, emptyMessage="No results found", align="start", width={240}

## Example
```jsx
<MultiSelectPopover
  items={[
    { id: '1', label: 'Alice', image: '/alice.jpg' },
    { id: '2', label: 'Bob' },
  ]}
  value={selected}
  onValueChange={setSelected}
>
  <Button>Assign members</Button>
</MultiSelectPopover>
```

## Gotchas
- Supply either `items` (flat) or `groups` (sectioned), not both
- When `onSearch` is provided, local filtering is disabled — the callback must return results
- Search state resets when the popover closes
