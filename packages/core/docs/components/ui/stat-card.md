# StatCard

- Import: @devalok/shilp-sutra/ui/stat-card
- Server-safe: No
- Category: ui

## Props
    label: string (heading text)
    title: string (alias for label)
    value: string | number (REQUIRED)
    prefix: string (before value, e.g. "$")
    suffix: string (after value, e.g. "users")
    delta: { value: string, direction: "up" | "down" | "neutral" }
    icon: ReactNode | ComponentType<{ className?: string }>
    loading: boolean (renders skeleton)
    comparisonLabel: string (shown after delta, e.g. "vs last month")
    secondaryLabel: string (below main value, e.g. "of $50,000 target")
    progress: number (0-100, renders thin progress bar below value)
    accent: "default" | "success" | "warning" | "error" | "info" (left border color)
    sparkline: number[] (renders mini SVG line chart)
    onClick: () => void (makes card clickable with hover state)
    href: string (makes card a link via LinkContext)
    footer: ReactNode (below card body, e.g. "View details →")

## Defaults
    none (all props are optional except value)

## Example
```jsx
<StatCard
  label="Revenue"
  value="$48,200"
  prefix="$"
  delta={{ value: "+12%", direction: "up" }}
  comparisonLabel="vs last month"
  icon={<IconCurrencyDollar />}
  accent="success"
/>

<StatCard
  label="Storage"
  value="4.2 GB"
  secondaryLabel="of 10 GB"
  progress={42}
  sparkline={[10, 25, 18, 30, 42]}
  footer={<a href="/storage">Manage storage →</a>}
/>
```

## Gotchas
- delta.direction "up" = green, "down" = red, "neutral" = grey
- `label` and `title` are aliases — use either, not both
- `onClick` and `href` are mutually exclusive — href takes precedence
- `sparkline` needs at least 2 data points to render

## Changes
### v0.2.0
- **Added** `icon` prop now accepts `React.ComponentType` (e.g., `icon={IconBolt}`) in addition to `ReactNode`

### v0.1.0
- **Added** Initial release
