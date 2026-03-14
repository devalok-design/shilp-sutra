# StatCard

- Import: @devalok/shilp-sutra/ui/stat-card
- Server-safe: No
- Category: ui

## Props
    label: string (heading text) — alias: title
    title: string (alias for label)
    value: string | number (REQUIRED)
    delta: { value: string, direction: "up" | "down" | "neutral" }
    icon: ReactNode | ComponentType<{ className?: string }>
    loading: boolean (renders skeleton)

## Example
```jsx
<StatCard
  label="Revenue"
  value="$48,200"
  delta={{ value: "+12%", direction: "up" }}
  icon={<IconCurrencyDollar />}
/>
```

## Gotchas
- delta.direction "up" = green, "down" = red, "neutral" = grey

## Changes
### v0.2.0
- **Added** `icon` prop now accepts `React.ComponentType` (e.g., `icon={IconBolt}`) in addition to `ReactNode`

### v0.1.0
- **Added** Initial release
