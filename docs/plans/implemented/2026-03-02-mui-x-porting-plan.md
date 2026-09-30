# MUI X Component Porting — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Port MUI X-class Data Grid, Charts (7 types), enhanced Date/Time Pickers, and Tree View into shilp-sutra with zero MUI dependency.

**Architecture:** Enhance existing DataTable (TanStack React Table engine) with full sorting/filtering/pagination/editing. Build chart library on D3.js + React wrappers. Extend date pickers with time support, constraints, presets. Add Tree View using Collapsible primitive. All components consume our CSS custom property tokens.

**Tech Stack:** TanStack React Table 8, D3.js 7 (modular), date-fns 4, React 18, TypeScript 5.7, CVA, Tailwind 3.4

**Design doc:** `docs/plans/2026-03-02-mui-x-porting-design.md`

---

## Task 1: Install Dependencies & Configure Build

**Files:**
- Modify: `package.json`
- Modify: `vite.config.ts:38-58` (externals)

**Step 1: Install D3 modules and react-virtual**

Run:
```bash
pnpm add d3-scale d3-shape d3-axis d3-selection d3-transition d3-interpolate d3-array d3-format d3-time-format @tanstack/react-virtual
```

**Step 2: Install D3 types**

Run:
```bash
pnpm add -D @types/d3-scale @types/d3-shape @types/d3-axis @types/d3-selection @types/d3-transition @types/d3-interpolate @types/d3-array @types/d3-format @types/d3-time-format
```

**Step 3: Add D3 and react-virtual to Vite externals**

In `vite.config.ts`, add to the `external` array (after line 49):
```typescript
/^d3-.*/,
```
The `@tanstack/*` pattern on line 47 already covers `@tanstack/react-virtual`.

**Step 4: Add chart tokens to semantic.css**

In `src/tokens/semantic.css`, add before line 223 (before closing `}`):
```css
/* ── Chart Palette ──────────────────────────────── */
--chart-1: var(--pink-500);
--chart-2: var(--purple-500);
--chart-3: var(--blue-500);
--chart-4: var(--green-500);
--chart-5: var(--yellow-500);
--chart-6: var(--red-500);
--chart-7: var(--cyan-500, #06b6d4);
--chart-8: var(--orange-500, #f97316);
```

And in the `.dark` section before line 349:
```css
/* ── Chart Palette (dark) ───────────────────────── */
--chart-1: var(--pink-400);
--chart-2: var(--purple-400);
--chart-3: var(--blue-400);
--chart-4: var(--green-400);
--chart-5: var(--yellow-400);
--chart-6: var(--red-400);
--chart-7: var(--cyan-400, #22d3ee);
--chart-8: var(--orange-400, #fb923c);
```

**Step 5: Verify build**

Run: `pnpm build`
Expected: Build succeeds with no errors

**Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml vite.config.ts src/tokens/semantic.css
git commit -m "chore: add d3, react-virtual deps and chart tokens for MUI X porting"
```

---

## Task 2: Enhanced DataTable — Sorting

**Files:**
- Modify: `src/ui/data-table.tsx`
- Modify: `src/ui/data-table.stories.tsx`

**Step 1: Write sorting story**

Add to `src/ui/data-table.stories.tsx` after the `SingleRow` story:
```tsx
export const Sortable: Story = {
  render: () => <DataTable columns={columns} data={data} sortable />,
}
```

**Step 2: Run storybook to see it fail (prop doesn't exist yet)**

Run: `pnpm dev`
Expected: TypeScript error — `sortable` is not a valid prop

**Step 3: Add sorting to DataTable**

Replace the entire `src/ui/data-table.tsx` with:

```tsx
'use client'

import * as React from 'react'
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { IconArrowUp, IconArrowDown, IconArrowsSort } from '@tabler/icons-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table'
import { cn } from './lib/utils'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  className?: string
  noResultsText?: string
  sortable?: boolean
}

export function DataTable<TData, TValue>({
  columns,
  data,
  className,
  noResultsText,
  sortable = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    ...(sortable && {
      getSortedRowModel: getSortedRowModel(),
      onSortingChange: setSorting,
      state: { sorting },
    }),
  })

  return (
    <div className={cn(className)}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : sortable && header.column.getCanSort() ? (
                    <button
                      type="button"
                      className="flex items-center gap-ds-01 hover:text-[var(--color-text-primary)] transition-colors cursor-pointer select-none"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: <IconArrowUp size={14} />,
                        desc: <IconArrowDown size={14} />,
                      }[header.column.getIsSorted() as string] ?? <IconArrowsSort size={14} className="opacity-40" />}
                    </button>
                  ) : (
                    flexRender(header.column.columnDef.header, header.getContext())
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="py-ds-05">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-[var(--color-text-tertiary)]"
              >
                {noResultsText || 'No results.'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
```

**Step 4: Verify storybook**

Run: `pnpm dev`
Expected: Sortable story shows clickable column headers with sort icons

**Step 5: Run tests**

Run: `pnpm test`
Expected: All existing tests pass

**Step 6: Commit**

```bash
git add src/ui/data-table.tsx src/ui/data-table.stories.tsx
git commit -m "feat(data-table): add column sorting support"
```

---

## Task 3: Enhanced DataTable — Filtering (Global + Column)

**Files:**
- Modify: `src/ui/data-table.tsx`
- Modify: `src/ui/data-table.stories.tsx`

**Step 1: Add filtering props and state to DataTable**

Add to imports in `data-table.tsx`:
```tsx
import {
  ColumnFiltersState,
  getFilteredRowModel,
} from '@tanstack/react-table'
```

Add to `DataTableProps`:
```tsx
filterable?: boolean
globalFilter?: boolean
```

Add state:
```tsx
const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
const [globalFilterValue, setGlobalFilterValue] = React.useState('')
```

Add to `useReactTable`:
```tsx
...(filterable && {
  getFilteredRowModel: getFilteredRowModel(),
  onColumnFiltersChange: setColumnFilters,
  onGlobalFilterChange: setGlobalFilterValue,
  state: { ...state, columnFilters, globalFilter: globalFilterValue },
}),
```

**Step 2: Add global filter input above table**

Add a search input when `globalFilter` is true:
```tsx
{globalFilter && (
  <div className="flex items-center gap-ds-03 pb-ds-04">
    <IconSearch size={16} className="text-[var(--color-icon-secondary)]" />
    <input
      type="text"
      placeholder="Search all columns..."
      value={globalFilterValue}
      onChange={(e) => setGlobalFilterValue(e.target.value)}
      className="flex-1 bg-transparent text-ds-md text-[var(--color-text-primary)] placeholder:text-[var(--color-text-placeholder)] outline-none"
    />
  </div>
)}
```

**Step 3: Add column filter inputs below headers**

When `filterable` is true, render a second header row with filter inputs per column (only for columns with `enableColumnFilter !== false`).

**Step 4: Add story**

```tsx
export const Filterable: Story = {
  render: () => <DataTable columns={columns} data={data} filterable globalFilter />,
}
```

**Step 5: Verify and commit**

Run: `pnpm dev` — verify filtering works
Run: `pnpm test` — all tests pass

```bash
git add src/ui/data-table.tsx src/ui/data-table.stories.tsx
git commit -m "feat(data-table): add global and column filtering"
```

---

## Task 4: Enhanced DataTable — Pagination

**Files:**
- Modify: `src/ui/data-table.tsx`
- Modify: `src/ui/data-table.stories.tsx`

**Step 1: Add pagination imports and props**

```tsx
import { getPaginationRowModel } from '@tanstack/react-table'
```

Add to `DataTableProps`:
```tsx
paginated?: boolean
pageSize?: number
pageSizeOptions?: number[]
```

**Step 2: Wire up pagination model**

```tsx
const [pagination, setPagination] = React.useState({
  pageIndex: 0,
  pageSize: pageSize ?? 10,
})

// In useReactTable:
...(paginated && {
  getPaginationRowModel: getPaginationRowModel(),
  onPaginationChange: setPagination,
  state: { ...state, pagination },
}),
```

**Step 3: Render pagination controls below table**

Use our existing Pagination components from `src/ui/pagination.tsx`:
```tsx
{paginated && (
  <div className="flex items-center justify-between px-ds-03 py-ds-04">
    <span className="text-ds-sm text-[var(--color-text-secondary)]">
      {table.getFilteredRowModel().rows.length} total rows
    </span>
    <div className="flex items-center gap-ds-03">
      <select
        value={table.getState().pagination.pageSize}
        onChange={(e) => table.setPageSize(Number(e.target.value))}
        className="h-8 rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-field)] px-ds-03 text-ds-sm"
      >
        {(pageSizeOptions ?? [10, 20, 50, 100]).map((size) => (
          <option key={size} value={size}>Show {size}</option>
        ))}
      </select>
      <PaginationRoot>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            />
          </PaginationItem>
          {/* Page numbers */}
          <PaginationItem>
            <PaginationNext
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            />
          </PaginationItem>
        </PaginationContent>
      </PaginationRoot>
    </div>
  </div>
)}
```

**Step 4: Add large dataset story**

Generate 100 rows of sample data and show pagination with page size selector.

**Step 5: Verify and commit**

```bash
git add src/ui/data-table.tsx src/ui/data-table.stories.tsx
git commit -m "feat(data-table): add pagination with page size selector"
```

---

## Task 5: Enhanced DataTable — Row Selection

**Files:**
- Modify: `src/ui/data-table.tsx`
- Modify: `src/ui/data-table.stories.tsx`

**Step 1: Add selection props**

```tsx
selectable?: boolean
onSelectionChange?: (selectedRows: TData[]) => void
```

**Step 2: Add checkbox column**

When `selectable` is true, prepend a checkbox column:
```tsx
const selectColumn: ColumnDef<TData, unknown> = {
  id: '_select',
  header: ({ table }) => (
    <Checkbox
      checked={table.getIsAllPageRowsSelected()}
      onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
    />
  ),
  cell: ({ row }) => (
    <Checkbox
      checked={row.getIsSelected()}
      onCheckedChange={(v) => row.toggleSelected(!!v)}
    />
  ),
  enableSorting: false,
  enableColumnFilter: false,
}
```

Uses our existing `Checkbox` component from `src/ui/checkbox.tsx`.

**Step 3: Wire up selection state**

```tsx
const [rowSelection, setRowSelection] = React.useState({})

// In useReactTable:
...(selectable && {
  onRowSelectionChange: setRowSelection,
  state: { ...state, rowSelection },
}),
```

**Step 4: Fire callback on selection change**

```tsx
React.useEffect(() => {
  if (onSelectionChange) {
    const selected = table.getFilteredSelectedRowModel().rows.map((r) => r.original)
    onSelectionChange(selected)
  }
}, [rowSelection])
```

**Step 5: Add story and commit**

```tsx
export const Selectable: Story = {
  render: () => {
    const [selected, setSelected] = React.useState<Task[]>([])
    return (
      <div>
        <DataTable columns={columns} data={data} selectable onSelectionChange={setSelected} />
        <p className="mt-ds-04 text-ds-sm">{selected.length} rows selected</p>
      </div>
    )
  },
}
```

```bash
git add src/ui/data-table.tsx src/ui/data-table.stories.tsx
git commit -m "feat(data-table): add row selection with checkboxes"
```

---

## Task 6: Enhanced DataTable — Column Visibility, Pinning, Density, Toolbar

**Files:**
- Modify: `src/ui/data-table.tsx`
- Create: `src/ui/data-table-toolbar.tsx`
- Modify: `src/ui/data-table.stories.tsx`

**Step 1: Create DataTableToolbar component**

`src/ui/data-table-toolbar.tsx`:
A toolbar that renders above the table with:
- Global search input (uses `SearchInput` from `src/ui/search-input.tsx`)
- Column visibility dropdown (uses `DropdownMenu` from `src/ui/dropdown-menu.tsx`)
- Density selector (compact/standard/comfortable) — toggles a CSS class
- Export CSV button

**Step 2: Add column visibility state**

```tsx
const [columnVisibility, setColumnVisibility] = React.useState({})

// In useReactTable:
onColumnVisibilityChange: setColumnVisibility,
state: { ...state, columnVisibility },
```

**Step 3: Add column pinning state**

Props:
```tsx
columnPinning?: { left?: string[]; right?: string[] }
```

Use TanStack's `columnPinning` state. Apply `sticky left-0` / `sticky right-0` + z-index to pinned cells.

**Step 4: Add density**

Props:
```tsx
density?: 'compact' | 'standard' | 'comfortable'
```

Map density to cell padding:
- compact: `py-ds-02`
- standard: `py-ds-05` (current default)
- comfortable: `py-ds-06`

**Step 5: Add toolbar prop**

When `toolbar` is true, render `<DataTableToolbar>` above the table.

**Step 6: Add comprehensive story and commit**

```tsx
export const WithToolbar: Story = {
  render: () => (
    <DataTable
      columns={columns}
      data={data}
      sortable
      filterable
      globalFilter
      paginated
      selectable
      toolbar
      density="standard"
    />
  ),
}
```

```bash
git add src/ui/data-table.tsx src/ui/data-table-toolbar.tsx src/ui/data-table.stories.tsx
git commit -m "feat(data-table): add toolbar, column visibility, pinning, density"
```

---

## Task 7: Enhanced DataTable — Cell Editing, Row Expansion, Virtualization, Export

**Files:**
- Modify: `src/ui/data-table.tsx`
- Modify: `src/ui/data-table-toolbar.tsx`
- Modify: `src/ui/data-table.stories.tsx`

**Step 1: Cell editing**

Props:
```tsx
editable?: boolean
onCellEdit?: (rowIndex: number, columnId: string, value: unknown) => void
```

Double-click a cell → render an Input in place. Blur or Enter saves. Escape cancels. Uses our `Input` from `src/ui/input.tsx`.

**Step 2: Row expansion**

Props:
```tsx
expandable?: boolean
renderExpanded?: (row: TData) => React.ReactNode
```

Uses `getExpandedRowModel()` from TanStack. Renders an expand icon in first column (or after checkbox if selectable). Expanded content renders in a full-width `<TableCell colSpan={...}>` below the row.

**Step 3: Virtualization**

Props:
```tsx
virtualRows?: boolean
```

When enabled, use `@tanstack/react-virtual` to virtualize table rows. Set container to fixed height with overflow-auto. Render only visible rows + buffer.

**Step 4: CSV export**

In `DataTableToolbar`, add export button that:
- Gets all rows from `table.getFilteredRowModel()`
- Maps to CSV string
- Creates Blob → download link
- Triggers download with `data-table-export.csv`

**Step 5: Add stories for each feature**

- `Editable` story with cell edit callback
- `Expandable` story with detail panel
- `VirtualizedLargeDataset` story with 10,000 rows
- `FullFeatured` story combining all features

**Step 6: Commit**

```bash
git add src/ui/data-table.tsx src/ui/data-table-toolbar.tsx src/ui/data-table.stories.tsx
git commit -m "feat(data-table): add cell editing, row expansion, virtualization, CSV export"
```

---

## Task 8: DataTable — Time Off Calendar Demo (Karm)

**Files:**
- Modify: `src/ui/data-table.stories.tsx`

**Step 1: Create Time Off Calendar demo story**

Add a `TimeOffCalendar` story that shows a DataTable used as a leave/time-off calendar:
- Rows = employees
- Columns = days of the month (dynamically generated)
- Cells = colored badges (Approved/Pending/Rejected/Holiday)
- Row selection for bulk actions
- First column pinned (employee name)
- Toolbar with month navigation
- Uses `Badge` variants for status colors

This is a showcase story demonstrating the DataGrid used for Karm's admin time-off view.

**Step 2: Commit**

```bash
git add src/ui/data-table.stories.tsx
git commit -m "feat(data-table): add time-off calendar Karm demo story"
```

---

## Task 9: Charts — Internal Utilities

**Files:**
- Create: `src/ui/charts/_internal/types.ts`
- Create: `src/ui/charts/_internal/colors.ts`
- Create: `src/ui/charts/_internal/scales.ts`
- Create: `src/ui/charts/_internal/axes.ts`
- Create: `src/ui/charts/_internal/grid-lines.ts`
- Create: `src/ui/charts/_internal/animation.ts`
- Create: `src/ui/charts/_internal/tooltip.tsx`
- Create: `src/ui/charts/_internal/legend.tsx`

**Step 1: Create shared types**

`types.ts`:
```tsx
export interface ChartMargin {
  top: number
  right: number
  bottom: number
  left: number
}

export interface DataPoint {
  [key: string]: string | number
}

export interface Series {
  key: string
  label: string
  color?: string  // token name or CSS value
}

export type ChartColor = 'chart-1' | 'chart-2' | 'chart-3' | 'chart-4' | 'chart-5' | 'chart-6' | 'chart-7' | 'chart-8'
```

**Step 2: Create color utility**

`colors.ts`:
Maps `ChartColor` names to CSS variable references. Returns computed colors from DOM. Provides `getChartColors(count)` that cycles through the palette.

**Step 3: Create scale wrappers**

`scales.ts`:
Wrappers around `d3-scale` that configure scales using our token system. Exports `createLinearScale`, `createBandScale`, `createTimeScale`, `createOrdinalScale`.

**Step 4: Create axis rendering**

`axes.ts`:
React component that renders SVG `<g>` with D3 axis. Props: `scale`, `orientation` (top/right/bottom/left), `tickFormat`, `tickCount`. Uses our font tokens.

**Step 5: Create grid lines**

`grid-lines.ts`:
Renders horizontal and/or vertical grid lines as SVG `<line>` elements. Color uses `--color-border-subtle`.

**Step 6: Create animation utility**

`animation.ts`:
Checks `prefers-reduced-motion` via `matchMedia`. Exports `useReducedMotion()` hook and `getTransitionDuration()` helper. D3 transitions respect this.

**Step 7: Create Tooltip component**

`tooltip.tsx`:
Chart-specific tooltip that renders at mouse position. Uses `position: fixed` with a portal. Accepts `content: ReactNode`. Styled with our shadow and border tokens.

**Step 8: Create Legend component**

`legend.tsx`:
Renders color swatches + labels. Props: `items: { label, color }[]`, `position: 'top' | 'bottom' | 'left' | 'right'`. Flexbox layout.

**Step 9: Commit**

```bash
git add src/ui/charts/
git commit -m "feat(charts): add internal utilities — scales, axes, tooltip, legend, colors"
```

---

## Task 10: Charts — ChartContainer + BarChart

**Files:**
- Create: `src/ui/charts/chart-container.tsx`
- Create: `src/ui/charts/bar-chart.tsx`
- Create: `src/ui/charts/bar-chart.stories.tsx`
- Create: `src/ui/charts/index.ts`

**Step 1: Create ChartContainer**

Responsive SVG wrapper using `ResizeObserver`. Provides width/height to children via context. Handles margin calculation.

```tsx
interface ChartContainerProps {
  height?: number
  margin?: Partial<ChartMargin>
  className?: string
  children: (dimensions: { width: number; height: number }) => React.ReactNode
}
```

**Step 2: Create BarChart**

```tsx
interface BarChartProps {
  data: DataPoint[]
  xKey: string
  yKey: string | string[]
  orientation?: 'vertical' | 'horizontal'
  stacked?: boolean
  grouped?: boolean
  color?: ChartColor | ChartColor[]
  height?: number
  showGrid?: boolean
  showTooltip?: boolean
  showLegend?: boolean
  animate?: boolean
  className?: string
  barRadius?: number
  xLabel?: string
  yLabel?: string
}
```

Implementation:
- `d3-scale`: bandScale for categories, linearScale for values
- `d3-shape`: no special shape needed, just rect rendering
- SVG `<rect>` elements for bars with rounded top corners
- Hover state: darken bar + show tooltip
- Stacked: stack bars vertically using `d3-shape` stack layout
- Grouped: side-by-side bars within each category band

**Step 3: Create stories**

```tsx
// stories: Default, Horizontal, Stacked, Grouped, MultiSeries, WithLegend, Responsive
```

**Step 4: Create index barrel**

**Step 5: Commit**

```bash
git add src/ui/charts/
git commit -m "feat(charts): add ChartContainer and BarChart component"
```

---

## Task 11: Charts — LineChart + AreaChart

**Files:**
- Create: `src/ui/charts/line-chart.tsx`
- Create: `src/ui/charts/line-chart.stories.tsx`
- Create: `src/ui/charts/area-chart.tsx`
- Create: `src/ui/charts/area-chart.stories.tsx`

**Step 1: Create LineChart**

```tsx
interface LineChartProps {
  data: DataPoint[]
  xKey: string
  series: Series[]
  curved?: boolean          // monotone interpolation
  showDots?: boolean
  dotSize?: number
  strokeWidth?: number
  height?: number
  showGrid?: boolean
  showTooltip?: boolean
  showLegend?: boolean
  animate?: boolean
  className?: string
  xLabel?: string
  yLabel?: string
}
```

Implementation:
- `d3-shape`: `line()` generator with optional `curveMonotoneX`
- SVG `<path>` for each series
- Optional `<circle>` for data points
- Hover: highlight nearest point, show crosshair + tooltip

**Step 2: Create AreaChart**

Same as LineChart but with `area()` generator from `d3-shape`. Adds fill below the line with opacity.

```tsx
interface AreaChartProps extends Omit<LineChartProps, 'showDots'> {
  stacked?: boolean
  fillOpacity?: number
  gradient?: boolean       // vertical gradient fill
}
```

**Step 3: Create stories for both**

- LineChart: Default, MultiSeries, Curved, WithDots, WithLegend
- AreaChart: Default, Stacked, Gradient, MultiSeries

**Step 4: Commit**

```bash
git add src/ui/charts/
git commit -m "feat(charts): add LineChart and AreaChart components"
```

---

## Task 12: Charts — PieChart

**Files:**
- Create: `src/ui/charts/pie-chart.tsx`
- Create: `src/ui/charts/pie-chart.stories.tsx`

**Step 1: Create PieChart**

```tsx
interface PieChartProps {
  data: { label: string; value: number; color?: string }[]
  variant?: 'pie' | 'donut'
  innerRadius?: number       // 0-1 ratio (0.6 for donut)
  padAngle?: number
  cornerRadius?: number
  height?: number
  showTooltip?: boolean
  showLegend?: boolean
  showLabels?: boolean
  animate?: boolean
  className?: string
  centerLabel?: React.ReactNode  // Content in donut center
}
```

Implementation:
- `d3-shape`: `pie()` layout + `arc()` generator
- SVG `<path>` for each slice
- Hover: slightly translate slice outward + show tooltip
- Donut: set innerRadius > 0
- Center label: `<foreignObject>` in SVG center for donut variant
- Labels: render on arc centroids

**Step 2: Create stories**

- Default (pie), Donut, WithLabels, WithCenterLabel, CustomColors, Interactive

**Step 3: Commit**

```bash
git add src/ui/charts/
git commit -m "feat(charts): add PieChart with pie and donut variants"
```

---

## Task 13: Charts — Sparkline + GaugeChart

**Files:**
- Create: `src/ui/charts/sparkline.tsx`
- Create: `src/ui/charts/sparkline.stories.tsx`
- Create: `src/ui/charts/gauge-chart.tsx`
- Create: `src/ui/charts/gauge-chart.stories.tsx`

**Step 1: Create Sparkline**

```tsx
interface SparklineProps {
  data: number[]
  variant?: 'line' | 'bar' | 'area'
  width?: number
  height?: number
  color?: ChartColor
  showLastDot?: boolean
  strokeWidth?: number
  className?: string
}
```

Compact inline chart — no axes, no labels, no tooltip. Pure SVG. Default height: 32px.
- line: `d3-shape` line generator
- bar: SVG rects
- area: `d3-shape` area generator

**Step 2: Create GaugeChart**

```tsx
interface GaugeChartProps {
  value: number
  max?: number
  min?: number
  label?: string
  valueLabel?: string | ((value: number) => string)
  color?: ChartColor
  trackColor?: string
  height?: number
  startAngle?: number    // default: -120 degrees
  endAngle?: number      // default: 120 degrees
  thickness?: number     // arc thickness
  animate?: boolean
  className?: string
}
```

Implementation:
- Background arc (track) in `--color-border-subtle`
- Value arc using `d3-shape` `arc()` generator
- Center text showing value/label using `<text>` SVG element
- Animation: D3 transition on arc endAngle

**Step 3: Create stories for both**

- Sparkline: Line, Bar, Area, Colored, InlineWithText
- GaugeChart: Default, Custom Range, Formatted Label, MultiGauges

**Step 4: Commit**

```bash
git add src/ui/charts/
git commit -m "feat(charts): add Sparkline and GaugeChart components"
```

---

## Task 14: Charts — RadarChart

**Files:**
- Create: `src/ui/charts/radar-chart.tsx`
- Create: `src/ui/charts/radar-chart.stories.tsx`

**Step 1: Create RadarChart**

```tsx
interface RadarChartProps {
  data: DataPoint[]
  axes: string[]              // axis labels (3-8 axes)
  series: Series[]
  maxValue?: number           // auto-detect if not set
  levels?: number             // concentric grid rings (default: 5)
  fillOpacity?: number
  showDots?: boolean
  height?: number
  showTooltip?: boolean
  showLegend?: boolean
  animate?: boolean
  className?: string
}
```

Implementation:
- Compute angle per axis: `(2 * Math.PI) / axes.length`
- Grid: concentric polygons for each level
- Axis lines: from center to each axis point
- Data: polygon connecting values on each axis, using `d3-shape lineRadial()`
- Fill: semi-transparent area fill
- Dots on each vertex

**Step 2: Create stories**

- Default, MultipleSeries, SkillAssessment (real-world Karm use case), Customized

**Step 3: Commit**

```bash
git add src/ui/charts/
git commit -m "feat(charts): add RadarChart component"
```

---

## Task 15: Charts — Exports & Complete Story

**Files:**
- Modify: `src/ui/charts/index.ts`
- Modify: `src/ui/index.ts`
- Create: `src/ui/charts/charts.stories.tsx` (overview story)

**Step 1: Update chart barrel export**

`src/ui/charts/index.ts`:
```tsx
export { ChartContainer } from './chart-container'
export { BarChart } from './bar-chart'
export type { BarChartProps } from './bar-chart'
export { LineChart } from './line-chart'
export type { LineChartProps } from './line-chart'
export { AreaChart } from './area-chart'
export type { AreaChartProps } from './area-chart'
export { PieChart } from './pie-chart'
export type { PieChartProps } from './pie-chart'
export { Sparkline } from './sparkline'
export type { SparklineProps } from './sparkline'
export { GaugeChart } from './gauge-chart'
export type { GaugeChartProps } from './gauge-chart'
export { RadarChart } from './radar-chart'
export type { RadarChartProps } from './radar-chart'
export { Legend } from './_internal/legend'
```

**Step 2: Add to ui/index.ts**

Add after existing exports:
```tsx
// Charts
export * from './charts'
```

**Step 3: Create overview story**

`charts.stories.tsx`: A dashboard-style story showing all 7 chart types in a grid layout — serves as a visual catalog.

**Step 4: Verify build**

Run: `pnpm build`
Expected: Build succeeds with chart modules in output

**Step 5: Commit**

```bash
git add src/ui/charts/ src/ui/index.ts
git commit -m "feat(charts): complete chart library with all 7 types and exports"
```

---

## Task 16: Date Picker — Refactor into Multi-File Module

**Files:**
- Create: `src/shared/date-picker/index.ts`
- Create: `src/shared/date-picker/calendar-grid.tsx` (extracted from date-picker.tsx lines 40-147)
- Create: `src/shared/date-picker/date-picker.tsx` (extracted from date-picker.tsx lines 150-219)
- Create: `src/shared/date-picker/date-range-picker.tsx` (extracted from date-picker.tsx lines 221-327)
- Create: `src/shared/date-picker/use-calendar.ts`
- Delete: `src/shared/date-picker.tsx` (replaced by directory)
- Modify: `src/shared/index.ts`

**Step 1: Create shared hook**

`use-calendar.ts`:
Extract month navigation logic (prev/next month, set month/year). Shared between DatePicker and DateRangePicker.

```tsx
export function useCalendar(initialMonth?: Date) {
  const [currentMonth, setCurrentMonth] = React.useState(initialMonth ?? new Date())

  const goToPreviousMonth = () => setCurrentMonth(prev => subMonths(prev, 1))
  const goToNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1))
  const goToMonth = (month: number) => setCurrentMonth(prev => setMonth(prev, month))
  const goToYear = (year: number) => setCurrentMonth(prev => setYear(prev, year))

  return { currentMonth, setCurrentMonth, goToPreviousMonth, goToNextMonth, goToMonth, goToYear }
}
```

**Step 2: Extract CalendarGrid**

Move lines 40-147 into `calendar-grid.tsx`. Add new props:
```tsx
disabledDates?: (date: Date) => boolean
minDate?: Date
maxDate?: Date
```

Disabled dates get `opacity-40 pointer-events-none` styling.

**Step 3: Extract DatePicker and DateRangePicker**

Move into separate files. Import CalendarGrid and useCalendar.

**Step 4: Update barrel exports**

`src/shared/date-picker/index.ts`:
```tsx
export { DatePicker } from './date-picker'
export { DateRangePicker } from './date-range-picker'
export { CalendarGrid } from './calendar-grid'
```

Update `src/shared/index.ts` to re-export from new path.

**Step 5: Verify all existing stories still work**

Run: `pnpm dev`
Expected: All date picker stories render correctly

**Step 6: Commit**

```bash
git add src/shared/date-picker/ src/shared/index.ts
git rm src/shared/date-picker.tsx
git commit -m "refactor(date-picker): extract into multi-file module"
```

---

## Task 17: Date Picker — Enhancements (Disabled Dates, Min/Max, Year/Month Picker, Keyboard Nav)

**Files:**
- Modify: `src/shared/date-picker/calendar-grid.tsx`
- Create: `src/shared/date-picker/year-picker.tsx`
- Create: `src/shared/date-picker/month-picker.tsx`
- Modify: `src/shared/date-picker/date-picker.tsx`
- Modify: `src/shared/date-picker/date-range-picker.tsx`
- Modify: `src/shared/date-picker.stories.tsx`

**Step 1: Add disabled dates and min/max to CalendarGrid**

When rendering each day button, check:
```tsx
const isDisabled = (disabledDates?.(day)) ||
  (minDate && isBefore(day, startOfDay(minDate))) ||
  (maxDate && isAfter(day, startOfDay(maxDate)))
```

**Step 2: Create YearPicker**

Grid of years (decade view, e.g. 2020-2029). Click selects year and switches back to month view.

**Step 3: Create MonthPicker**

Grid of 12 months. Click selects month and switches back to day view.

**Step 4: Add header navigation**

In DatePicker/DateRangePicker, clicking the month/year text in the header cycles through views: days → months → years.

**Step 5: Add keyboard navigation to CalendarGrid**

Arrow keys move focus between days. Enter/Space selects. Tab moves to next focusable element outside calendar. Home/End go to first/last day of month.

**Step 6: Update stories with new features**

```tsx
export const WithConstraints: Story = {
  render: () => (
    <DatePicker
      minDate={new Date(2026, 0, 1)}
      maxDate={new Date(2026, 11, 31)}
      disabledDates={(d) => d.getDay() === 0 || d.getDay() === 6}
    />
  ),
}
```

**Step 7: Commit**

```bash
git add src/shared/date-picker/
git commit -m "feat(date-picker): add disabled dates, min/max, year/month picker, keyboard nav"
```

---

## Task 18: TimePicker + DateTimePicker

**Files:**
- Create: `src/shared/date-picker/time-picker.tsx`
- Create: `src/shared/date-picker/date-time-picker.tsx`
- Modify: `src/shared/date-picker/index.ts`
- Modify: `src/shared/index.ts`
- Modify: `src/shared/date-picker.stories.tsx`

**Step 1: Create TimePicker**

```tsx
interface TimePickerProps {
  value?: Date
  onChange?: (date: Date) => void
  format?: '12h' | '24h'
  minuteStep?: number       // 1, 5, 10, 15, 30
  secondStep?: number       // optional seconds
  showSeconds?: boolean
  placeholder?: string
  className?: string
  disabled?: boolean
}
```

Implementation:
- Popover with three scrollable columns (hours, minutes, optional seconds)
- AM/PM toggle button for 12h format
- Each column: scrollable list with `overflow-y: auto`, selected item highlighted
- Input displays formatted time string
- Uses our Popover + Input primitives

**Step 2: Create DateTimePicker**

```tsx
interface DateTimePickerProps {
  value?: Date
  onChange?: (date: Date) => void
  minDate?: Date
  maxDate?: Date
  disabledDates?: (date: Date) => boolean
  timeFormat?: '12h' | '24h'
  minuteStep?: number
  placeholder?: string
  className?: string
}
```

Implementation:
- Popover containing CalendarGrid on top + TimePicker below
- Selecting a date updates the date part; time picker updates the time part
- Display shows both date and time in trigger button

**Step 3: Update exports**

Add to `src/shared/date-picker/index.ts`:
```tsx
export { TimePicker } from './time-picker'
export { DateTimePicker } from './date-time-picker'
```

**Step 4: Add stories**

- TimePicker: Default, 24Hour, With15MinSteps, WithSeconds
- DateTimePicker: Default, WithConstraints, Controlled

**Step 5: Commit**

```bash
git add src/shared/date-picker/ src/shared/index.ts
git commit -m "feat(date-picker): add TimePicker and DateTimePicker components"
```

---

## Task 19: Date Picker — Presets + Multiple Months

**Files:**
- Create: `src/shared/date-picker/presets.tsx`
- Modify: `src/shared/date-picker/date-range-picker.tsx`
- Modify: `src/shared/date-picker/index.ts`
- Modify: `src/shared/date-picker.stories.tsx`

**Step 1: Create Presets component**

```tsx
type PresetKey = 'today' | 'yesterday' | 'last7days' | 'last30days' | 'thisMonth' | 'lastMonth' | 'thisYear'

interface PresetsProps {
  presets: PresetKey[]
  onSelect: (start: Date, end: Date) => void
}
```

Renders a vertical list of preset buttons in the DateRangePicker popover sidebar.

**Step 2: Add presets to DateRangePicker**

When `presets` prop is provided, render preset sidebar to the left of the calendar grid.

**Step 3: Add multiple months**

Props:
```tsx
numberOfMonths?: number  // default: 1
```

When > 1, render side-by-side calendars. Navigation moves both months together.

**Step 4: Add stories**

```tsx
export const RangeWithPresets: Story = {
  render: () => (
    <DateRangePicker
      presets={['today', 'last7days', 'last30days', 'thisMonth', 'lastMonth']}
      numberOfMonths={2}
    />
  ),
}
```

**Step 5: Commit**

```bash
git add src/shared/date-picker/
git commit -m "feat(date-picker): add presets and multiple month support for range picker"
```

---

## Task 20: Tree View

**Files:**
- Create: `src/ui/tree-view/index.ts`
- Create: `src/ui/tree-view/tree-view.tsx`
- Create: `src/ui/tree-view/tree-item.tsx`
- Create: `src/ui/tree-view/use-tree.ts`
- Create: `src/ui/tree-view/tree-view.stories.tsx`
- Modify: `src/ui/index.ts`

**Step 1: Create use-tree hook**

```tsx
interface UseTreeOptions {
  defaultExpanded?: string[]
  defaultSelected?: string[]
  multiSelect?: boolean
  onSelect?: (selectedIds: string[]) => void
  onExpand?: (expandedIds: string[]) => void
}

interface UseTreeReturn {
  expanded: Set<string>
  selected: Set<string>
  toggle: (id: string) => void
  select: (id: string, event?: React.MouseEvent) => void
  isExpanded: (id: string) => boolean
  isSelected: (id: string) => boolean
  expandAll: () => void
  collapseAll: () => void
}
```

**Step 2: Create TreeItem**

```tsx
interface TreeItemProps {
  itemId: string
  label: React.ReactNode
  icon?: React.ReactNode
  secondaryLabel?: React.ReactNode
  actions?: React.ReactNode
  disabled?: boolean
  children?: React.ReactNode
  depth?: number  // set internally
}
```

Implementation:
- Renders a row with expand icon (if has children), optional checkbox, icon, label
- Children wrapped in our Collapsible primitive for animated expand/collapse
- Indentation: `paddingLeft: depth * 20px`
- Indentation guides: vertical border lines at each depth level
- Focus management: `tabIndex`, focus ring
- ARIA: `role="treeitem"`, `aria-expanded`, `aria-selected`, `aria-level`

**Step 3: Create TreeView**

```tsx
interface TreeViewProps {
  items?: TreeNode[]          // data-driven mode
  defaultExpanded?: string[]
  defaultSelected?: string[]
  multiSelect?: boolean
  checkboxes?: boolean
  onSelect?: (ids: string[]) => void
  onExpand?: (ids: string[]) => void
  className?: string
  children?: React.ReactNode  // declarative mode
}

interface TreeNode {
  id: string
  label: string
  icon?: React.ReactNode
  children?: TreeNode[]
  disabled?: boolean
}
```

Two modes:
1. **Data-driven**: Pass `items` array, TreeView renders TreeItems automatically
2. **Declarative**: Use TreeItem children directly for custom rendering

ARIA: `role="tree"` on root, keyboard navigation with arrow keys.

**Step 4: Add keyboard navigation**

In TreeView root:
- ArrowDown: move focus to next visible item
- ArrowUp: move focus to previous visible item
- ArrowRight: expand focused item (if collapsed), or move to first child
- ArrowLeft: collapse focused item (if expanded), or move to parent
- Enter/Space: select focused item
- Home: focus first item
- End: focus last visible item
- Type-ahead: focus item matching typed characters

**Step 5: Create stories**

```tsx
// FileExplorer: Folder/file tree with icons
// Checkboxes: Multi-select with checkbox mode
// Controlled: External state management
// CustomRendering: Declarative TreeItem children with actions
// Nested: Deeply nested data (5+ levels)
```

**Step 6: Update ui/index.ts**

Add:
```tsx
// Tree View
export * from './tree-view'
```

**Step 7: Commit**

```bash
git add src/ui/tree-view/ src/ui/index.ts
git commit -m "feat(tree-view): add TreeView and TreeItem components with keyboard navigation"
```

---

## Task 21: Update Top-Level Exports & Build Verification

**Files:**
- Modify: `src/index.ts`
- Modify: `vite.config.ts` (if new entry points needed)

**Step 1: Verify all new exports are reachable from src/index.ts**

The top-level `src/index.ts` re-exports from `ui/index.ts` and `shared/index.ts`. Since we added to those, verify the chain:
- `src/index.ts` → `src/ui/index.ts` → `src/ui/charts/index.ts` ✓
- `src/index.ts` → `src/ui/index.ts` → `src/ui/tree-view/index.ts` ✓
- `src/index.ts` → `src/shared/index.ts` → `src/shared/date-picker/index.ts` ✓

**Step 2: Full build**

Run: `pnpm build`
Expected: Clean build with all new modules in dist/

**Step 3: Type check**

Run: `pnpm typecheck`
Expected: No type errors

**Step 4: Run all tests**

Run: `pnpm test`
Expected: All tests pass

**Step 5: Run storybook**

Run: `pnpm dev`
Expected: All new components visible in Storybook with working stories

**Step 6: Commit**

```bash
git add -A
git commit -m "chore: verify exports, build, and storybook for all new components"
```

---

## Summary

| Task | Component | Commits |
|------|-----------|---------|
| 1 | Dependencies & tokens | 1 |
| 2-8 | Enhanced DataTable (sorting, filtering, pagination, selection, toolbar, editing, expansion, virtualization, export, Karm demo) | 7 |
| 9-15 | Charts library (internals, bar, line, area, pie, sparkline, gauge, radar, exports) | 7 |
| 16-19 | Date/Time Pickers (refactor, enhancements, TimePicker, DateTimePicker, presets) | 4 |
| 20 | Tree View | 1 |
| 21 | Final verification & exports | 1 |
| **Total** | **4 component families, ~25 new files** | **21 commits** |
