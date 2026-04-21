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
- **FilterBar + FilterSelect + FilterMultiSelect** — three-part kit. FilterBar is the toolbar container; FilterSelect/FilterMultiSelect are the individual filter controls.
- **size propagates via context** from FilterBar to every FilterSelect/FilterMultiSelect child. Don't set size on individual filters.
- **Children MUST be direct** — the size cascade breaks if filters are wrapped in extra divs. Use React fragments or let them be direct children.
- **Active filter highlight:** FilterSelect/FilterMultiSelect auto-show an accent border when their value is set (non-empty array for multi, non-"all" for single).
- **Pair with DataTable or any list:** FilterBar sits above a DataTable/list; `searchValue` + `onSearchChange` drive global filter; individual filters drive column filters via your own state management.
- **"Clear all" convention:** Passing `onClearAll` renders a Reset button that's your escape hatch — implement it to clear all filter state in one call.

## Gotchas
- FilterSelect and FilterMultiSelect must be direct children of FilterBar to inherit the size context
- FilterSelect uses `"all"` as the sentinel value for "no filter" — do not use `"all"` as a real option value
- Active filters get an accent border highlight automatically
