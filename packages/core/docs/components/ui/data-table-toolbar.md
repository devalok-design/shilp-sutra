# DataTableToolbar

- Import: @devalok/shilp-sutra/ui/data-table-toolbar
- Server-safe: No
- Category: ui

## Props
    table: Table<TData> (TanStack table instance)
    globalFilter: boolean
    globalFilterValue: string
    onGlobalFilterChange: (value: string) => void
    density: 'compact' | 'standard' | 'comfortable'
    onDensityChange: (density: Density) => void
    enableExport: boolean

## Defaults
    none

## Example
```jsx
import { DataTableToolbar } from '@devalok/shilp-sutra/ui/data-table-toolbar'

<DataTableToolbar
  table={table}
  globalFilter
  globalFilterValue={filterValue}
  onGlobalFilterChange={setFilterValue}
  density={density}
  onDensityChange={setDensity}
  enableExport
/>
```

## Gotchas
- Barrel-isolated since v0.5.0 — must use `@devalok/shilp-sutra/ui/data-table-toolbar`, NOT the `ui` barrel
- Companion to DataTable — provides column visibility, density toggle, and CSV export controls
- Requires @tanstack/react-table as a peer dependency

## Changes
### v0.5.0
- **Changed** (BREAKING) Removed from `@devalok/shilp-sutra/ui` barrel export — must use `@devalok/shilp-sutra/ui/data-table-toolbar`

### v0.1.0
- **Added** Initial release
