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
    deltaPlacement: "block" | "inline" (block = below value [default]; inline = on the value's baseline)
    icon: ReactNode | ComponentType<{ className?: string }>
    loading: boolean (renders skeleton)
    comparisonLabel: string (shown after delta, e.g. "vs last month")
    secondaryLabel: string (below main value, e.g. "of $50,000 target")
    progress: number (0-100, renders thin progress bar below value)
    variant: "default" | "elevated" | "outline" | "flat" (default = ring-in-shadow, no border; elevated = stronger shadow; outline = border, no shadow; flat = filled, no edge) — delegated to Card
    accentStyle: "none" | "icon" | "tint" (none [default]; icon = accent chip around icon; tint = accent surface wash + accent value)
    iconFill: "soft" | "solid" (chip style when accentStyle="icon"; default soft)
    flash: "up" | "down" | "goal" | "record" | "alert" | "live" | { tone, icon } (opt-in entrance flash; requires icon)
    flashSpeed: "fast" | "normal" | "slow" (default normal)
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
  accentStyle="icon"
  flash="up"
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

## Composability
- **High-density metric card** — optimized for dashboards. Everything optional except `value`. Mix and match features (delta, sparkline, progress, secondary label, footer) per metric's needs.
- **Router integration via href:** Internally uses `LinkContext` to resolve framework-specific Link components (Next.js, react-router). Set `href` in a LinkProvider-wrapped tree to get seamless client-side navigation without custom asChild wiring.
- **Interactive modes:** `onClick` makes the entire card a button; `href` makes it a link. Mutually exclusive — href wins if both are set.
- **Accent (composable, opt-in):** `accentStyle="icon"` wraps `icon` in an accent chip (`iconFill="soft" | "solid"`); `accentStyle="tint"` applies a subtle accent surface wash + accent value. `variant` picks edge-vs-elevation. No colored rail — the DS never stacks a border + drop shadow (make-kit rule #6). Trend health reads from `delta.direction` (up=green, down=red).
- **Flash motion (opt-in):** `flash` mounts a toned state glyph (`up`/`down`/`goal`/`record`/`alert`/`live`, or `{ tone, icon }`) that settles to `icon`; `flashSpeed` tunes timing. Reuses the standalone `StatFlash` primitive. Honors `prefers-reduced-motion`.
- **Sparkline:** Pure SVG, lightweight — no chart library. For rich charts use Chart components. Minimum 2 data points.
- **Icon auto-sizing:** Accepts `ComponentType<{ className }>` OR `ReactNode`. The component prop (e.g. `icon={IconBolt}`) is preferred — icon is rendered at a consistent size.
- **Loading state:** `loading={true}` renders the full card skeleton — use during initial data fetch.

## Gotchas
- delta.direction "up" = green, "down" = red, "neutral" = grey
- `label` and `title` are aliases — use either, not both
- `onClick` and `href` are mutually exclusive — href takes precedence
- `sparkline` needs at least 2 data points to render

## Changes
### v0.44.0
- **BREAKING** Renamed `surface` → `variant`, widened to a 4-way scale (`default` | `elevated` | `outline` | `flat`). StatCard now composes `<Card>`, so surface, gap-model padding, and elevation all live in one place. Migration: `surface="raised"` → `variant="default"`, `surface="flat"` → `variant="outline"`.
- **Added** `deltaPlacement` (`"block"` [default] | `"inline"`) — inline rides the value's baseline for compact dashboards.

### v0.43.0
- **BREAKING** Removed `accent` (colored left-rail). Use `accentStyle` (`"icon"` | `"tint"`) or rely on `delta` for trend colour.
- **Added** `surface`, `accentStyle`, `iconFill`, `flash`, `flashSpeed`. New standalone `StatFlash` primitive. Base no longer stacks border + shadow.

### v0.2.0
- **Added** `icon` prop now accepts `React.ComponentType` (e.g., `icon={IconBolt}`) in addition to `ReactNode`

### v0.1.0
- **Added** Initial release
