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

## Composability
- **Generalized multi-select popover** — picks from a fixed list (items) or grouped list (groups), with search, async search, and custom rendering.
- **Items vs groups (mutually exclusive):** Pass `items` for flat lists, `groups` for sectioned lists. Don't pass both.
- **Async search via onSearch:** When provided, local filtering is disabled — the callback owns filtering and returns a new list. `searchDebounce` (default 300ms) throttles calls.
- **renderItem escape hatch:** Pass `(item, selected) => ReactNode` for custom item rendering (avatar + multi-line descriptions, etc.). Built-in default renders image + label + description.
- **maxSelections behavior:** At the limit, clicking a new item REPLACES the oldest selection (FIFO). `maxSelections={1}` effectively acts as single-select.
- **MultiSelectPopover vs Combobox vs MemberPicker:**
  - Combobox = form-field multi-select (typeahead + selection in place)
  - MultiSelectPopover = button-triggered popup for bulk selection (good for "Assign to" / "Add tags" scenarios)
  - MemberPicker = MultiSelectPopover specialized for team-member UI

## Gotchas
- Supply either `items` (flat) or `groups` (sectioned), not both
- When `onSearch` is provided, local filtering is disabled — the callback must return results
- Search state resets when the popover closes
- `maxSelections: 1` acts as single-select — clicking a new item replaces the current one

## Changes

### v0.27.2
- **Fixed** `maxSelections` at limit now replaces oldest selection instead of blocking. Single-select (`maxSelections: 1`) swaps in the new value.

### v0.26.0
- **Added** Initial release
