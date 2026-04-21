# MasterDetail

- Import: @devalok/shilp-sutra/composed/master-detail
- Server-safe: No
- Category: composed

## Compound Components
MasterDetail (root), MasterDetail.List, MasterDetail.Detail, MasterDetail.ListItem

## Props

### MasterDetail (root)
    selected: string | null (ID of currently selected item; null = show list on mobile)
    onBack: () => void (called when mobile back button is pressed)
    masterWidth: string (master panel width on desktop)
    breakpoint: "sm" | "md" | "lg" (below this, stacked mobile mode activates)

### MasterDetail.ListItem
    active: boolean (highlights the item)
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
<!-- composability-stub -->
- TODO: document how this component composes with others (context cascade, slot API, portal behavior, common pairings, when to use vs alternatives).

## Gotchas
- On mobile (below breakpoint), List and Detail are mutually exclusive — selecting an item hides the list
- The `onBack` callback is required for the mobile back button to appear in the Detail pane
- Uses `window.matchMedia` — SSR renders desktop layout initially, then hydrates to correct mode
