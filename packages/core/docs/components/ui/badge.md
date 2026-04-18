# Badge

- Import: @devalok/shilp-sutra/ui/badge
- Server-safe: No
- Category: ui

## Props
    variant: "subtle" | "solid" | "outline" | "soft"
    color: "default" | "accent" | "error" | "success" | "warning" | "info" | "neutral" | "teal" | "amber" | "slate" | "indigo" | "cyan" | "orange" | "emerald" | "custom"
    size: "xs" | "sm" | "md" | "lg"
    startIcon: ReactElement | null
    endIcon: ReactElement | null
    dot: boolean (shows animated leading dot indicator)
    onClick: () => void (makes badge interactive as button)
    selected: boolean (toggle state — shows check icon when true)
    disabled: boolean
    onDismiss: () => void (shows dismiss X button)
    maxWidth: number (enables truncation with title tooltip)
    truncate: boolean (ellipsis overflow — pair with a width/maxWidth; adds title tooltip)
    circle: boolean (square aspect-ratio, centered content)
    asChild: boolean
    children: ReactNode

## Compound Components
    Badge.Indicator — status indicator sub-component
    Badge.Group — layout wrapper for badge collections

## Defaults
    variant="subtle", color="default", size="md"

## Example
```jsx
<Badge variant="solid" color="success">Active</Badge>
<Badge color="teal" onDismiss={() => removeFilter('teal')}>Teal team</Badge>
<Badge onClick={() => toggle()} selected={isSelected}>Filterable</Badge>
<Badge color="custom" style={{ '--badge-color': '#8b5cf6' }}>Custom</Badge>
```

## Gotchas
- DO NOT use variant="destructive" — use variant="solid" color="error"
- Badge is now interactive when `onClick` is provided (renders as `<button>`)
- When both `onClick` and `onDismiss` are provided, renders as `div[role="button"]` to avoid nested buttons
- Chip is deprecated — use Badge with `onClick` for interactive tags
- `color="custom"` requires `--badge-color` CSS variable (and optionally `--badge-fg-color` for solid variant)

## Changes
### v0.31.0
- **Added** `truncate` prop — enables ellipsis truncation without requiring maxWidth

### v0.29.0
- **Changed** (BREAKING) v2 rewrite — Badge is now a full interactive component
- **Added** `soft` variant (tinted bg, no border — completes the 4-variant set: subtle/solid/outline/soft)
- **Added** `custom` color with CSS variable `--badge-color` (and `--badge-fg-color` for solid)
- **Added** Interactive mode: `onClick` makes Badge a clickable button, `selected` shows animated check icon
- **Added** `disabled` prop with reduced opacity and pointer-events-none
- **Added** `startIcon` / `endIcon` props (auto-sized per badge size)
- **Added** `maxWidth` prop for truncation with title tooltip
- **Added** `circle` prop for square aspect-ratio badges
- **Added** `asChild` prop for Slot composition
- **Added** `Badge.Indicator` and `Badge.Group` compound sub-components
- **Deprecated** Chip component — use Badge with `onClick` instead
- **Changed** Dot animation now uses Framer Motion spring entrance + continuous pulse

### v0.18.0
- **Changed** Pulse-ring animation migrated to Framer Motion
- **Fixed** Accent color variants — `text-accent-9` changed to `text-accent-11`, `border-accent-9` changed to `border-accent-7`
- **Changed** OKLCH color token migration

### v0.8.0
- **Fixed** `text-[10px]` changed to `text-ds-xs` for token consistency

### v0.4.2
- **Fixed** `Omit<HTMLAttributes, 'color'>` resolves TS2320 conflict with CVA color prop

### v0.3.1
- **Fixed** Dismiss button added 24px touch target

### v0.3.0
- **Changed** (BREAKING) Single `variant` axis split into `variant` (subtle/solid/outline) + `color` (default/info/success/error/...)
- **Fixed** Solid variant phantom token `text-on-interactive` changed to `text-on-color`

### v0.1.0
- **Added** Initial release
