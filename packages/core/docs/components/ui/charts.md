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

## Gotchas
- Barrel-isolated since v0.5.0 — must use `@devalok/shilp-sutra/ui/charts`, NOT the `ui` barrel
- Requires D3 as an optional peer dependency

## Changes
### v0.18.0
- **Changed** All 8 chart types migrated to Framer Motion entrance animations

### v0.5.0
- **Changed** (BREAKING) All chart components removed from `@devalok/shilp-sutra/ui` barrel export. Must use `@devalok/shilp-sutra/ui/charts` import path.

### v0.1.0
- **Added** Initial release
