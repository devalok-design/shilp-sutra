# MUI X Component Porting Design

> Port MUI X-class features into shilp-sutra with zero MUI dependency.
> Approach: study MUI X's API and feature set, build native implementations
> using our own engines (TanStack Table, D3.js, date-fns, Radix primitives).

## Scope

Four component families, all chart types, full DataGrid features:

| Family | Engine | New Components |
|---|---|---|
| DataGrid (enhanced DataTable) | TanStack React Table v8 | 0 new files, major enhancement |
| Charts (7 types) | D3.js + React wrappers | ~15 new files |
| Date/Time Pickers (enhanced + new) | date-fns + our calendar | ~6 new files |
| Tree View | Custom React + Collapsible | ~3 new files |

## 1. Enhanced DataTable (DataGrid-class)

### Engine
TanStack React Table v8 (already installed).

### Features to Add

| Feature | TanStack API | UI |
|---|---|---|
| Sorting | `getSortedRowModel()` | Sort icons in column headers |
| Filtering | `getFilteredRowModel()` | Column filter inputs + global search |
| Pagination | `getPaginationRowModel()` | Our Pagination component |
| Column visibility | `columnVisibility` state | Dropdown toggle menu |
| Column resizing | `columnResizing` feature | Drag handle on header borders |
| Column pinning | `columnPinning` state | Sticky left/right positioning |
| Row selection | Checkbox column + `rowSelection` | Checkbox in first column |
| Row expansion | `getExpandedRowModel()` | Expand icon + detail panel |
| Cell editing | Custom edit state | Inline Input/Select on double-click |
| Density | CSS variable toggle | Compact/standard/comfortable |
| Toolbar | Composite component | Search, filter, columns, density, export |
| Export | Client-side CSV generation | Toolbar button |
| Loading/Empty | Props | Skeleton rows + EmptyState |
| Virtualization | `@tanstack/react-virtual` | Virtual row rendering for 10K+ rows |

### API Design

```tsx
<DataTable
  data={rows}
  columns={columns}
  sortable
  filterable
  paginated
  pageSize={25}
  selectable
  onSelectionChange={handleSelect}
  toolbar
  density="standard"
  loading={isLoading}
  emptyMessage="No records found"
  virtualRows        // opt-in virtualization
  columnPinning={{ left: ["name"], right: ["actions"] }}
  onCellEdit={handleEdit}
/>
```

### Storybook
- Full interactive demo with all features togglable
- Time Off Calendar demo for Karm admin use case
- Large dataset demo (10K rows) with virtualization

---

## 2. Charts Library

### Engine
D3.js v7 (tree-shaken modules: d3-scale, d3-shape, d3-axis, d3-selection, d3-transition).

### File Structure

```
src/ui/charts/
  index.ts
  chart-container.tsx       — Responsive SVG container + tooltip provider
  bar-chart.tsx             — Vertical/horizontal/stacked/grouped
  line-chart.tsx            — Single/multi-series lines
  area-chart.tsx            — Filled area, stacked area
  pie-chart.tsx             — Pie + donut variants
  sparkline.tsx             — Compact inline (line/bar/area)
  gauge-chart.tsx           — Circular gauge with value arc
  radar-chart.tsx           — Spider/radar for multi-axis
  _internal/
    scales.ts               — D3 scale wrappers using tokens
    axes.ts                 — X/Y axis rendering
    grid-lines.ts           — Background grid
    tooltip.tsx             — Chart tooltip component
    legend.tsx              — Chart legend component
    colors.ts               — Chart color palette from tokens
    animation.ts            — D3 transitions + reduced-motion
    types.ts                — Shared TypeScript types
```

### Chart Types

| Type | Variants | Use Cases |
|---|---|---|
| BarChart | vertical, horizontal, stacked, grouped | Attendance, project metrics |
| LineChart | single, multi-series, curved/linear | Trends over time |
| AreaChart | filled, stacked, gradient | Volume/capacity visualization |
| PieChart | pie, donut | Distribution (leave types, task status) |
| Sparkline | line, bar, area | Inline metric trends |
| GaugeChart | single value, multi-ring | KPI dashboards, attendance % |
| RadarChart | filled, outlined | Skill assessments, performance |

### Shared Features
- Responsive via ResizeObserver
- Design token colors (semantic palette + chart-specific palette)
- Dark mode via CSS custom properties
- Tooltip on hover (our Popover primitive)
- Legend component (position: top/bottom/left/right)
- Animation with `prefers-reduced-motion` respect
- ARIA labels for accessibility
- Grid lines (optional)
- Axis labels and formatting

### API Examples

```tsx
<BarChart
  data={[{ label: "Jan", value: 120 }, { label: "Feb", value: 95 }]}
  xKey="label"
  yKey="value"
  orientation="vertical"
  color="primary"
/>

<LineChart
  data={salesData}
  series={[
    { key: "revenue", label: "Revenue", color: "primary" },
    { key: "costs", label: "Costs", color: "secondary" },
  ]}
  xKey="month"
  curved
/>

<PieChart
  data={[{ label: "Approved", value: 45 }, { label: "Pending", value: 12 }]}
  variant="donut"
  innerRadius={0.6}
/>

<Sparkline data={[4, 7, 3, 8, 5, 9]} variant="line" height={32} />

<GaugeChart value={73} max={100} label="Attendance" />

<RadarChart
  data={skillData}
  axes={["Frontend", "Backend", "DevOps", "Design", "Testing"]}
  series={[{ key: "score", label: "Score" }]}
/>
```

---

## 3. Enhanced Date/Time Pickers

### Engine
date-fns (already installed) + our calendar grid.

### File Structure

```
src/shared/date-picker/
  index.ts
  date-picker.tsx            — Enhanced single date
  date-range-picker.tsx      — Enhanced range
  time-picker.tsx            — NEW: hour/minute/second + AM/PM
  date-time-picker.tsx       — NEW: combined date + time
  calendar-grid.tsx          — Shared calendar rendering (refactored)
  year-picker.tsx            — NEW: year grid (decade view)
  month-picker.tsx           — NEW: month grid
  presets.tsx                — NEW: quick-select presets
  use-calendar.ts            — Shared navigation/selection hook
```

### Enhancements to Existing Components

| Feature | Description |
|---|---|
| Disabled dates | `disabledDates` prop (array or predicate function) |
| Min/Max date | `minDate` / `maxDate` constraint props |
| Presets | Quick select ("Today", "Last 7 days", "This month") |
| Locale support | date-fns locale passthrough |
| Multiple months | 2-month side-by-side view for range picker |
| Year/Month nav | Click header to switch to year/month picker |
| Keyboard nav | Arrow keys to navigate calendar grid |

### New Components

**TimePicker**: Hour/minute selector with scrollable columns, AM/PM toggle.
Uses our Input + Select primitives inside a Popover.

**DateTimePicker**: Combined DatePicker + TimePicker in one popover.
Calendar grid on top, time selection below.

### API Examples

```tsx
<DatePicker
  value={date}
  onChange={setDate}
  minDate={new Date(2024, 0, 1)}
  maxDate={new Date(2026, 11, 31)}
  disabledDates={(d) => d.getDay() === 0}  // no Sundays
/>

<DateRangePicker
  value={range}
  onChange={setRange}
  presets={["today", "last7days", "thisMonth", "lastMonth"]}
  numberOfMonths={2}
/>

<TimePicker
  value={time}
  onChange={setTime}
  format="12h"       // or "24h"
  minuteStep={15}
/>

<DateTimePicker
  value={dateTime}
  onChange={setDateTime}
  minDate={new Date()}
/>
```

---

## 4. Tree View

### Engine
Custom React + our Collapsible primitive for expand/collapse animation.

### File Structure

```
src/ui/tree-view/
  index.ts
  tree-view.tsx        — Root container (role="tree")
  tree-item.tsx        — Individual node (role="treeitem")
  use-tree.ts          — Selection, expansion, keyboard state
```

### Features

| Feature | Description |
|---|---|
| Expand/collapse | Animated via our Collapsible primitive |
| Single select | Click to select one node |
| Multi-select | Ctrl/Cmd+click or checkbox mode |
| Checkbox mode | Checkbox per node with indeterminate parent state |
| Keyboard nav | Arrow keys, Home/End, Enter/Space, type-ahead |
| Custom render | Icon, label, secondary text, action buttons |
| Nested data | `{ id, label, children: [...] }` structure |
| Flat data | `{ id, label, parentId }` with auto-nesting |
| Indentation guides | Vertical lines showing depth |
| Lazy loading | `onExpand` callback to load children on demand |
| ARIA tree pattern | Full `role="tree"` / `role="treeitem"` semantics |

### API Design

```tsx
<TreeView
  items={[
    { id: "1", label: "Documents", icon: <FolderIcon />, children: [
      { id: "1.1", label: "resume.pdf", icon: <FileIcon /> },
      { id: "1.2", label: "cover-letter.docx", icon: <FileIcon /> },
    ]},
    { id: "2", label: "Pictures", icon: <FolderIcon />, children: [] },
  ]}
  defaultExpanded={["1"]}
  onSelect={handleSelect}
  multiSelect
  checkboxes
/>
```

---

## 5. New Dependencies

| Package | Purpose | Gzipped Size |
|---|---|---|
| `d3-scale` | Scale functions for charts | ~4KB |
| `d3-shape` | Path generators (arc, line, area, pie) | ~5KB |
| `d3-axis` | Axis rendering | ~2KB |
| `d3-selection` | DOM manipulation for D3 | ~4KB |
| `d3-transition` | Animations | ~3KB |
| `d3-interpolate` | Color/value interpolation | ~3KB |
| `d3-array` | Array utilities (extent, bisect) | ~3KB |
| `d3-format` | Number formatting | ~2KB |
| `d3-time-format` | Date formatting for axes | ~2KB |
| `@tanstack/react-virtual` | DataTable virtualization | ~5KB |

**Total new dependency weight**: ~33KB gzipped (tree-shaken D3 modules + react-virtual).

No other new deps. We reuse TanStack Table, date-fns, and vendored Radix.

---

## 6. Token Integration

All new components consume our token system:

- **Colors**: `var(--color-primary)`, chart palette from new `--chart-*` tokens
- **Spacing**: `var(--spacing-*)` for padding, margins, gaps
- **Typography**: `var(--font-*)` for labels, axes, tooltips
- **Radius**: `var(--radius-*)` for containers, tooltip borders
- **Shadows**: `var(--shadow-*)` for elevated tooltips, popovers
- **Dark mode**: All respond to `.dark` class toggle via CSS custom properties

### New Chart Tokens

```css
:root {
  --chart-1: var(--color-primary);
  --chart-2: var(--color-secondary);
  --chart-3: #f59e0b;  /* amber */
  --chart-4: #10b981;  /* emerald */
  --chart-5: #8b5cf6;  /* violet */
  --chart-6: #ec4899;  /* pink */
  --chart-7: #06b6d4;  /* cyan */
  --chart-8: #f97316;  /* orange */
}
```

---

## 7. Export Updates

### src/ui/index.ts additions
- All chart components
- TreeView, TreeItem
- Enhanced DataTable (same export, more features)

### src/shared/index.ts additions
- TimePicker
- DateTimePicker
- YearPicker, MonthPicker
- DatePicker presets

### src/index.ts
- Re-export new modules
