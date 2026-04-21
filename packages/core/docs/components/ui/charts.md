# Charts

- Import: @devalok/shilp-sutra/ui/charts
- Server-safe: No
- Category: ui

## Props
    Charts is a collection of chart components. Each accepts data-specific props.

    Exported components:
      ChartContainer — wrapper with responsive sizing
      BarChart
      LineChart
      AreaChart
      PieChart
      Sparkline
      GaugeChart
      RadarChart
      Legend — chart legend with LegendItem[]

## Defaults
    none

## Example
```jsx
import { BarChart } from '@devalok/shilp-sutra/ui/charts'

<BarChart data={salesData} />
```

## Composability
- **ChartContainer wraps all chart primitives** — provides responsive sizing (fills parent width, configurable aspect ratio) and a consistent background/padding. Always render charts inside a ChartContainer unless you're building a custom container.
- **Legend is a sibling, not a child** — render `<Legend items={...} />` next to your chart (above/below), not nested. Use `onHover` / `onClick` handlers in Legend + chart to sync hover highlights.
- **Data shape is chart-specific** — BarChart wants `[{ label, value }]`, LineChart wants `[{ x, y, series }]`, etc. Each chart's props doc spells out the shape; don't assume cross-chart compatibility.
- **Sparkline is the only chart safe to use inline** — it's a minimal 1-line SVG, no axes, no legend. Use it inside StatCard, tables, tight cells. For anything larger, reach for the full chart types.
- **Entrance animations** — all charts use Framer Motion spring-based entry. Animations respect `prefers-reduced-motion`.
- **Accessibility:** Charts render role="img" with aria-label from the chart title. For dense data, provide a hidden accessible table fallback manually (WCAG requirement for complex charts).

## Gotchas
- Barrel-isolated since v0.5.0 — must use `@devalok/shilp-sutra/ui/charts`, NOT the `ui` barrel
- Requires D3 as an optional peer dependency
- Chart components do NOT auto-generate accessible data tables — add one manually for WCAG compliance on complex charts

## Changes
### v0.18.0
- **Changed** All 8 chart types migrated to Framer Motion entrance animations

### v0.5.0
- **Changed** (BREAKING) All chart components removed from `@devalok/shilp-sutra/ui` barrel export. Must use `@devalok/shilp-sutra/ui/charts` import path.

### v0.1.0
- **Added** Initial release
