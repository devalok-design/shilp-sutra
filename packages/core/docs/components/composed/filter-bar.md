# FilterBar

- Import: @devalok/shilp-sutra/composed/filter-bar
- Server-safe: No
- Category: composed

## Exports
FilterBar, FilterSelect, FilterMultiSelect

## Props

### FilterBar
    searchValue: string
    onSearchChange: (value: string) => void (renders SearchInput when provided)
    searchPlaceholder: string
    onClearAll: () => void (renders "Clear all" button when provided)
    size: "xs" | "sm" | "md" (propagated to all child controls via context)
    children: ReactNode (FilterSelect / FilterMultiSelect controls)

### FilterSelect
    label: string
    value: string
    onValueChange: (value: string) => void
    options: { value: string; label: string }[]
    allLabel: string (label for the "all" option)

### FilterMultiSelect
    label: string
    value: string[]
    onValueChange: (values: string[]) => void
    options: { value: string; label: string }[]

## Defaults
    size="sm", searchPlaceholder="Search...", allLabel="All"

## Example
```jsx
<FilterBar searchValue={search} onSearchChange={setSearch} onClearAll={clearFilters}>
  <FilterSelect
    label="Status"
    value={status}
    onValueChange={setStatus}
    options={[{ value: 'active', label: 'Active' }, { value: 'done', label: 'Done' }]}
  />
  <FilterMultiSelect
    label="Assignees"
    value={assignees}
    onValueChange={setAssignees}
    options={memberOptions}
  />
</FilterBar>
```

## Composability
<!-- composability-stub -->
- TODO: document how this component composes with others (context cascade, slot API, portal behavior, common pairings, when to use vs alternatives).

## Gotchas
- FilterSelect and FilterMultiSelect must be direct children of FilterBar to inherit the size context
- FilterSelect uses `"all"` as the sentinel value for "no filter" — do not use `"all"` as a real option value
- Active filters get an accent border highlight automatically
