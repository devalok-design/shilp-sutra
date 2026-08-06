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
    enableExport: boolean — show the Export CSV button (default true)
    onExport: (visibleRows: TData[]) => void — replaces the built-in CSV logic; receives the currently visible filtered rows

## Defaults
    enableExport=true, globalFilter=false

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

## Composability
- **Companion to DataTable** — typically enabled via DataTable's `toolbar={true}` prop (which auto-renders this internally). Use DataTableToolbar directly only if you're building a custom DataTable integration that needs the toolbar positioned/styled differently.
- **Reads table state via the `table` instance** (TanStack react-table) — you must pass it. For the auto-rendered version inside DataTable, this wiring is automatic.
- **Feature toggles:** `globalFilter` (search across all columns), density switcher (compact/standard/comfortable row heights), CSV export. Turn each on/off independently.
- **Density changes are runtime** — the switcher writes to the same `defaultDensity` that DataTable's prop seeds. State lives in DataTable context.

## Gotchas
- Barrel-isolated since v0.5.0 — must use `@devalok/shilp-sutra/ui/data-table-toolbar`, NOT the `ui` barrel
- Companion to DataTable — provides column visibility, density toggle, and CSV export controls
- Requires @tanstack/react-table as a peer dependency
- Prefer DataTable's `toolbar={true}` prop over rendering this directly

## Changes
### v0.57.0
- **Added** `onExport?: (visibleRows: TData[]) => void` — when provided, replaces the built-in CSV logic. Same signature as `DataTable`'s `onExport`, so the prop forwards straight through.

### v0.5.0
- **Changed** (BREAKING) Removed from `@devalok/shilp-sutra/ui` barrel export — must use `@devalok/shilp-sutra/ui/data-table-toolbar`

### v0.1.0
- **Added** Initial release
