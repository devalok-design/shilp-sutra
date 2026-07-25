# MasterDetail

- Import: @devalok/shilp-sutra/composed/master-detail
- Server-safe: No
- Category: composed

## Compound Components
MasterDetail (root), MasterDetail.List, MasterDetail.Detail, MasterDetail.ListItem

## Props

### MasterDetail (root)
    selected: string | null (CONTROLLED selected item id; omit for uncontrolled)
    defaultSelected: string | null (uncontrolled initial selection)
    onSelect: (value: string) => void (called with a row's `value` when chosen)
    label: string (accessible name for the listbox; default "Items")
    onBack: () => void (called when mobile back button is pressed)
    masterWidth: string (master panel width on desktop)
    breakpoint: "sm" | "md" | "lg" (below this, stacked mobile mode activates)
    emptyState: ReactNode (shown in the detail pane when nothing is selected)
    onNavigate: (direction: "up" | "down") => void

Selection can be controlled (`selected`) or owned by the component
(`defaultSelected` + `onSelect`). With `value` on each ListItem, `active` /
`aria-selected` derive automatically — no need to hand-wire `active` + `onClick`.

### MasterDetail.ListItem
    value: string (row id — enables derived selection + auto-fires onSelect on activate)
    active: boolean (explicit highlight; omit to derive from value === selected)
    (extends ButtonHTMLAttributes)

## Defaults
    selected={null}, masterWidth="280px", breakpoint="md"

## Example
```jsx
<MasterDetail selected={selectedId} onBack={() => setSelectedId(null)}>
  <MasterDetail.List>
    {items.map((item) => (
      <MasterDetail.ListItem
        key={item.id}
        active={item.id === selectedId}
        onClick={() => setSelectedId(item.id)}
      >
        {item.name}
      </MasterDetail.ListItem>
    ))}
  </MasterDetail.List>
  <MasterDetail.Detail>
    {selectedId ? <ItemDetail id={selectedId} /> : <EmptyState />}
  </MasterDetail.Detail>
</MasterDetail>
```

## Composability
- **Responsive list+detail layout.** Desktop: side-by-side panels. Mobile (below `breakpoint`): stacked, mutually exclusive (list OR detail, controlled by `selected`).
- **Compound structure:** `MasterDetail.List` contains `MasterDetail.ListItem[]` (interactive). `MasterDetail.Detail` holds the currently-selected view.
- **onBack is required for mobile** — renders the back button in Detail pane. Omitting it leaves users stranded once they drill into an item on mobile.
- **SSR gotcha:** Uses `window.matchMedia` — initial SSR render picks desktop mode; hydrates to mobile mode if viewport is narrow. If that causes layout shift, consider rendering this only after mount (via `useState(false)` + `useEffect`).
- **Pairs with EmptyState** — render EmptyState inside Detail when `selected === null` on desktop ("Pick an item to get started").

## Gotchas
- On mobile (below breakpoint), List and Detail are mutually exclusive — selecting an item hides the list
- The `onBack` callback is required for the mobile back button to appear in the Detail pane
- Uses `window.matchMedia` — SSR renders desktop layout initially, then hydrates to correct mode
